'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  Truck,
  User,
  Calendar,
  FileText,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { createBooking } from '@/lib/firebase';

const AVAILABLE_SERVICES = [
  { id: 'Wash & Fold — ₹109/kg', name: 'Wash & Fold', rate: '₹109 / kg', desc: 'Everyday laundry washed & neatly folded' },
  { id: 'Wash & Iron — ₹149/kg', name: 'Wash & Iron', rate: '₹149 / kg', desc: 'Steam pressed on hangers' },
  { id: 'Dry Cleaning — from ₹149', name: 'Dry Cleaning', rate: 'From ₹149', desc: 'Suits, gowns, blazers & delicate fabrics' },
  { id: 'Home Textiles & Sofa Cleaning', name: 'Sofa & Carpet Care', rate: 'From ₹30/sq.ft', desc: 'Deep wet extraction & shampooing' },
  { id: 'Lining Curtain — ₹45/sq. ft.', name: 'Curtains (Parda)', rate: '₹45/sq.ft', desc: 'Anti-shrink steam dry cleaning' },
  { id: 'Shoe Spa & Cleaning', name: 'Shoe Spa & Cleaning', rate: 'Buy 2 Get 1 Free', desc: 'Sneakers, leather boots & sports shoes' },
];

function OrderFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlService = searchParams.get('service');
  const urlGarment = searchParams.get('garment');

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('400706');
  const [building, setBuilding] = useState('');
  const [address, setAddress] = useState('');
  const [quantity, setQuantity] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('Morning (9 AM - 12 PM)');
  const [contact, setContact] = useState<'WhatsApp' | 'Phone Call'>('WhatsApp');
  const [items, setItems] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    if (urlService) {
      setSelectedServices([urlService]);
    } else {
      setSelectedServices(['Wash & Fold — ₹109/kg']);
    }

    if (urlGarment) {
      setItems(urlGarment);
    }
  }, [urlService, urlGarment]);

  const toggleService = (srvId: string) => {
    setSelectedServices((prev) =>
      prev.includes(srvId)
        ? prev.filter((s) => s !== srvId)
        : [...prev, srvId]
    );
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServices.length) {
      alert('Please select at least one service.');
      return;
    }
    if (!name.trim() || !phone.trim() || !address.trim()) {
      alert('Please fill in required fields: Name, Phone Number, and Complete Address.');
      return;
    }

    setLoading(true);
    try {
      const fullAddress = `${address}${building ? `, ${building}` : ''} (PIN: ${pin})`;
      const res = await createBooking({
        serviceType: 'pickup',
        customerName: name.trim(),
        phone: phone.trim(),
        address: fullAddress,
        preferredDate: date || 'Earliest available slot',
        preferredTimeSlot: time,
        notes: `Services: ${selectedServices.join(', ')} | Garments: ${items || 'Not specified'} | Notes: ${notes || 'None'} | Contact Pref: ${contact}`,
        status: 'new',
      });

      if (res.success) {
        setBookingId(res.id);
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#008f51', '#d4af37', '#ffffff', '#ffd700'],
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Booking submission failed:', err);
      alert('Something went wrong while submitting. Please call or WhatsApp us directly.');
    } finally {
      setLoading(false);
    }
  };

  const openWhatsAppDirect = () => {
    const msg = [
      'Hi UClean Nerul West, I have placed an order request.',
      '',
      `📌 Booking ID: ${bookingId || 'New Request'}`,
      `👤 Name: ${name}`,
      `📞 Mobile: ${phone}`,
      `📮 PIN: ${pin}`,
      `🏢 Building / Flat: ${building || 'Not specified'}`,
      `📍 Address: ${address}`,
      `🧺 Services: ${selectedServices.join(', ')}`,
      `⚖️ Approx. Quantity: ${quantity || 'Not specified'}`,
      `📅 Pickup Date: ${date || 'Earliest available'}`,
      `⏰ Preferred Time: ${time}`,
      `💬 Contact Preference: ${contact}`,
      `👔 Garments Note: ${items || 'None'}`,
      `📝 Instructions: ${notes || 'None'}`,
      '',
      'Please confirm my pickup slot and final charges.',
    ].join('\n');

    window.open('https://wa.me/917400474132?text=' + encodeURIComponent(msg), '_blank');
  };

  return (
    <div className="app-container min-h-screen bg-[#FAF6EE] relative flex flex-col pb-16 font-sans">
      
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#DECBB0] px-4 py-3 flex items-center justify-between shadow-xs">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-semibold text-[#111827] hover:text-[#008f51] transition-colors py-1 px-2.5 rounded-full bg-[#FAF6EE] border border-[#DECBB0]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Store</span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#008f51] rounded-lg flex items-center justify-center font-bold text-white text-xs shadow-xs">
            U
          </div>
          <div className="text-right">
            <span className="block text-[11px] font-bold text-[#111827] leading-none">UCLEAN NERUL</span>
            <span className="text-[9.5px] font-medium text-[#008f51]">Doorstep Pickup</span>
          </div>
        </div>

        <a
          href="tel:+917400474132"
          className="flex items-center gap-1 text-[11px] font-bold text-[#008f51] bg-[#eaf8f1] border border-[#a7f3d0] px-2.5 py-1 rounded-full hover:bg-[#008f51] hover:text-white transition-colors"
        >
          <Phone className="w-3 h-3" />
          <span>Call Store</span>
        </a>
      </div>

      <div className="p-4 sm:p-5 max-w-xl mx-auto w-full">
        {bookingId ? (
          /* Confirmation State */
          <div className="bg-white rounded-2xl border border-[#DECBB0] p-6 text-center shadow-sm space-y-5 animate-in fade-in duration-300">
            <div className="w-16 h-16 bg-[#eaf8f1] rounded-full flex items-center justify-center mx-auto border-2 border-[#008f51] text-[#008f51]">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div>
              <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest text-[#008f51] bg-[#eaf8f1] px-3 py-1 rounded-full border border-[#a7f3d0] mb-2">
                Order Registered Successfully
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#111827]">
                Thank you, {name}!
              </h2>
              <p className="text-xs sm:text-sm text-[#4B5563] mt-1 leading-relaxed">
                Your doorstep pickup request has been recorded. Our team will contact you shortly to confirm timing and pickup.
              </p>
            </div>

            <div className="bg-[#FAF6EE] border border-[#DECBB0] p-3.5 rounded-xl text-xs font-semibold text-[#111827] flex items-center justify-between">
              <span className="text-[#6B7280]">Booking Tracking ID:</span>
              <span className="font-mono font-bold text-[#008f51] text-sm">#{bookingId}</span>
            </div>

            <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 text-left text-xs space-y-2 text-[#374151]">
              <div className="flex justify-between border-b border-[#F3F4F6] pb-1.5">
                <span className="text-[#6B7280]">Services:</span>
                <span className="font-semibold text-right max-w-[200px] truncate">{selectedServices.join(', ')}</span>
              </div>
              <div className="flex justify-between border-b border-[#F3F4F6] pb-1.5">
                <span className="text-[#6B7280]">Phone:</span>
                <span className="font-semibold">{phone}</span>
              </div>
              <div className="flex justify-between border-b border-[#F3F4F6] pb-1.5">
                <span className="text-[#6B7280]">Address:</span>
                <span className="font-semibold text-right max-w-[200px] truncate">{address}{building ? `, ${building}` : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Schedule:</span>
                <span className="font-semibold">{date || 'Earliest available'} • {time}</span>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={openWhatsAppDirect}
                className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Send Details via WhatsApp (Fastest Response)</span>
              </button>

              <button
                type="button"
                onClick={() => router.push('/')}
                className="w-full py-2.5 px-4 rounded-xl bg-[#FAF6EE] hover:bg-[#ECE0C6] text-[#111827] font-semibold text-xs border border-[#DECBB0] transition-colors"
              >
                Return to Store Homepage
              </button>
            </div>
          </div>
        ) : (
          /* Form Content */
          <div className="space-y-4">
            
            {/* Header Hero Card */}
            <div className="bg-white rounded-2xl border border-[#DECBB0] p-4 sm:p-5 shadow-xs">
              <span className="inline-block text-[9.5px] font-extrabold tracking-widest uppercase text-[#008f51] bg-[#eaf8f1] px-2.5 py-0.5 rounded-full mb-1.5 border border-[#a7f3d0]">
                FREE DOORSTEP PICKUP &bull; NERUL SECTOR 6
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-[#111827] leading-tight">
                Schedule Your Laundry Pickup
              </h1>
              <p className="text-xs sm:text-[13px] text-[#4B5563] mt-1 leading-relaxed">
                Select your desired services and enter pickup details. Our store team will arrive with clean laundry bags and digital weighing scale.
              </p>

              {/* Trust Features */}
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-[#F3F4F6] text-center text-[10px] text-[#374151] font-medium">
                <div className="flex items-center justify-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-[#008f51] shrink-0" />
                  <span>Free Pickup</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#008f51] shrink-0" />
                  <span>Zero Damage</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#008f51] shrink-0" />
                  <span>24-48h Delivery</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              {/* Section 1: Services Selection */}
              <div className="bg-white rounded-2xl border border-[#DECBB0] p-4 sm:p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-[13px] font-bold text-[#111827]">
                    1. Select Service(s) *
                  </label>
                  <span className="text-[11px] font-medium text-[#008f51]">
                    {selectedServices.length} selected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {AVAILABLE_SERVICES.map((srv) => {
                    const isChecked = selectedServices.includes(srv.id);
                    return (
                      <label
                        key={srv.id}
                        onClick={() => toggleService(srv.id)}
                        className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-[#eaf8f1] border-[#008f51] shadow-xs'
                            : 'bg-[#FAF6EE] border-[#DECBB0] hover:bg-[#f3ebd9]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-0.5 w-4 h-4 rounded text-[#008f51] accent-[#008f51] focus:ring-[#008f51] cursor-pointer"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-[#111827] truncate">
                              {srv.name}
                            </span>
                            <span className="text-[11px] font-extrabold text-[#00874c] shrink-0">
                              {srv.rate}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#4B5563] mt-0.5 leading-snug line-clamp-1">
                            {srv.desc}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>

                {/* If custom preselected service from URL wasn't in standard list */}
                {selectedServices.some((s) => !AVAILABLE_SERVICES.some((a) => a.id === s)) && (
                  <div className="bg-[#eaf8f1] border border-[#a7f3d0] rounded-xl p-2.5 text-xs text-[#072618] flex items-center justify-between">
                    <span>Selected Plan: <strong>{selectedServices.find((s) => !AVAILABLE_SERVICES.some((a) => a.id === s))}</strong></span>
                  </div>
                )}
              </div>

              {/* Section 2: Contact Details */}
              <div className="bg-white rounded-2xl border border-[#DECBB0] p-4 sm:p-5 shadow-xs space-y-3">
                <label className="text-xs sm:text-[13px] font-bold text-[#111827] block">
                  2. Contact Details *
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11.5px] font-medium text-[#4B5563] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-[#DECBB0] bg-white text-xs sm:text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#008f51] focus:ring-1 focus:ring-[#008f51]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11.5px] font-medium text-[#4B5563] mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-[#DECBB0] bg-white text-xs sm:text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#008f51] focus:ring-1 focus:ring-[#008f51]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Pickup Address */}
              <div className="bg-white rounded-2xl border border-[#DECBB0] p-4 sm:p-5 shadow-xs space-y-3">
                <label className="text-xs sm:text-[13px] font-bold text-[#111827] block">
                  3. Pickup Address (Nerul / Navi Mumbai) *
                </label>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11.5px] font-medium text-[#4B5563] mb-1">
                      Flat / House No. &amp; Building / Society Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Flat 402, Sea Breeze Apts, Sector 6"
                      value={building}
                      onChange={(e) => setBuilding(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-[#DECBB0] bg-white text-xs sm:text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#008f51] focus:ring-1 focus:ring-[#008f51]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11.5px] font-medium text-[#4B5563] mb-1">
                        Street Address &amp; Nearest Landmark *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Near D-Mart, Sector 6, Nerul West"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-[#DECBB0] bg-white text-xs sm:text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#008f51] focus:ring-1 focus:ring-[#008f51]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11.5px] font-medium text-[#4B5563] mb-1">
                        PIN Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        placeholder="400706"
                        className="w-full h-10 px-3 rounded-lg border border-[#DECBB0] bg-white text-xs sm:text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#008f51] focus:ring-1 focus:ring-[#008f51]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Schedule & Preferences */}
              <div className="bg-white rounded-2xl border border-[#DECBB0] p-4 sm:p-5 shadow-xs space-y-3">
                <label className="text-xs sm:text-[13px] font-bold text-[#111827] block">
                  4. Schedule &amp; Preferences
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11.5px] font-medium text-[#4B5563] mb-1">
                      Preferred Pickup Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-[#DECBB0] bg-white text-xs sm:text-sm text-[#111827] focus:outline-none focus:border-[#008f51] focus:ring-1 focus:ring-[#008f51]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11.5px] font-medium text-[#4B5563] mb-1">
                      Preferred Time Slot
                    </label>
                    <select
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-[#DECBB0] bg-white text-xs sm:text-sm text-[#111827] focus:outline-none focus:border-[#008f51] focus:ring-1 focus:ring-[#008f51]"
                    >
                      <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                      <option value="Afternoon (12 PM - 4 PM)">Afternoon (12 PM - 4 PM)</option>
                      <option value="Evening (4 PM - 8 PM)">Evening (4 PM - 8 PM)</option>
                      <option value="Flexible / Call Before Arrival">Flexible / Call Before Arrival</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11.5px] font-medium text-[#4B5563] mb-1">
                      Garments / Items Description (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 5 shirts, 2 blazers, 1 curtain set"
                      value={items}
                      onChange={(e) => setItems(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-[#DECBB0] bg-white text-xs sm:text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#008f51] focus:ring-1 focus:ring-[#008f51]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11.5px] font-medium text-[#4B5563] mb-1">
                      Estimated Weight or Count (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ~4-5 kg or ~10 pieces"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-[#DECBB0] bg-white text-xs sm:text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#008f51] focus:ring-1 focus:ring-[#008f51]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11.5px] font-medium text-[#4B5563] mb-1">
                    Special Instructions / Stains Note (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Ring flat doorbell, collar stain on white shirt, delicate fabric handling"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-[#DECBB0] bg-white text-xs sm:text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#008f51] focus:ring-1 focus:ring-[#008f51]"
                  />
                </div>

                <div>
                  <label className="block text-[11.5px] font-medium text-[#4B5563] mb-1">
                    Contact Preference for Confirmation
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs font-semibold text-[#111827] cursor-pointer">
                      <input
                        type="radio"
                        name="contact_pref"
                        checked={contact === 'WhatsApp'}
                        onChange={() => setContact('WhatsApp')}
                        className="accent-[#008f51]"
                      />
                      <span>WhatsApp Message (Recommended)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold text-[#111827] cursor-pointer">
                      <input
                        type="radio"
                        name="contact_pref"
                        checked={contact === 'Phone Call'}
                        onChange={() => setContact('Phone Call')}
                        className="accent-[#008f51]"
                      />
                      <span>Phone Call</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="space-y-2.5 pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#008f51] to-[#05a862] hover:from-[#05a862] hover:to-[#072618] text-white font-bold text-xs sm:text-sm tracking-wide shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#ffe57f]" />
                      <span>CONFIRM &amp; BOOK DOORSTEP PICKUP &rarr;</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={openWhatsAppDirect}
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-[#FAF6EE] text-[#072618] font-semibold text-xs border border-[#DECBB0] shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>Book Directly on WhatsApp</span>
                </button>

                <p className="text-[10px] text-[#6B7280] text-center pt-1">
                  Zero advance payment required &bull; Final charges weighed &amp; billed at doorstep before processing.
                </p>
              </div>

            </form>
          </div>
        )}
      </div>

    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF6EE] flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="w-8 h-8 border-3 border-[#008f51] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-[#111827]">Loading pickup order form...</p>
        </div>
      }
    >
      <OrderFormContent />
    </Suspense>
  );
}
