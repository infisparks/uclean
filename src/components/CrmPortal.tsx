'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
} from 'lucide-react';
import {
  sendWhatsAppMessage,
  generateBookingConfirmationTemplate,
  generateQuotationTemplate,
  generateReadyForDeliveryTemplate,
} from '@/lib/whatsapp';
import { rtdb } from '@/lib/firebase';
import { ref, onValue, update, set } from 'firebase/database';
import {
  validateIndianMobile,
  validateCustomerName,
  validateAddress,
} from '@/lib/validation';

export interface CrmOrder {
  id: string;
  name: string;
  phone: string;
  service: string;
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
  createdAt?: string;
  callDone?: boolean;
  pickupDone?: boolean;
}

interface ChatMessage {
  id: string;
  sender: 'store' | 'customer';
  text: string;
  time: string;
  status: 'sent' | 'delivered';
}

const INITIAL_DEMO_ORDERS: CrmOrder[] = [
  {
    id: 'UC-26095',
    name: 'Ayesha Shaikh',
    phone: '9820145621',
    service: 'Wash & Steam Iron',
    qty: '4 kg (estimate)',
    total: '596',
    address: 'Flat 402, Seawoods Palm Beach Road, Sector 6, Nerul West',
    slot: 'Today · 02:00 PM – 04:00 PM',
    date: 'Today',
    time: '02:00 PM – 04:00 PM',
    status: 'New Request',
    notes: 'Please call 10 mins before arrival. 4 shirts & 2 bedsheets.',
    items: '4 Shirts, 2 Double Bedsheets',
    createdAt: '10 mins ago',
    callDone: false,
    pickupDone: false,
  },
  {
    id: 'UC-26094',
    name: 'Rahul Mehta',
    phone: '9833441122',
    service: 'Dry Cleaning — Men Suits',
    qty: '2 garments',
    total: '499',
    address: 'B-12, Greens Enclave, Sector 8, Nerul West',
    slot: 'Today · 05:00 PM – 07:00 PM',
    date: 'Today',
    time: '05:00 PM – 07:00 PM',
    status: 'Call Confirmed',
    notes: '2-piece wedding tuxedo suit. Gentle steam press required.',
    items: '1 Blazer, 1 Trouser',
    createdAt: '1 hour ago',
    callDone: true,
    pickupDone: false,
  },
  {
    id: 'UC-26093',
    name: 'Sana Khan',
    phone: '8879654123',
    service: 'Women Ethnic & Saree Spa',
    qty: '3 Sarees',
    total: '850',
    address: 'Bldg 3, Sector 10, Nerul West',
    slot: 'Today · 11:00 AM – 01:00 PM',
    date: 'Today',
    time: '11:00 AM – 01:00 PM',
    status: 'Pickup Assigned',
    notes: 'Banarasi silk saree with zari border. Roll press required.',
    items: '3 Silk Sarees',
    createdAt: '2 hours ago',
    callDone: true,
    pickupDone: false,
  },
  {
    id: 'UC-26092',
    name: 'Vivek Patil',
    phone: '9769223344',
    service: 'Footwear & Sneaker Spa',
    qty: '2 pairs',
    total: '698',
    address: 'Plot 45, Sector 4, Nerul West',
    slot: 'Today · 03:00 PM – 05:00 PM',
    date: 'Today',
    time: '03:00 PM – 05:00 PM',
    status: 'Ready for Delivery',
    notes: 'Nike Air Jordans and formal leather shoes deep cleaned & sanitized.',
    items: '1 Sneaker, 1 Leather Shoes',
    createdAt: 'Yesterday',
    callDone: true,
    pickupDone: true,
  },
  {
    id: 'UC-26091',
    name: 'Fatima Ali',
    phone: '9167889900',
    service: 'Wash & Fold Laundry',
    qty: '5 kg',
    total: '545',
    address: 'Room 201, Shanti Heights, Sector 6, Nerul West',
    slot: 'Delivered',
    date: 'Yesterday',
    time: 'Delivered',
    status: 'Delivered',
    notes: 'Organic softener requested.',
    items: 'Everyday wear clothes',
    createdAt: '2 days ago',
    callDone: true,
    pickupDone: true,
  },
];

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
    description: 'Booking arrival & rider dispatch',
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

export function CrmPortal({ onBackToStore }: { onBackToStore: () => void }) {
  const [orders, setOrders] = useState<CrmOrder[]>(INITIAL_DEMO_ORDERS);
  const [selectedId, setSelectedId] = useState<string>(INITIAL_DEMO_ORDERS[0].id);
  const [search, setSearch] = useState('');
  const [activeNav, setActiveNav] = useState<'all' | 'calls' | 'pickups' | 'quotes' | 'ready' | 'delivered'>('all');
  const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'amount_high' | 'amount_low'>('newest');
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // WhatsApp drawer state
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
  const [newCustSlot, setNewCustSlot] = useState('Today · 02:00 PM – 04:00 PM');
  const [newCustNotes, setNewCustNotes] = useState('');
  const [newCustAmount, setNewCustAmount] = useState('149');
  const [newCustNameError, setNewCustNameError] = useState('');
  const [newCustPhoneError, setNewCustPhoneError] = useState('');
  const [newCustAddressError, setNewCustAddressError] = useState('');

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

  // Sync bookings from API & Firebase RTDB & LocalStorage
  useEffect(() => {
    let isMounted = true;

    const fetchServerBookings = async () => {
      try {
        const res = await fetch('/api/bookings');
        const json = await res.json();
        if (json.success && Array.isArray(json.bookings) && json.bookings.length > 0) {
          const mapped: CrmOrder[] = json.bookings.map((b: any) => ({
            id: b.id || b.orderId || `UC-${Math.floor(26100 + Math.random() * 8000)}`,
            name: b.customerName || b.name || 'Online Customer',
            phone: b.phone || '',
            service: String(b.serviceType || b.service || 'Laundry Service'),
            qty: b.quantity || b.qty || 'To estimate',
            total: b.totalEstimate ? String(b.totalEstimate) : (b.total ? String(b.total) : 'To confirm'),
            address: b.address || 'Nerul West',
            slot: b.slot || `${b.preferredDate || 'Today'} · ${b.preferredTimeSlot || 'Standard Slot'}`,
            date: b.preferredDate || b.date || 'Today',
            time: b.preferredTimeSlot || b.time || 'Standard Slot',
            status: b.status ? capitalizeStatus(b.status) : 'New Request',
            notes: typeof b.notes === 'string' ? b.notes : '',
            items: typeof b.items === 'string' ? b.items : '',
            createdAt: b.timestamp ? new Date(b.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (b.createdAt || 'Recent'),
            callDone: b.status !== 'new' && b.status !== 'New Request',
            pickupDone: ['picked-up', 'Picked Up', 'in-progress', 'Cleaning In Progress', 'Delivered'].includes(b.status),
          }));

          if (isMounted) {
            setOrders((prev) => {
              const serverIds = new Set(mapped.map((o) => o.id));
              const remainingPrev = prev.filter((o) => !serverIds.has(o.id));
              return [...mapped, ...remainingPrev];
            });
          }
        }
      } catch (err) {
        console.warn('API sync warning:', err);
      }
    };

    fetchServerBookings();
    loadLocalCache();

    const intervalId = setInterval(fetchServerBookings, 4000);

    let unsubscribeRtdb = () => {};
    try {
      const bookingsRef = ref(rtdb, 'bookings');
      unsubscribeRtdb = onValue(
        bookingsRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const val = snapshot.val();
            const rtdbList: CrmOrder[] = Object.keys(val).map((k) => {
              const item = val[k];
              return {
                id: item.id || item.orderId || k,
                name: item.customerName || item.name || 'Online Customer',
                phone: item.phone || '',
                service: String(item.serviceType || item.service || 'Laundry Service'),
                qty: item.quantity || item.qty || 'Standard Package',
                total: item.totalEstimate ? String(item.totalEstimate) : (item.total ? String(item.total) : 'To confirm'),
                address: item.address || 'Nerul West',
                slot: item.slot || `${item.preferredDate || 'Today'} · ${item.preferredTimeSlot || 'Standard Slot'}`,
                date: item.preferredDate || item.date || 'Today',
                time: item.preferredTimeSlot || item.time || 'Standard Slot',
                status: item.status ? capitalizeStatus(item.status) : 'New Request',
                notes: typeof item.notes === 'string' ? item.notes : '',
                items: typeof item.items === 'string' ? item.items : '',
                createdAt: item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (item.createdAt || 'Recent'),
                callDone: item.status !== 'new' && item.status !== 'New Request',
                pickupDone: ['picked-up', 'Picked Up', 'in-progress', 'Cleaning In Progress', 'Delivered'].includes(item.status),
              };
            }).reverse();

            if (isMounted) {
              setOrders((prev) => {
                const liveIds = new Set(rtdbList.map((o) => o.id));
                const remaining = prev.filter((o) => !liveIds.has(o.id));
                return [...rtdbList, ...remaining];
              });
            }
          }
        },
        (err) => console.warn('RTDB listen warning:', err)
      );
    } catch (e) {
      console.warn('RTDB setup notice:', e);
    }

    function loadLocalCache() {
      try {
        const local = JSON.parse(localStorage.getItem('uclean_local_bookings') || '[]');
        if (Array.isArray(local) && local.length > 0) {
          const cached: CrmOrder[] = local.map((b: any, idx: number) => ({
            id: b.id || `UC-${26095 + idx}`,
            name: b.customerName || 'Online Booking',
            phone: b.phone || '',
            service: b.serviceType || 'Laundry Service',
            qty: '3 kg (est.)',
            total: b.totalEstimate ? String(b.totalEstimate) : 'To confirm',
            address: b.address || 'Nerul West',
            slot: `${b.preferredDate || 'Today'} · ${b.preferredTimeSlot || 'Afternoon'}`,
            date: b.preferredDate || 'Today',
            time: b.preferredTimeSlot || 'Afternoon',
            status: b.status ? capitalizeStatus(b.status) : 'New Request',
            notes: b.notes || 'Submitted via web booking form',
            createdAt: 'Recent',
            callDone: false,
            pickupDone: false,
          }));

          if (isMounted) {
            setOrders((prev) => {
              const ids = new Set(prev.map((o) => o.id));
              const additions = cached.filter((m) => !ids.has(m.id));
              return [...additions, ...prev];
            });
          }
        }
      } catch (e) {
        console.warn('Local cache read note:', e);
      }
    }

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      unsubscribeRtdb();
    };
  }, []);

  function capitalizeStatus(s: string) {
    if (s === 'new') return 'New Request';
    if (s === 'confirmed') return 'Call Confirmed';
    if (s === 'in-progress') return 'Cleaning In Progress';
    if (s === 'completed') return 'Delivered';
    return s;
  }

  // Selected Order
  const selectedOrder = useMemo(() => {
    return orders.find((o) => o.id === selectedId) || orders[0] || INITIAL_DEMO_ORDERS[0];
  }, [orders, selectedId]);

  // Operational KPI Counters based on business psychology
  const opsCounters = useMemo(() => {
    // 1. Calls Pending (Attention - Amber)
    const callsPending = orders.filter((o) => o.status === 'New Request' || !o.callDone);

    // 2. Today's Pickups (Logistics - Blue)
    const pickupsToday = orders.filter(
      (o) =>
        (o.slot.toLowerCase().includes('today') || o.date?.toLowerCase().includes('today')) &&
        ['New Request', 'Call Confirmed', 'Pickup Assigned'].includes(o.status)
    );

    // 3. Quotes Pending (Valuation - Purple)
    const quotesPending = orders.filter((o) => ['Picked Up', 'At Store / Inspection', 'Quotation Sent'].includes(o.status));

    // 4. Ready for Delivery (Fulfillment - Emerald)
    const readyForDelivery = orders.filter((o) => o.status === 'Ready for Delivery' || o.status === 'Out for Delivery');

    // 5. Total Active Pipeline
    const activePipeline = orders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled');

    return {
      callsPendingCount: callsPending.length,
      pickupsTodayCount: pickupsToday.length,
      quotesPendingCount: quotesPending.length,
      readyDeliveryCount: readyForDelivery.length,
      activePipelineCount: activePipeline.length,
    };
  }, [orders]);

  // Filtered & Sorted orders list
  const filteredOrders = useMemo(() => {
    const list = orders.filter((o) => {
      const q = search.toLowerCase().trim();
      const matchQuery =
        !q ||
        o.id.toLowerCase().includes(q) ||
        o.name.toLowerCase().includes(q) ||
        o.phone.toLowerCase().includes(q) ||
        o.address.toLowerCase().includes(q) ||
        o.service.toLowerCase().includes(q);

      if (!matchQuery) return false;

      if (activeNav === 'calls') {
        return o.status === 'New Request' || !o.callDone;
      }
      if (activeNav === 'pickups') {
        return (
          (o.slot.toLowerCase().includes('today') || o.date?.toLowerCase().includes('today')) &&
          ['New Request', 'Call Confirmed', 'Pickup Assigned'].includes(o.status)
        );
      }
      if (activeNav === 'quotes') {
        return ['Picked Up', 'At Store / Inspection', 'Quotation Sent'].includes(o.status);
      }
      if (activeNav === 'ready') {
        return o.status === 'Ready for Delivery' || o.status === 'Out for Delivery';
      }
      if (activeNav === 'delivered') {
        return o.status === 'Delivered';
      }
      return true;
    });

    // Sorting
    return list.sort((a, b) => {
      if (sortOption === 'amount_high') {
        const valA = parseFloat(a.total.replace(/[^\d.]/g, '')) || 0;
        const valB = parseFloat(b.total.replace(/[^\d.]/g, '')) || 0;
        return valB - valA;
      }
      if (sortOption === 'amount_low') {
        const valA = parseFloat(a.total.replace(/[^\d.]/g, '')) || 0;
        const valB = parseFloat(b.total.replace(/[^\d.]/g, '')) || 0;
        return valA - valB;
      }
      if (sortOption === 'oldest') {
        return a.id.localeCompare(b.id);
      }
      // default newest
      return b.id.localeCompare(a.id);
    });
  }, [orders, search, activeNav, sortOption]);

  // Color Psychology Badges
  // Amber: Attention / Pending confirmation (non-alarming alertness)
  // Blue/Indigo: Verified, scheduled, logistics in motion (trust, order)
  // Purple/Violet: Value appraisal, quotation, inspection (quality, precision)
  // Cyan/Teal: Cleaning, washing, steam sanitizing (hygiene, freshness)
  // Emerald: Completed, ready for handoff, delivered (success, reliability)
  // Rose: Cancelled, refund, alert (critical caution)
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'New Request':
        return {
          pillBg: 'bg-amber-50 text-amber-800 border-amber-200/90',
          dot: 'bg-amber-500',
          accent: 'border-l-amber-500',
          description: 'Awaiting phone confirmation from store',
        };
      case 'Call Confirmed':
        return {
          pillBg: 'bg-blue-50 text-blue-800 border-blue-200/90',
          dot: 'bg-blue-600',
          accent: 'border-l-blue-600',
          description: 'Customer reached · Pickup slot locked',
        };
      case 'Pickup Assigned':
        return {
          pillBg: 'bg-indigo-50 text-indigo-800 border-indigo-200/90',
          dot: 'bg-indigo-600',
          accent: 'border-l-indigo-600',
          description: 'Rider assigned for doorstep pickup',
        };
      case 'Picked Up':
        return {
          pillBg: 'bg-purple-50 text-purple-800 border-purple-200/90',
          dot: 'bg-purple-600',
          accent: 'border-l-purple-600',
          description: 'Garments safely collected from customer',
        };
      case 'At Store / Inspection':
        return {
          pillBg: 'bg-violet-50 text-violet-800 border-violet-200/90',
          dot: 'bg-violet-600',
          accent: 'border-l-violet-600',
          description: 'Weighing, stain inspection & fabric tagging',
        };
      case 'Quotation Sent':
        return {
          pillBg: 'bg-sky-50 text-sky-800 border-sky-200/90',
          dot: 'bg-sky-600',
          accent: 'border-l-sky-600',
          description: 'Price estimate sent to customer WhatsApp',
        };
      case 'Cleaning In Progress':
        return {
          pillBg: 'bg-teal-50 text-teal-800 border-teal-200/90',
          dot: 'bg-teal-600',
          accent: 'border-l-teal-600',
          description: 'Undergoing eco-wash / hydro-iron / dry cleaning',
        };
      case 'Quality Check':
        return {
          pillBg: 'bg-cyan-50 text-cyan-800 border-cyan-200/90',
          dot: 'bg-cyan-600',
          accent: 'border-l-cyan-600',
          description: 'Steam finish & packaging inspection',
        };
      case 'Ready for Delivery':
        return {
          pillBg: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold',
          dot: 'bg-emerald-600 animate-pulse',
          accent: 'border-l-emerald-600',
          description: 'Packaged & ready for doorstep delivery',
        };
      case 'Out for Delivery':
        return {
          pillBg: 'bg-emerald-50 text-emerald-900 border-emerald-400',
          dot: 'bg-emerald-700',
          accent: 'border-l-emerald-700',
          description: 'Rider en-route with clean garments',
        };
      case 'Delivered':
        return {
          pillBg: 'bg-slate-100 text-slate-800 border-slate-300 font-semibold',
          dot: 'bg-slate-600',
          accent: 'border-l-slate-400',
          description: 'Handed over to customer · Order closed',
        };
      case 'Cancelled':
        return {
          pillBg: 'bg-rose-50 text-rose-800 border-rose-200/90',
          dot: 'bg-rose-600',
          accent: 'border-l-rose-600',
          description: 'Cancelled by customer or store staff',
        };
      default:
        return {
          pillBg: 'bg-slate-50 text-slate-700 border-slate-200',
          dot: 'bg-slate-500',
          accent: 'border-l-slate-400',
          description: 'Standard order status',
        };
    }
  };

  // Status Changer
  const handleStatusChange = async (newStatus: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === selectedOrder.id ? { ...o, status: newStatus } : o))
    );

    try {
      fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedOrder.id, status: newStatus }),
      }).catch(() => {});

      update(ref(rtdb, `bookings/${selectedOrder.id}`), {
        status: newStatus,
      }).catch(() => {});
    } catch {
      // Local fallback
    }

    showToast(`Order #${selectedOrder.id} status moved to "${newStatus}"`, 'info');
  };

  // Quick Action: Mark Call Done
  const handleMarkCallDone = () => {
    setOrders((prev) =>
      prev.map((o) => (o.id === selectedOrder.id ? { ...o, callDone: true, status: 'Call Confirmed' } : o))
    );
    showToast(`Call confirmed with ${selectedOrder.name}!`, 'success');
  };

  // Quick Action: Mark Pickup Done
  const handleMarkPickupDone = () => {
    setOrders((prev) =>
      prev.map((o) => (o.id === selectedOrder.id ? { ...o, pickupDone: true, status: 'Picked Up' } : o))
    );
    showToast(`Garments collected from ${selectedOrder.name}!`, 'success');
  };

  // WhatsApp Drawer Launcher
  const openWhatsAppDrawer = (prefillTemplate?: 1 | 2 | 3) => {
    setIsWaOpen(true);
    let msg = '';
    if (prefillTemplate === 1) {
      msg = generateBookingConfirmationTemplate({
        customerName: selectedOrder.name,
        orderId: selectedOrder.id,
        address: selectedOrder.address,
        date: selectedOrder.date || 'Today',
        time: selectedOrder.time || selectedOrder.slot,
      });
    } else if (prefillTemplate === 2) {
      msg = generateQuotationTemplate({
        customerName: selectedOrder.name,
        orderId: selectedOrder.id,
        services: selectedOrder.service + (selectedOrder.items ? ` (${selectedOrder.items})` : ''),
        amount: quoteAmount || selectedOrder.total.replace(/[^\d]/g, '') || '450',
      });
    } else if (prefillTemplate === 3) {
      msg = generateReadyForDeliveryTemplate({
        customerName: selectedOrder.name,
        orderId: selectedOrder.id,
        amount: quoteAmount || selectedOrder.total || '450',
      });
    }
    if (msg) {
      setWaInputMessage(msg);
    }
  };

  const applyTemplate = (tmpl: 1 | 2 | 3) => {
    openWhatsAppDrawer(tmpl);
  };

  // Send WhatsApp message
  const handleSendWhatsAppMessage = async () => {
    if (!selectedOrder.phone) {
      showToast('Customer phone number is missing!', 'error');
      return;
    }
    const textToSend = waInputMessage.trim();
    if (!textToSend) {
      showToast('Please type a message before sending.', 'error');
      return;
    }

    setSendingWa(true);
    try {
      const res = await sendWhatsAppMessage(selectedOrder.phone, textToSend);
      if (res.success) {
        const newMsg: ChatMessage = {
          id: 'MSG-' + Date.now(),
          sender: 'store',
          text: textToSend,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'delivered',
        };

        setChatHistory((prev) => ({
          ...prev,
          [selectedOrder.id]: [...(prev[selectedOrder.id] || []), newMsg],
        }));

        setWaInputMessage('');
        showToast(`WhatsApp delivered to ${selectedOrder.name}!`, 'success');
      } else {
        showToast(`Delivery notice: ${res.message || 'Check gateway'}`, 'error');
      }
    } catch {
      showToast('Failed to dispatch WhatsApp message.', 'error');
    } finally {
      setSendingWa(false);
    }
  };

  // Manual New Order Creator
  const handleCreateNewOrder = (e: React.FormEvent) => {
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
    const newOrd: CrmOrder = {
      id: newId,
      name: nameVal.formatted || newCustName.trim(),
      phone: phoneVal.formatted || newCustPhone.trim(),
      service: newCustService,
      qty: 'Standard package',
      total: newCustAmount || 'To confirm',
      address: addressVal.formatted || newCustAddress.trim(),
      slot: newCustSlot,
      date: newCustSlot.split('·')[0]?.trim() || 'Today',
      time: newCustSlot.split('·')[1]?.trim() || 'Afternoon',
      status: 'New Request',
      notes: newCustNotes.trim() || 'Walk-in / Phone order logged by desk staff',
      createdAt: 'Just now',
      callDone: false,
      pickupDone: false,
    };

    setOrders([newOrd, ...orders]);
    setSelectedId(newId);
    setNewOrderModalOpen(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustAddress('');
    setNewCustNotes('');

    fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrd),
    }).catch(() => {});

    try {
      set(ref(rtdb, `bookings/${newId}`), newOrd).catch(() => {});
    } catch {
      // Local fallback
    }

    showToast(`Order #${newId} logged successfully!`, 'success');
  };

  // Copy full order details for delivery rider dispatch
  const handleCopyRiderDispatch = () => {
    const text = `*UCLEAN PICKUP DISPATCH*\nOrder: #${selectedOrder.id}\nCustomer: ${selectedOrder.name}\nPhone: ${selectedOrder.phone}\nSlot: ${selectedOrder.slot}\nAddress: ${selectedOrder.address}\nServices: ${selectedOrder.service}\nNotes: ${selectedOrder.notes || 'None'}`;
    copyToClipboard(text, 'Rider Dispatch Slip');
  };

  // Current lifecycle index for selected order
  const currentLifecycleIndex = useMemo(() => {
    const current = selectedOrder.status;
    if (current === 'New Request') return 0;
    if (current === 'Call Confirmed' || current === 'Pickup Assigned') return 1;
    if (current === 'Picked Up') return 2;
    if (current === 'At Store / Inspection' || current === 'Quotation Sent') return 3;
    if (current === 'Cleaning In Progress' || current === 'Quality Check') return 4;
    if (current === 'Ready for Delivery' || current === 'Out for Delivery') return 5;
    if (current === 'Delivered') return 6;
    return 0;
  }, [selectedOrder.status]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      
      {/* ========================================================================= */}
      {/* 1. LEFT EXECUTIVE DESK SIDEBAR (Deep Charcoal/Slate for High Focus & Ergonomics) */}
      {/* ========================================================================= */}
      <aside className="w-64 bg-[#0F172A] text-slate-200 flex flex-col justify-between shrink-0 border-r border-slate-800/80 hidden md:flex min-h-screen sticky top-0 h-screen z-20 shadow-xl">
        <div>
          {/* Header Brand */}
          <div className="p-4 px-5 border-b border-slate-800/80 bg-[#0B132B]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-black text-white text-base shadow-sm ring-1 ring-white/10">
                U
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="font-heading font-black text-sm tracking-tight text-white leading-tight">
                    UCLEAN
                  </h1>
                  <span className="text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded border border-blue-400/30">
                    CRM
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                  Nerul West &bull; Branch #104
                </p>
              </div>
            </div>
          </div>

          {/* Nav Categories */}
          <div className="p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 block mb-2">
              Operational Views
            </span>

            <nav className="space-y-1 text-xs font-semibold">
              {/* All Orders */}
              <button
                onClick={() => setActiveNav('all')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                  activeNav === 'all'
                    ? 'bg-blue-600 text-white shadow-sm font-bold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-blue-400" />
                  <span>All Active Orders</span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] font-mono font-bold">
                  {orders.length}
                </span>
              </button>

              {/* Calls Pending (Amber Attention) */}
              <button
                onClick={() => setActiveNav('calls')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                  activeNav === 'calls'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-sm ring-1 ring-white/30'
                    : 'text-amber-300/90 hover:bg-amber-500/10 hover:text-amber-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <PhoneCall className="w-4 h-4 text-amber-400" />
                  <span>Baat Karna Hai (Calls)</span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-amber-400/30 text-amber-200 text-[11px] font-mono font-black border border-amber-300/30">
                  {opsCounters.callsPendingCount}
                </span>
              </button>

              {/* Pickups Today (Blue Logistics) */}
              <button
                onClick={() => setActiveNav('pickups')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                  activeNav === 'pickups'
                    ? 'bg-blue-600 text-white font-black shadow-sm'
                    : 'text-blue-300/90 hover:bg-blue-600/10 hover:text-blue-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-blue-400" />
                  <span>Aaj Ka Pickup (Today)</span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-blue-500/30 text-blue-200 text-[11px] font-mono font-black border border-blue-400/30">
                  {opsCounters.pickupsTodayCount}
                </span>
              </button>

              {/* Quotation Pending (Purple Valuation) */}
              <button
                onClick={() => setActiveNav('quotes')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                  activeNav === 'quotes'
                    ? 'bg-purple-600 text-white font-black shadow-sm'
                    : 'text-purple-300/90 hover:bg-purple-600/10 hover:text-purple-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <DollarSign className="w-4 h-4 text-purple-400" />
                  <span>Quotation Pending</span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-purple-500/30 text-purple-200 text-[11px] font-mono font-bold border border-purple-400/30">
                  {opsCounters.quotesPendingCount}
                </span>
              </button>

              {/* Ready for Delivery (Emerald Fulfillment) */}
              <button
                onClick={() => setActiveNav('ready')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                  activeNav === 'ready'
                    ? 'bg-emerald-600 text-white font-black shadow-sm'
                    : 'text-emerald-300/90 hover:bg-emerald-600/10 hover:text-emerald-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Package className="w-4 h-4 text-emerald-400" />
                  <span>Ready for Delivery</span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/30 text-emerald-200 text-[11px] font-mono font-black border border-emerald-400/30">
                  {opsCounters.readyDeliveryCount}
                </span>
              </button>

              {/* Delivered Archive */}
              <button
                onClick={() => setActiveNav('delivered')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                  activeNav === 'delivered'
                    ? 'bg-slate-700 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CheckCheck className="w-4 h-4 text-slate-400" />
                  <span>Delivered / Closed</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Quick WhatsApp Drawer trigger */}
          <div className="p-3 pt-1">
            <button
              onClick={() => setIsWaOpen(!isWaOpen)}
              className="w-full p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-xs flex items-center justify-between transition-colors border border-slate-700"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#25D366]" />
                <span>WhatsApp Desk</span>
              </div>
              <span className="text-[10px] bg-[#25D366]/20 text-[#25D366] font-bold px-1.5 py-0.5 rounded border border-[#25D366]/30">
                Connected
              </span>
            </button>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0B132B]/80 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Firebase Sync
            </span>
            <span className="font-mono text-[10px] text-slate-500">v3.2</span>
          </div>

          <button
            onClick={onBackToStore}
            className="w-full py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700/80"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
            <span>Return to Store Front</span>
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MAIN OPERATIONS WORKSPACE */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0 bg-[#F8FAFC]">
        
        {/* Top Control Header Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 px-4 py-3 sm:px-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            {/* Search Input & Branch Indicator */}
            <div className="flex items-center gap-3 flex-1 max-w-xl">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search customer, phone, order ID, address..."
                  className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-300/80 focus:border-blue-600 focus:bg-white rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all"
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

              {/* Sort selector */}
              <div className="relative hidden md:flex items-center shrink-0">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as any)}
                  className="px-3 py-2 bg-slate-50 border border-slate-300/80 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <option value="newest">Sort: Newest First</option>
                  <option value="oldest">Sort: Oldest First</option>
                  <option value="amount_high">Sort: Amount (High to Low)</option>
                  <option value="amount_low">Sort: Amount (Low to High)</option>
                </select>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5 self-end sm:self-auto">
              <button
                onClick={() => openWhatsAppDrawer()}
                className="h-9 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center gap-2 border border-slate-200 transition-colors"
                title="Open WhatsApp Communication Desk"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
                <span className="hidden sm:inline">WhatsApp Desk</span>
              </button>

              <button
                onClick={() => setNewOrderModalOpen(true)}
                className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors active:scale-98"
              >
                <Plus className="w-4 h-4" />
                <span>+ New Order</span>
              </button>
            </div>
          </div>
        </header>

        {/* ======================================================================= */}
        {/* EXECUTIVE KPI METRIC STRIP (Grounding in Color Psychology) */}
        {/* ======================================================================= */}
        <section className="bg-white border-b border-slate-200/90 px-4 py-3.5 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            
            {/* Card 1: 📞 Calls Pending ("Baat Karna Hai") — Amber for proactive attention */}
            <button
              onClick={() => setActiveNav('calls')}
              className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                activeNav === 'calls'
                  ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-400/30 shadow-xs'
                  : 'bg-slate-50/60 border-slate-200 hover:border-amber-300 hover:bg-amber-50/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold text-amber-800 uppercase tracking-wide flex items-center gap-1.5">
                  <PhoneCall className="w-3 h-3 text-amber-600" />
                  Calls To Make
                </span>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xl font-heading font-black text-slate-900">
                  {opsCounters.callsPendingCount}
                </span>
                <span className="text-[11px] text-amber-700 font-semibold">Baat Karna Hai</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                Pending phone verification
              </div>
            </button>

            {/* Card 2: 🚚 Today's Pickups ("Aaj Ka Pickup") — Blue for planned logistics */}
            <button
              onClick={() => setActiveNav('pickups')}
              className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                activeNav === 'pickups'
                  ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-400/30 shadow-xs'
                  : 'bg-slate-50/60 border-slate-200 hover:border-blue-300 hover:bg-blue-50/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold text-blue-800 uppercase tracking-wide flex items-center gap-1.5">
                  <Truck className="w-3 h-3 text-blue-600" />
                  Today's Pickups
                </span>
                <span className="w-2 h-2 rounded-full bg-blue-500" />
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xl font-heading font-black text-slate-900">
                  {opsCounters.pickupsTodayCount}
                </span>
                <span className="text-[11px] text-blue-700 font-semibold">Aaj Ka Pickup</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                Scheduled for today
              </div>
            </button>

            {/* Card 3: 💰 Quotations Awaiting — Purple for precision & valuation */}
            <button
              onClick={() => setActiveNav('quotes')}
              className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                activeNav === 'quotes'
                  ? 'bg-purple-50/90 border-purple-400 ring-2 ring-purple-400/30 shadow-xs'
                  : 'bg-slate-50/60 border-slate-200 hover:border-purple-300 hover:bg-purple-50/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold text-purple-800 uppercase tracking-wide flex items-center gap-1.5">
                  <DollarSign className="w-3 h-3 text-purple-600" />
                  Quotes Pending
                </span>
                <span className="w-2 h-2 rounded-full bg-purple-500" />
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xl font-heading font-black text-slate-900">
                  {opsCounters.quotesPendingCount}
                </span>
                <span className="text-[11px] text-purple-700 font-semibold">Inspection</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                Weighing & price quotes
              </div>
            </button>

            {/* Card 4: 📦 Ready for Delivery — Emerald for completion & fresh fulfillment */}
            <button
              onClick={() => setActiveNav('ready')}
              className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                activeNav === 'ready'
                  ? 'bg-emerald-50/90 border-emerald-400 ring-2 ring-emerald-400/30 shadow-xs'
                  : 'bg-slate-50/60 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold text-emerald-800 uppercase tracking-wide flex items-center gap-1.5">
                  <Package className="w-3 h-3 text-emerald-600" />
                  Ready Delivery
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xl font-heading font-black text-slate-900">
                  {opsCounters.readyDeliveryCount}
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold">Packed</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                Freshly cleaned & bagged
              </div>
            </button>

            {/* Card 5: 📋 Total Active Pipeline — Slate for stability */}
            <button
              onClick={() => setActiveNav('all')}
              className={`hidden lg:block p-3 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                activeNav === 'all'
                  ? 'bg-slate-100/90 border-slate-400 ring-2 ring-slate-400/30 shadow-xs'
                  : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                  <Layers className="w-3 h-3 text-slate-600" />
                  Active Pipeline
                </span>
                <span className="w-2 h-2 rounded-full bg-slate-500" />
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xl font-heading font-black text-slate-900">
                  {opsCounters.activePipelineCount}
                </span>
                <span className="text-[11px] text-slate-600 font-semibold">Total Orders</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                Currently tracking
              </div>
            </button>

          </div>
        </section>

        {/* ======================================================================= */}
        {/* 3. SPLIT WORKSPACE: ORDERS QUEUE (LEFT) + COMMAND CENTER (RIGHT) */}
        {/* ======================================================================= */}
        <div className="flex-1 p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 min-w-0">
          
          {/* ORDERS QUEUE (5 columns) */}
          <div className="lg:col-span-5 flex flex-col space-y-3 min-w-0">
            
            {/* Queue Control Strip */}
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 px-1">
              <div className="flex items-center gap-2">
                <span className="text-slate-900 font-bold">
                  {filteredOrders.length} {filteredOrders.length === 1 ? 'Order' : 'Orders'}
                </span>
                <span className="text-slate-400">&bull;</span>
                <span className="capitalize text-slate-600">
                  {activeNav === 'all' ? 'All Orders' : activeNav === 'calls' ? 'Pending Calls' : activeNav === 'pickups' ? "Today's Pickups" : activeNav}
                </span>
              </div>

              {activeNav !== 'all' && (
                <button
                  onClick={() => setActiveNav('all')}
                  className="text-blue-600 hover:text-blue-800 text-[11px] font-semibold"
                >
                  Clear filter
                </button>
              )}
            </div>

            {/* Orders Cards List */}
            <div className="space-y-2.5 max-h-[calc(100vh-230px)] overflow-y-auto pr-1">
              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 shadow-xs">
                  <AlertCircle className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                  <p className="text-sm font-bold text-slate-800">No matching orders found</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Try switching the filter or clear your search query.
                  </p>
                  <button
                    onClick={() => {
                      setActiveNav('all');
                      setSearch('');
                    }}
                    className="mt-3 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                filteredOrders.map((ord) => {
                  const isSelected = ord.id === selectedId;
                  const cfg = getStatusConfig(ord.status);

                  return (
                    <div
                      key={ord.id}
                      onClick={() => setSelectedId(ord.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative bg-white ${
                        isSelected
                          ? `border-blue-600 shadow-sm ring-1 ring-blue-500/30 ${cfg.accent} border-l-4 -translate-y-0.5`
                          : 'border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
                      }`}
                    >
                      {/* Top Row: Order ID, Status Chip, Time Ago */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            #{ord.id}
                          </span>
                          {!ord.callDone && ord.status === 'New Request' && (
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Call pending" />
                          )}
                        </div>

                        <span
                          className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border flex items-center gap-1 ${cfg.pillBg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {ord.status}
                        </span>
                      </div>

                      {/* Middle Row: Customer Name & Amount */}
                      <div className="mt-2 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="font-heading font-black text-sm text-slate-900 leading-tight truncate">
                            {ord.name}
                          </h4>
                          <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{ord.phone || 'No phone'}</span>
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {ord.total.startsWith('₹') ? ord.total : `₹${ord.total}`}
                          </span>
                          <p className="text-[10px] text-slate-400 font-medium mt-1">
                            {ord.createdAt || 'Recent'}
                          </p>
                        </div>
                      </div>

                      {/* Services & Scheduled Slot Info */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 gap-2">
                        <span className="truncate max-w-[200px] text-slate-700 font-medium">
                          {ord.service}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500 shrink-0 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {ord.slot.split('·')[0]?.trim() || ord.slot}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ===================================================================== */}
          {/* COMMAND CENTER: SELECTED ORDER DETAILS & LIFECYCLE (7 columns) */}
          {/* ===================================================================== */}
          <div className="lg:col-span-7 flex flex-col space-y-4 min-w-0">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-5">
              
              {/* Header: Customer, ID, Status, and Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                    {selectedOrder.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                        #{selectedOrder.id}
                      </span>
                      <span
                        className={`text-[11px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                          getStatusConfig(selectedOrder.status).pillBg
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusConfig(selectedOrder.status).dot}`} />
                        {selectedOrder.status}
                      </span>
                    </div>
                    <h2 className="font-heading font-black text-xl text-slate-900 mt-1 tracking-tight">
                      {selectedOrder.name}
                    </h2>
                  </div>
                </div>

                {/* Primary Quick Communications */}
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${selectedOrder.phone}`}
                    className="h-9 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center gap-1.5 border border-slate-200 transition-colors"
                    title="Direct Phone Call"
                  >
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                    <span>Call</span>
                  </a>

                  <button
                    onClick={() => openWhatsAppDrawer(1)}
                    className="h-9 px-3.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors active:scale-95"
                    title="Open WhatsApp Chat Drawer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={handleCopyRiderDispatch}
                    className="h-9 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1 border border-slate-200 transition-colors"
                    title="Copy Dispatch Summary for Rider / Driver"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Rider Slip</span>
                  </button>
                </div>
              </div>

              {/* Order Lifecycle Visual Progress Stepper */}
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/90 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="text-[11px] uppercase tracking-wider text-slate-500">
                    Order Lifecycle Pipeline
                  </span>
                  <span className="text-blue-700 font-mono text-[11px]">
                    Step {currentLifecycleIndex + 1} of 7
                  </span>
                </div>

                {/* Stepper Dots */}
                <div className="grid grid-cols-7 gap-1 pt-1">
                  {ORDER_LIFECYCLE_STEPS.map((step, idx) => {
                    const isDone = idx < currentLifecycleIndex;
                    const isCurrent = idx === currentLifecycleIndex;

                    return (
                      <button
                        key={step.key}
                        onClick={() => handleStatusChange(step.key)}
                        className={`group flex flex-col items-center text-center p-1 rounded-lg transition-all ${
                          isCurrent
                            ? 'bg-blue-600/10'
                            : 'hover:bg-slate-200/50'
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
              </div>

              {/* Operational Action Buttons: Confirm Call & Pickup Complete */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleMarkCallDone}
                  className="h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors active:scale-98"
                >
                  <PhoneCall className="w-4 h-4 text-blue-200" />
                  <span>Baat Ho Gayi (Confirm Call)</span>
                </button>

                <button
                  onClick={handleMarkPickupDone}
                  className="h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors active:scale-98"
                >
                  <Truck className="w-4 h-4 text-emerald-200" />
                  <span>Pickup Complete (Kapde Le Liye)</span>
                </button>
              </div>

              {/* Customer & Delivery Logistics Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/90 text-xs">
                
                {/* Pickup Address */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      Pickup Address
                    </span>
                    <button
                      onClick={() => copyToClipboard(selectedOrder.address, 'Address')}
                      className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-0.5"
                    >
                      <Copy className="w-2.5 h-2.5" />
                      <span>Copy</span>
                    </button>
                  </div>
                  <p className="font-semibold text-slate-900 leading-relaxed">
                    {selectedOrder.address || 'Address not provided'}
                  </p>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(
                      `${selectedOrder.address}, Nerul West, Navi Mumbai`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-semibold pt-0.5"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>Open in Google Maps</span>
                  </a>
                </div>

                {/* Scheduled Slot & Contact */}
                <div className="space-y-1">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    Pickup Schedule
                  </span>
                  <p className="font-semibold text-slate-900">
                    {selectedOrder.slot || 'Standard pickup window'}
                  </p>
                  <div className="pt-1 flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Phone:</span>
                    <span className="font-mono font-bold text-slate-900">{selectedOrder.phone}</span>
                    <button
                      onClick={() => copyToClipboard(selectedOrder.phone, 'Phone')}
                      className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                {/* Services & Instructions */}
                <div className="space-y-1 sm:col-span-2 pt-2.5 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                      <Package className="w-3 h-3 text-slate-400" />
                      Garment &amp; Service Package
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-900">
                      Estimate: {selectedOrder.total.startsWith('₹') ? selectedOrder.total : `₹${selectedOrder.total}`}
                    </span>
                  </div>
                  <p className="font-bold text-slate-900">
                    {selectedOrder.service} {selectedOrder.items ? `— ${selectedOrder.items}` : ''}
                  </p>
                  {selectedOrder.notes && (
                    <div className="mt-1 p-2 rounded-xl bg-white border border-slate-200 text-slate-700 italic">
                      &quot;{selectedOrder.notes}&quot;
                    </div>
                  )}
                </div>

              </div>

              {/* WhatsApp Notification Action Cards (3 Clean Intent Templates) */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    WhatsApp Customer Notifications:
                  </span>
                  <span className="text-[11px] text-[#25D366] font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse"></span>
                    Evolution API Ready
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Template 1: Pickup Confirmed */}
                  <button
                    onClick={() => openWhatsAppDrawer(1)}
                    className="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 text-left transition-all active:scale-98 group"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wide text-blue-700 block mb-0.5">
                      Template 1
                    </span>
                    <h5 className="font-bold text-xs text-slate-900 group-hover:text-blue-900">
                      Pickup Confirmed
                    </h5>
                    <p className="text-[10.5px] text-slate-500 mt-0.5">
                      Send booking receipt
                    </p>
                  </button>

                  {/* Template 2: Send Quotation */}
                  <button
                    onClick={() => openWhatsAppDrawer(2)}
                    className="p-3 rounded-2xl bg-slate-50 hover:bg-purple-50/60 border border-slate-200 hover:border-purple-300 text-left transition-all active:scale-98 group"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wide text-purple-700 block mb-0.5">
                      Template 2
                    </span>
                    <h5 className="font-bold text-xs text-slate-900 group-hover:text-purple-900">
                      Send Quotation
                    </h5>
                    <p className="text-[10.5px] text-slate-500 mt-0.5">
                      Garment price estimate
                    </p>
                  </button>

                  {/* Template 3: Ready for Delivery */}
                  <button
                    onClick={() => openWhatsAppDrawer(3)}
                    className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 text-left transition-all active:scale-98 group"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-700 block mb-0.5">
                      Template 3
                    </span>
                    <h5 className="font-bold text-xs text-slate-900 group-hover:text-emerald-900">
                      Ready for Delivery
                    </h5>
                    <p className="text-[10.5px] text-slate-500 mt-0.5">
                      Delivery coordination
                    </p>
                  </button>
                </div>
              </div>

              {/* Status Switcher (Grouped Logically for Ergonomics & Clarity) */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Quick Status Transition:
                </span>

                <div className="space-y-2.5">
                  {STATUS_GROUPS.map((grp) => (
                    <div key={grp.group} className="space-y-1">
                      <div className="text-[10.5px] font-bold text-slate-500 flex items-center gap-1.5">
                        <span>{grp.group}</span>
                        <span className="text-slate-300">&bull;</span>
                        <span className="font-normal text-slate-400">{grp.description}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {grp.statuses.map((st) => {
                          const isCurrent = selectedOrder.status === st;
                          const cfg = getStatusConfig(st);

                          return (
                            <button
                              key={st}
                              onClick={() => handleStatusChange(st)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                                isCurrent
                                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isCurrent ? 'bg-white' : cfg.dot}`} />
                              <span>{st}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. WHATSAPP WEB DESK SLIDE DRAWER */}
      {/* ========================================================================= */}
      {isWaOpen && (
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
              onClick={() => applyTemplate(1)}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-emerald-50 text-emerald-800 border border-slate-300 hover:border-emerald-400 transition-colors whitespace-nowrap shadow-2xs"
            >
              1. Pickup Receipt
            </button>
            <button
              onClick={() => applyTemplate(2)}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-purple-50 text-purple-800 border border-slate-300 hover:border-purple-400 transition-colors whitespace-nowrap shadow-2xs"
            >
              2. Quotation
            </button>
            <button
              onClick={() => applyTemplate(3)}
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
                    <span className="text-[#53bdeb] font-bold">✓✓</span>
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
                  applyTemplate(2);
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
              placeholder="Type customer message or select a template above..."
              className="flex-1 px-3 py-2 bg-white border border-slate-300 focus:border-[#25D366] rounded-2xl text-xs outline-none resize-none leading-relaxed text-slate-800"
            />

            <button
              type="button"
              disabled={sendingWa || !waInputMessage.trim()}
              onClick={handleSendWhatsAppMessage}
              className="w-11 h-11 rounded-full bg-[#00A884] hover:bg-[#008f6f] text-white flex items-center justify-center shadow-md active:scale-95 disabled:opacity-40 transition-all shrink-0"
              title="Dispatch message via WhatsApp"
            >
              {sendingWa ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Send className="w-5 h-5 text-white" />
              )}
            </button>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. ADD MANUAL ORDER MODAL */}
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
                    <option value="Today · 10:00 AM – 12:00 PM">Today · 10:00 AM – 12:00 PM</option>
                    <option value="Today · 02:00 PM – 04:00 PM">Today · 02:00 PM – 04:00 PM</option>
                    <option value="Today · 06:00 PM – 08:00 PM">Today · 06:00 PM – 08:00 PM</option>
                    <option value="Tomorrow · Morning">Tomorrow · Morning</option>
                    <option value="Tomorrow · Evening">Tomorrow · Evening</option>
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
                  placeholder="e.g. 5 Shirts, 2 Pants, urgent evening delivery"
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
                  className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 active:scale-98 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>Create Booking</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. TOAST NOTIFICATIONS */}
      {/* ========================================================================= */}
      {toastMsg && (
        <div
          className={`fixed bottom-5 right-5 z-50 p-3.5 px-4 rounded-2xl shadow-lg flex items-center gap-2.5 border animate-in slide-in-from-bottom duration-250 max-w-md ${
            toastMsg.type === 'error'
              ? 'bg-rose-950 text-white border-rose-800'
              : toastMsg.type === 'info'
              ? 'bg-slate-900 text-white border-slate-800'
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
