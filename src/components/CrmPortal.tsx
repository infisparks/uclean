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
  Minimize2,
  Maximize2,
  Copy,
  ExternalLink,
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
    | 'Quotation Sent'
    | 'Cleaning In Progress'
    | 'Ready for Delivery'
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

const STATUS_LIST = [
  'New Request',
  'Call Confirmed',
  'Pickup Assigned',
  'Picked Up',
  'At Store / Inspection',
  'Quotation Sent',
  'Cleaning In Progress',
  'Quality Check',
  'Ready for Delivery',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
];

export function CrmPortal({ onBackToStore }: { onBackToStore: () => void }) {
  const [orders, setOrders] = useState<CrmOrder[]>(INITIAL_DEMO_ORDERS);
  const [selectedId, setSelectedId] = useState<string>(INITIAL_DEMO_ORDERS[0].id);
  const [search, setSearch] = useState('');
  const [activeNav, setActiveNav] = useState<'all' | 'calls' | 'pickups' | 'quotes' | 'ready'>('all');
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // WhatsApp popup drawer state
  const [isWaOpen, setIsWaOpen] = useState(false);
  const [waInputMessage, setWaInputMessage] = useState('');
  const [sendingWa, setSendingWa] = useState(false);
  const [chatHistory, setChatHistory] = useState<Record<string, ChatMessage[]>>({});

  // Quote input within WhatsApp popup
  const [quoteAmount, setQuoteAmount] = useState('450');

  // Manual new order modal
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
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Fetch bookings from server-side API & LocalStorage & Firestore
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
        console.warn('Server bookings API poll note:', err);
      }
    };

    // 1. Initial fetch
    fetchServerBookings();
    loadLocalCache();

    // 2. Poll server every 3 seconds for live order sync across all devices
    const intervalId = setInterval(fetchServerBookings, 3000);

    // 3. Live Firebase Realtime Database WebSocket listener
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
        (err) => {
          console.warn('Realtime Database listen warning:', err);
        }
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
        console.warn('Local cache read error:', e);
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

  // Operational Calculations (Aaj kitne logon ka pickup karna hai, kitnon se baat karna hai)
  const opsCounters = useMemo(() => {
    // 1. Baat karna hai (New requests pending phone verification)
    const callsPending = orders.filter((o) => o.status === 'New Request' || !o.callDone);

    // 2. Aaj kitne logon ka pickup karna hai
    const pickupsToday = orders.filter(
      (o) =>
        (o.slot.toLowerCase().includes('today') || o.date?.toLowerCase().includes('today')) &&
        ['New Request', 'Call Confirmed', 'Pickup Assigned'].includes(o.status)
    );

    // 3. Quotes pending
    const quotesPending = orders.filter((o) => ['Picked Up', 'At Store / Inspection'].includes(o.status));

    // 4. Ready for delivery
    const readyForDelivery = orders.filter((o) => o.status === 'Ready for Delivery');

    return {
      callsPendingCount: callsPending.length,
      callsPendingList: callsPending,
      pickupsTodayCount: pickupsToday.length,
      pickupsTodayList: pickupsToday,
      quotesPendingCount: quotesPending.length,
      readyDeliveryCount: readyForDelivery.length,
    };
  }, [orders]);

  // Filtered orders list based on active tab & search
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
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
        return o.status === 'Ready for Delivery';
      }
      return true;
    });
  }, [orders, search, activeNav]);

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

    showToast(`Order #${selectedOrder.id} status updated to "${newStatus}"`, 'info');
  };

  // Mark Call Done
  const handleMarkCallDone = () => {
    setOrders((prev) =>
      prev.map((o) => (o.id === selectedOrder.id ? { ...o, callDone: true, status: 'Call Confirmed' } : o))
    );
    showToast(`Call verified with ${selectedOrder.name}! Status: Call Confirmed.`, 'success');
  };

  // Mark Pickup Done
  const handleMarkPickupDone = () => {
    setOrders((prev) =>
      prev.map((o) => (o.id === selectedOrder.id ? { ...o, pickupDone: true, status: 'Picked Up' } : o))
    );
    showToast(`Garments collected from ${selectedOrder.name}! Status: Picked Up.`, 'success');
  };

  // Open WhatsApp popup for current order
  const openWhatsAppPopupForOrder = (prefillTemplate?: 1 | 2 | 3) => {
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

  // Send message via Evolution API
  const handleSendWhatsAppMessage = async () => {
    if (!selectedOrder.phone) {
      showToast('Customer phone number is missing!', 'error');
      return;
    }
    const textToSend = waInputMessage.trim();
    if (!textToSend) {
      showToast('Please type a message to send.', 'error');
      return;
    }

    setSendingWa(true);
    try {
      const res = await sendWhatsAppMessage(selectedOrder.phone, textToSend);
      if (res.success) {
        // Append to chat history for this order
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
        showToast(`WhatsApp sent to ${selectedOrder.name} (${selectedOrder.phone})! 🚀`, 'success');
      } else {
        showToast(`Delivery notice: ${res.message || 'Check gateway'}`, 'error');
      }
    } catch {
      showToast('Failed to send WhatsApp message.', 'error');
    } finally {
      setSendingWa(false);
    }
  };

  // Quick Action Buttons on Template Chips inside WhatsApp
  const applyTemplate = (tmpl: 1 | 2 | 3) => {
    if (tmpl === 1) {
      setWaInputMessage(
        generateBookingConfirmationTemplate({
          customerName: selectedOrder.name,
          orderId: selectedOrder.id,
          address: selectedOrder.address,
          date: selectedOrder.date || 'Today',
          time: selectedOrder.time || selectedOrder.slot,
        })
      );
    } else if (tmpl === 2) {
      setWaInputMessage(
        generateQuotationTemplate({
          customerName: selectedOrder.name,
          orderId: selectedOrder.id,
          services: selectedOrder.service + (selectedOrder.items ? ` (${selectedOrder.items})` : ''),
          amount: quoteAmount,
        })
      );
    } else if (tmpl === 3) {
      setWaInputMessage(
        generateReadyForDeliveryTemplate({
          customerName: selectedOrder.name,
          orderId: selectedOrder.id,
          amount: selectedOrder.total,
        })
      );
    }
  };

  // Manual new order creation with strict validation
  const handleCreateNewOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validate Name
    const nameVal = validateCustomerName(newCustName);
    if (!nameVal.isValid) {
      setNewCustNameError(nameVal.error || 'Please enter customer name');
      return;
    }
    setNewCustNameError('');

    // 2. Validate Indian Mobile
    const phoneVal = validateIndianMobile(newCustPhone);
    if (!phoneVal.isValid) {
      setNewCustPhoneError(phoneVal.error || 'Please enter valid 10-digit Indian mobile number');
      return;
    }
    setNewCustPhoneError('');

    // 3. Validate Address
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
      notes: newCustNotes.trim() || 'Manual order entered by store staff',
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

    showToast(`Order #${newId} created! Click WhatsApp icon to send pickup confirmation.`, 'success');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'New Request':
        return 'bg-amber-500 text-white border-amber-600 shadow-xs font-black';
      case 'Call Confirmed':
        return 'bg-blue-600 text-white border-blue-700 shadow-xs font-black';
      case 'Pickup Assigned':
        return 'bg-indigo-600 text-white border-indigo-700 shadow-xs font-black';
      case 'Picked Up':
        return 'bg-purple-600 text-white border-purple-700 shadow-xs font-black';
      case 'At Store / Inspection':
        return 'bg-teal-600 text-white border-teal-700 shadow-xs font-black';
      case 'Quotation Sent':
        return 'bg-sky-500 text-white border-sky-600 shadow-xs font-black';
      case 'Cleaning In Progress':
        return 'bg-orange-500 text-white border-orange-600 shadow-xs font-black';
      case 'Quality Check':
        return 'bg-violet-600 text-white border-violet-700 shadow-xs font-black';
      case 'Ready for Delivery':
        return 'bg-emerald-500 text-white border-emerald-600 shadow-xs font-black animate-pulse';
      case 'Out for Delivery':
        return 'bg-lime-600 text-white border-lime-700 shadow-xs font-black';
      case 'Delivered':
        return 'bg-emerald-700 text-white border-emerald-800 shadow-xs font-black';
      case 'Cancelled':
        return 'bg-rose-600 text-white border-rose-700 shadow-xs font-black';
      default:
        return 'bg-slate-700 text-white border-slate-800 shadow-xs font-bold';
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 flex font-sans antialiased relative">
      
      {/* ========================================================================= */}
      {/* 1. LEFT EXECUTIVE SIDEBAR (Clean, high-contrast, modern store desk) */}
      {/* ========================================================================= */}
      <aside className="w-64 bg-[#052e16] text-white flex flex-col justify-between shrink-0 border-r border-emerald-500/30 hidden md:flex min-h-screen sticky top-0 h-screen shadow-lg">
        <div>
          {/* Logo & Store Header */}
          <div className="p-5 border-b border-emerald-500/30 bg-[#031f0f]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center font-black text-white text-lg shadow-md border border-white/20">
                U
              </div>
              <div>
                <h1 className="font-heading font-black text-base tracking-tight text-white leading-tight">
                  UCLEAN CRM
                </h1>
                <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Nerul West Store
                </p>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="p-3 space-y-1.5 text-xs font-bold">
            <button
              onClick={() => setActiveNav('all')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                activeNav === 'all'
                  ? 'bg-emerald-600 text-white shadow-md font-black'
                  : 'text-emerald-100/90 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4" />
                <span>All Orders</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-[11px] font-black">
                {orders.length}
              </span>
            </button>

            {/* 🔥 BAAT KARNA HAI (Calls Pending) */}
            <button
              onClick={() => setActiveNav('calls')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                activeNav === 'calls'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md ring-2 ring-white/40'
                  : 'text-amber-300 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <PhoneCall className="w-4 h-4 text-amber-300" />
                <span>Baat Karna Hai (Calls)</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[11px] font-black shadow-xs animate-pulse">
                {opsCounters.callsPendingCount}
              </span>
            </button>

            {/* 🔥 AAJ KA PICKUP (Today's Pickups) */}
            <button
              onClick={() => setActiveNav('pickups')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                activeNav === 'pickups'
                  ? 'bg-emerald-500 text-white font-black shadow-md ring-2 ring-white/40'
                  : 'text-emerald-300 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-emerald-300" />
                <span>Aaj Ka Pickup (Today)</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[11px] font-black shadow-xs">
                {opsCounters.pickupsTodayCount}
              </span>
            </button>

            {/* Quotations Stage */}
            <button
              onClick={() => setActiveNav('quotes')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                activeNav === 'quotes'
                  ? 'bg-purple-600 text-white font-black shadow-md'
                  : 'text-purple-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <DollarSign className="w-4 h-4" />
                <span>Quotation Pending</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-[11px] font-black">
                {opsCounters.quotesPendingCount}
              </span>
            </button>

            {/* Ready for Delivery */}
            <button
              onClick={() => setActiveNav('ready')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                activeNav === 'ready'
                  ? 'bg-blue-600 text-white font-black shadow-md'
                  : 'text-blue-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4" />
                <span>Ready for Delivery</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-[11px] font-black">
                {opsCounters.readyDeliveryCount}
              </span>
            </button>
          </nav>

          {/* Quick WhatsApp popup toggle button in sidebar */}
          <div className="p-3">
            <button
              onClick={() => setIsWaOpen(!isWaOpen)}
              className="w-full p-3 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
            >
              <MessageSquare className="w-4 h-4 text-white" />
              <span>{isWaOpen ? 'Hide WhatsApp Drawer' : 'Open WhatsApp Drawer'}</span>
            </button>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-emerald-500/30 space-y-2 bg-[#031f0f]">
          <div className="text-[11px] text-emerald-300 flex items-center gap-1.5 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            Evolution API Connected
          </div>
          <button
            onClick={onBackToStore}
            className="w-full py-2.5 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-colors border border-white/20"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Customer Store</span>
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MAIN WORKSPACE */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        
        {/* Top Control Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 sm:px-6 shadow-xs">
          <div className="flex items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, phone, order ID, address..."
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-300 focus:border-emerald-500 focus:bg-white rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-[11px] font-black">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Live Realtime Database</span>
              </div>

              <button
                onClick={() => setIsWaOpen(true)}
                className="h-9 px-3.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                title="Open WhatsApp Side Panel"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">WhatsApp Chat</span>
              </button>

              <button
                onClick={() => setNewOrderModalOpen(true)}
                className="h-9 px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-black text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>New Order</span>
              </button>
            </div>
          </div>
        </header>

        {/* 🔥 DAILY ACTION BANNER (Aaj kitne logon ka pickup aur kitnon se baat karna hai) 🔥 */}
        <section className="bg-gradient-to-r from-[#008f51] via-[#059669] to-[#047857] text-white px-4 py-4 sm:px-6 shadow-md border-b border-emerald-400/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-300 animate-ping" />
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-100">
                  NERUL SECTOR 6 STORE &bull; LIVE DISPATCH &amp; OPERATIONS
                </span>
              </div>
              <h2 className="font-heading font-black text-base sm:text-xl text-white tracking-tight">
                Store Operations Action Center
              </h2>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Badge 1: Calls to Make */}
              <button
                onClick={() => setActiveNav('calls')}
                className={`px-3.5 py-2 rounded-xl border flex items-center gap-2 text-xs font-black transition-all shadow-sm active:scale-95 ${
                  activeNav === 'calls'
                    ? 'bg-amber-400 text-slate-950 border-white ring-2 ring-white/50'
                    : 'bg-amber-400/20 hover:bg-amber-400/30 text-amber-100 border-amber-300/40'
                }`}
              >
                <PhoneCall className="w-4 h-4 text-amber-300" />
                <span>
                  Baat Karna Hai:{' '}
                  <strong className="text-white bg-amber-500 px-2 py-0.5 rounded-lg font-black ml-1">
                    {opsCounters.callsPendingCount} Calls
                  </strong>
                </span>
              </button>

              {/* Badge 2: Pickups to Make Today */}
              <button
                onClick={() => setActiveNav('pickups')}
                className={`px-3.5 py-2 rounded-xl border flex items-center gap-2 text-xs font-black transition-all shadow-sm active:scale-95 ${
                  activeNav === 'pickups'
                    ? 'bg-emerald-300 text-slate-950 border-white ring-2 ring-white/50'
                    : 'bg-emerald-400/20 hover:bg-emerald-400/30 text-emerald-100 border-emerald-300/40'
                }`}
              >
                <Truck className="w-4 h-4 text-emerald-200" />
                <span>
                  Aaj Ka Pickup:{' '}
                  <strong className="text-white bg-emerald-700 px-2 py-0.5 rounded-lg font-black ml-1">
                    {opsCounters.pickupsTodayCount} Pickups
                  </strong>
                </span>
              </button>

              {/* Badge 3: Ready for delivery */}
              <button
                onClick={() => setActiveNav('ready')}
                className={`px-3.5 py-2 rounded-xl border flex items-center gap-2 text-xs font-black transition-all shadow-sm active:scale-95 ${
                  activeNav === 'ready'
                    ? 'bg-blue-400 text-slate-950 border-white ring-2 ring-white/50'
                    : 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-100 border-blue-300/40'
                }`}
              >
                <Package className="w-4 h-4 text-blue-200" />
                <span>
                  Ready Delivery:{' '}
                  <strong className="text-white bg-blue-600 px-2 py-0.5 rounded-lg font-black ml-1">
                    {opsCounters.readyDeliveryCount}
                  </strong>
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Main 2-Column Split: Orders Table on Left, Order Detail on Right */}
        <div className="flex-1 p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* ORDERS LIST (5 cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-gray-500 px-1">
              <span>Showing {filteredOrders.length} orders</span>
              <span className="capitalize">{activeNav} View</span>
            </div>

            <div className="space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center text-slate-500">
                  <AlertCircle className="w-9 h-9 mx-auto text-amber-500 mb-2" />
                  <p className="text-sm font-black text-slate-800">No matching orders found</p>
                  <p className="text-xs text-slate-500 mt-1">Check another filter or clear search.</p>
                </div>
              ) : (
                filteredOrders.map((ord) => {
                  const isSelected = ord.id === selectedId;
                  return (
                    <div
                      key={ord.id}
                      onClick={() => setSelectedId(ord.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                        isSelected
                          ? 'bg-emerald-50/70 border-2 border-emerald-500 shadow-md ring-2 ring-emerald-400/25 -translate-y-0.5'
                          : 'bg-white border-slate-200 hover:border-emerald-400 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-300">
                          #{ord.id}
                        </span>
                        <span
                          className={`text-[10.5px] font-black uppercase px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                            ord.status
                          )}`}
                        >
                          {ord.status}
                        </span>
                      </div>

                      <div className="mt-2.5 flex items-start justify-between">
                        <div>
                          <h4 className="font-heading font-black text-[15px] text-slate-900 leading-tight">
                            {ord.name}
                          </h4>
                          <p className="text-xs text-slate-600 font-bold mt-1 flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{ord.phone || 'No phone'}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-mono font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                            {ord.total.startsWith('₹') ? ord.total : `₹${ord.total}`}
                          </span>
                          <p className="text-[10px] text-slate-400 font-semibold mt-1">{ord.createdAt || 'Recent'}</p>
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                        <span className="truncate max-w-[210px] font-bold text-slate-800">
                          {ord.service}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500 shrink-0">
                          {ord.slot}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ORDER DETAIL PANEL (7 cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-5">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-emerald-800 bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-300">
                      Order #{selectedOrder.id}
                    </span>
                    <span
                      className={`text-xs font-black uppercase px-3 py-1 rounded-full border ${getStatusBadge(
                        selectedOrder.status
                      )}`}
                    >
                      {selectedOrder.status}
                    </span>
                  </div>
                  <h2 className="font-heading font-black text-2xl text-slate-900 mt-2 tracking-tight">
                    {selectedOrder.name}
                  </h2>
                </div>

                {/* Quick Call & WhatsApp Popup Button */}
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${selectedOrder.phone}`}
                    className="h-10 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs flex items-center gap-1.5 transition-colors border border-slate-200"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Call Now</span>
                  </a>

                  <button
                    onClick={() => openWhatsAppPopupForOrder(1)}
                    className="h-10 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Open WhatsApp</span>
                  </button>
                </div>
              </div>

              {/* Order Info Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-gradient-to-br from-slate-50 to-emerald-50/30 p-4 rounded-2xl border border-slate-200">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    Pickup Address
                  </span>
                  <p className="text-xs font-bold text-slate-900 leading-relaxed">
                    {selectedOrder.address || 'Address not provided'}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    Scheduled Slot
                  </span>
                  <p className="text-xs font-bold text-slate-900">
                    {selectedOrder.slot || 'Earliest available'}
                  </p>
                </div>

                <div className="space-y-1 sm:col-span-2 pt-2.5 border-t border-slate-200">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Package className="w-3.5 h-3.5 text-emerald-600" />
                    Services &amp; Notes
                  </span>
                  <p className="text-xs font-black text-slate-900">
                    {selectedOrder.service} {selectedOrder.items ? `— ${selectedOrder.items}` : ''}
                  </p>
                  {selectedOrder.notes && (
                    <p className="text-xs text-slate-600 italic mt-0.5 font-medium bg-white/70 p-2 rounded-lg border border-slate-200">
                      &quot;{selectedOrder.notes}&quot;
                    </p>
                  )}
                </div>
              </div>

              {/* Operations Action Buttons: 1. Confirm Call, 2. Mark Pickup */}
              <div className="flex items-center gap-2.5 pt-1">
                <button
                  onClick={handleMarkCallDone}
                  className="flex-1 h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98"
                >
                  <PhoneCall className="w-4 h-4 text-blue-200" />
                  <span>Baat Ho Gayi (Confirm Call)</span>
                </button>

                <button
                  onClick={handleMarkPickupDone}
                  className="flex-1 h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98"
                >
                  <Truck className="w-4 h-4 text-emerald-200" />
                  <span>Pickup Complete (Kapde Le Liye)</span>
                </button>
              </div>

              {/* 3 WhatsApp Quick Launch Cards */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-600">
                    Send WhatsApp Notification:
                  </span>
                  <span className="text-[11px] font-black text-[#25D366] flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse"></span>
                    Evolution API Connected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    onClick={() => openWhatsAppPopupForOrder(1)}
                    className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 hover:brightness-105 text-white shadow-sm text-left transition-all border border-emerald-400 active:scale-98"
                  >
                    <span className="text-[10px] font-black uppercase text-emerald-100 block mb-1">
                      Template 1
                    </span>
                    <h5 className="font-black text-xs text-white">Pickup Confirmed</h5>
                    <p className="text-[10.5px] text-emerald-100 mt-0.5">Booking receipt message</p>
                  </button>

                  <button
                    onClick={() => openWhatsAppPopupForOrder(2)}
                    className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 hover:brightness-105 text-white shadow-sm text-left transition-all border border-amber-400 active:scale-98"
                  >
                    <span className="text-[10px] font-black uppercase text-amber-100 block mb-1">
                      Template 2
                    </span>
                    <h5 className="font-black text-xs text-white">Send Quotation</h5>
                    <p className="text-[10.5px] text-amber-100 mt-0.5">Garment price estimate</p>
                  </button>

                  <button
                    onClick={() => openWhatsAppPopupForOrder(3)}
                    className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 hover:brightness-105 text-white shadow-sm text-left transition-all border border-blue-400 active:scale-98"
                  >
                    <span className="text-[10px] font-black uppercase text-blue-100 block mb-1">
                      Template 3
                    </span>
                    <h5 className="font-black text-xs text-white">Ready for Delivery</h5>
                    <p className="text-[10.5px] text-blue-100 mt-0.5">Delivery coordination</p>
                  </button>
                </div>
              </div>

              {/* Status Stepper */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-black uppercase tracking-wider text-slate-600 block">
                  Change Order Status:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {STATUS_LIST.slice(0, 8).map((st) => {
                    const isCur = selectedOrder.status === st;
                    return (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(st)}
                        className={`px-3 py-2 rounded-xl text-xs font-black border transition-all text-center active:scale-95 ${
                          isCur
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm ring-2 ring-emerald-400/40'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                        }`}
                      >
                        {st}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. 🔥 WHATSAPP WEB STYLE SIDE POPUP (DRAWER / POPUP) 🔥 */}
      {/* ========================================================================= */}
      {isWaOpen && (
        <div className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[420px] bg-[#EFEAE2] shadow-2xl border-l border-gray-300 flex flex-col animate-in slide-in-from-right duration-300">
          
          {/* WhatsApp Header (Classic Dark Green #075E54) */}
          <div className="bg-[#075E54] text-white p-3.5 px-4 flex items-center justify-between shadow-md select-none shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#128C7E] flex items-center justify-center font-bold text-white text-sm shadow-inner">
                {selectedOrder.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight text-white flex items-center gap-1.5">
                  {selectedOrder.name}
                  <span className="text-[10px] font-normal text-[#9fe3c1] font-mono">
                    (#{selectedOrder.id})
                  </span>
                </h3>
                <p className="text-[11px] text-[#A8DEC4] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]"></span>
                  {selectedOrder.phone || 'No phone'} &bull; Online
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
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-white transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={() => setIsWaOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Template Chips Strip */}
          <div className="bg-[#f0f2f5] p-2.5 px-3 border-b border-gray-200 flex items-center gap-1.5 overflow-x-auto text-[11px] font-bold shrink-0">
            <span className="text-gray-500 text-[10px] uppercase font-black shrink-0">Templates:</span>
            <button
              onClick={() => applyTemplate(1)}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-[#d9fdd3] text-[#075E54] border border-gray-300 hover:border-[#25D366] transition-all whitespace-nowrap shadow-2xs"
            >
              1. Pickup Received
            </button>
            <button
              onClick={() => applyTemplate(2)}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-[#fff0db] text-amber-800 border border-gray-300 hover:border-amber-400 transition-all whitespace-nowrap shadow-2xs"
            >
              2. Quotation
            </button>
            <button
              onClick={() => applyTemplate(3)}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-[#e1f0ff] text-blue-800 border border-gray-300 hover:border-blue-400 transition-all whitespace-nowrap shadow-2xs"
            >
              3. Ready for Delivery
            </button>
          </div>

          {/* WhatsApp Chat Wallpaper Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#EFEAE2]">
            
            {/* Encryption notice */}
            <div className="text-center">
              <span className="inline-block bg-[#FFEECD] text-[#632608] text-[10px] px-3 py-1 rounded-lg shadow-2xs">
                🔒 Connected to Evolution API &bull; Messages deliver instantly to customer
              </span>
            </div>

            {/* Sent Messages History for this order */}
            {(chatHistory[selectedOrder.id] || []).map((msg) => (
              <div key={msg.id} className="flex justify-end">
                <div className="max-w-[85%] bg-[#D9FDD3] text-gray-900 rounded-2xl rounded-tr-none p-3 shadow-xs text-xs space-y-1">
                  <p className="whitespace-pre-line leading-relaxed font-sans">{msg.text}</p>
                  <div className="text-[10px] text-gray-500 text-right flex items-center justify-end gap-1">
                    <span>{msg.time}</span>
                    <span className="text-[#53bdeb] font-bold">✓✓</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Live Message Preview Bubble if typing or selected */}
            {waInputMessage && (
              <div className="flex justify-end">
                <div className="max-w-[90%] bg-white text-gray-900 rounded-2xl rounded-tr-none p-3 shadow-sm border border-emerald-300/60 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-black text-[#008f51] pb-1 border-b border-gray-100">
                    <span>Message to be sent:</span>
                    <span>Ready</span>
                  </div>
                  <p className="whitespace-pre-line leading-relaxed font-mono text-[11px] text-gray-800">
                    {waInputMessage}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Quotation Amount Quick Adjuster (if template 2 selected) */}
          <div className="bg-[#F0F2F5] px-3 py-1.5 border-t border-gray-200 flex items-center justify-between text-xs">
            <span className="text-[11px] font-bold text-gray-600">Quick Quote Amount:</span>
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500 font-bold">₹</span>
              <input
                type="number"
                value={quoteAmount}
                onChange={(e) => {
                  setQuoteAmount(e.target.value);
                  applyTemplate(2);
                }}
                className="w-20 px-2 py-0.5 bg-white border border-gray-300 rounded-md text-xs font-black outline-none"
              />
            </div>
          </div>

          {/* WhatsApp Bottom Input & Send Box */}
          <div className="bg-[#F0F2F5] p-3 border-t border-gray-200 flex items-end gap-2 shrink-0">
            <textarea
              rows={3}
              value={waInputMessage}
              onChange={(e) => setWaInputMessage(e.target.value)}
              placeholder="Type message or click a template above..."
              className="flex-1 px-3 py-2 bg-white border border-gray-300 focus:border-[#25D366] rounded-2xl text-xs outline-none resize-none leading-relaxed"
            />

            <button
              type="button"
              disabled={sendingWa || !waInputMessage.trim()}
              onClick={handleSendWhatsAppMessage}
              className="w-11 h-11 rounded-full bg-[#00A884] hover:bg-[#008f6f] text-white flex items-center justify-center shadow-md active:scale-95 disabled:opacity-40 transition-all shrink-0"
              title="Send via Evolution WhatsApp API"
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
      {/* 4. CREATE MANUAL NEW ORDER MODAL */}
      {/* ========================================================================= */}
      {newOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col">
            <div className="bg-gradient-to-r from-[#008f51] to-emerald-700 text-white p-4 px-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-200">
                  Store Desk &bull; Nerul West
                </span>
                <h3 className="font-heading font-black text-base text-white">
                  Add New Customer Order
                </h3>
              </div>
              <button
                onClick={() => setNewOrderModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewOrder} className="p-5 overflow-y-auto space-y-3.5 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1">
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
                    className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-bold text-slate-900 outline-none transition-all ${
                      newCustNameError
                        ? 'border-rose-500 bg-rose-50/50'
                        : 'border-slate-300 focus:border-emerald-500 focus:bg-white'
                    }`}
                  />
                  {newCustNameError && (
                    <p className="text-[10px] text-rose-600 font-bold mt-1">
                      {newCustNameError}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1">
                    Indian Mobile *
                  </label>
                  <div className="flex rounded-xl overflow-hidden">
                    <div className="flex items-center gap-1 bg-slate-100 border border-r-0 border-slate-300 px-2.5 text-xs font-bold text-slate-800 shrink-0">
                      <span>🇮🇳</span>
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
                      className={`w-full px-3 py-2 border rounded-r-xl text-xs font-bold text-slate-900 outline-none transition-all ${
                        newCustPhoneError
                          ? 'border-rose-500 bg-rose-50/50'
                          : 'border-slate-300 focus:border-emerald-500 focus:bg-white bg-slate-50'
                      }`}
                    />
                  </div>
                  {newCustPhoneError && (
                    <p className="text-[10px] text-rose-600 font-bold mt-1">
                      {newCustPhoneError}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1">
                  Service Requested
                </label>
                <select
                  value={newCustService}
                  onChange={(e) => setNewCustService(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 focus:border-emerald-500 focus:bg-white rounded-xl text-xs font-bold text-slate-900 outline-none"
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
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1">
                  Complete Address *
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
                  className={`w-full px-3 py-2 border rounded-xl text-xs font-bold text-slate-900 outline-none transition-all ${
                    newCustAddressError
                      ? 'border-rose-500 bg-rose-50/50'
                      : 'border-slate-300 focus:border-emerald-500 focus:bg-white bg-slate-50'
                  }`}
                />
                {newCustAddressError && (
                  <p className="text-[10px] text-rose-600 font-bold mt-1">
                    {newCustAddressError}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1">
                    Pickup Time Slot
                  </label>
                  <select
                    value={newCustSlot}
                    onChange={(e) => setNewCustSlot(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 focus:border-emerald-500 focus:bg-white rounded-xl text-xs font-bold text-slate-900 outline-none"
                  >
                    <option value="Today · 10:00 AM – 12:00 PM">Today · 10:00 AM – 12:00 PM</option>
                    <option value="Today · 02:00 PM – 04:00 PM">Today · 02:00 PM – 04:00 PM</option>
                    <option value="Today · 06:00 PM – 08:00 PM">Today · 06:00 PM – 08:00 PM</option>
                    <option value="Tomorrow · Morning">Tomorrow · Morning</option>
                    <option value="Tomorrow · Evening">Tomorrow · Evening</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1">
                    Initial Estimate (₹)
                  </label>
                  <input
                    type="number"
                    value={newCustAmount}
                    onChange={(e) => setNewCustAmount(e.target.value)}
                    placeholder="149"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 focus:border-emerald-500 focus:bg-white rounded-xl text-xs font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1">
                  Garment Details / Instructions
                </label>
                <textarea
                  rows={2}
                  value={newCustNotes}
                  onChange={(e) => setNewCustNotes(e.target.value)}
                  placeholder="e.g. 5 Shirts, 2 Pants, urgent delivery"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 focus:border-emerald-500 focus:bg-white rounded-xl text-xs font-bold text-slate-900 outline-none resize-none"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setNewOrderModalOpen(false)}
                  className="flex-1 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5 active:scale-98 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Order</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed bottom-5 left-5 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 border animate-in slide-in-from-bottom duration-300 max-w-md ${
            toastMsg.type === 'error'
              ? 'bg-rose-900 text-white border-rose-700'
              : toastMsg.type === 'info'
              ? 'bg-[#072618] text-white border-[#008f51]'
              : 'bg-emerald-900 text-white border-emerald-700'
          }`}
        >
          {toastMsg.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-300 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          )}
          <span className="text-xs font-bold leading-snug">{toastMsg.text}</span>
          <button onClick={() => setToastMsg(null)} className="ml-auto text-white/60 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
}
