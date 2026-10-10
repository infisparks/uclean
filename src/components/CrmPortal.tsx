'use client';

import React, { useState, useEffect } from 'react';

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
}

const INITIAL_ORDERS: CrmOrder[] = [
  {
    id: 'UC-26091',
    name: 'Ayesha Shaikh',
    phone: '98XXXXXX21',
    service: 'Wash & Iron',
    qty: '3 kg (estimate)',
    total: '₹447 est.',
    address: 'Sample address, Sector 6, Nerul West',
    slot: 'Today · Afternoon',
    status: 'New Request',
    notes: 'Call before pickup',
  },
  {
    id: 'UC-26090',
    name: 'Rahul Mehta',
    phone: '98XXXXXX34',
    service: 'Dry Cleaning',
    qty: '2 garments',
    total: 'To confirm',
    address: 'Sample address, Nerul West',
    slot: 'Today · Evening',
    status: 'Call Confirmed',
    notes: 'Confirm garment-wise quote',
  },
  {
    id: 'UC-26089',
    name: 'Sana Khan',
    phone: '88XXXXXX56',
    service: 'Wash & Fold',
    qty: '4 kg (estimate)',
    total: '₹436 est.',
    address: 'Sample address, Sector 6',
    slot: 'Today · Morning',
    status: 'Pickup Assigned',
    notes: 'Partner assigned',
  },
  {
    id: 'UC-26088',
    name: 'Vivek Patil',
    phone: '97XXXXXX77',
    service: 'Carpet Cleaning',
    qty: 'Approx. 35 sq. ft.',
    total: 'To measure',
    address: 'Sample address, Nerul West',
    slot: 'Tomorrow · Morning',
    status: 'Quotation Sent',
    notes: 'Awaiting customer approval',
  },
  {
    id: 'UC-26087',
    name: 'Fatima Ali',
    phone: '91XXXXXX90',
    service: 'Wash & Fold',
    qty: '5 kg',
    total: '₹545 est.',
    address: 'Sample address, Nerul West',
    slot: 'Completed',
    status: 'Delivered',
    notes: 'Feedback pending',
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
  const [orders, setOrders] = useState<CrmOrder[]>(INITIAL_ORDERS);
  const [selectedId, setSelectedId] = useState<string>(INITIAL_ORDERS[0].id);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [activeNav, setActiveNav] = useState('orders');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [statusSelect, setStatusSelect] = useState<string>(INITIAL_ORDERS[0].status);

  // Sync web bookings from localStorage if any exist
  useEffect(() => {
    try {
      const local = JSON.parse(localStorage.getItem('uclean_local_bookings') || '[]');
      if (Array.isArray(local) && local.length > 0) {
        const mapped: CrmOrder[] = local.map((b: any, idx: number) => ({
          id: b.id || `UC-${26092 + idx}`,
          name: b.customerName || 'Online Booking',
          phone: b.phone || '98XXXXXX00',
          service: b.serviceType || 'Laundry Service',
          qty: '3 kg (estimate)',
          total: b.totalEstimate ? `₹${b.totalEstimate} est.` : 'To confirm',
          address: b.address || 'Sample address, Nerul West',
          slot: `${b.preferredDate || 'Today'} · ${b.preferredTimeSlot || 'Afternoon'}`,
          status: 'New Request',
          notes: b.notes || 'Submitted via web booking form',
        }));

        setOrders((prev) => {
          const ids = new Set(prev.map((o) => o.id));
          const additions = mapped.filter((m) => !ids.has(m.id));
          return [...additions, ...prev];
        });
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, []);

  const selectedOrder = orders.find((x) => x.id === selectedId) || orders[0];

  useEffect(() => {
    if (selectedOrder) {
      setStatusSelect(selectedOrder.status);
    }
  }, [selectedOrder?.id]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const getStatusClass = (s: string) => {
    if (s === 'New Request') return 'new';
    if (s === 'Call Confirmed') return 'confirmed';
    if (s.includes('Pickup') || s === 'Picked Up') return 'pickup';
    if (
      s.includes('Cleaning') ||
      s.includes('Inspection') ||
      s === 'Quotation Sent' ||
      s === 'Quality Check'
    )
      return 'clean';
    if (s === 'Delivered') return 'delivered';
    return '';
  };

  const filteredOrders = orders.filter((o) => {
    const matchFilter = filter === 'All' || o.status === filter;
    const matchSearch = [o.id, o.name, o.phone, o.service]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase().trim());
    return matchFilter && matchSearch;
  });

  const handleUpdateStatus = () => {
    setOrders((prev) =>
      prev.map((o) => (o.id === selectedOrder.id ? { ...o, status: statusSelect as any } : o))
    );
    showToast('Demo status updated. No real customer notification was sent.');
  };

  const handleConfirmBtn = () => {
    if (selectedOrder.status === 'New Request') {
      setOrders((prev) =>
        prev.map((o) => (o.id === selectedOrder.id ? { ...o, status: 'Call Confirmed' } : o))
      );
      setStatusSelect('Call Confirmed');
      showToast('Demo only: mark as confirmed after an actual customer call.');
    } else {
      showToast('Check the selected order status before confirming.');
    }
  };

  const handleAssignBtn = () => {
    if (['Call Confirmed', 'New Request'].includes(selectedOrder.status)) {
      setOrders((prev) =>
        prev.map((o) => (o.id === selectedOrder.id ? { ...o, status: 'Pickup Assigned' } : o))
      );
      setStatusSelect('Pickup Assigned');
      showToast('Demo only: assign a real delivery partner and slot in the live system.');
    } else {
      showToast('Pickup assignment is available before collection.');
    }
  };

  const handleNewOrder = () => {
    const n = orders.length + 26087;
    const newOrd: CrmOrder = {
      id: 'UC-' + n,
      name: 'New Demo Customer',
      phone: 'Not provided',
      service: 'Wash & Fold',
      qty: 'To confirm',
      total: 'To confirm',
      address: 'Address pending',
      slot: 'Not scheduled',
      status: 'New Request',
      notes: 'Demo order',
    };
    setOrders([newOrd, ...orders]);
    setSelectedId(newOrd.id);
    showToast('Demo order added. This will disappear when the page is refreshed.');
  };

  return (
    <div className="crm-scope">
      <style>{`
        .crm-scope {
          --g: #174d3b;
          --lime: #d8f36a;
          --bg: #f4f6f4;
          --ink: #17251d;
          --muted: #69766d;
          --line: #e1e7e1;
          --white: #fff;
          --blue: #eaf2ff;
          --orange: #fff1dd;
          --green: #e2f5e8;
          min-height: 100vh;
          background: var(--bg);
          color: var(--ink);
          font: 14px/1.45 Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
        }
        .crm-scope * {
          box-sizing: border-box;
        }
        .crm-scope .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          width: 225px;
          background: #12382b;
          color: white;
          padding: 24px 15px;
          z-index: 30;
        }
        .crm-scope .logo {
          font-size: 22px;
          font-weight: 950;
          margin: 0 0 5px;
        }
        .crm-scope .sub {
          font-size: 10px;
          color: #b9d1c0;
          letter-spacing: 1.5px;
        }
        .crm-scope .demo {
          font-size: 10px;
          background: #ffffff18;
          border-radius: 7px;
          padding: 8px;
          margin: 20px 0;
        }
        .crm-scope .nav {
          display: block;
          color: #d6e4da;
          padding: 12px;
          border-radius: 9px;
          margin: 4px 0;
          text-decoration: none;
          cursor: pointer;
        }
        .crm-scope .nav.active,
        .crm-scope .nav:hover {
          background: #ffffff18;
          color: white;
        }
        .crm-scope .sidefoot {
          position: absolute;
          bottom: 20px;
          font-size: 11px;
          color: #b9d1c0;
          line-height: 1.5;
        }
        .crm-scope .backbtn {
          margin-top: 15px;
          display: block;
          width: 100%;
          padding: 8px 10px;
          border-radius: 7px;
          background: #ffffff18;
          color: #d8f36a;
          border: 1px solid #ffffff25;
          font-size: 11px;
          font-weight: 800;
          text-align: center;
          cursor: pointer;
        }
        .crm-scope .backbtn:hover {
          background: #ffffff30;
        }
        .crm-scope .main {
          margin-left: 225px;
          padding: 25px;
          max-width: 1500px;
        }
        .crm-scope .head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-bottom: 22px;
        }
        .crm-scope .head h1 {
          font-size: 27px;
          margin: 0;
          letter-spacing: -1px;
          font-weight: 800;
        }
        .crm-scope .head p {
          color: var(--muted);
          margin: 4px 0 0;
        }
        .crm-scope .tag {
          background: #fff;
          border: 1px solid var(--line);
          border-radius: 9px;
          padding: 10px 12px;
          font-size: 11px;
          font-weight: 800;
        }
        .crm-scope .stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 13px;
        }
        .crm-scope .stat,
        .crm-scope .panel {
          background: white;
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 18px;
        }
        .crm-scope .stat span {
          color: var(--muted);
          font-size: 12px;
        }
        .crm-scope .stat strong {
          display: block;
          font-size: 27px;
          letter-spacing: -1px;
          margin: 7px 0;
          font-weight: 800;
        }
        .crm-scope .stat small {
          color: var(--g);
          font-size: 11px;
          font-weight: 600;
        }
        .crm-scope .toolbar {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin: 20px 0;
        }
        .crm-scope .toolbar input,
        .crm-scope .toolbar select {
          border: 1px solid var(--line);
          background: white;
          padding: 11px;
          border-radius: 9px;
          min-width: 160px;
          font-size: 13px;
          color: var(--ink);
        }
        .crm-scope .toolbar input {
          flex: 1;
          max-width: 320px;
        }
        .crm-scope .btn {
          border: 0;
          background: var(--g);
          color: white;
          padding: 11px 14px;
          border-radius: 9px;
          font-weight: 800;
          cursor: pointer;
          font-size: 13px;
        }
        .crm-scope .btn:hover {
          opacity: 0.92;
        }
        .crm-scope .btn.light {
          background: white;
          color: var(--g);
          border: 1px solid var(--line);
        }
        .crm-scope .btn.light:hover {
          background: #f4f6f4;
        }
        .crm-scope .layout {
          display: grid;
          grid-template-columns: 1.55fr 1fr;
          gap: 15px;
        }
        .crm-scope .panel h2 {
          font-size: 16px;
          margin: 0 0 15px;
          font-weight: 800;
        }
        .crm-scope .tablewrap {
          overflow: auto;
        }
        .crm-scope table {
          border-collapse: collapse;
          width: 100%;
          min-width: 690px;
        }
        .crm-scope th,
        .crm-scope td {
          text-align: left;
          padding: 12px 10px;
          border-bottom: 1px solid #edf0ed;
          font-size: 12px;
          white-space: nowrap;
        }
        .crm-scope th {
          color: var(--muted);
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: .7px;
          font-weight: 800;
        }
        .crm-scope .customer {
          font-weight: 850;
        }
        .crm-scope .muted {
          color: var(--muted);
          font-size: 11px;
        }
        .crm-scope .pill {
          display: inline-block;
          border-radius: 50px;
          padding: 5px 8px;
          font-size: 10px;
          font-weight: 850;
          background: #eef1ef;
        }
        .crm-scope .pill.new {
          background: var(--blue);
          color: #2758a4;
        }
        .crm-scope .pill.confirmed {
          background: var(--green);
          color: #17653b;
        }
        .crm-scope .pill.pickup {
          background: var(--orange);
          color: #955800;
        }
        .crm-scope .pill.clean {
          background: #eee8ff;
          color: #6844a4;
        }
        .crm-scope .pill.delivered {
          background: #e9efeb;
          color: #45584b;
        }
        .crm-scope .rowbtn {
          padding: 7px 9px;
          border-radius: 7px;
          border: 1px solid var(--line);
          background: #fff;
          font-size: 10px;
          font-weight: 800;
          cursor: pointer;
        }
        .crm-scope .rowbtn:hover {
          background: var(--bg);
        }
        .crm-scope .detail {
          margin-top: 15px;
        }
        .crm-scope .detailgrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .crm-scope .detailbox {
          background: #f7f9f7;
          border-radius: 9px;
          padding: 11px;
        }
        .crm-scope .detailbox small {
          display: block;
          color: var(--muted);
          font-size: 10px;
          font-weight: 600;
        }
        .crm-scope .detailbox strong {
          display: block;
          font-size: 12px;
          margin-top: 3px;
          font-weight: 700;
        }
        .crm-scope .timeline {
          border-left: 2px solid #dce6dd;
          margin: 14px 0 0 7px;
          padding-left: 16px;
        }
        .crm-scope .event {
          position: relative;
          margin: 0 0 15px;
        }
        .crm-scope .event:before {
          content: "";
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--g);
          left: -21px;
          top: 5px;
        }
        .crm-scope .event strong {
          font-size: 12px;
          font-weight: 700;
        }
        .crm-scope .event p {
          font-size: 11px;
          color: var(--muted);
          margin: 2px 0 0;
        }
        .crm-scope .actions {
          display: flex;
          gap: 7px;
          flex-wrap: wrap;
          margin-top: 15px;
        }
        .crm-scope .notice {
          font-size: 11px;
          color: var(--muted);
          margin-top: 16px;
        }
        .crm-scope .toast {
          background: #e2f5e8;
          color: #17653b;
          padding: 10px;
          border-radius: 8px;
          margin-top: 10px;
          font-size: 12px;
          font-weight: 600;
        }
        @media(max-width: 1050px) {
          .crm-scope .sidebar {
            width: 180px;
          }
          .crm-scope .main {
            margin-left: 180px;
            padding: 18px;
          }
          .crm-scope .stats {
            grid-template-columns: repeat(2, 1fr);
          }
          .crm-scope .layout {
            grid-template-columns: 1fr;
          }
        }
        @media(max-width: 650px) {
          .crm-scope .sidebar {
            position: static;
            width: auto;
            padding: 13px 15px;
          }
          .crm-scope .sidebar .nav,
          .crm-scope .sidefoot,
          .crm-scope .demo {
            display: none;
          }
          .crm-scope .logo {
            font-size: 19px;
          }
          .crm-scope .main {
            margin: 0;
            padding: 13px;
          }
          .crm-scope .head {
            align-items: flex-start;
            flex-direction: column;
          }
          .crm-scope .head h1 {
            font-size: 23px;
          }
          .crm-scope .stats {
            gap: 8px;
          }
          .crm-scope .stat {
            padding: 12px;
          }
          .crm-scope .stat strong {
            font-size: 23px;
          }
          .crm-scope .toolbar input,
          .crm-scope .toolbar select {
            flex: 1;
            min-width: 130px;
          }
          .crm-scope .panel {
            padding: 13px;
          }
          .crm-scope .detailgrid {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="logo">UCLEAN</div>
        <div className="sub">NERUL WEST · ORDER DESK</div>
        <div className="demo">DEMO PORTAL · SAMPLE DATA ONLY</div>
        
        <a
          className={`nav ${activeNav === 'orders' ? 'active' : ''}`}
          href="#orders"
          onClick={() => setActiveNav('orders')}
        >
          ▦ &nbsp; Orders
        </a>
        <a
          className={`nav ${activeNav === 'orderdetail' ? 'active' : ''}`}
          href="#orderdetail"
          onClick={() => setActiveNav('orderdetail')}
        >
          ◉ &nbsp; Order details
        </a>
        <a
          className={`nav ${activeNav === 'workflow' ? 'active' : ''}`}
          href="#workflow"
          onClick={() => setActiveNav('workflow')}
        >
          ⇄ &nbsp; Workflow
        </a>
        <a
          className={`nav ${activeNav === 'customers' ? 'active' : ''}`}
          href="#customers"
          onClick={() => setActiveNav('customers')}
        >
          ♙ &nbsp; Customer records
        </a>
        <a
          className={`nav ${activeNav === 'reports' ? 'active' : ''}`}
          href="#reports"
          onClick={() => setActiveNav('reports')}
        >
          ▥ &nbsp; Reports
        </a>

        <button onClick={onBackToStore} className="backbtn">
          ← Back to Store Website
        </button>

        <div className="sidefoot">
          Shop 1, Plot 219<br />
          Sector 6, Nerul West
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="main">
        {/* HEADER */}
        <div className="head">
          <div>
            <h1>Order Management</h1>
            <p>Review requests, confirm orders and track pickup through delivery.</p>
          </div>
          <span className="tag">● DEMO · NOT CONNECTED TO DATABASE</span>
        </div>

        {/* STATS */}
        <div className="stats">
          <div className="stat">
            <span>Today&apos;s order requests</span>
            <strong id="statTotal">{orders.length}</strong>
            <small>Demo count</small>
          </div>
          <div className="stat">
            <span>Awaiting confirmation</span>
            <strong id="statNew">{orders.filter((o) => o.status === 'New Request').length}</strong>
            <small>Call customer</small>
          </div>
          <div className="stat">
            <span>Pickup / cleaning</span>
            <strong>
              {orders.filter((o) => !['New Request', 'Delivered', 'Cancelled'].includes(o.status)).length}
            </strong>
            <small>In progress</small>
          </div>
          <div className="stat">
            <span>Delivered</span>
            <strong>{orders.filter((o) => o.status === 'Delivered').length}</strong>
            <small>Demo count</small>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="toolbar">
          <input
            id="search"
            placeholder="Search order, name or phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All statuses</option>
            {STATUS_LIST.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button className="btn" id="newOrder" onClick={handleNewOrder}>
            + Add demo order
          </button>
          <button className="btn light" onClick={() => window.print()}>
            Print view
          </button>
        </div>

        {/* 2-COLUMN LAYOUT */}
        <div className="layout">
          {/* ORDERS TABLE */}
          <section className="panel" id="orders">
            <h2>Recent order requests</h2>
            <div className="tablewrap">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Est. total</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody id="orderRows">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6}>No matching demo orders.</td>
                    </tr>
                  ) : (
                    filteredOrders.map((o) => (
                      <tr key={o.id}>
                        <td>
                          <b>{o.id}</b>
                          <div className="muted">{o.slot}</div>
                        </td>
                        <td>
                          <span className="customer">{o.name}</span>
                          <div className="muted">{o.phone}</div>
                        </td>
                        <td>
                          {o.service}
                          <div className="muted">{o.qty}</div>
                        </td>
                        <td>{o.total}</td>
                        <td>
                          <span className={`pill ${getStatusClass(o.status)}`}>
                            {o.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="rowbtn"
                            onClick={() => setSelectedId(o.id)}
                          >
                            View / update
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <p className="notice">
              Select an order to inspect the details and update its status. This browser demo uses temporary sample data only.
            </p>
          </section>

          {/* ORDER DETAIL INSPECTOR */}
          <section className="panel" id="orderdetail">
            <h2>
              Selected order <span id="selectedId" className="muted">#{selectedOrder.id}</span>
            </h2>
            <div id="detailContent">
              <span className={`pill ${getStatusClass(selectedOrder.status)}`}>
                {selectedOrder.status}
              </span>
              
              <div className="detailgrid" style={{ marginTop: '13px' }}>
                <div className="detailbox">
                  <small>Customer</small>
                  <strong>{selectedOrder.name}</strong>
                </div>
                <div className="detailbox">
                  <small>Phone</small>
                  <strong>{selectedOrder.phone}</strong>
                </div>
                <div className="detailbox">
                  <small>Service / quantity</small>
                  <strong>{selectedOrder.service} · {selectedOrder.qty}</strong>
                </div>
                <div className="detailbox">
                  <small>Estimate</small>
                  <strong>{selectedOrder.total}</strong>
                </div>
                <div className="detailbox" style={{ gridColumn: '1/-1' }}>
                  <small>Pickup address</small>
                  <strong>{selectedOrder.address}</strong>
                </div>
                <div className="detailbox" style={{ gridColumn: '1/-1' }}>
                  <small>Internal note</small>
                  <strong>{selectedOrder.notes}</strong>
                </div>
              </div>

              <div className="timeline">
                <div className="event">
                  <strong>Order request received</strong>
                  <p>Website order form · sample event</p>
                </div>
                <div className="event">
                  <strong>Current status: {selectedOrder.status}</strong>
                  <p>Next action depends on confirmation and operations stage.</p>
                </div>
              </div>

              <label style={{ display: 'block', marginTop: '15px', fontSize: '11px', fontWeight: 800 }}>
                Update status (demo)
              </label>
              
              <select
                id="statusChange"
                value={statusSelect}
                onChange={(e) => setStatusSelect(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #dfe7e1',
                  borderRadius: '8px',
                  marginTop: '6px',
                }}
              >
                {STATUS_LIST.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <button
                className="rowbtn"
                style={{ marginTop: '8px' }}
                onClick={handleUpdateStatus}
              >
                Save status update
              </button>
            </div>

            <div className="actions">
              <button className="btn" id="confirmBtn" onClick={handleConfirmBtn}>
                Confirm after call
              </button>
              <button className="btn light" id="assignBtn" onClick={handleAssignBtn}>
                Assign pickup
              </button>
            </div>

            {toastMsg && (
              <div className="toast" style={{ display: 'block' }}>
                {toastMsg}
              </div>
            )}
          </section>
        </div>

        {/* WORKFLOW */}
        <section className="panel detail" id="workflow">
          <h2>Order lifecycle &amp; status meanings</h2>
          <div className="detailgrid">
            <div className="detailbox">
              <small>01 · NEW REQUEST</small>
              <strong>Customer submitted order form</strong>
            </div>
            <div className="detailbox">
              <small>02 · CALL CONFIRMED</small>
              <strong>Staff called, checked details and confirmed</strong>
            </div>
            <div className="detailbox">
              <small>03 · PICKUP ASSIGNED</small>
              <strong>Delivery partner and slot assigned</strong>
            </div>
            <div className="detailbox">
              <small>04 · PICKED UP</small>
              <strong>Items collected; count and condition recorded</strong>
            </div>
            <div className="detailbox">
              <small>05 · INSPECTION / QUOTE</small>
              <strong>Actual weight/items and final amount checked</strong>
            </div>
            <div className="detailbox">
              <small>06 · CLEANING</small>
              <strong>Customer approves quote; cleaning starts</strong>
            </div>
            <div className="detailbox">
              <small>07 · QUALITY CHECK</small>
              <strong>Order checked and packed</strong>
            </div>
            <div className="detailbox">
              <small>08 · DELIVERY</small>
              <strong>Partner assigned; delivery and payment tracked</strong>
            </div>
          </div>
          <p className="notice">
            Recommended rule: do not dispatch a pickup until the customer has confirmed by phone or WhatsApp. Do not start chargeable processing until the final quotation is approved.
          </p>
        </section>

        {/* CUSTOMER RECORD */}
        <section className="panel detail" id="customers">
          <h2>Customer record example</h2>
          <div className="detailgrid">
            <div className="detailbox">
              <small>Customer</small>
              <strong id="custName">{selectedOrder.name}</strong>
            </div>
            <div className="detailbox">
              <small>Phone</small>
              <strong id="custPhone">{selectedOrder.phone}</strong>
            </div>
            <div className="detailbox">
              <small>Address</small>
              <strong id="custAddress">{selectedOrder.address}</strong>
            </div>
            <div className="detailbox">
              <small>Customer type</small>
              <strong>First order · demo</strong>
            </div>
          </div>
        </section>

        {/* REPORTS */}
        <section className="panel detail" id="reports">
          <h2>Metrics to track in the real system</h2>
          <div className="detailgrid">
            <div className="detailbox">
              <small>Marketing</small>
              <strong>Ad source → order requests → confirmed orders</strong>
            </div>
            <div className="detailbox">
              <small>Operations</small>
              <strong>Pickup on time, turnaround time, delivery success</strong>
            </div>
            <div className="detailbox">
              <small>Revenue</small>
              <strong>Average order value, service mix, discounts</strong>
            </div>
            <div className="detailbox">
              <small>Retention</small>
              <strong>Repeat orders, membership conversion, complaints</strong>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
