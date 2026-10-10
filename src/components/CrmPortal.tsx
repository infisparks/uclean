'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  Phone,
  Clock,
  MapPin,
  Search,
  Filter,
  CheckCircle,
  Plus,
  Printer,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Send,
  UserCheck,
  Truck,
} from 'lucide-react';

export interface CrmOrder {
  id: string;
  name: string;
  phone: string;
  service: string;
  qty: string;
  total: string;
  address: string;
  slot: string;
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
    | 'Cancelled';
  notes: string;
  createdAt?: string;
}

const INITIAL_DEMO_ORDERS: CrmOrder[] = [
  {
    id: 'UC-26091',
    name: 'Ayesha Shaikh',
    phone: '+91 98204 77121',
    service: 'Wash & Iron',
    qty: '3.5 kg (estimate)',
    total: '₹521 est.',
    address: 'Flat 402, Sea View Heights, Sector 6, Nerul West',
    slot: 'Today · Afternoon (12-4 PM)',
    status: 'New Request',
    notes: 'Call before arriving. Ring flat bell twice.',
  },
  {
    id: 'UC-26090',
    name: 'Rahul Mehta',
    phone: '+91 98191 43234',
    service: 'Dry Cleaning (Suits)',
    qty: '2 garments (3-pc suit + blazer)',
    total: '₹1,248 est.',
    address: 'B-12, Palm Beach Residency, Nerul',
    slot: 'Today · Evening (4-9 PM)',
    status: 'Call Confirmed',
    notes: 'Urgent turnaround required by tomorrow evening.',
  },
  {
    id: 'UC-26089',
    name: 'Sana Khan',
    phone: '+91 88790 12356',
    service: 'Wash & Fold',
    qty: '4.2 kg (estimate)',
    total: '₹457 est.',
    address: 'Room 101, Om Sai Krupa, Sector 6',
    slot: 'Today · Morning (8-12 PM)',
    status: 'Pickup Assigned',
    notes: 'Assigned to driver Ramesh.',
  },
  {
    id: 'UC-26088',
    name: 'Vivek Patil',
    phone: '+91 97022 55477',
    service: 'Carpet & Sofa Shampoo',
    qty: 'Approx. 35 sq. ft. + 3 seater',
    total: '₹1,850 quotation',
    address: 'Row House 4, Sector 6, Nerul West',
    slot: 'Tomorrow · Morning',
    status: 'Quotation Sent',
    notes: 'Customer accepted estimate on WhatsApp.',
  },
  {
    id: 'UC-26087',
    name: 'Fatima Ali',
    phone: '+91 91673 88990',
    service: 'Bridal Lehenga Dry Clean',
    qty: '1 set (heavy zari work)',
    total: '₹1,499',
    address: 'Plot 45, Near Meridian, Nerul West',
    slot: 'Delivered',
    status: 'Delivered',
    notes: 'Quality checked, customer loved packaging.',
  },
];

export function CrmPortal({ onBackToStore }: { onBackToStore: () => void }) {
  const [orders, setOrders] = useState<CrmOrder[]>(INITIAL_DEMO_ORDERS);
  const [selectedId, setSelectedId] = useState<string>(INITIAL_DEMO_ORDERS[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Load any local storage submitted orders
  useEffect(() => {
    try {
      const local = JSON.parse(localStorage.getItem('uclean_local_bookings') || '[]');
      if (Array.isArray(local) && local.length > 0) {
        const mapped: CrmOrder[] = local.map((b: any, idx: number) => ({
          id: b.id || `UC-${26100 + idx}`,
          name: b.customerName || 'Customer',
          phone: b.phone || '98XXXXXX',
          service: b.serviceType || 'Pickup Order',
          qty: 'Pending weigh',
          total: b.totalEstimate ? `₹${b.totalEstimate}` : 'To confirm',
          address: b.address || 'Nerul West',
          slot: `${b.preferredDate || 'Today'} · ${b.preferredTimeSlot || 'Morning'}`,
          status: 'New Request',
          notes: b.notes || 'Submitted from Web App',
        }));

        setOrders((prev) => {
          const ids = new Set(prev.map((o) => o.id));
          const newOnes = mapped.filter((m) => !ids.has(m.id));
          return [...newOnes, ...prev];
        });
      }
    } catch (e) {
      console.warn(e);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const selectedOrder = orders.find((o) => o.id === selectedId) || orders[0];

  const filteredOrders = orders.filter((o) => {
    const matchFilter = statusFilter === 'All' || o.status === statusFilter;
    const matchSearch =
      !searchQuery ||
      [o.id, o.name, o.phone, o.service, o.address]
        .join(' ')
        .toLowerCase()
        .includes(searchQuery.toLowerCase().trim());
    return matchFilter && matchSearch;
  });

  const getStatusPillClass = (st: string) => {
    if (st === 'New Request') return 'bg-blue-100 text-blue-800 border-blue-200';
    if (st === 'Call Confirmed') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (st.includes('Pickup') || st === 'Picked Up') return 'bg-amber-100 text-amber-800 border-amber-200';
    if (st === 'Delivered') return 'bg-teal-100 text-teal-800 border-teal-200';
    if (st === 'Cancelled') return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-purple-100 text-purple-800 border-purple-200';
  };

  const updateOrderStatus = (newStatus: CrmOrder['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === selectedOrder.id ? { ...o, status: newStatus } : o))
    );
    showToast(`Order #${selectedOrder.id} status updated to: ${newStatus}`);
  };

  const handleQuickAddOrder = () => {
    const newId = `UC-${26095 + orders.length}`;
    const newOrder: CrmOrder = {
      id: newId,
      name: 'Walk-in Customer (Nerul)',
      phone: '+91 74004 74132',
      service: 'Wash & Fold',
      qty: '5 kg standard',
      total: '₹545 est.',
      address: 'Shop drop-off, Sector 6, Nerul',
      slot: 'Today · Express 24hr',
      status: 'New Request',
      notes: 'Customer dropped off garments at counter.',
    };
    setOrders([newOrder, ...orders]);
    setSelectedId(newId);
    showToast('New order created successfully.');
  };

  const handleSendWhatsAppUpdate = () => {
    const cleanPhone = selectedOrder.phone.replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(
      `Hi ${selectedOrder.name}! 👋\n\n` +
      `This is an update from *U CLEAN Nerul West* regarding your Order *#${selectedOrder.id}*.\n` +
      `📌 Current Status: *${selectedOrder.status}*\n` +
      `🧺 Service: ${selectedOrder.service}\n` +
      `🚚 Slot: ${selectedOrder.slot}\n\n` +
      `For any questions, reach us at +91 74004 74132. Thank you for choosing U CLEAN!`
    );
    window.open(`https://wa.me/${cleanPhone || '917400474132'}?text=${msg}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#f4f6f4] text-[#17251d] flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-[#072618] text-white p-3.5 px-5 flex items-center justify-between shadow-md border-b border-[#008f51]/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#008f51] rounded-xl flex items-center justify-center font-black text-lg text-white shadow-sm">
            U
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-lg font-black tracking-wide text-white">
                UCLEAN ORDER DESK CRM
              </h1>
              <span className="bg-[#008f51] text-[#a8f0cf] text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                Live Portal
              </span>
            </div>
            <p className="text-[11px] text-[#a8dec4]">
              Nerul West &bull; Sector 6 Order &amp; Logistics Management
            </p>
          </div>
        </div>

        <button
          onClick={onBackToStore}
          className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-1"
        >
          <span>&larr; Back to Client Website</span>
        </button>
      </header>

      {/* Main CRM Body */}
      <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-5">
        
        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-[#e1e7e1] shadow-sm">
            <span className="text-xs text-[#69766d] font-bold block">Total Active Orders</span>
            <strong className="text-2xl font-black text-[#072618] block mt-1 font-heading">
              {orders.length}
            </strong>
            <small className="text-[#008f51] font-extrabold text-[11px] flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" /> Real-time active
            </small>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#e1e7e1] shadow-sm">
            <span className="text-xs text-[#69766d] font-bold block">Awaiting Call / Confirm</span>
            <strong className="text-2xl font-black text-amber-700 block mt-1 font-heading">
              {orders.filter((o) => o.status === 'New Request').length}
            </strong>
            <small className="text-amber-600 font-bold text-[11px]">Immediate action</small>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#e1e7e1] shadow-sm">
            <span className="text-xs text-[#69766d] font-bold block">In Pickup / Cleaning</span>
            <strong className="text-2xl font-black text-purple-700 block mt-1 font-heading">
              {orders.filter((o) => !['New Request', 'Delivered', 'Cancelled'].includes(o.status)).length}
            </strong>
            <small className="text-purple-600 font-bold text-[11px]">In workflow</small>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#e1e7e1] shadow-sm">
            <span className="text-xs text-[#69766d] font-bold block">Delivered &amp; Paid</span>
            <strong className="text-2xl font-black text-[#008f51] block mt-1 font-heading">
              {orders.filter((o) => o.status === 'Delivered').length}
            </strong>
            <small className="text-[#008f51] font-bold text-[11px]">Completed</small>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#e1e7e1] flex flex-wrap gap-2.5 items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#69766d]" />
              <input
                type="text"
                placeholder="Search by name, phone, order ID, or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 text-xs bg-[#f4f6f4] border border-[#e1e7e1] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008f51]"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-[#69766d]" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 px-2 text-xs bg-[#f4f6f4] border border-[#e1e7e1] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008f51]"
              >
                <option value="All">All Statuses</option>
                <option>New Request</option>
                <option>Call Confirmed</option>
                <option>Pickup Assigned</option>
                <option>Picked Up</option>
                <option>At Store / Inspection</option>
                <option>Quotation Sent</option>
                <option>Cleaning In Progress</option>
                <option>Quality Check</option>
                <option>Ready for Delivery</option>
                <option>Out for Delivery</option>
                <option>Delivered</option>
                <option>Cancelled</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleQuickAddOrder}
              className="h-9 px-3 rounded-xl bg-[#008f51] hover:bg-[#072618] text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Walk-in Order</span>
            </button>

            <button
              onClick={() => window.print()}
              className="h-9 px-3 rounded-xl bg-white border border-[#e1e7e1] hover:bg-[#f4f6f4] text-[#072618] text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Desk View</span>
            </button>
          </div>
        </div>

        {/* 2-Column Split: Orders Table on Left, Selected Order Details on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Table (Left 7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#e1e7e1] p-4 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading text-sm font-black text-[#072618] uppercase tracking-wider">
                Recent Order Requests ({filteredOrders.length})
              </h2>
              <span className="text-[11px] text-[#69766d]">Click to view details</span>
            </div>

            <div className="overflow-x-auto flex-1 max-h-[560px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#e1e7e1] text-[#69766d] uppercase text-[10px] font-black">
                    <th className="py-2.5 px-2">Order ID</th>
                    <th className="py-2.5 px-2">Customer</th>
                    <th className="py-2.5 px-2">Service</th>
                    <th className="py-2.5 px-2">Estimate</th>
                    <th className="py-2.5 px-2">Status</th>
                    <th className="py-2.5 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf0ed]">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[#69766d]">
                        No orders matching the filter.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((ord) => {
                      const isSelected = ord.id === selectedId;
                      return (
                        <tr
                          key={ord.id}
                          onClick={() => setSelectedId(ord.id)}
                          className={`hover:bg-[#f7f9f7] transition-colors cursor-pointer ${
                            isSelected ? 'bg-[#eaf8f1]/60 font-semibold' : ''
                          }`}
                        >
                          <td className="py-3 px-2 whitespace-nowrap">
                            <strong className="text-[#072618] block">{ord.id}</strong>
                            <span className="text-[10px] text-[#69766d] block">{ord.slot}</span>
                          </td>
                          <td className="py-3 px-2">
                            <span className="font-bold text-[#072618] block">{ord.name}</span>
                            <span className="text-[10px] text-[#69766d] block">{ord.phone}</span>
                          </td>
                          <td className="py-3 px-2">
                            <span className="block text-[#072618]">{ord.service}</span>
                            <span className="text-[10px] text-[#69766d] block">{ord.qty}</span>
                          </td>
                          <td className="py-3 px-2 font-mono font-bold text-[#008f51] whitespace-nowrap">
                            {ord.total}
                          </td>
                          <td className="py-3 px-2 whitespace-nowrap">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black border ${getStatusPillClass(
                                ord.status
                              )}`}
                            >
                              {ord.status}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right whitespace-nowrap">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedId(ord.id);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[#FAF6EE] hover:bg-[#072618] hover:text-white border border-[#DECBB0] text-[10.5px] font-bold transition-colors"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Selected Order Panel (Right 5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-[#e1e7e1] p-5 shadow-sm flex flex-col justify-between">
            {selectedOrder ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#e1e7e1] pb-3">
                  <div>
                    <span className="text-[10px] font-black tracking-wider uppercase text-[#69766d]">
                      ORDER INSPECTION
                    </span>
                    <h3 className="font-heading text-lg font-black text-[#072618] flex items-center gap-2">
                      #{selectedOrder.id}
                    </h3>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black border ${getStatusPillClass(
                      selectedOrder.status
                    )}`}
                  >
                    {selectedOrder.status}
                  </span>
                </div>

                {/* Customer Details Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-[#f7f9f7] p-2.5 rounded-xl border border-[#e1e7e1]">
                    <span className="text-[10px] font-bold text-[#69766d] block">Customer</span>
                    <strong className="text-xs text-[#072618] block mt-0.5">{selectedOrder.name}</strong>
                  </div>

                  <div className="bg-[#f7f9f7] p-2.5 rounded-xl border border-[#e1e7e1]">
                    <span className="text-[10px] font-bold text-[#69766d] block">Phone / WhatsApp</span>
                    <strong className="text-xs text-[#072618] block mt-0.5">{selectedOrder.phone}</strong>
                  </div>

                  <div className="bg-[#f7f9f7] p-2.5 rounded-xl border border-[#e1e7e1]">
                    <span className="text-[10px] font-bold text-[#69766d] block">Service &amp; Qty</span>
                    <strong className="text-xs text-[#072618] block mt-0.5">
                      {selectedOrder.service} ({selectedOrder.qty})
                    </strong>
                  </div>

                  <div className="bg-[#f7f9f7] p-2.5 rounded-xl border border-[#e1e7e1]">
                    <span className="text-[10px] font-bold text-[#69766d] block">Estimate Amount</span>
                    <strong className="text-xs text-[#008f51] block mt-0.5">{selectedOrder.total}</strong>
                  </div>

                  <div className="col-span-2 bg-[#f7f9f7] p-2.5 rounded-xl border border-[#e1e7e1]">
                    <span className="text-[10px] font-bold text-[#69766d] block">Pickup Address</span>
                    <strong className="text-xs text-[#072618] block mt-0.5 leading-snug">
                      {selectedOrder.address}
                    </strong>
                  </div>

                  <div className="col-span-2 bg-[#f7f9f7] p-2.5 rounded-xl border border-[#e1e7e1]">
                    <span className="text-[10px] font-bold text-[#69766d] block">Internal Notes / Instructions</span>
                    <p className="text-xs text-[#072618] mt-0.5">{selectedOrder.notes || 'None'}</p>
                  </div>
                </div>

                {/* Status Update Dropdown */}
                <div className="bg-[#FAF6EE] p-3 rounded-xl border border-[#DECBB0]">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-[#632608] mb-1.5 font-heading">
                    Update Order Status
                  </label>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => updateOrderStatus(e.target.value as any)}
                    className="w-full h-10 px-3 text-xs font-bold rounded-xl border border-[#DECBB0] bg-white text-[#072618] focus:outline-none focus:ring-2 focus:ring-[#008f51]"
                  >
                    <option>New Request</option>
                    <option>Call Confirmed</option>
                    <option>Pickup Assigned</option>
                    <option>Picked Up</option>
                    <option>At Store / Inspection</option>
                    <option>Quotation Sent</option>
                    <option>Cleaning In Progress</option>
                    <option>Quality Check</option>
                    <option>Ready for Delivery</option>
                    <option>Out for Delivery</option>
                    <option>Delivered</option>
                    <option>Cancelled</option>
                  </select>
                </div>

                {/* Direct Action Buttons */}
                <div className="flex flex-col gap-2 pt-1">
                  <button
                    onClick={() => updateOrderStatus('Call Confirmed')}
                    className="w-full h-10 rounded-xl bg-[#008f51] hover:bg-[#072618] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Confirm After Phone Call</span>
                  </button>

                  <button
                    onClick={handleSendWhatsAppUpdate}
                    className="w-full h-10 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send WhatsApp Status Update to Customer</span>
                  </button>

                  <button
                    onClick={() => updateOrderStatus('Pickup Assigned')}
                    className="w-full h-10 rounded-xl bg-[#FAF6EE] hover:bg-[#ECE0C6] text-[#632608] font-bold text-xs border border-[#DECBB0] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Assign Pickup Partner</span>
                  </button>
                </div>

                {toastMsg && (
                  <div className="p-2.5 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold text-center animate-in fade-in">
                    {toastMsg}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-[#69766d]">No order selected.</div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
