'use client';

import React, { useState } from 'react';
import { X, Send, Sparkles, CheckCircle, ShieldCheck, AlertCircle, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { createBooking } from '@/lib/firebase';
import {
  validateIndianMobile,
  validateCustomerName,
  validateAddress,
} from '@/lib/validation';

interface DetailedOrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedService?: string;
  garmentName?: string;
}

export function DetailedOrderFormModal({
  isOpen,
  onClose,
  preselectedService,
  garmentName,
}: DetailedOrderFormModalProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('400706');
  const [building, setBuilding] = useState('');
  const [address, setAddress] = useState('');
  const [quantity, setQuantity] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('Flexible');
  const [contact, setContact] = useState('WhatsApp');
  const [items, setItems] = useState('');
  const [notes, setNotes] = useState('');
  const [consent, setConsent] = useState(true);
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  // Validation errors
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [addressError, setAddressError] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setBookingId(null);
      if (preselectedService) {
        setSelectedServices([preselectedService]);
      } else {
        setSelectedServices(['Wash & Fold — ₹109/kg']);
      }
      if (garmentName) {
        setItems(garmentName);
      }
    }
  }, [isOpen, preselectedService, garmentName]);

  if (!isOpen) return null;

  const toggleService = (srv: string) => {
    setSelectedServices((prev) =>
      prev.includes(srv) ? prev.filter((s) => s !== srv) : [...prev, srv]
    );
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServices.length) {
      alert('Please select at least one service.');
      return;
    }

    // 1. Validate Customer Name
    const nameVal = validateCustomerName(name);
    if (!nameVal.isValid) {
      setNameError(nameVal.error || 'Please enter a valid name.');
      return;
    }
    setNameError('');

    // 2. Validate Indian Mobile Number (Compulsory, 10-digits starting with 6-9)
    const phoneVal = validateIndianMobile(phone);
    if (!phoneVal.isValid) {
      setPhoneError(phoneVal.error || 'Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    setPhoneError('');

    // 3. Validate Pickup Address
    const addressVal = validateAddress(address);
    if (!addressVal.isValid) {
      setAddressError(addressVal.error || 'Please provide your complete pickup address.');
      return;
    }
    setAddressError('');

    setLoading(true);
    try {
      const fullAddress = `${address}${building ? `, ${building}` : ''} (PIN: ${pin})`;
      const res = await createBooking({
        serviceType: 'pickup',
        customerName: nameVal.formatted || name.trim(),
        phone: phoneVal.formatted || phone.trim(),
        address: fullAddress,
        preferredDate: date || 'Earliest available',
        preferredTimeSlot: time,
        notes: `Services: ${selectedServices.join(', ')} | Garments: ${items || 'None'} | Notes: ${notes || 'None'} | Contact Pref: ${contact}`,
        status: 'new',
      });

      if (res.success) {
        setBookingId(res.id);
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#008f51', '#d4af37', '#ffffff', '#ffd700'],
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openWhatsAppDirect = () => {
    const msg = [
      'Hi UClean Nerul West, I would like to place an order request.',
      '',
      `📌 Booking ID: ${bookingId || 'New Request'}`,
      `👤 Name: ${name}`,
      `📞 Mobile: ${phone}`,
      `📮 PIN: ${pin}`,
      `🏢 Building: ${building || 'Not provided'}`,
      `📍 Address: ${address}`,
      `🧺 Services: ${selectedServices.join(', ')}`,
      `⚖️ Approx. quantity: ${quantity || 'Not provided'}`,
      `📅 Pickup date: ${date || 'To be discussed'}`,
      `⏰ Preferred time: ${time}`,
      `💬 Contact preference: ${contact}`,
      `👔 Garment details: ${items || 'Not provided'}`,
      `📝 Instructions: ${notes || 'None'}`,
      '',
      'Please call/contact me to confirm the final quotation and pickup slot.',
    ].join('\n');

    window.open('https://wa.me/917400474132?text=' + encodeURIComponent(msg), '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl overflow-hidden shadow-2xl border-2 border-[#DECBB0] max-h-[94vh] flex flex-col">
        
        {/* Top Header Banner */}
        <div className="bg-[#072618] text-white p-4 px-5 flex items-center justify-between border-b border-[#008f51]/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#008f51] flex items-center justify-center font-black text-white text-base shadow-sm">
              U
            </div>
            <div>
              <div className="text-[10px] font-extrabold tracking-widest text-[#a8dec4] uppercase">
                FREE PICKUP &amp; DELIVERY &bull; UCLEAN NERUL WEST
              </div>
              <h3 className="font-heading text-lg font-black text-white leading-tight">
                {bookingId ? 'Order Request Registered!' : 'Schedule Pickup & Order'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {bookingId ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-[#eaf8f1] rounded-full flex items-center justify-center mx-auto border-2 border-[#008f51] text-[#008f51] animate-bounce">
                <CheckCircle className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-2xl font-black text-[#072618] font-heading">
                  Order Request Received, {name}!
                </h4>
                <p className="text-xs text-[#008f51] font-bold mt-1.5 flex items-center justify-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse"></span>
                  WhatsApp confirmation sent to {phone}!
                </p>
                <div className="mt-3 inline-block bg-[#FAF6EE] border border-[#DECBB0] px-4 py-2 rounded-xl text-xs font-bold text-[#632608]">
                  Order Tracking ID: <span className="text-[#008f51] font-mono font-extrabold">#{bookingId}</span>
                </div>
              </div>

              <div className="p-4 bg-[#FAF6EE] rounded-2xl border border-[#ECE0C6] text-left text-xs text-[#0c2b1e] space-y-1.5">
                <p><strong>Selected Services:</strong> {selectedServices.join(', ')}</p>
                <p><strong>Phone:</strong> {phone}</p>
                <p><strong>Pickup Address:</strong> {address}, {building} (PIN: {pin})</p>
                <p><strong>Slot:</strong> {date || 'Today/Tomorrow'} • {time}</p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={openWhatsAppDirect}
                  className="w-full h-12 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Order to WhatsApp (Recommended)</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full h-10 rounded-full bg-[#FAF6EE] hover:bg-[#ECE0C6] text-[#632608] font-bold text-xs transition-colors"
                >
                  Close &amp; Return to Store
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              {/* Intro Tag */}
              <div className="bg-[#FAF6EE] border border-[#DECBB0] rounded-2xl p-3.5">
                <div className="text-[10.5px] font-extrabold tracking-wider text-[#632608] uppercase">
                  ORDER REQUEST &bull; NERUL SECTOR 6
                </div>
                <h4 className="font-heading font-black text-sm text-[#072618] mt-0.5">
                  Tell us what you need cleaned.
                </h4>
                <p className="text-[11.5px] text-[#4e6b5d] mt-0.5">
                  Choose your services and share pickup details. The team will call to confirm the order, final charges and available pickup time.
                </p>
              </div>

              {/* 1. Services selection */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#072618] mb-2 font-heading">
                  1. Choose Service(s) *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'Wash & Fold — ₹109/kg', name: 'Wash & Fold', sub: '₹109 per kg' },
                    { id: 'Wash & Iron — ₹149/kg', name: 'Wash & Iron', sub: '₹149 per kg' },
                    { id: 'Dry Cleaning — from ₹149', name: 'Dry Cleaning', sub: 'From ₹149 per item' },
                    { id: 'Carpet Cleaning — ₹30/sq. ft.', name: 'Carpet Cleaning', sub: '₹30 per sq. ft.' },
                    { id: 'Lining Curtain — ₹45/sq. ft.', name: 'Lining Curtain', sub: '₹45 per sq. ft.' },
                    { id: 'Shoe Spa & Cleaning', name: 'Shoe Spa & Clean', sub: 'Buy 2 Get 1 Free' },
                  ].map((srv) => {
                    const checked = selectedServices.includes(srv.id);
                    return (
                      <label
                        key={srv.id}
                        onClick={() => toggleService(srv.id)}
                        className={`flex gap-2 items-start p-2.5 rounded-xl border cursor-pointer transition-all ${
                          checked
                            ? 'bg-[#eaf8f1] border-[#008f51] shadow-sm'
                            : 'bg-[#FAF6EE] border-[#DECBB0] hover:bg-[#ECE0C6]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {}}
                          className="mt-1 accent-[#008f51]"
                        />
                        <div>
                          <strong className="block text-xs text-[#072618]">{srv.name}</strong>
                          <span className="text-[10px] text-[#4e6b5d]">{srv.sub}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 2. Customer details */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#072618] mb-2 font-heading">
                  2. Customer &amp; Pickup Details
                </label>
                
                <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-[#0c2b1e] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Imran Khan"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (nameError) setNameError('');
                      }}
                      className={`w-full h-10 px-3 rounded-xl border text-xs focus:bg-white focus:outline-none focus:ring-2 ${
                        nameError
                          ? 'border-rose-500 bg-rose-50/50 focus:ring-rose-400'
                          : 'border-[#DECBB0] bg-[#FAF6EE] focus:ring-[#008f51]'
                      }`}
                    />
                    {nameError && (
                      <p className="text-[10px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{nameError}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0c2b1e] mb-1">
                      Indian Mobile No. (WhatsApp) *
                    </label>
                    <div className="relative flex">
                      <span className="h-10 px-2 rounded-l-xl border-y border-l border-[#DECBB0] bg-[#F1EAD9] text-[#072618] font-bold text-[11px] flex items-center gap-1 select-none">
                        <span>🇮🇳</span>
                        <span>+91</span>
                      </span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="10-digit number"
                        value={phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setPhone(val);
                          if (phoneError) setPhoneError('');
                        }}
                        className={`w-full h-10 px-3 rounded-r-xl border text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 ${
                          phoneError
                            ? 'border-rose-500 bg-rose-50/50 focus:ring-rose-400'
                            : 'border-[#DECBB0] bg-[#FAF6EE] focus:ring-[#008f51]'
                        }`}
                      />
                    </div>
                    {phoneError && (
                      <p className="text-[10px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{phoneError}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-[#0c2b1e] mb-1">PIN Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="6-digit PIN"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-[#DECBB0] bg-[#FAF6EE] text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008f51]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0c2b1e] mb-1">Building / Society</label>
                    <input
                      type="text"
                      placeholder="Society or Apartment name"
                      value={building}
                      onChange={(e) => setBuilding(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-[#DECBB0] bg-[#FAF6EE] text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008f51]"
                    />
                  </div>
                </div>

                <div className="mb-2.5">
                  <label className="block text-[11px] font-bold text-[#0c2b1e] mb-1">Complete Pickup Address *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Flat number, floor, building, landmark, Sector 6 / Nerul..."
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      if (addressError) setAddressError('');
                    }}
                    className={`w-full p-2.5 rounded-xl border text-xs focus:bg-white focus:outline-none focus:ring-2 ${
                      addressError
                        ? 'border-rose-500 bg-rose-50/50 focus:ring-rose-400'
                        : 'border-[#DECBB0] bg-[#FAF6EE] focus:ring-[#008f51]'
                    }`}
                  />
                  {addressError && (
                    <p className="text-[10px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{addressError}</span>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 mb-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-[#0c2b1e] mb-1">Approx. Qty</label>
                    <input
                      type="text"
                      placeholder="e.g. 3 kg / 4 shirts"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full h-10 px-2.5 rounded-xl border border-[#DECBB0] bg-[#FAF6EE] text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008f51]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0c2b1e] mb-1">Pickup Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full h-10 px-2 rounded-xl border border-[#DECBB0] bg-[#FAF6EE] text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008f51]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0c2b1e] mb-1">Preferred Time</label>
                    <select
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full h-10 px-2 rounded-xl border border-[#DECBB0] bg-[#FAF6EE] text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008f51]"
                    >
                      <option>Morning (8-12)</option>
                      <option>Afternoon (12-4)</option>
                      <option>Evening (4-9)</option>
                      <option>Flexible</option>
                    </select>
                  </div>
                </div>

                <div className="mb-2.5">
                  <label className="block text-[11px] font-bold text-[#0c2b1e] mb-1">Garment Types &amp; Quantities (for Dry Cleaning)</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. 1 3-pc suit, 1 bridal lehenga, 2 leather shoes..."
                    value={items}
                    onChange={(e) => setItems(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#DECBB0] bg-[#FAF6EE] text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008f51]"
                  />
                </div>

                <div className="mb-2.5">
                  <label className="block text-[11px] font-bold text-[#0c2b1e] mb-1">Special Instructions (Optional)</label>
                  <textarea
                    rows={1}
                    placeholder="Any stains, fragile fabrics, or delivery note..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#DECBB0] bg-[#FAF6EE] text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008f51]"
                  />
                </div>

                {/* Consent */}
                <label className="flex items-center gap-2 p-2 rounded-xl bg-[#FAF6EE] border border-[#DECBB0] cursor-pointer text-[11px] text-[#0c2b1e]">
                  <input
                    type="checkbox"
                    checked={consent}
                    required
                    onChange={(e) => setConsent(e.target.checked)}
                    className="accent-[#008f51]"
                  />
                  <span>
                    <strong>I agree to be contacted about this order.</strong> Final quotes confirmed by store.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-full bg-gradient-to-r from-[#008f51] to-[#05a862] hover:from-[#05a862] hover:to-[#008f51] text-white font-black text-sm tracking-wide shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-60"
              >
                {loading ? (
                  <span>Recording in Firebase...</span>
                ) : (
                  <span>SUBMIT ORDER REQUEST &rarr;</span>
                )}
              </button>

              <p className="text-[10px] text-center text-[#8c9e94]">
                🛡️ Secure pickup request. Stored in Firebase &amp; instantly confirmed with UClean Nerul staff.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
