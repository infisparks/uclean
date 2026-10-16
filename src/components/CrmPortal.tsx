'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Phone,
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  Truck,
  Sparkles,
  Search,
  Plus,
  ArrowLeft,
  DollarSign,
  Package,
  AlertCircle,
  Filter,
  X,
  ChevronRight,
  User,
  MapPin,
  Calendar,
  FileText,
  PhoneCall,
  Check,
  Copy,
  ExternalLink,
  RefreshCw,
  SlidersHorizontal,
  Navigation,
  ClipboardCheck,
  CheckCheck,
  Layers,
  ShoppingBag,
  LogOut,
  Ban,
  Trash2,
  Download,
  Volume2,
  VolumeX,
  Printer,
  Eye,
  LayoutGrid,
  List,
  PanelRightClose,
  PanelRightOpen,
  LayoutDashboard,
  Home,
  BarChart3,
  Users,
  Settings,
  Menu,
  Edit3,
} from 'lucide-react';
import {
  sendWhatsAppMessage,
  generateBookingConfirmationTemplate,
  generateQuotationTemplate,
  generateReadyForDeliveryTemplate,
} from '@/lib/whatsapp';
import { rtdb, deleteBooking, getDeletedOrderIds } from '@/lib/firebase';
import { ref, onValue, update, set, remove, get } from 'firebase/database';
import {
  validateIndianMobile,
  validateCustomerName,
  validateAddress,
} from '@/lib/validation';
import {
  getMinSelectableDateString,
  getLocalTodayDateString,
  getActiveSlotsList,
  getDefaultSlotForDate,
} from '@/lib/slotAvailability';
import {
  PRIMARY_SERVICES,
  getServiceDisplay,
  extractBasePrice,
  isServiceMatch,
} from '@/lib/servicesCatalog';

export interface CrmOrder {
  id: string;
  name: string;
  phone: string;
  service: string;
  services?: string[];
  qty: string;
  total: string;
  address: string;
  slot: string;
  date?: string;
  time?: string;
  status:
    | 'New Request'
    | 'Call Confirmed'
    | 'Pickup Assigned'
    | 'Picked Up'
    | 'At Store / Inspection'
    | 'Quotation Sent'
    | 'Cleaning In Progress'
    | 'Quality Check'
    | 'Ready for Delivery'
    | 'Out for Delivery'
    | 'Delivered'
    | 'Cancelled'
    | string;
  notes: string;
  items?: string;
  contactPreference?: string;
  createdAt?: string;
  timestamp?: string;
  callDone?: boolean;
  pickupDone?: boolean;
}

interface ChatMessage {
  id: string;
  sender: 'store' | 'customer';
  text: string;
  time: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
}

const ORDER_LIFECYCLE_STEPS = [
  { key: 'New Request', label: '1. Request', short: 'Request' },
  { key: 'Call Confirmed', label: '2. Confirmed', short: 'Confirmed' },
  { key: 'Picked Up', label: '3. Picked Up', short: 'Pickup' },
  { key: 'At Store / Inspection', label: '4. In Store', short: 'In Store' },
  { key: 'Cleaning In Progress', label: '5. Cleaning', short: 'Cleaning' },
  { key: 'Ready for Delivery', label: '6. Ready', short: 'Ready' },
  { key: 'Delivered', label: '7. Delivered', short: 'Delivered' },
];

const STATUS_GROUPS = [
  {
    group: 'Intake & Verification',
    description: 'Booking arrival & customer call verification',
    statuses: ['New Request', 'Call Confirmed', 'Pickup Assigned'],
  },
  {
    group: 'Workshop & Cleaning',
    description: 'Inspection, quote & wash processing',
    statuses: ['Picked Up', 'At Store / Inspection', 'Quotation Sent', 'Cleaning In Progress', 'Quality Check'],
  },
  {
    group: 'Fulfillment & Close',
    description: 'Dispatch, completion & resolution',
    statuses: ['Ready for Delivery', 'Out for Delivery', 'Delivered', 'Cancelled'],
  },
];

// Helper: Format exact booking timestamp ("Samne wale ne kab book kiya tha")
export function formatBookingTimestamp(raw?: string | null): {
  fullDateTime: string;
  timeAgo: string;
  dateOnly: string;
  timeOnly: string;
} {
  if (!raw) {
    return {
      fullDateTime: 'Recently',
      timeAgo: 'Recently',
      dateOnly: 'Today',
      timeOnly: 'Standard Slot',
    };
  }

  const parsed = new Date(raw);
  if (isNaN(parsed.getTime())) {
    return {
      fullDateTime: raw,
      timeAgo: raw,
      dateOnly: raw,
      timeOnly: '',
    };
  }

  const day = parsed.getDate().toString().padStart(2, '0');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[parsed.getMonth()];
  const year = parsed.getFullYear();
  const timeOnly = parsed.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const fullDateTime = `${day} ${month} ${year}, ${timeOnly}`;
  const dateOnly = `${day} ${month} ${year}`;

  const diffMs = Date.now() - parsed.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  let timeAgo = 'Just now';
  if (diffMins < 1) timeAgo = 'Just now';
  else if (diffMins < 60) timeAgo = `${diffMins}m ago`;
  else if (diffHours < 24) timeAgo = `${diffHours}h ago`;
  else if (diffDays === 1) timeAgo = 'Yesterday';
  else if (diffDays < 7) timeAgo = `${diffDays}d ago`;
  else timeAgo = dateOnly;

  return { fullDateTime, timeAgo, dateOnly, timeOnly };
}

// Smart parser: Cleanly separates structured services, garments, quantities, contact, and clean notes
export function parseOrderDetails(
  rawService?: string,
  rawNotes?: string,
  rawItems?: string,
  rawQty?: string,
  rawServices?: string[],
  rawContact?: string
) {
  let services: string[] = Array.isArray(rawServices) && rawServices.length > 0 ? [...rawServices] : [];
  let garments = rawItems && rawItems !== 'None' ? rawItems : '';
  let quantity = rawQty && rawQty !== 'None' && rawQty !== 'Standard Package' ? rawQty : '';
  let contact = rawContact || '';
  let cleanNotes = typeof rawNotes === 'string' ? rawNotes : '';

  // If notes contains the pipe-separated string from earlier bookings:
  // e.g. "Services: Wash & Fold — ₹109/kg | Garments: None | Approx Qty: None | Notes: None | Contact: WhatsApp"
  if (cleanNotes.includes('Services:')) {
    const parts = cleanNotes.split('|').map((p) => p.trim());
    for (const part of parts) {
      if (part.startsWith('Services:')) {
        const s = part.replace('Services:', '').trim();
        if (s && s !== 'None') {
          services = s.split(',').map((x) => x.trim()).filter(Boolean);
        }
      } else if (part.startsWith('Garments:')) {
        const g = part.replace('Garments:', '').trim();
        if (g && g !== 'None') garments = g;
      } else if (part.startsWith('Approx Qty:')) {
        const q = part.replace('Approx Qty:', '').trim();
        if (q && q !== 'None') quantity = q;
      } else if (part.startsWith('Contact:')) {
        const c = part.replace('Contact:', '').trim();
        if (c && c !== 'None') contact = c;
      } else if (part.startsWith('Notes:')) {
        const n = part.replace('Notes:', '').trim();
        if (n && n !== 'None') cleanNotes = n;
        else cleanNotes = '';
      }
    }
  }

  // If cleanNotes is just a repetitive "Services: ..." or "None", blank it out
  if (cleanNotes.startsWith('Services:') || cleanNotes === 'None') {
    cleanNotes = '';
  }

  const primaryService =
    services.length > 0
      ? services.join(', ')
      : rawService && rawService !== 'pickup' && rawService !== 'general-inquiry'
      ? rawService
      : 'Wash & Fold Laundry';

  return {
    displayService: primaryService,
    services: services.length > 0 ? services : [primaryService],
    garments,
    quantity,
    contact: contact || 'WhatsApp',
    cleanNotes,
  };
}

// Synthesized audio chime for new live order notification
function playNewOrderSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.12); // A5
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.4);
  } catch {
    // Audio autoplay restrictions before user gesture
  }
}

// Helper to merge orders non-destructively: guarantees Firebase bookings are never lost or wiped out
function mergeOrdersList(existing: CrmOrder[], incoming: CrmOrder[]): CrmOrder[] {
  const map = new Map<string, CrmOrder>();
  // 1. Existing orders
  for (const o of existing) {
    if (o && o.id) map.set(o.id, o);
  }
  // 2. Incoming orders (overlay changes from incoming)
  for (const o of incoming) {
    if (o && o.id) {
      const prev = map.get(o.id);
      map.set(o.id, prev ? { ...prev, ...o } : o);
    }
  }
  return Array.from(map.values()).sort((a, b) => {
    const timeA = new Date(a.createdAt || a.timestamp || 0).getTime();
    const timeB = new Date(b.createdAt || b.timestamp || 0).getTime();
    return timeB - timeA;
  });
}

export function CrmPortal({
  onBackToStore,
  onLogout,
}: {
  onBackToStore: () => void;
  onLogout?: () => void;
}) {
  // Orders state initialized EMPTY for clean client handover
  const [orders, setOrders] = useState<CrmOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<CrmOrder | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [search, setSearch] = useState('');
  const [activeNav, setActiveNav] = useState<'all' | 'calls' | 'pickups' | 'cleaning' | 'ready' | 'delivered' | 'cancelled'>('all');
  const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'amount_high' | 'amount_low'>('newest');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // WhatsApp Drawer state
  const [isWaOpen, setIsWaOpen] = useState(false);
  const [waInputMessage, setWaInputMessage] = useState('');
  const [sendingWa, setSendingWa] = useState(false);
  const [chatHistory, setChatHistory] = useState<Record<string, ChatMessage[]>>({});
  const [quoteAmount, setQuoteAmount] = useState('450');

  // Manual new order modal state
  const [newOrderModalOpen, setNewOrderModalOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustService, setNewCustService] = useState('Wash & Steam Iron');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustSlot, setNewCustSlot] = useState(() => getDefaultSlotForDate(getLocalTodayDateString()));
  const [newCustNotes, setNewCustNotes] = useState('');
  const [newCustAmount, setNewCustAmount] = useState('149');
  const [newCustNameError, setNewCustNameError] = useState('');
  const [newCustPhoneError, setNewCustPhoneError] = useState('');
  const [newCustAddressError, setNewCustAddressError] = useState('');
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Edit order details & services state
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [editServices, setEditServices] = useState<string[]>([]);
  const [editQty, setEditQty] = useState('');
  const [editTotal, setEditTotal] = useState('');
  const [editItems, setEditItems] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const handleOpenEditOrder = (ord: CrmOrder) => {
    const currentServices = ord.services && ord.services.length > 0 ? [...ord.services] : [ord.service];
    setEditServices(currentServices);
    setEditQty(ord.qty && ord.qty !== 'Standard Package' ? ord.qty : '');
    setEditTotal(ord.total && ord.total !== 'To confirm' ? ord.total.replace(/^₹/, '') : '');
    setEditItems(ord.items || '');
    setEditNotes(ord.notes || '');
    setIsEditingOrder(true);
  };

  const handleToggleEditService = (serviceName: string) => {
    setEditServices((prev) => {
      const exists = prev.some((s) => isServiceMatch(s, serviceName));
      if (exists) {
        return prev.filter((s) => !isServiceMatch(s, serviceName));
      } else {
        return [...prev, serviceName];
      }
    });
  };

  const handleAutoCalculateTotal = () => {
    const sumBase = editServices.reduce((acc, s) => {
      const disp = getServiceDisplay(s);
      return acc + (disp.basePrice || 0);
    }, 0);
    const qtyNum = parseInt(editQty, 10);
    const calc = qtyNum && qtyNum > 0 ? sumBase * qtyNum : sumBase;
    if (calc > 0) {
      setEditTotal(String(calc));
    }
  };

  const handleSaveOrderEdits = async () => {
    if (!selectedOrder) return;
    if (editServices.length === 0) {
      alert('Please keep at least one service selected.');
      return;
    }

    setSavingEdit(true);
    try {
      const primaryService = editServices.join(', ');
      const cleanTotal = editTotal ? (editTotal.startsWith('₹') ? editTotal : `₹${editTotal}`) : selectedOrder.total;
      const updates = {
        service: primaryService,
        serviceType: primaryService,
        services: editServices,
        qty: editQty || 'Standard Package',
        quantity: editQty || 'Standard Package',
        total: cleanTotal,
        totalEstimate: extractBasePrice(cleanTotal) || undefined,
        items: editItems,
        notes: editNotes,
      };

      await update(ref(rtdb, `bookings/${selectedOrder.id}`), updates);

      const updatedOrd: CrmOrder = {
        ...selectedOrder,
        service: primaryService,
        services: editServices,
        qty: editQty || 'Standard Package',
        total: cleanTotal,
        items: editItems,
        notes: editNotes,
      };

      setOrders((prev) => prev.map((o) => (o.id === selectedOrder.id ? updatedOrd : o)));
      setSelectedOrder(updatedOrd);
      setIsEditingOrder(false);
      showToast('Order details & services updated!', 'success');
    } catch (err) {
      console.error('Failed to update order:', err);
      showToast('Failed to update order', 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  const previousOrderCount = useRef<number>(0);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedItem(label);
    showToast(`Copied ${label} to clipboard`, 'info');
    setTimeout(() => setCopiedItem(null), 2000);
  };

  function capitalizeStatus(s: string) {
    if (s === 'new' || s === 'New') return 'New Request';
    if (s === 'confirmed' || s === 'Confirmed') return 'Call Confirmed';
    if (s === 'in-progress' || s === 'In Progress') return 'Cleaning In Progress';
    if (s === 'completed' || s === 'Completed') return 'Delivered';
    if (s === 'cancelled' || s === 'canceled') return 'Cancelled';
    return s;
  }

  // Open the detail sidebar drawer for any contact / order (slide-over modal)
  const handleOpenSidebar = (ord: CrmOrder) => {
    setSelectedOrder(ord);
    setIsSidebarOpen(true);
  };

  // Close the detail sidebar drawer
  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Real-time synchronization directly with Firebase Realtime Database and browser cache
  useEffect(() => {
    let isMounted = true;
    setIsLoadingData(true);

    const safetyTimer = setTimeout(() => {
      if (isMounted) setIsLoadingData(false);
    }, 2500);

    // 1. Initial hydration from local storage if available
    try {
      localStorage.removeItem('uclean_demo_orders');
      const deletedIds = getDeletedOrderIds();
      const localCached = JSON.parse(localStorage.getItem('uclean_local_bookings') || '[]');
      if (Array.isArray(localCached) && localCached.length > 0 && isMounted) {
        const mappedLocal: CrmOrder[] = localCached
          .filter((b: any) => b && !deletedIds.has(b.id) && !deletedIds.has(b.orderId))
          .map((b: any) => {
            const rawTime = b.createdAt || b.timestamp;
            const parsed = parseOrderDetails(
              b.service || b.serviceType,
              b.notes,
              b.items,
              b.quantity || b.qty,
              b.services,
              b.contactPreference || b.contact
            );
            return {
              id: b.id || b.orderId || `UC-${Math.floor(26100 + Math.random() * 8000)}`,
              name: b.customerName || b.name || 'Customer',
              phone: b.phone || '',
              service: parsed.displayService,
              services: parsed.services,
              qty: parsed.quantity || b.quantity || b.qty || 'Standard Package',
              total: b.totalEstimate ? String(b.totalEstimate) : (b.total ? String(b.total) : 'To confirm'),
              address: b.address || 'Nerul West',
              slot: b.slot || `${b.preferredDate || 'Today'} · ${b.preferredTimeSlot || 'Standard Slot'}`,
              date: b.preferredDate || b.date || 'Today',
              time: b.preferredTimeSlot || b.time || 'Standard Slot',
              status: b.status ? capitalizeStatus(b.status) : 'New Request',
              notes: parsed.cleanNotes,
              items: parsed.garments,
              contactPreference: parsed.contact,
              createdAt: rawTime || new Date().toISOString(),
              timestamp: rawTime || new Date().toISOString(),
              callDone: b.status !== 'new' && b.status !== 'New Request',
              pickupDone: ['picked-up', 'Picked Up', 'in-progress', 'Cleaning In Progress', 'Delivered'].includes(b.status),
            };
          });
        setOrders(mappedLocal);
      }
    } catch {
      // ignore
    }

    // 2. Firebase RTDB Live Listener (Client-side real-time sync)
    let unsubscribeRtdb = () => {};
    try {
      const bookingsRef = ref(rtdb, 'bookings');
      unsubscribeRtdb = onValue(
        bookingsRef,
        (snapshot) => {
          if (isMounted) setIsLoadingData(false);
          const deletedIds = getDeletedOrderIds();
          if (snapshot.exists()) {
            const val = snapshot.val();
            const rtdbList: CrmOrder[] = Object.keys(val)
              .map((k) => {
                const item = val[k];
                const rawTime = item.createdAt || item.timestamp;
                const parsed = parseOrderDetails(
                  item.service || item.serviceType,
                  item.notes,
                  item.items,
                  item.quantity || item.qty,
                  item.services,
                  item.contactPreference || item.contact
                );
                return {
                  id: item.id || item.orderId || k,
                  name: item.customerName || item.name || 'Customer',
                  phone: item.phone || '',
                  service: parsed.displayService,
                  services: parsed.services,
                  qty: parsed.quantity || item.quantity || item.qty || 'Standard Package',
                  total: item.totalEstimate ? String(item.totalEstimate) : (item.total ? String(item.total) : 'To confirm'),
                  address: item.address || 'Nerul West',
                  slot: item.slot || `${item.preferredDate || 'Today'} · ${item.preferredTimeSlot || 'Standard Slot'}`,
                  date: item.preferredDate || item.date || 'Today',
                  time: item.preferredTimeSlot || item.time || 'Standard Slot',
                  status: item.status ? capitalizeStatus(item.status) : 'New Request',
                  notes: parsed.cleanNotes,
                  items: parsed.garments,
                  contactPreference: parsed.contact,
                  createdAt: rawTime || new Date().toISOString(),
                  timestamp: rawTime || new Date().toISOString(),
                  callDone: item.status !== 'new' && item.status !== 'New Request',
                  pickupDone: ['picked-up', 'Picked Up', 'in-progress', 'Cleaning In Progress', 'Delivered'].includes(item.status),
                };
              })
              .filter(
                (o) =>
                  !deletedIds.has(o.id) &&
                  !deletedIds.has(o.id.replace(/^#/, ''))
              )
              .reverse();

            if (isMounted) {
              setOrders(rtdbList);

              if (previousOrderCount.current > 0 && rtdbList.length > previousOrderCount.current && soundEnabled) {
                playNewOrderSound();
                showToast('🔔 New Customer Booking Received!', 'success');
              }
              previousOrderCount.current = rtdbList.length;

              setSelectedOrder((prev) => {
                if (!prev) return null;
                if (deletedIds.has(prev.id) || deletedIds.has(prev.id.replace(/^#/, ''))) {
                  setIsSidebarOpen(false);
                  return null;
                }
                return rtdbList.find((m) => m.id === prev.id) || null;
              });
            }
          } else {
            if (isMounted) {
              setOrders([]);
              setSelectedOrder(null);
            }
          }
        },
        (err) => {
          console.warn('RTDB listen warning:', err);
          if (isMounted) setIsLoadingData(false);
        }
      );
    } catch (e) {
      console.warn('RTDB setup notice:', e);
      if (isMounted) setIsLoadingData(false);
    }

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
      unsubscribeRtdb();
    };
  }, [soundEnabled]);

  // Operational KPI Counters
  const opsCounters = useMemo(() => {
    const todayStr = getLocalTodayDateString();
    const callsPending = orders.filter((o) => o.status === 'New Request' || !o.callDone);
    const pickupsToday = orders.filter((o) => {
      const slotLower = (o.slot || '').toLowerCase();
      const dateStr = o.date || '';
      const isToday =
        slotLower.includes('today') ||
        dateStr.toLowerCase().includes('today') ||
        dateStr === todayStr ||
        slotLower.includes(todayStr);
      return isToday && ['New Request', 'Call Confirmed', 'Pickup Assigned'].includes(o.status);
    });
    const inCleaning = orders.filter((o) =>
      ['Picked Up', 'At Store / Inspection', 'Quotation Sent', 'Cleaning In Progress', 'Quality Check'].includes(o.status)
    );
    const readyDelivery = orders.filter((o) => o.status === 'Ready for Delivery' || o.status === 'Out for Delivery');
    const delivered = orders.filter((o) => o.status === 'Delivered');
    const cancelled = orders.filter((o) => o.status === 'Cancelled');
    const activePipeline = orders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled');

    return {
      callsPendingCount: callsPending.length,
      pickupsTodayCount: pickupsToday.length,
      inCleaningCount: inCleaning.length,
      readyDeliveryCount: readyDelivery.length,
      deliveredCount: delivered.length,
      cancelledCount: cancelled.length,
      activePipelineCount: activePipeline.length,
    };
  }, [orders]);

  // Filtered & Sorted orders
  const filteredOrders = useMemo(() => {
    const todayStr = getLocalTodayDateString();
    const list = orders.filter((o) => {
      const q = search.toLowerCase().trim();
      const matchQuery =
        !q ||
        (o.id?.toLowerCase().includes(q) ?? false) ||
        (o.name?.toLowerCase().includes(q) ?? false) ||
        (o.phone?.toLowerCase().includes(q) ?? false) ||
        (o.address?.toLowerCase().includes(q) ?? false) ||
        (o.service?.toLowerCase().includes(q) ?? false);

      if (!matchQuery) return false;

      if (activeNav === 'calls') {
        return o.status === 'New Request' || !o.callDone;
      }
      if (activeNav === 'pickups') {
        const slotLower = (o.slot || '').toLowerCase();
        const dateStr = o.date || '';
        const isToday =
          slotLower.includes('today') ||
          dateStr.toLowerCase().includes('today') ||
          dateStr === todayStr ||
          slotLower.includes(todayStr);
        return isToday && ['New Request', 'Call Confirmed', 'Pickup Assigned'].includes(o.status);
      }
      if (activeNav === 'cleaning') {
        return ['Picked Up', 'At Store / Inspection', 'Quotation Sent', 'Cleaning In Progress', 'Quality Check'].includes(o.status);
      }
      if (activeNav === 'ready') {
        return o.status === 'Ready for Delivery' || o.status === 'Out for Delivery';
      }
      if (activeNav === 'delivered') {
        return o.status === 'Delivered';
      }
      if (activeNav === 'cancelled') {
        return o.status === 'Cancelled';
      }
      return true;
    });

    // Sorting
    return list.sort((a, b) => {
      if (sortOption === 'amount_high') {
        const valA = parseFloat((a.total || '').replace(/[^\d.]/g, '')) || 0;
        const valB = parseFloat((b.total || '').replace(/[^\d.]/g, '')) || 0;
        return valB - valA;
      }
      if (sortOption === 'amount_low') {
        const valA = parseFloat((a.total || '').replace(/[^\d.]/g, '')) || 0;
        const valB = parseFloat((b.total || '').replace(/[^\d.]/g, '')) || 0;
        return valA - valB;
      }
      if (sortOption === 'oldest') {
        const timeA = new Date(a.createdAt || a.timestamp || 0).getTime();
        const timeB = new Date(b.createdAt || b.timestamp || 0).getTime();
        return timeA - timeB;
      }
      // default newest first by booking timestamp
      const timeA = new Date(a.createdAt || a.timestamp || 0).getTime();
      const timeB = new Date(b.createdAt || b.timestamp || 0).getTime();
      return timeB - timeA;
    });
  }, [orders, search, activeNav, sortOption]);

  // Auto-select first order if none selected (for industry CRM docked right panel)
  useEffect(() => {
    if (!selectedOrder && filteredOrders.length > 0) {
      setSelectedOrder(filteredOrders[0]);
    }
  }, [filteredOrders, selectedOrder]);

  // Color config for badges
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'New Request':
        return {
          pillBg: 'bg-amber-50 text-amber-900 border-amber-300 font-bold',
          dot: 'bg-amber-500 animate-pulse',
          accent: 'border-l-amber-500',
          badgeText: 'Call Pending',
        };
      case 'Call Confirmed':
        return {
          pillBg: 'bg-blue-50 text-blue-900 border-blue-300 font-bold',
          dot: 'bg-blue-600',
          accent: 'border-l-blue-600',
          badgeText: 'Call Confirmed',
        };
      case 'Pickup Assigned':
        return {
          pillBg: 'bg-indigo-50 text-indigo-900 border-indigo-300 font-bold',
          dot: 'bg-indigo-600',
          accent: 'border-l-indigo-600',
          badgeText: 'Rider Assigned',
        };
      case 'Picked Up':
        return {
          pillBg: 'bg-purple-50 text-purple-900 border-purple-300 font-bold',
          dot: 'bg-purple-600',
          accent: 'border-l-purple-600',
          badgeText: 'Picked Up',
        };
      case 'At Store / Inspection':
        return {
          pillBg: 'bg-violet-50 text-violet-900 border-violet-300 font-bold',
          dot: 'bg-violet-600',
          accent: 'border-l-violet-600',
          badgeText: 'In Store',
        };
      case 'Quotation Sent':
        return {
          pillBg: 'bg-sky-50 text-sky-900 border-sky-300 font-bold',
          dot: 'bg-sky-600',
          accent: 'border-l-sky-600',
          badgeText: 'Quote Sent',
        };
      case 'Cleaning In Progress':
        return {
          pillBg: 'bg-teal-50 text-teal-900 border-teal-300 font-bold',
          dot: 'bg-teal-600',
          accent: 'border-l-teal-600',
          badgeText: 'Cleaning',
        };
      case 'Quality Check':
        return {
          pillBg: 'bg-cyan-50 text-cyan-900 border-cyan-300 font-bold',
          dot: 'bg-cyan-600',
          accent: 'border-l-cyan-600',
          badgeText: 'Quality Check',
        };
      case 'Ready for Delivery':
        return {
          pillBg: 'bg-emerald-50 text-emerald-900 border-emerald-300 font-extrabold',
          dot: 'bg-emerald-600 animate-pulse',
          accent: 'border-l-emerald-600',
          badgeText: 'Ready',
        };
      case 'Out for Delivery':
        return {
          pillBg: 'bg-emerald-50 text-emerald-900 border-emerald-400 font-bold',
          dot: 'bg-emerald-700',
          accent: 'border-l-emerald-700',
          badgeText: 'Out For Delivery',
        };
      case 'Delivered':
        return {
          pillBg: 'bg-slate-100 text-slate-800 border-slate-300 font-semibold',
          dot: 'bg-slate-600',
          accent: 'border-l-slate-400',
          badgeText: 'Delivered',
        };
      case 'Cancelled':
        return {
          pillBg: 'bg-rose-50 text-rose-800 border-rose-300 font-bold',
          dot: 'bg-rose-600',
          accent: 'border-l-rose-600',
          badgeText: 'Cancelled',
        };
      default:
        return {
          pillBg: 'bg-slate-50 text-slate-700 border-slate-200',
          dot: 'bg-slate-500',
          accent: 'border-l-slate-400',
          badgeText: status,
        };
    }
  };

  // Status Change Handler
  const handleStatusChange = async (targetId: string, newStatus: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === targetId ? { ...o, status: newStatus } : o))
    );

    if (selectedOrder && selectedOrder.id === targetId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    try {
      update(ref(rtdb, `bookings/${targetId}`), {
        status: newStatus,
      }).catch(() => {});
    } catch {
      // Local fallback
    }

    showToast(`Order #${targetId} moved to "${newStatus}"`, 'info');
  };

  // Quick Action: Confirm Call
  const handleMarkCallDone = (targetOrder: CrmOrder) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === targetOrder.id
          ? { ...o, callDone: true, status: 'Call Confirmed' }
          : o
      )
    );
    if (selectedOrder && selectedOrder.id === targetOrder.id) {
      setSelectedOrder((prev) =>
        prev ? { ...prev, callDone: true, status: 'Call Confirmed' } : null
      );
    }

    update(ref(rtdb, `bookings/${targetOrder.id}`), {
      status: 'Call Confirmed',
    }).catch(() => {});

    showToast(`Call confirmed with ${targetOrder.name}`, 'success');
  };

  // Quick Action: Assign Pickup
  const handleAssignPickup = (targetOrder: CrmOrder) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === targetOrder.id
          ? { ...o, callDone: true, status: 'Pickup Assigned' }
          : o
      )
    );
    if (selectedOrder && selectedOrder.id === targetOrder.id) {
      setSelectedOrder((prev) =>
        prev ? { ...prev, callDone: true, status: 'Pickup Assigned' } : null
      );
    }

    update(ref(rtdb, `bookings/${targetOrder.id}`), {
      status: 'Pickup Assigned',
    }).catch(() => {});

    showToast(`Rider assigned for ${targetOrder.name}! Pickup scheduled.`, 'info');
  };

  // Quick Action: Cancel Order
  const handleCancelOrder = (targetOrder: CrmOrder) => {
    const confirmCancel = window.confirm(
      `Are you sure you want to CANCEL Order #${targetOrder.id} (${targetOrder.name})?`
    );
    if (!confirmCancel) return;

    handleStatusChange(targetOrder.id, 'Cancelled');
    showToast(`Order #${targetOrder.id} has been CANCELLED`, 'error');
  };

  // Quick Action: Reactivate Cancelled Order
  const handleReactivateOrder = (targetOrder: CrmOrder) => {
    handleStatusChange(targetOrder.id, 'Call Confirmed');
    showToast(`Order #${targetOrder.id} reactivated (Call Confirmed)!`, 'success');
  };

  // Quick Action: Mark Pickup Done
  const handleMarkPickupDone = (targetOrder: CrmOrder) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === targetOrder.id
          ? { ...o, callDone: true, pickupDone: true, status: 'Picked Up' }
          : o
      )
    );
    if (selectedOrder && selectedOrder.id === targetOrder.id) {
      setSelectedOrder((prev) =>
        prev ? { ...prev, callDone: true, pickupDone: true, status: 'Picked Up' } : null
      );
    }

    update(ref(rtdb, `bookings/${targetOrder.id}`), {
      status: 'Picked Up',
    }).catch(() => {});

    showToast(`Pickup completed! Garments collected from ${targetOrder.name}`, 'success');
  };

  // Quick Action: Start Washing
  const handleStartCleaning = (targetOrder: CrmOrder) => {
    handleStatusChange(targetOrder.id, 'Cleaning In Progress');
    showToast(`Order #${targetOrder.id} moved to Cleaning / Wash!`, 'info');
  };

  // Delete single order permanently from database and cache
  const handleDeleteOrder = async (orderId: string) => {
    const cleanId = orderId.replace(/^#/, '');
    const sure = window.confirm(`Permanently remove Order #${cleanId} from CRM database?\n\nThis will completely erase the order and cannot be undone.`);
    if (!sure) return;

    // 1. Immediately remove from React state & close drawer if selected
    setOrders((prev) => prev.filter((o) => o.id !== orderId && o.id !== cleanId));
    if (selectedOrder && (selectedOrder.id === orderId || selectedOrder.id === cleanId)) {
      setIsSidebarOpen(false);
      setSelectedOrder(null);
    }

    // 2. Perform deep deletion across local storage & Firebase Realtime Database
    try {
      await deleteBooking(orderId);
      showToast(`Order #${cleanId} permanently deleted!`, 'info');
    } catch (e) {
      console.error('Delete order error:', e);
      showToast(`Order #${cleanId} removed`, 'info');
    }
  };

  // Export orders to CSV
  const handleExportCSV = () => {
    if (!orders.length) {
      showToast('No orders to export yet!', 'error');
      return;
    }
    const headers = [
      'Order ID',
      'Customer Name',
      'Phone',
      'Booked Date & Time',
      'Scheduled Slot',
      'Service Package',
      'Amount Estimate',
      'Status',
      'Pickup Address',
      'Notes',
    ];
    const rows = orders.map((o) => {
      const timeInfo = formatBookingTimestamp(o.createdAt || o.timestamp);
      return [
        o.id,
        `"${(o.name || '').replace(/"/g, '""')}"`,
        `"${o.phone || ''}"`,
        `"${timeInfo.fullDateTime}"`,
        `"${(o.slot || '').replace(/"/g, '""')}"`,
        `"${(o.service || '').replace(/"/g, '""')}"`,
        `"${o.total || ''}"`,
        `"${o.status || ''}"`,
        `"${(o.address || '').replace(/"/g, '""')}"`,
        `"${(o.notes || '').replace(/"/g, '""')}"`,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `uclean_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Orders exported to CSV successfully!', 'success');
  };

  // Print Rider Slip
  const handlePrintRiderSlip = (order: CrmOrder) => {
    const timeInfo = formatBookingTimestamp(order.createdAt || order.timestamp);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>UClean Pickup Slip #${order.id}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace; padding: 20px; max-width: 380px; margin: 0 auto; color: #111; line-height: 1.4; }
            .header { text-align: center; border-bottom: 2px dashed #333; padding-bottom: 10px; margin-bottom: 12px; }
            .header h2 { margin: 0; font-size: 18px; font-weight: 900; letter-spacing: 1px; }
            .header p { margin: 2px 0; font-size: 11px; color: #444; }
            .row { display: flex; justify-content: space-between; margin: 6px 0; font-size: 12px; }
            .bold { font-weight: bold; }
            .address { border-top: 1px dashed #444; border-bottom: 1px dashed #444; padding: 8px 0; margin: 10px 0; font-size: 12px; }
            .footer { text-align: center; font-size: 10px; margin-top: 15px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>UCLEAN NERUL WEST</h2>
            <p>Branch #104 · Doorstep Pickup & Delivery</p>
            <p>Store Phone: +91 74004 74132</p>
          </div>
          <div class="row"><span class="bold">ORDER ID:</span> <span class="bold">#${order.id}</span></div>
          <div class="row"><span class="bold">BOOKED ON:</span> <span>${timeInfo.fullDateTime}</span></div>
          <div class="row"><span class="bold">CUSTOMER:</span> <span class="bold">${order.name}</span></div>
          <div class="row"><span class="bold">PHONE:</span> <span class="bold">${order.phone}</span></div>
          <div class="row"><span class="bold">SLOT:</span> <span>${order.slot}</span></div>
          <div class="row"><span class="bold">SERVICE:</span> <span>${order.service}</span></div>
          <div class="row"><span class="bold">ESTIMATE:</span> <span>${order.total}</span></div>
          <div class="address">
            <span class="bold">PICKUP ADDRESS:</span><br/>
            ${order.address}
          </div>
          ${order.notes ? `<div style="font-size:11px; margin-bottom:8px;"><b>Instructions:</b> ${order.notes}</div>` : ''}
          <div class="footer">
            *** PLEASE WEIGH DIGITALLY IN FRONT OF CUSTOMER ***
          </div>
          <script>window.onload = function() { window.print(); }<\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // WhatsApp Drawer Launcher
  const openWhatsAppDrawer = (order: CrmOrder, prefillTemplate?: 1 | 2 | 3) => {
    setSelectedOrder(order);
    setIsWaOpen(true);
    let msg = '';
    if (prefillTemplate === 1) {
      msg = generateBookingConfirmationTemplate({
        customerName: order.name,
        orderId: order.id,
        address: order.address,
        date: order.date || 'Today',
        time: order.time || order.slot,
      });
    } else if (prefillTemplate === 2) {
      msg = generateQuotationTemplate({
        customerName: order.name,
        orderId: order.id,
        services: order.service + (order.items ? ` (${order.items})` : ''),
        amount: quoteAmount || order.total.replace(/[^\d]/g, '') || '450',
      });
    } else if (prefillTemplate === 3) {
      msg = generateReadyForDeliveryTemplate({
        customerName: order.name,
        orderId: order.id,
        amount: quoteAmount || order.total || '450',
      });
    }
    if (msg) {
      setWaInputMessage(msg);
    }
  };

  // Send WhatsApp message (Instantaneous Optimistic UI + non-blocking background API dispatch)
  const handleSendWhatsAppMessage = async (customText?: string) => {
    if (!selectedOrder?.phone) {
      showToast('Customer phone number is missing!', 'error');
      return;
    }
    const textToSend = (typeof customText === 'string' ? customText : waInputMessage).trim();
    if (!textToSend) {
      showToast('Please type a message before sending.', 'error');
      return;
    }

    const orderId = selectedOrder.id;
    const phone = selectedOrder.phone;
    const name = selectedOrder.name;
    const tempId = 'MSG-' + Date.now();

    // 1. INSTANT 0ms OPTIMISTIC UI: Immediately add message bubble into the chat!
    const optimisticMsg: ChatMessage = {
      id: tempId,
      sender: 'store',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'pending',
    };

    setChatHistory((prev) => ({
      ...prev,
      [orderId]: [...(prev[orderId] || []), optimisticMsg],
    }));

    // Clear textarea immediately so user can keep typing without feeling stuck
    if (typeof customText !== 'string') {
      setWaInputMessage('');
    }

    // Fast non-blocking background dispatch
    sendWhatsAppMessage(phone, textToSend)
      .then((res) => {
        if (res.success) {
          // Upgrade checkmark to official WhatsApp blue double-check ✓✓
          setChatHistory((prev) => ({
            ...prev,
            [orderId]: (prev[orderId] || []).map((m) =>
              m.id === tempId ? { ...m, status: 'delivered' } : m
            ),
          }));
          showToast(`WhatsApp message delivered to ${name}!`, 'success');
        } else {
          setChatHistory((prev) => ({
            ...prev,
            [orderId]: (prev[orderId] || []).map((m) =>
              m.id === tempId ? { ...m, status: 'failed' } : m
            ),
          }));
          showToast(`Delivery note: ${res.message || 'WhatsApp Web fallback'}`, 'info');
        }
      })
      .catch(() => {
        setChatHistory((prev) => ({
          ...prev,
          [orderId]: (prev[orderId] || []).map((m) =>
            m.id === tempId ? { ...m, status: 'failed' } : m
          ),
        }));
      });
  };

  // Manual New Order Creator
  const handleCreateNewOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    const nameVal = validateCustomerName(newCustName);
    if (!nameVal.isValid) {
      setNewCustNameError(nameVal.error || 'Please enter full name');
      return;
    }
    setNewCustNameError('');

    const phoneVal = validateIndianMobile(newCustPhone);
    if (!phoneVal.isValid) {
      setNewCustPhoneError(phoneVal.error || 'Please enter valid 10-digit mobile');
      return;
    }
    setNewCustPhoneError('');

    const addressVal = validateAddress(newCustAddress);
    if (!addressVal.isValid) {
      setNewCustAddressError(addressVal.error || 'Please enter complete pickup address');
      return;
    }
    setNewCustAddressError('');

    const newId = 'UC-' + Math.floor(26100 + Math.random() * 8000);
    const nowIso = new Date().toISOString();

    const newOrd: CrmOrder = {
      id: newId,
      name: nameVal.formatted || newCustName.trim(),
      phone: phoneVal.formatted || newCustPhone.trim(),
      service: newCustService,
      qty: 'Standard package',
      total: newCustAmount ? `₹${newCustAmount}` : 'To confirm',
      address: addressVal.formatted || newCustAddress.trim(),
      slot: newCustSlot,
      date: newCustSlot.split('·')[0]?.trim() || 'Today',
      time: newCustSlot.split('·')[1]?.trim() || 'Afternoon',
      status: 'New Request',
      notes: newCustNotes.trim() || 'Walk-in / Phone order logged by desk staff',
      createdAt: nowIso,
      timestamp: nowIso,
      callDone: false,
      pickupDone: false,
    };

    setCreatingOrder(true);
    try {
      await set(ref(rtdb, `bookings/${newId}`), newOrd);
    } catch {
      // Local fallback
    } finally {
      setCreatingOrder(false);
      setNewOrderModalOpen(false);
      setNewCustName('');
      setNewCustPhone('');
      setNewCustAddress('');
      setNewCustNotes('');
    }

    setOrders([newOrd, ...orders]);
    setSelectedOrder(newOrd);
    setIsSidebarOpen(true);
    showToast(`Order #${newId} logged successfully!`, 'success');
  };

  // Copy dispatch summary
  const handleCopyRiderDispatch = (ord: CrmOrder) => {
    const timeInfo = formatBookingTimestamp(ord.createdAt || ord.timestamp);
    const text = `*UCLEAN PICKUP DISPATCH*\nOrder: #${ord.id}\nBooked: ${timeInfo.fullDateTime}\nCustomer: ${ord.name}\nPhone: ${ord.phone}\nSlot: ${ord.slot}\nAddress: ${ord.address}\nServices: ${ord.service}${ord.qty && ord.qty !== 'None' ? `\nApprox Qty: ${ord.qty}` : ''}${ord.items && ord.items !== 'None' ? `\nGarments: ${ord.items}` : ''}${ord.notes && ord.notes !== 'None' ? `\nNotes: ${ord.notes}` : ''}`;
    copyToClipboard(text, 'Rider Dispatch Slip');
  };

  // Helper: Get lifecycle step index
  const getLifecycleIndex = (status: string) => {
    if (status === 'New Request') return 0;
    if (status === 'Call Confirmed' || status === 'Pickup Assigned') return 1;
    if (status === 'Picked Up') return 2;
    if (status === 'At Store / Inspection' || status === 'Quotation Sent') return 3;
    if (status === 'Cleaning In Progress' || status === 'Quality Check') return 4;
    if (status === 'Ready for Delivery' || status === 'Out for Delivery') return 5;
    if (status === 'Delivered') return 6;
    return -1; // Cancelled or unknown
  };

  // Current lifecycle index for selected order
  const currentLifecycleIndex = useMemo(() => {
    if (!selectedOrder) return 0;
    return getLifecycleIndex(selectedOrder.status);
  }, [selectedOrder]);

  // Render Client Detail Content for Slide-Over Drawer
  const renderOrderDetailContent = (ord: CrmOrder) => {
    const timeInfo = formatBookingTimestamp(ord.createdAt || ord.timestamp);
    const cfg = getStatusConfig(ord.status);
    const lifeIdx = getLifecycleIndex(ord.status);

    return (
      <div className="flex flex-col h-full overflow-hidden bg-white">
        {/* Drawer Header */}
        <div className="p-3.5 px-4 sm:p-4 sm:px-5 border-b border-slate-200/90 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-sm shadow-sm shrink-0">
              {ord.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-mono text-xs font-bold text-slate-200 bg-white/10 px-2 py-0.5 rounded border border-white/20">
                  #{ord.id}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border inline-flex items-center gap-1 shrink-0 ${
                    cfg.pillBg
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                  <span className="whitespace-nowrap">{ord.status}</span>
                </span>
              </div>
              <h2 className="font-heading font-black text-base sm:text-lg text-white mt-0.5 leading-tight truncate">
                {ord.name}
              </h2>
            </div>
          </div>

          <button
            onClick={handleCloseSidebar}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer shrink-0 ml-2"
            title="Close Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {/* Booking Timing Card */}
          <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-blue-50/90 p-3.5 sm:p-4 rounded-2xl border border-blue-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-[11px] uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                Customer Booking Timing
              </span>
              <span className="font-mono font-bold text-xs text-blue-800 bg-white/80 px-2 py-0.5 rounded border border-blue-200">
                {timeInfo.timeAgo}
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-blue-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-slate-500 uppercase block">
                  Order Placed At:
                </span>
                <span className="font-heading font-black text-xs sm:text-sm text-slate-900">
                  {timeInfo.fullDateTime}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-semibold text-slate-500 uppercase block">
                  Requested Slot:
                </span>
                <span className="text-xs font-bold text-blue-700">
                  {ord.slot}
                </span>
              </div>
            </div>
          </div>

          {/* Operational Lifecycle Action Hub */}
          <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 rounded-2xl border border-slate-200/90 p-3.5 sm:p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Next Action (Operational Stage)</span>
              </span>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border inline-flex items-center gap-1 shrink-0 ${
                  cfg.pillBg
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                <span className="whitespace-nowrap">{ord.status}</span>
              </span>
            </div>

            {/* Guidance banner based on status */}
            {ord.status === 'New Request' && (
              <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-amber-200/80 flex items-center justify-center shrink-0 text-amber-800 font-black text-xs">
                  1
                </div>
                <div>
                  <p className="font-bold text-amber-950">Step 1: Customer Call Verification Pending</p>
                  <p className="text-[11px] text-amber-800">Call customer to verify order and confirm pickup schedule.</p>
                </div>
              </div>
            )}

            {ord.status === 'Call Confirmed' && (
              <div className="p-2.5 rounded-xl bg-blue-50/90 border border-blue-200 text-blue-900 text-xs flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-blue-200/80 flex items-center justify-center shrink-0 text-blue-800 font-black text-xs">
                  2
                </div>
                <div>
                  <p className="font-bold text-blue-950">Step 2: Call Confirmed ✓ — Schedule Pickup</p>
                  <p className="text-[11px] text-blue-800">Call is confirmed. Assign a rider or record collection directly.</p>
                </div>
              </div>
            )}

            {ord.status === 'Pickup Assigned' && (
              <div className="p-2.5 rounded-xl bg-indigo-50/90 border border-indigo-200 text-indigo-900 text-xs flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-indigo-200/80 flex items-center justify-center shrink-0 text-indigo-800 font-black text-xs">
                  3
                </div>
                <div>
                  <p className="font-bold text-indigo-950">Step 3: Rider Dispatched — Doorstep Collection</p>
                  <p className="text-[11px] text-indigo-800">Rider dispatched to customer address. Click 'Picked Up' once clothes are received.</p>
                </div>
              </div>
            )}

            {['Picked Up', 'At Store / Inspection'].includes(ord.status) && (
              <div className="p-2.5 rounded-xl bg-emerald-50/90 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-emerald-200/80 flex items-center justify-center shrink-0 text-emerald-800 font-black text-xs">
                  ✓
                </div>
                <div>
                  <p className="font-bold text-emerald-950">Clothes Received at Store / Workshop!</p>
                  <p className="text-[11px] text-emerald-800">Begin inspection and cleaning workflow.</p>
                </div>
              </div>
            )}

            {ord.status === 'Cancelled' && (
              <div className="p-2.5 rounded-xl bg-rose-50/90 border border-rose-200 text-rose-900 text-xs flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-rose-200/80 flex items-center justify-center shrink-0 text-rose-800 font-black text-xs">
                  ✕
                </div>
                <div>
                  <p className="font-bold text-rose-950">Order Cancelled</p>
                  <p className="text-[11px] text-rose-800">This order has been cancelled. Click below to reactivate if needed.</p>
                </div>
              </div>
            )}

            {/* 3 Step Action Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5">
              {/* Step 1: Confirm Call */}
              <button
                onClick={() => handleMarkCallDone(ord)}
                className={`h-10 px-2 rounded-xl font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-all active:scale-98 whitespace-nowrap shrink-0 cursor-pointer ${
                  ord.callDone || ['Call Confirmed', 'Pickup Assigned', 'Picked Up', 'At Store / Inspection', 'Cleaning In Progress', 'Ready for Delivery', 'Delivered'].includes(ord.status)
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                    : ord.status === 'New Request'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs ring-2 ring-blue-400/50'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
                title="1. Confirm call with customer"
              >
                {ord.callDone || ord.status !== 'New Request' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                ) : (
                  <PhoneCall className="w-3.5 h-3.5 text-white shrink-0" />
                )}
                <span className="whitespace-nowrap">
                  {ord.callDone || ord.status !== 'New Request'
                    ? 'Call Confirmed ✓'
                    : '1. Confirm Call'}
                </span>
              </button>

              {/* Step 2: Assign Pickup */}
              <button
                onClick={() => handleAssignPickup(ord)}
                className={`h-10 px-2 rounded-xl font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-all active:scale-98 whitespace-nowrap shrink-0 cursor-pointer ${
                  ord.status === 'Pickup Assigned'
                    ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-400/50'
                    : ['Picked Up', 'At Store / Inspection', 'Cleaning In Progress', 'Ready for Delivery', 'Delivered'].includes(ord.status)
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
                    : ord.status === 'Call Confirmed'
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs ring-2 ring-amber-300'
                    : 'bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200'
                }`}
                title="2. Assign rider to collect clothes"
              >
                <Truck className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">
                  {ord.status === 'Pickup Assigned'
                    ? 'Rider Assigned ✓'
                    : ['Picked Up', 'At Store / Inspection', 'Cleaning In Progress', 'Ready for Delivery', 'Delivered'].includes(ord.status)
                    ? 'Pickup Done ✓'
                    : '2. Assign Pickup'}
                </span>
              </button>

              {/* Step 3: Picked Up */}
              <button
                onClick={() => handleMarkPickupDone(ord)}
                className={`h-10 px-2 rounded-xl font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-all active:scale-98 whitespace-nowrap shrink-0 cursor-pointer ${
                  ['Picked Up', 'At Store / Inspection', 'Cleaning In Progress', 'Ready for Delivery', 'Delivered'].includes(ord.status)
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                    : ord.status === 'Pickup Assigned' || ord.status === 'Call Confirmed'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs ring-2 ring-emerald-400/50'
                    : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200'
                }`}
                title="3. Mark clothes collected from customer"
              >
                <Package className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">
                  {['Picked Up', 'At Store / Inspection', 'Cleaning In Progress', 'Ready for Delivery', 'Delivered'].includes(ord.status)
                    ? 'Picked Up ✓'
                    : '3. Mark Picked Up'}
                </span>
              </button>
            </div>

            {/* Additional next step for workshop if clothes already picked up */}
            {['Picked Up', 'At Store / Inspection'].includes(ord.status) && (
              <div className="pt-1 flex items-center gap-2">
                <button
                  onClick={() => handleStartCleaning(ord)}
                  className="flex-1 h-9 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs inline-flex items-center justify-center gap-1.5 shadow-2xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span className="whitespace-nowrap">Start Washing / Cleaning</span>
                </button>
              </div>
            )}

            {/* Secondary Row: Safe Cancellation / Reactivate Options */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              {ord.status === 'Cancelled' ? (
                <button
                  onClick={() => handleReactivateOrder(ord)}
                  className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-2xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3 shrink-0" />
                  <span className="whitespace-nowrap">Reactivate Order</span>
                </button>
              ) : (
                <button
                  onClick={() => handleCancelOrder(ord)}
                  className="h-8 px-2.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 font-semibold text-[11px] inline-flex items-center gap-1.5 border border-slate-200 hover:border-rose-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  title="Cancel this order if customer declined"
                >
                  <Ban className="w-3 h-3 text-rose-500 shrink-0" />
                  <span className="whitespace-nowrap">Cancel Order</span>
                </button>
              )}

              <span className="text-[10px] text-slate-400 font-medium ml-auto hidden sm:inline">
                Status: {ord.status}
              </span>
            </div>
          </div>

          {/* Direct Communications Strip (Call, WhatsApp, Print Slip) */}
          <div className="flex items-center gap-2 pt-1 flex-wrap sm:flex-nowrap">
            <a
              href={`tel:${ord.phone}`}
              className="flex-1 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs inline-flex items-center justify-center gap-1.5 border border-slate-200 transition-colors whitespace-nowrap shrink-0"
            >
              <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="whitespace-nowrap truncate">Call {ord.phone}</span>
            </a>

            <button
              onClick={() => openWhatsAppDrawer(ord, 1)}
              className="flex-1 h-9 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs inline-flex items-center justify-center gap-1.5 shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">WhatsApp Chat</span>
            </button>

            <button
              onClick={() => handlePrintRiderSlip(ord)}
              className="h-9 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs inline-flex items-center justify-center gap-1 border border-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title="Print Thermal / Rider Pickup Slip"
            >
              <Printer className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">Print Slip</span>
            </button>
          </div>

          {/* Order Lifecycle Visual Progress Stepper */}
          <div className="bg-slate-50/90 p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="text-[11px] uppercase tracking-wider text-slate-500">
                Order Lifecycle Pipeline
              </span>
              {ord.status === 'Cancelled' ? (
                <span className="text-rose-600 font-bold text-[11px]">
                  STATUS: CANCELLED
                </span>
              ) : (
                <span className="text-blue-700 font-mono text-[11px]">
                  Step {lifeIdx + 1} of 7
                </span>
              )}
            </div>

            {/* Stepper Dots */}
            <div className="grid grid-cols-7 gap-1 pt-1">
              {ORDER_LIFECYCLE_STEPS.map((step, idx) => {
                const isDone = idx < lifeIdx;
                const isCurrent = idx === lifeIdx;

                return (
                  <button
                    key={step.key}
                    onClick={() => handleStatusChange(ord.id, step.key)}
                    className={`group flex flex-col items-center text-center p-1 rounded-lg transition-all ${
                      isCurrent ? 'bg-blue-600/10' : 'hover:bg-slate-200/50'
                    }`}
                    title={`Click to set status to ${step.label}`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-mono transition-all ${
                        isDone
                          ? 'bg-emerald-600 text-white'
                          : isCurrent
                          ? 'bg-blue-600 text-white ring-2 ring-blue-400/40 shadow-xs'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isDone ? <Check className="w-3 h-3" /> : idx + 1}
                    </div>
                    <span
                      className={`text-[9.5px] mt-1 font-semibold truncate max-w-full ${
                        isCurrent
                          ? 'text-blue-700 font-black'
                          : isDone
                          ? 'text-emerald-700'
                          : 'text-slate-500'
                      }`}
                    >
                      {step.short}
                    </span>
                  </button>
                );
              })}
            </div>

            {ord.status === 'Cancelled' && (
              <div className="mt-2 p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <Ban className="w-4 h-4 text-rose-600 shrink-0" />
                <span>This booking is marked as <b>Cancelled</b>. Click any step above to reactivate.</span>
              </div>
            )}
          </div>

          {/* Customer Pickup Address & Maps */}
          <div className="bg-slate-50/80 p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Pickup Address
              </span>
              <button
                onClick={() => copyToClipboard(ord.address, 'Address')}
                className="text-[10.5px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-0.5 cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </button>
            </div>
            <p className="font-semibold text-slate-900 leading-relaxed">
              {ord.address || 'Address not provided'}
            </p>
            <div className="pt-1 flex items-center justify-between">
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(
                  `${ord.address}, Nerul West, Navi Mumbai`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-bold"
              >
                <Navigation className="w-3 h-3" />
                <span>Open in Google Maps &rarr;</span>
              </a>
              <button
                onClick={() => handleCopyRiderDispatch(ord)}
                className="text-[11px] text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>Copy Rider Slip</span>
              </button>
            </div>
          </div>

          {/* Selected Services & Order Specifications Card */}
          <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4 sm:p-4.5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Selected Service(s)</span>
              </span>
              <div className="flex items-center gap-2">
                {ord.total && ord.total !== 'To confirm' && ord.total !== '0' ? (
                  <span className="font-mono font-bold text-xs text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                    Total: {ord.total.startsWith('₹') ? ord.total : `₹${ord.total}`}
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    To confirm after weigh/call
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleOpenEditOrder(ord)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-2xs transition active:scale-95 cursor-pointer"
                  title="Edit Selected Services, Quantity or Set Total Price"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Set Price / Edit</span>
                </button>
              </div>
            </div>

            {/* Service Badges */}
            <div className="space-y-1.5">
              {(ord.services && ord.services.length > 0 ? ord.services : [ord.service]).map((srv, sIdx) => {
                const disp = getServiceDisplay(srv);
                return (
                  <div
                    key={sIdx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/90 text-emerald-950 font-bold text-xs shadow-2xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center text-[11px] font-black shrink-0">
                        ✓
                      </span>
                      <span className="text-sm shrink-0">{disp.icon}</span>
                      <div className="min-w-0 flex items-center gap-2 flex-wrap">
                        <span className="truncate">{disp.title}</span>
                        {disp.rate && (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md border border-emerald-300/80">
                            {disp.rate}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[9.5px] uppercase tracking-wide font-extrabold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200/80 shrink-0">
                      Selected
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Structured Specifications Grid */}
            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              {/* Approx Quantity */}
              <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-0.5">
                  <Package className="w-3 h-3 text-slate-400" />
                  Approx. Quantity
                </span>
                <p className="font-bold text-slate-800 text-[11.5px] truncate">
                  {ord.qty && ord.qty !== 'None' ? ord.qty : 'Standard Bag / To Weigh'}
                </p>
              </div>

              {/* Garment Details */}
              <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-0.5">
                  <FileText className="w-3 h-3 text-slate-400" />
                  Garments Note
                </span>
                <p className="font-bold text-slate-800 text-[11.5px] truncate">
                  {ord.items && ord.items !== 'None' ? ord.items : 'General Clothes'}
                </p>
              </div>

              {/* Contact Preference */}
              <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-0.5">
                  <PhoneCall className="w-3 h-3 text-slate-400" />
                  Contact Via
                </span>
                <p className="font-bold text-emerald-700 text-[11.5px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {ord.contactPreference || 'WhatsApp'}
                </p>
              </div>

              {/* Pickup Time Window */}
              <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-0.5">
                  <Clock className="w-3 h-3 text-slate-400" />
                  Pickup Slot
                </span>
                <p className="font-bold text-blue-700 text-[11.5px] truncate">
                  {ord.slot}
                </p>
              </div>
            </div>

            {/* Customer Special Instructions (cleanly separated, only if present) */}
            {ord.notes && ord.notes.trim() && ord.notes.trim() !== 'None' && (
              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/90 text-xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wide text-amber-800 flex items-center gap-1">
                  <FileText className="w-3 h-3 text-amber-600" />
                  Customer Instructions
                </span>
                <p className="font-medium text-amber-950 italic">
                  &ldquo;{ord.notes}&rdquo;
                </p>
              </div>
            )}
          </div>

          {/* WhatsApp Notification Action Cards */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
              Send WhatsApp Customer Updates:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Template 1: Pickup Confirmed */}
              <button
                onClick={() => openWhatsAppDrawer(ord, 1)}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 text-left transition-all active:scale-98 group cursor-pointer"
              >
                <span className="text-[9.5px] font-bold uppercase tracking-wide text-blue-700 block">
                  Template 1
                </span>
                <h5 className="font-bold text-xs text-slate-900 group-hover:text-blue-900 mt-0.5">
                  Pickup Confirmed
                </h5>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Send receipt
                </p>
              </button>

              {/* Template 2: Send Quotation */}
              <button
                onClick={() => openWhatsAppDrawer(ord, 2)}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-purple-50/60 border border-slate-200 hover:border-purple-300 text-left transition-all active:scale-98 group cursor-pointer"
              >
                <span className="text-[9.5px] font-bold uppercase tracking-wide text-purple-700 block">
                  Template 2
                </span>
                <h5 className="font-bold text-xs text-slate-900 group-hover:text-purple-900 mt-0.5">
                  Send Quotation
                </h5>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Garment price
                </p>
              </button>

              {/* Template 3: Ready for Delivery */}
              <button
                onClick={() => openWhatsAppDrawer(ord, 3)}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 text-left transition-all active:scale-98 group cursor-pointer"
              >
                <span className="text-[9.5px] font-bold uppercase tracking-wide text-emerald-700 block">
                  Template 3
                </span>
                <h5 className="font-bold text-xs text-slate-900 group-hover:text-emerald-900 mt-0.5">
                  Ready for Delivery
                </h5>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Delivery notice
                </p>
              </button>
            </div>
          </div>

          {/* Status Transition Selector */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
              Change Status Directly:
            </span>

            <div className="space-y-2">
              {STATUS_GROUPS.map((grp) => (
                <div key={grp.group} className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5">
                    <span>{grp.group}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {grp.statuses.map((st) => {
                      const isCurrent = ord.status === st;
                      const statusCfg = getStatusConfig(st);

                      return (
                        <button
                          key={st}
                          onClick={() => handleStatusChange(ord.id, st)}
                          className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                            isCurrent
                              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isCurrent ? 'bg-white' : statusCfg.dot}`} />
                          <span>{st}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delete Order option */}
          <div className="pt-3 border-t border-slate-200 flex justify-end">
            <button
              onClick={() => handleDeleteOrder(ord.id)}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete This Order Permanently</span>
            </button>
          </div>

        </div>
      </div>
    );
  };

  // Unique Customers aggregated from bookings
  const uniqueCustomers = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        phone: string;
        address: string;
        ordersCount: number;
        totalSpent: number;
        latestDate: string;
        latestStatus: string;
      }
    >();
    for (const o of orders) {
      const key = (o.phone || o.name || '').trim();
      if (!key) continue;
      const existing = map.get(key);
      const amount = parseFloat((o.total || '').replace(/[^\d.]/g, '')) || 0;
      if (existing) {
        existing.ordersCount += 1;
        existing.totalSpent += amount;
        const curTime = new Date(o.createdAt || o.timestamp || 0).getTime();
        const prevTime = new Date(existing.latestDate || 0).getTime();
        if (curTime > prevTime) {
          existing.latestDate = o.createdAt || o.timestamp || '';
          existing.address = o.address || existing.address;
          existing.latestStatus = o.status;
        }
      } else {
        map.set(key, {
          name: o.name,
          phone: o.phone,
          address: o.address,
          ordersCount: 1,
          totalSpent: amount,
          latestDate: o.createdAt || o.timestamp || '',
          latestStatus: o.status,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.ordersCount - a.ordersCount);
  }, [orders]);

  // Fleet Drivers Dispatch Data
  const fleetDrivers = [
    {
      id: 'D-01',
      name: 'Rahul Sharma',
      phone: '9820198201',
      vehicle: 'Hero Nyx Electric (MH-43-BE-4102)',
      zone: 'Nerul West & Seawoods',
      status: 'On Active Route',
      assignedPickups: orders.filter((o) => o.status === 'Pickup Assigned').slice(0, 3),
      completedToday: 8,
      rating: '4.9 ★',
    },
    {
      id: 'D-02',
      name: 'Amit Verma',
      phone: '9819234812',
      vehicle: 'TVS iQube (MH-43-CF-7811)',
      zone: 'Palm Beach Road & Sector 6',
      status: 'Available at Store',
      assignedPickups: orders.filter((o) => o.status === 'Ready for Delivery').slice(0, 2),
      completedToday: 6,
      rating: '4.8 ★',
    },
    {
      id: 'D-03',
      name: 'Vikram Singh',
      phone: '9821876543',
      vehicle: 'Bajaj Chetak EV (MH-43-DA-2041)',
      zone: 'Nerul East & Sector 19',
      status: 'On Delivery Run',
      assignedPickups: orders.filter((o) => o.status === 'Out for Delivery').slice(0, 2),
      completedToday: 5,
      rating: '5.0 ★',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* 1. TOP EXECUTIVE CRM CONTROL BAR */}
      <header className="bg-white border-b border-slate-200/90 sticky top-0 z-20 shadow-xs">
        <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Brand & Storefront Return */}
          <div className="flex items-center justify-between md:justify-start gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <button
                onClick={onBackToStore}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer shrink-0"
                title="Return to Customer Storefront"
              >
                <ArrowLeft className="w-4 h-4 shrink-0" />
              </button>

                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 flex items-center justify-center font-black text-white text-base shadow-sm shrink-0">
                    U
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <h1 className="font-heading font-black text-sm sm:text-base text-slate-900 leading-tight whitespace-nowrap">
                        UCLEAN CRM
                      </h1>
                      <span className="inline-flex items-center gap-1 text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        Live Cloud Sync
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">
                      Nerul West &bull; Store Dispatch Desk
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Order Button for Mobile Top Bar */}
              <div className="flex items-center gap-1.5 md:hidden">
                <button
                  onClick={() => setNewOrderModalOpen(true)}
                  className="h-8 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1 shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 shrink-0" />
                  <span className="whitespace-nowrap">+ Order</span>
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="w-full md:flex-1 md:max-w-md md:mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search customer, mobile, ID, address..."
                  className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-300/80 focus:border-blue-600 focus:bg-white rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition-all"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Action Tools */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none w-full md:w-auto shrink-0">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 shrink-0">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-all ${
                    viewMode === 'table' ? 'bg-white shadow-xs text-blue-700 font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Table List View"
                >
                  <List className="w-3.5 h-3.5 shrink-0" />
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`p-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-all ${
                    viewMode === 'cards' ? 'bg-white shadow-xs text-blue-700 font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Cards Grid View"
                >
                  <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
                </button>
              </div>

              {/* Sound notification toggle */}
              <button
                onClick={() => {
                  setSoundEnabled(!soundEnabled);
                  showToast(soundEnabled ? 'Chime alerts muted' : 'Chime alerts activated', 'info');
                }}
              className={`p-2 rounded-xl border transition-colors shrink-0 ${
                soundEnabled
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-slate-100 border-slate-200 text-slate-400'
              }`}
              title={soundEnabled ? 'Live Order Sound: Active' : 'Live Order Sound: Muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 shrink-0" /> : <VolumeX className="w-4 h-4 shrink-0" />}
            </button>

            {/* Export CSV button */}
            <button
              onClick={handleExportCSV}
              className="h-9 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs inline-flex items-center gap-1.5 border border-slate-200 transition-colors whitespace-nowrap shrink-0"
              title="Download Orders to Excel / CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span className="whitespace-nowrap">Export CSV</span>
            </button>

            {/* + New Order Button (Desktop view) */}
            <button
              onClick={() => setNewOrderModalOpen(true)}
              className="hidden md:inline-flex h-9 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs items-center gap-1.5 shadow-xs transition-colors active:scale-98 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">+ New Order</span>
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                className="h-9 px-3 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-semibold text-xs inline-flex items-center gap-1.5 border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                title="Sign out of Admin Portal"
              >
                <LogOut className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">Log Out</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. OPERATIONAL KPI METRIC CARDS STRIP */}
      {/* ========================================================================= */}
      <section className="bg-white border-b border-slate-200/90 px-3 sm:px-6 lg:px-8 py-3">
        <div className="w-full max-w-[1920px] mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
          
          {/* Card 1: 📞 Calls Pending */}
          <button
            onClick={() => setActiveNav('calls')}
            className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
              activeNav === 'calls'
                ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/30 shadow-xs'
                : 'bg-slate-50/70 border-slate-200 hover:border-amber-300 hover:bg-amber-50/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1 whitespace-nowrap truncate">
                <PhoneCall className="w-3 h-3 text-amber-600 shrink-0" />
                Calls Pending
              </span>
              {opsCounters.callsPendingCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
              )}
            </div>
            <div className="mt-1.5 flex items-baseline justify-between">
              <span className="text-xl font-heading font-black text-slate-900">
                {opsCounters.callsPendingCount}
              </span>
              <span className="text-[11px] text-amber-700 font-bold whitespace-nowrap">To Call</span>
            </div>
          </button>

          {/* Card 2: 🚚 Today's Pickups */}
          <button
            onClick={() => setActiveNav('pickups')}
            className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
              activeNav === 'pickups'
                ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-400/30 shadow-xs'
                : 'bg-slate-50/70 border-slate-200 hover:border-blue-300 hover:bg-blue-50/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wide flex items-center gap-1 whitespace-nowrap truncate">
                <Truck className="w-3 h-3 text-blue-600 shrink-0" />
                Today's Pickups
              </span>
              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
            </div>
            <div className="mt-1.5 flex items-baseline justify-between">
              <span className="text-xl font-heading font-black text-slate-900">
                {opsCounters.pickupsTodayCount}
              </span>
              <span className="text-[11px] text-blue-700 font-bold whitespace-nowrap">Due Today</span>
            </div>
          </button>

          {/* Card 3: 🧼 Workshop / In Cleaning */}
          <button
            onClick={() => setActiveNav('cleaning')}
            className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
              activeNav === 'cleaning'
                ? 'bg-teal-50 border-teal-400 ring-2 ring-teal-400/30 shadow-xs'
                : 'bg-slate-50/70 border-slate-200 hover:border-teal-300 hover:bg-teal-50/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-teal-900 uppercase tracking-wide flex items-center gap-1 whitespace-nowrap truncate">
                <Sparkles className="w-3 h-3 text-teal-600 shrink-0" />
                In Cleaning
              </span>
              <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
            </div>
            <div className="mt-1.5 flex items-baseline justify-between">
              <span className="text-xl font-heading font-black text-slate-900">
                {opsCounters.inCleaningCount}
              </span>
              <span className="text-[11px] text-teal-700 font-bold whitespace-nowrap">Workshop</span>
            </div>
          </button>

          {/* Card 4: 📦 Ready for Delivery */}
          <button
            onClick={() => setActiveNav('ready')}
            className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
              activeNav === 'ready'
                ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400/30 shadow-xs'
                : 'bg-slate-50/70 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wide flex items-center gap-1 whitespace-nowrap truncate">
                <Package className="w-3 h-3 text-emerald-600 shrink-0" />
                Ready Delivery
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            </div>
            <div className="mt-1.5 flex items-baseline justify-between">
              <span className="text-xl font-heading font-black text-slate-900">
                {opsCounters.readyDeliveryCount}
              </span>
              <span className="text-[11px] text-emerald-700 font-bold whitespace-nowrap">Packed</span>
            </div>
          </button>

          {/* Card 5: ❌ Cancelled */}
          <button
            onClick={() => setActiveNav('cancelled')}
            className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
              activeNav === 'cancelled'
                ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-400/30 shadow-xs'
                : 'bg-slate-50/70 border-slate-200 hover:border-rose-300 hover:bg-rose-50/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-rose-900 uppercase tracking-wide flex items-center gap-1 whitespace-nowrap truncate">
                <Ban className="w-3 h-3 text-rose-600 shrink-0" />
                Cancelled
              </span>
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
            </div>
            <div className="mt-1.5 flex items-baseline justify-between">
              <span className="text-xl font-heading font-black text-slate-900">
                {opsCounters.cancelledCount}
              </span>
              <span className="text-[11px] text-rose-700 font-bold whitespace-nowrap">Canceld</span>
            </div>
          </button>

          {/* Card 6: 📋 Total Active */}
          <button
            onClick={() => setActiveNav('all')}
            className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
              activeNav === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 whitespace-nowrap truncate ${
                activeNav === 'all' ? 'text-slate-300' : 'text-slate-600'
              }`}>
                <Layers className="w-3 h-3 shrink-0" />
                All Bookings
              </span>
              <span className={`w-2 h-2 rounded-full shrink-0 ${activeNav === 'all' ? 'bg-blue-400' : 'bg-slate-400'}`} />
            </div>
            <div className="mt-1.5 flex items-baseline justify-between">
              <span className={`text-xl font-heading font-black ${
                activeNav === 'all' ? 'text-white' : 'text-slate-900'
              }`}>
                {orders.length}
              </span>
              <span className={`text-[11px] font-bold whitespace-nowrap ${
                activeNav === 'all' ? 'text-blue-300' : 'text-slate-500'
              }`}>
                Total
              </span>
            </div>
          </button>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. MAIN WORKSPACE: FULL-WIDTH ORDERS & CONTACTS TABLE/GRID */}
      {/* ========================================================================= */}
      <main className="flex-1 w-full max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4">
        
        {/* Workspace Subheader with Filter Tabs & Sort */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3 px-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold pb-1 lg:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveNav('all')}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                activeNav === 'all'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Orders ({orders.length})
            </button>

            <button
              onClick={() => setActiveNav('calls')}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeNav === 'calls'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200/70'
              }`}
            >
              <PhoneCall className="w-3 h-3 shrink-0" />
              <span className="whitespace-nowrap">Calls Pending ({opsCounters.callsPendingCount})</span>
            </button>

            <button
              onClick={() => setActiveNav('pickups')}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeNav === 'pickups'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-200/70'
              }`}
            >
              <Truck className="w-3 h-3 shrink-0" />
              <span className="whitespace-nowrap">Today's Pickups ({opsCounters.pickupsTodayCount})</span>
            </button>

            <button
              onClick={() => setActiveNav('cleaning')}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeNav === 'cleaning'
                  ? 'bg-teal-600 text-white font-bold shadow-xs'
                  : 'bg-teal-50 text-teal-900 hover:bg-teal-100 border border-teal-200/70'
              }`}
            >
              <Sparkles className="w-3 h-3 shrink-0" />
              <span className="whitespace-nowrap">In Cleaning ({opsCounters.inCleaningCount})</span>
            </button>

            <button
              onClick={() => setActiveNav('ready')}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeNav === 'ready'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200/70'
              }`}
            >
              <Package className="w-3 h-3 shrink-0" />
              <span className="whitespace-nowrap">Ready ({opsCounters.readyDeliveryCount})</span>
            </button>

            <button
              onClick={() => setActiveNav('delivered')}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeNav === 'delivered'
                  ? 'bg-slate-800 text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Check className="w-3 h-3 shrink-0" />
              <span className="whitespace-nowrap">Delivered ({opsCounters.deliveredCount})</span>
            </button>

            <button
              onClick={() => setActiveNav('cancelled')}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeNav === 'cancelled'
                  ? 'bg-rose-600 text-white font-bold shadow-xs'
                  : 'bg-rose-50 text-rose-900 hover:bg-rose-100 border border-rose-200/70'
              }`}
            >
              <Ban className="w-3 h-3 shrink-0" />
              <span className="whitespace-nowrap">Cancelled ({opsCounters.cancelledCount})</span>
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
            <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">Sort by:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
            >
              <option value="newest">Booking: Newest First</option>
              <option value="oldest">Booking: Oldest First</option>
              <option value="amount_high">Amount: High to Low</option>
              <option value="amount_low">Amount: Low to High</option>
            </select>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* ORDERS DISPLAY: FULL-WIDTH TABLE / CARDS VIEW */}
        {/* ======================================================================= */}
        <div className="w-full space-y-4">
          {isLoadingData ? (
            /* Live Data Loading Skeleton Effect (Follows Global UI Rules: clean minimal layout, soft gray, purple accent) */
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
              {/* Header Status Strip */}
              <div className="p-3.5 px-5 bg-gradient-to-r from-purple-50/80 via-slate-50 to-purple-50/80 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="relative flex items-center justify-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-ping absolute opacity-75" />
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600 relative" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    Loading live bookings from database...
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-purple-700 font-bold bg-white px-2.5 py-1 rounded-lg border border-purple-200 shadow-2xs">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Syncing Live Data</span>
                </div>
              </div>

              {/* Shimmering Skeleton Table Rows */}
              <div className="divide-y divide-slate-100 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="p-4 px-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-200/90 shrink-0" />
                      <div className="space-y-1.5">
                        <div className="h-4 w-32 sm:w-44 bg-slate-200 rounded" />
                        <div className="h-2.5 w-24 bg-slate-100 rounded" />
                      </div>
                    </div>
                    <div className="hidden sm:block h-3.5 w-28 bg-slate-100 rounded" />
                    <div className="hidden md:block h-6 w-36 bg-slate-100 rounded-lg" />
                    <div className="h-3.5 w-16 bg-slate-200/80 rounded" />
                    <div className="h-5 w-24 bg-slate-100 rounded-full" />
                    <div className="hidden lg:flex gap-1.5">
                      <div className="h-7 w-16 bg-slate-100 rounded-lg" />
                      <div className="h-7 w-7 bg-slate-100 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : filteredOrders.length === 0 ? (
              /* Empty State */
              <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center shadow-xs space-y-4 max-w-lg mx-auto mt-6">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto border border-slate-200 shadow-inner">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-lg text-slate-900">
                    {orders.length === 0 ? 'No Active Orders' : 'No Matching Bookings'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                    {orders.length === 0
                      ? 'Portal is ready for client delivery! New customer bookings submitted through the storefront form or WhatsApp will arrive here live in real-time.'
                      : 'Try clearing your search query or switching the status filter tab above.'}
                  </p>
                </div>
                <div className="pt-2 flex justify-center gap-2">
                  <button
                    onClick={() => setNewOrderModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add Manual Order</span>
                  </button>
                  {orders.length > 0 && (
                    <button
                      onClick={() => {
                        setActiveNav('all');
                        setSearch('');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                    >
                      View All Orders
                    </button>
                  )}
                </div>
              </div>
            ) : viewMode === 'table' ? (
              /* ===================================================================== */
              /* TABLE VIEW: FULL-WIDTH DENSE & CLEAR CONTACTS SPREAD WITH CRISP LINES */
              /* ===================================================================== */
              <div className="bg-white rounded-2xl border border-slate-300 shadow-xs overflow-hidden">
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left border-collapse table-auto">
                    <thead>
                      <tr className="bg-slate-100/95 border-b-2 border-slate-300 text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                        <th className="py-3 px-3.5 whitespace-nowrap">Customer</th>
                        <th className="py-3 px-3.5 whitespace-nowrap">Order ID</th>
                        <th className="py-3 px-3.5 whitespace-nowrap">Booked On</th>
                        <th className="py-3 px-3.5 whitespace-nowrap">Pickup Slot</th>
                        <th className="py-3 px-3.5 whitespace-nowrap">Service</th>
                        <th className="py-3 px-3.5 whitespace-nowrap">Total</th>
                        <th className="py-3 px-3.5 whitespace-nowrap">Status</th>
                        <th className="py-3 px-3.5 text-right whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-slate-200/90 text-xs font-medium">
                      {filteredOrders.map((ord) => {
                        const timeInfo = formatBookingTimestamp(ord.createdAt || ord.timestamp);
                        const cfg = getStatusConfig(ord.status);
                        const isSelected = selectedOrder?.id === ord.id;

                        return (
                          <tr
                            key={ord.id}
                            onClick={() => handleOpenSidebar(ord)}
                            className={`border-b-2 border-slate-200 transition-all cursor-pointer group ${
                              isSelected
                                ? 'bg-blue-50/95 border-l-4 border-l-blue-600 shadow-2xs font-semibold'
                                : 'hover:bg-blue-50/50 odd:bg-white even:bg-slate-50/70 border-l-4 border-l-transparent'
                            }`}
                          >
                            {/* Customer & Mobile */}
                            <td className="py-3 px-3.5 whitespace-nowrap">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                                  {ord.name.slice(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <span className="font-heading font-black text-xs text-slate-900 group-hover:text-blue-700 block whitespace-nowrap truncate max-w-[130px] xl:max-w-[180px]">
                                    {ord.name}
                                  </span>
                                  <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 whitespace-nowrap">
                                    <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span className="font-mono whitespace-nowrap">{ord.phone || 'No phone'}</span>
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Order ID */}
                            <td className="py-3 px-3.5 whitespace-nowrap">
                              <span className="font-mono font-bold text-[11px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/90 whitespace-nowrap inline-block">
                                #{ord.id}
                              </span>
                            </td>

                            {/* Booked On */}
                            <td className="py-3 px-3.5 whitespace-nowrap">
                              <div className="whitespace-nowrap">
                                <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1 whitespace-nowrap">
                                  <Calendar className="w-3 h-3 text-blue-600 shrink-0" />
                                  <span className="whitespace-nowrap">{timeInfo.fullDateTime}</span>
                                </span>
                                <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded mt-0.5 inline-block whitespace-nowrap">
                                  {timeInfo.timeAgo}
                                </span>
                              </div>
                            </td>

                            {/* Pickup Schedule Window */}
                            <td className="py-3 px-3.5 text-slate-700 whitespace-nowrap">
                              <div className="flex items-center gap-1 whitespace-nowrap">
                                <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="font-semibold text-[11px] whitespace-nowrap truncate max-w-[130px] block">
                                  {ord.slot}
                                </span>
                              </div>
                            </td>

                            {/* Service Package */}
                            <td className="py-3 px-3.5 text-slate-700 whitespace-nowrap">
                              <span
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200/90 font-bold text-[11px] max-w-[180px] xl:max-w-[220px] truncate shadow-2xs"
                                title={ord.service}
                              >
                                <ShoppingBag className="w-3 h-3 text-emerald-600 shrink-0" />
                                <span className="truncate">{ord.service}</span>
                              </span>
                            </td>

                            {/* Total Amount */}
                            <td className="py-3 px-3.5 whitespace-nowrap">
                              {ord.total && ord.total !== 'To confirm' && ord.total !== '0' ? (
                                <span className="font-mono font-bold text-slate-900 text-xs whitespace-nowrap">
                                  {ord.total.startsWith('₹') ? ord.total : `₹${ord.total}`}
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 whitespace-nowrap">
                                  To confirm
                                </span>
                              )}
                            </td>

                            {/* Status Chip */}
                            <td className="py-3 px-3.5 whitespace-nowrap">
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border inline-flex items-center gap-1 whitespace-nowrap shrink-0 ${cfg.pillBg}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                                <span className="whitespace-nowrap">{ord.status}</span>
                              </span>
                            </td>

                            {/* Quick Row Actions */}
                            <td className="py-3 px-3.5 text-right whitespace-nowrap shrink-0" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                                {/* Step 1: Confirm Call button */}
                                {ord.status === 'New Request' && (
                                  <button
                                    onClick={() => handleMarkCallDone(ord)}
                                    className="h-7 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10.5px] inline-flex items-center gap-1 shadow-2xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                                    title="Confirm Call with Customer"
                                  >
                                    <PhoneCall className="w-3 h-3 shrink-0" />
                                    <span className="whitespace-nowrap">Confirm Call</span>
                                  </button>
                                )}

                                {/* Step 2: Assign Pickup & Picked Up when Call Confirmed */}
                                {ord.status === 'Call Confirmed' && (
                                  <>
                                    <button
                                      onClick={() => handleAssignPickup(ord)}
                                      className="h-7 px-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10.5px] inline-flex items-center gap-1 shadow-2xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                                      title="Assign Pickup (Dispatch Rider)"
                                    >
                                      <Truck className="w-3 h-3 shrink-0" />
                                      <span className="whitespace-nowrap">Assign Pickup</span>
                                    </button>
                                    <button
                                      onClick={() => handleMarkPickupDone(ord)}
                                      className="h-7 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10.5px] inline-flex items-center gap-1 shadow-2xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                                      title="Mark Clothes Picked Up"
                                    >
                                      <Package className="w-3 h-3 shrink-0" />
                                      <span className="whitespace-nowrap">Picked Up</span>
                                    </button>
                                  </>
                                )}

                                {/* Step 3: Picked Up when Pickup Assigned */}
                                {ord.status === 'Pickup Assigned' && (
                                  <button
                                    onClick={() => handleMarkPickupDone(ord)}
                                    className="h-7 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10.5px] inline-flex items-center gap-1 shadow-2xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                                    title="Mark Clothes Picked Up"
                                  >
                                    <Package className="w-3 h-3 shrink-0" />
                                    <span className="whitespace-nowrap">Picked Up</span>
                                  </button>
                                )}

                                {/* Cancel button */}
                                {ord.status !== 'Cancelled' && ord.status !== 'Delivered' && (
                                  <button
                                    onClick={() => handleCancelOrder(ord)}
                                    className="h-7 px-2 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-bold text-[10.5px] inline-flex items-center gap-1 border border-slate-200 hover:border-rose-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                                    title="Cancel Order"
                                  >
                                    <Ban className="w-3 h-3 text-rose-500 shrink-0" />
                                    <span className="whitespace-nowrap">Cancel</span>
                                  </button>
                                )}

                                {/* Reactivate button if Cancelled */}
                                {ord.status === 'Cancelled' && (
                                  <button
                                    onClick={() => handleReactivateOrder(ord)}
                                    className="h-7 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[10.5px] inline-flex items-center gap-1 border border-emerald-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                                    title="Reactivate Cancelled Order"
                                  >
                                    <RefreshCw className="w-3 h-3 text-emerald-600 shrink-0" />
                                    <span className="whitespace-nowrap">Reopen</span>
                                  </button>
                                )}

                                {/* View Sidebar Details */}
                                <button
                                  onClick={() => handleOpenSidebar(ord)}
                                  className="h-7 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[10.5px] inline-flex items-center gap-1 border border-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                                  title="Open Order Details Sidebar"
                                >
                                  <Eye className="w-3 h-3 text-slate-600 shrink-0" />
                                  <span className="whitespace-nowrap">Details</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteOrder(ord.id)}
                                  className="h-7 w-7 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 inline-flex items-center justify-center border border-slate-200 hover:border-rose-200 transition-colors shrink-0 cursor-pointer"
                                  title="Delete Order Permanently"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
        ) : (
          /* ===================================================================== */
          /* CARDS VIEW: MULTI-COLUMN INTERACTIVE CARDS GRID */
          /* ===================================================================== */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5">
            {filteredOrders.map((ord) => {
              const timeInfo = formatBookingTimestamp(ord.createdAt || ord.timestamp);
              const cfg = getStatusConfig(ord.status);

              return (
                <div
                  key={ord.id}
                  onClick={() => handleOpenSidebar(ord)}
                  className={`bg-white rounded-2xl border p-4 shadow-2xs hover:shadow-sm hover:border-blue-400 transition-all cursor-pointer relative ${cfg.accent} border-l-4`}
                >
                  {/* Top Bar: ID, Status, Booking time */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 whitespace-nowrap shrink-0">
                      #{ord.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border inline-flex items-center gap-1 whitespace-nowrap shrink-0 ${cfg.pillBg}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                      <span className="whitespace-nowrap">{ord.status}</span>
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="mt-3 flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-heading font-black text-sm text-slate-900 leading-tight truncate">
                        {ord.name}
                      </h4>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5 flex items-center gap-1 whitespace-nowrap">
                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="font-mono whitespace-nowrap">{ord.phone || 'No phone'}</span>
                      </p>
                    </div>
                    {ord.total && ord.total !== 'To confirm' && ord.total !== '0' ? (
                      <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 whitespace-nowrap shrink-0">
                        {ord.total.startsWith('₹') ? ord.total : `₹${ord.total}`}
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 whitespace-nowrap shrink-0">
                        To confirm
                      </span>
                    )}
                  </div>

                  {/* Samne wale ne kab book kiya tha */}
                  <div className="mt-2.5 p-2 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between text-xs gap-1">
                    <span className="text-[11px] font-bold text-blue-900 flex items-center gap-1 whitespace-nowrap truncate">
                      <Calendar className="w-3 h-3 text-blue-600 shrink-0" />
                      <span className="whitespace-nowrap">{timeInfo.fullDateTime}</span>
                    </span>
                    <span className="text-[10px] font-bold text-blue-700 whitespace-nowrap shrink-0">
                      {timeInfo.timeAgo}
                    </span>
                  </div>

                  {/* Service & Slot */}
                  <div className="mt-2 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-900 truncate bg-emerald-50/80 px-2 py-1 rounded-lg border border-emerald-200/80">
                      <ShoppingBag className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{ord.service}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium truncate text-slate-500 px-0.5">
                      <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{ord.slot}</span>
                    </div>
                  </div>

                  {/* Quick Card Actions */}
                  <div
                    className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      {ord.status === 'New Request' && (
                        <button
                          onClick={() => handleMarkCallDone(ord)}
                          className="h-7 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10.5px] inline-flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                          title="Confirm Call with Customer"
                        >
                          <PhoneCall className="w-3 h-3 shrink-0" />
                          <span className="whitespace-nowrap">Confirm Call</span>
                        </button>
                      )}
                      {ord.status === 'Call Confirmed' && (
                        <>
                          <button
                            onClick={() => handleAssignPickup(ord)}
                            className="h-7 px-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10.5px] inline-flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                            title="Assign Pickup (Dispatch Rider)"
                          >
                            <Truck className="w-3 h-3 shrink-0" />
                            <span className="whitespace-nowrap">Assign Pickup</span>
                          </button>
                          <button
                            onClick={() => handleMarkPickupDone(ord)}
                            className="h-7 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10.5px] inline-flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                            title="Mark Clothes Picked Up"
                          >
                            <Package className="w-3 h-3 shrink-0" />
                            <span className="whitespace-nowrap">Picked Up</span>
                          </button>
                        </>
                      )}
                      {ord.status === 'Pickup Assigned' && (
                        <button
                          onClick={() => handleMarkPickupDone(ord)}
                          className="h-7 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10.5px] inline-flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                          title="Mark Clothes Picked Up"
                        >
                          <Package className="w-3 h-3 shrink-0" />
                          <span className="whitespace-nowrap">Picked Up</span>
                        </button>
                      )}
                      {ord.status !== 'Cancelled' && ord.status !== 'Delivered' && (
                        <button
                          onClick={() => handleCancelOrder(ord)}
                          className="h-7 px-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[10.5px] inline-flex items-center gap-1 border border-rose-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                          title="Cancel Order"
                        >
                          <Ban className="w-3 h-3 text-rose-600 shrink-0" />
                          <span className="whitespace-nowrap">Cancel</span>
                        </button>
                      )}
                      {ord.status === 'Cancelled' && (
                        <button
                          onClick={() => handleReactivateOrder(ord)}
                          className="h-7 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[10.5px] inline-flex items-center gap-1 border border-emerald-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                          title="Reopen Order"
                        >
                          <RefreshCw className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="whitespace-nowrap">Reopen</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        onClick={() => handleDeleteOrder(ord.id)}
                        className="h-7 w-7 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 inline-flex items-center justify-center border border-slate-200 hover:border-rose-200 transition-colors shrink-0 cursor-pointer"
                        title="Delete Order Permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenSidebar(ord)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-0.5 whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <span className="whitespace-nowrap">View Details</span>
                        <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </div>

      </main>

      {/* ========================================================================= */}
      {/* 4. SLIDE-OVER SIDEBAR DRAWER (PREVIOUS BEHAVIOR) */}
      {/* ========================================================================= */}
      {isSidebarOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            onClick={handleCloseSidebar}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
          />

          {/* Sidebar Drawer Panel */}
          <div className="relative w-full sm:w-[520px] lg:w-[560px] bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col z-10 overflow-hidden animate-in slide-in-from-right duration-300">
            {renderOrderDetailContent(selectedOrder)}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. WHATSAPP WEB DESK SLIDE DRAWER */}
      {/* ========================================================================= */}
      {isWaOpen && selectedOrder && (
        <div className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[440px] bg-[#EFEAE2] shadow-2xl border-l border-slate-300 flex flex-col animate-in slide-in-from-right duration-250">
          
          {/* Header (Official WhatsApp Palette #075E54) */}
          <div className="bg-[#075E54] text-white p-3.5 px-4 flex items-center justify-between shadow-md shrink-0 select-none">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#128C7E] flex items-center justify-center font-bold text-white text-sm shadow-inner">
                {selectedOrder.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-sm leading-tight text-white flex items-center gap-1.5 truncate">
                  <span>{selectedOrder.name}</span>
                  <span className="text-[10px] font-normal text-emerald-200 font-mono">
                    (#{selectedOrder.id})
                  </span>
                </h3>
                <p className="text-[11px] text-emerald-100 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]"></span>
                  <span>{selectedOrder.phone || 'No phone'}</span>
                  <span>&bull;</span>
                  <span>Online Desk</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <a
                href={`https://wa.me/${selectedOrder.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                  waInputMessage || `Hi ${selectedOrder.name}...`
                )}`}
                target="_blank"
                rel="noreferrer"
                title="Open directly in WhatsApp Web"
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/90 hover:text-white transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={() => setIsWaOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/90 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Template Selector Chips */}
          <div className="bg-[#F0F2F5] p-2.5 px-3 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px] font-semibold shrink-0">
            <span className="text-slate-500 text-[10px] uppercase font-bold shrink-0">Templates:</span>
            <button
              onClick={() => openWhatsAppDrawer(selectedOrder, 1)}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-emerald-50 text-emerald-800 border border-slate-300 hover:border-emerald-400 transition-colors whitespace-nowrap shadow-2xs"
            >
              1. Pickup Receipt
            </button>
            <button
              onClick={() => openWhatsAppDrawer(selectedOrder, 2)}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-purple-50 text-purple-800 border border-slate-300 hover:border-purple-400 transition-colors whitespace-nowrap shadow-2xs"
            >
              2. Quotation
            </button>
            <button
              onClick={() => openWhatsAppDrawer(selectedOrder, 3)}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-blue-50 text-blue-800 border border-slate-300 hover:border-blue-400 transition-colors whitespace-nowrap shadow-2xs"
            >
              3. Ready Notice
            </button>
          </div>

          {/* Chat Bubble Body with WhatsApp Wallpaper */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#EFEAE2]">
            {/* Notice */}
            <div className="text-center">
              <span className="inline-block bg-[#FFEECD] text-[#632608] text-[10px] px-3 py-1 rounded-lg shadow-2xs">
                🔒 Connected via Evolution API &bull; Direct customer delivery
              </span>
            </div>

            {/* Past Messages History for this order */}
            {(chatHistory[selectedOrder.id] || []).map((msg) => (
              <div key={msg.id} className="flex justify-end">
                <div className="max-w-[85%] bg-[#D9FDD3] text-slate-900 rounded-2xl rounded-tr-none p-3 shadow-xs text-xs space-y-1">
                  <p className="whitespace-pre-line leading-relaxed font-sans">{msg.text}</p>
                  <div className="text-[10px] text-slate-500 text-right flex items-center justify-end gap-1">
                    <span>{msg.time}</span>
                    {msg.status === 'delivered' ? (
                      <span className="text-[#53bdeb] font-bold" title="Delivered">✓✓</span>
                    ) : msg.status === 'failed' ? (
                      <span className="text-rose-500 font-bold" title="Delivery failed">⚠️</span>
                    ) : (
                      <span className="text-slate-400 font-bold" title="Sending...">✓</span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Message Preview */}
            {waInputMessage && (
              <div className="flex justify-end">
                <div className="max-w-[90%] bg-white text-slate-900 rounded-2xl rounded-tr-none p-3 shadow-xs border border-emerald-300 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-emerald-700 pb-1 border-b border-slate-100">
                    <span>Message to Dispatch:</span>
                    <span>Ready</span>
                  </div>
                  <p className="whitespace-pre-line leading-relaxed font-mono text-[11px] text-slate-800">
                    {waInputMessage}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Quote Adjuster */}
          <div className="bg-[#F0F2F5] px-3 py-1.5 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-[11px] font-semibold text-slate-600">Quick Quote Amount (₹):</span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-bold">₹</span>
              <input
                type="number"
                value={quoteAmount}
                onChange={(e) => {
                  setQuoteAmount(e.target.value);
                  openWhatsAppDrawer(selectedOrder, 2);
                }}
                className="w-20 px-2 py-0.5 bg-white border border-slate-300 rounded-md text-xs font-bold outline-none"
              />
            </div>
          </div>

          {/* Input & Send Bar */}
          <div className="bg-[#F0F2F5] p-3 border-t border-slate-200 flex items-end gap-2 shrink-0">
            <textarea
              rows={3}
              value={waInputMessage}
              onChange={(e) => setWaInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (waInputMessage.trim()) {
                    handleSendWhatsAppMessage();
                  }
                }
              }}
              placeholder="Type customer message or select a template above... (Press Enter to send)"
              className="flex-1 px-3 py-2 bg-white border border-slate-300 focus:border-[#25D366] rounded-2xl text-xs outline-none resize-none leading-relaxed text-slate-800"
            />

            <button
              type="button"
              disabled={!waInputMessage.trim()}
              onClick={() => handleSendWhatsAppMessage()}
              className="w-11 h-11 rounded-full bg-[#00A884] hover:bg-[#008f6f] text-white flex items-center justify-center shadow-md active:scale-95 disabled:opacity-40 transition-all shrink-0 cursor-pointer"
              title="Dispatch message via WhatsApp (Press Enter)"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. ADD MANUAL NEW ORDER MODAL */}
      {/* ========================================================================= */}
      {newOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 px-5 flex items-center justify-between">
              <div>
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                  UClean Nerul West &bull; Front Desk
                </span>
                <h3 className="font-heading font-black text-base text-white">
                  Add New Customer Booking
                </h3>
              </div>
              <button
                onClick={() => setNewOrderModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateNewOrder} className="p-5 overflow-y-auto space-y-3.5 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCustName}
                    onChange={(e) => {
                      setNewCustName(e.target.value);
                      if (newCustNameError) setNewCustNameError('');
                    }}
                    placeholder="e.g. Imran Khan"
                    className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 outline-none transition-all ${
                      newCustNameError
                        ? 'border-rose-500 bg-rose-50/50'
                        : 'border-slate-300 focus:border-blue-600 focus:bg-white'
                    }`}
                  />
                  {newCustNameError && (
                    <p className="text-[10px] text-rose-600 font-semibold mt-1">
                      {newCustNameError}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Mobile Number *
                  </label>
                  <div className="flex rounded-xl overflow-hidden">
                    <div className="flex items-center gap-1 bg-slate-100 border border-r-0 border-slate-300 px-2.5 text-xs font-bold text-slate-700 shrink-0">
                      <span>+91</span>
                    </div>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={newCustPhone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setNewCustPhone(val);
                        if (newCustPhoneError) setNewCustPhoneError('');
                      }}
                      placeholder="10-digit number"
                      className={`w-full px-3 py-2 border rounded-r-xl text-xs font-semibold text-slate-900 outline-none transition-all ${
                        newCustPhoneError
                          ? 'border-rose-500 bg-rose-50/50'
                          : 'border-slate-300 focus:border-blue-600 focus:bg-white bg-slate-50'
                      }`}
                    />
                  </div>
                  {newCustPhoneError && (
                    <p className="text-[10px] text-rose-600 font-semibold mt-1">
                      {newCustPhoneError}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Service Package
                </label>
                <select
                  value={newCustService}
                  onChange={(e) => setNewCustService(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 focus:border-blue-600 focus:bg-white rounded-xl text-xs font-semibold text-slate-900 outline-none cursor-pointer"
                >
                  <option value="Wash & Steam Iron — ₹149/kg">Wash & Steam Iron — ₹149/kg</option>
                  <option value="Wash & Fold — ₹109/kg">Wash & Fold — ₹109/kg</option>
                  <option value="Dry Cleaning — Men Suits">Dry Cleaning — Men Suits &amp; Blazers</option>
                  <option value="Dry Cleaning — Women Ethnic & Sarees">Dry Cleaning — Sarees &amp; Ethnic</option>
                  <option value="Footwear & Sneaker Spa">Footwear &amp; Designer Sneaker Spa</option>
                  <option value="Steam Pressing Only">Steam Pressing Only</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Pickup Address *
                </label>
                <input
                  type="text"
                  required
                  value={newCustAddress}
                  onChange={(e) => {
                    setNewCustAddress(e.target.value);
                    if (newCustAddressError) setNewCustAddressError('');
                  }}
                  placeholder="e.g. Flat 301, Palm Beach Heights, Sector 6, Nerul West"
                  className={`w-full px-3 py-2 border rounded-xl text-xs font-semibold text-slate-900 outline-none transition-all ${
                    newCustAddressError
                      ? 'border-rose-500 bg-rose-50/50'
                      : 'border-slate-300 focus:border-blue-600 focus:bg-white bg-slate-50'
                  }`}
                />
                {newCustAddressError && (
                  <p className="text-[10px] text-rose-600 font-semibold mt-1">
                    {newCustAddressError}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Time Slot
                  </label>
                  <select
                    value={newCustSlot}
                    onChange={(e) => setNewCustSlot(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 focus:border-blue-600 focus:bg-white rounded-xl text-xs font-semibold text-slate-900 outline-none cursor-pointer"
                  >
                    {getActiveSlotsList(getLocalTodayDateString()).map((s) => (
                      <option key={`Today · ${s.value}`} value={`Today · ${s.value}`}>
                        Today · {s.label}
                      </option>
                    ))}
                    <option value="Tomorrow · Morning (09:00 AM – 12:00 PM)">
                      Tomorrow · Morning (09:00 AM – 12:00 PM)
                    </option>
                    <option value="Tomorrow · Afternoon (01:00 PM – 04:00 PM)">
                      Tomorrow · Afternoon (01:00 PM – 04:00 PM)
                    </option>
                    <option value="Tomorrow · Evening (05:00 PM – 08:00 PM)">
                      Tomorrow · Evening (05:00 PM – 08:00 PM)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Initial Estimate (₹)
                  </label>
                  <input
                    type="number"
                    value={newCustAmount}
                    onChange={(e) => setNewCustAmount(e.target.value)}
                    placeholder="149"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 focus:border-blue-600 focus:bg-white rounded-xl text-xs font-semibold text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Garment Details / Instructions
                </label>
                <textarea
                  rows={2}
                  value={newCustNotes}
                  onChange={(e) => setNewCustNotes(e.target.value)}
                  placeholder="e.g. 5 Shirts, 2 Pants, gentle steam press"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 focus:border-blue-600 focus:bg-white rounded-xl text-xs font-semibold text-slate-900 outline-none resize-none"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setNewOrderModalOpen(false)}
                  className="flex-1 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingOrder}
                  className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 active:scale-98 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {creatingOrder ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Creating Booking...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Create Booking</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6.5. EDIT ORDER SERVICES & DETAILS MODAL */}
      {/* ========================================================================= */}
      {isEditingOrder && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() => !savingEdit && setIsEditingOrder(false)}
          />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] z-10 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 px-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-xs">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Edit Order & Services
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Order #{selectedOrder.id} &bull; {selectedOrder.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingOrder(false)}
                disabled={savingEdit}
                className="w-8 h-8 rounded-full hover:bg-slate-200/80 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Service Selection Toggle Grid */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-purple-600" />
                    <span>Selected Services ({editServices.length})</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Click to add or remove
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PRIMARY_SERVICES.map((srv) => {
                    const isSelected = editServices.some((s) => isServiceMatch(s, srv.id) || isServiceMatch(s, srv.name));
                    return (
                      <button
                        key={srv.id}
                        type="button"
                        onClick={() => handleToggleEditService(srv.name)}
                        className={`text-left p-2.5 rounded-xl border transition flex items-center justify-between gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-purple-50/90 border-purple-300 text-purple-950 font-bold shadow-2xs ring-1 ring-purple-300'
                            : 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-base shrink-0">{srv.icon}</span>
                          <div className="min-w-0">
                            <p className="text-[11.5px] truncate leading-tight font-bold">{srv.name}</p>
                            <p className="text-[10px] font-semibold text-emerald-700">{srv.rate}</p>
                          </div>
                        </div>
                        <span
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 transition ${
                            isSelected
                              ? 'bg-purple-600 text-white'
                              : 'border border-slate-300 bg-white text-transparent'
                          }`}
                        >
                          ✓
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity Stepper & Price Calculation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Quantity */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1">
                    <Package className="w-3 h-3 text-slate-500" />
                    <span>Approx Quantity</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const num = parseInt(editQty, 10);
                        if (!isNaN(num) && num > 1) {
                          setEditQty(String(num - 1));
                        } else if (isNaN(num)) {
                          setEditQty('1');
                        }
                      }}
                      className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-base flex items-center justify-center transition active:scale-95 cursor-pointer shrink-0"
                    >
                      &minus;
                    </button>
                    <input
                      type="text"
                      value={editQty}
                      onChange={(e) => setEditQty(e.target.value)}
                      placeholder="e.g. 2, 5, 3 kg"
                      className="w-full px-2.5 h-9 bg-slate-50 border border-slate-300 focus:border-purple-600 focus:bg-white rounded-lg text-center font-bold text-xs text-slate-900 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const num = parseInt(editQty, 10);
                        if (!isNaN(num)) {
                          setEditQty(String(num + 1));
                        } else {
                          setEditQty('2');
                        }
                      }}
                      className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-base flex items-center justify-center transition active:scale-95 cursor-pointer shrink-0"
                    >
                      &#43;
                    </button>
                  </div>
                </div>

                {/* Total Price Decided by Admin */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                      <span>Total Amount (₹)</span>
                    </label>
                    <span className="text-[9.5px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      Decided by Admin
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-500 font-bold text-xs">₹</span>
                    <input
                      type="text"
                      value={editTotal}
                      onChange={(e) => setEditTotal(e.target.value)}
                      placeholder="Enter amount after weigh/call (e.g. 250)"
                      className="w-full pl-7 pr-3 h-9 bg-slate-50 border border-slate-300 focus:border-purple-600 focus:bg-white rounded-lg text-xs font-bold text-slate-900 outline-none"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Write amount after confirming with customer or weighing garments. Leave empty for &ldquo;To confirm&rdquo;.
                  </p>
                </div>
              </div>

              {/* Garment Details & Instructions */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1">
                  <FileText className="w-3 h-3 text-slate-500" />
                  <span>Garments Note</span>
                </label>
                <input
                  type="text"
                  value={editItems}
                  onChange={(e) => setEditItems(e.target.value)}
                  placeholder="e.g. 2 Sarees, 1 Silk Suit, 3 Shirts"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 focus:border-purple-600 focus:bg-white rounded-xl text-xs font-semibold text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Special Notes / Instructions
                </label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="e.g. Starch sarees, gentle steam iron, collar stain on blue shirt"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 focus:border-purple-600 focus:bg-white rounded-xl text-xs font-semibold text-slate-900 outline-none resize-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsEditingOrder(false)}
                disabled={savingEdit}
                className="px-4 py-2 rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-700 font-semibold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveOrderEdits}
                disabled={savingEdit}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-98 transition cursor-pointer disabled:opacity-50"
              >
                {savingEdit ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. TOAST NOTIFICATIONS */}
      {/* ========================================================================= */}
      {toastMsg && (
        <div
          className={`fixed bottom-5 right-5 z-50 p-3.5 px-4 rounded-2xl shadow-lg flex items-center gap-2.5 border animate-in slide-in-from-bottom duration-250 max-w-md ${
            toastMsg.type === 'error'
              ? 'bg-rose-950 text-white border-rose-800'
              : 'bg-slate-900 text-white border-slate-800'
          }`}
        >
          {toastMsg.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span className="text-xs font-medium leading-snug">{toastMsg.text}</span>
          <button
            onClick={() => setToastMsg(null)}
            className="ml-auto text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
}
