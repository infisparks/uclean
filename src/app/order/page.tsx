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
  Truck,
  Check,
  User,
  Building2,
  Calendar,
  FileText,
  Copy,
  Search,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { createBooking } from '@/lib/firebase';
import {
  validateIndianMobile,
  validateCustomerName,
  validateAddress,
} from '@/lib/validation';
import {
  PRIMARY_SERVICES,
  ALL_SERVICES_CATALOG,
  searchCatalog,
  CatalogService,
  isServiceMatch,
} from '@/lib/servicesCatalog';
import { AllServicesModal } from '@/components/AllServicesModal';

function OrderFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlService = searchParams.get('service');
  const urlGarment = searchParams.get('garment');

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [serviceSearch, setServiceSearch] = useState('');
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
  const [copiedId, setCopiedId] = useState(false);
  const [isServicesModalOpen, setIsServicesModalOpen] = useState(false);

  // Validation error states
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [addressError, setAddressError] = useState('');

  // Primary services by default; if urlService is specified, that service is placed as the 1st card and auto-selected!
  const filteredAvailableServices = React.useMemo(() => {
    const raw = serviceSearch.toLowerCase().trim();
    if (raw) return searchCatalog(raw, 'All');

    // If urlService is present, find it and ensure it's at index 0 (the first card)!
    if (urlService) {
      const matched =
        PRIMARY_SERVICES.find(
          (s) => isServiceMatch(s.id, urlService) || isServiceMatch(s.name, urlService)
        ) ||
        ALL_SERVICES_CATALOG.find(
          (s) => isServiceMatch(s.id, urlService) || isServiceMatch(s.name, urlService)
        );

      if (matched) {
        const others = PRIMARY_SERVICES.filter((s) => !isServiceMatch(s.id, matched.id));
        return [matched, ...others];
      }
    }

    return PRIMARY_SERVICES;
  }, [serviceSearch, urlService]);

  useEffect(() => {
    if (urlService) {
      const matched =
        PRIMARY_SERVICES.find(
          (s) => isServiceMatch(s.id, urlService) || isServiceMatch(s.name, urlService)
        ) ||
        ALL_SERVICES_CATALOG.find(
          (s) => isServiceMatch(s.id, urlService) || isServiceMatch(s.name, urlService)
        );

      if (matched) {
        setSelectedServices([matched.id]);
      } else {
        setSelectedServices([urlService]);
      }
    } else {
      setSelectedServices([PRIMARY_SERVICES[0].id]);
    }

    if (urlGarment) {
      setItems(urlGarment);
    }
  }, [urlService, urlGarment]);

  const toggleService = (srvId: string) => {
    setSelectedServices((prev) => {
      const exists = prev.some((s) => isServiceMatch(s, srvId));
      if (exists) {
        return prev.filter((s) => !isServiceMatch(s, srvId));
      } else {
        return [...prev, srvId];
      }
    });
  };

  const handleCopyId = () => {
    if (bookingId) {
      navigator.clipboard.writeText(bookingId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
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
      setNameError(nameVal.error || 'Please enter a valid customer name.');
      return;
    }
    setNameError('');

    // 2. Validate Indian Mobile Number (10 digits starting with 6,7,8,9)
    const phoneVal = validateIndianMobile(phone);
    if (!phoneVal.isValid) {
      setPhoneError(phoneVal.error || 'Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    setPhoneError('');

    // 3. Validate Address
    const addressVal = validateAddress(address);
    if (!addressVal.isValid) {
      setAddressError(addressVal.error || 'Please enter a complete pickup address.');
      return;
    }
    setAddressError('');

    setLoading(true);
    try {
      const fullAddress = `${addressVal.formatted}${building ? `, ${building}` : ''} (PIN: ${pin})`;
      const res = await createBooking({
        serviceType: 'pickup',
        customerName: nameVal.formatted || name.trim(),
        phone: phoneVal.formatted || phone.trim(),
        address: fullAddress,
        preferredDate: date || 'Earliest available slot',
        preferredTimeSlot: time,
        notes: `Services: ${selectedServices.join(', ')} | Garments: ${items || 'None'} | Approx Qty: ${quantity || 'None'} | Notes: ${notes || 'None'} | Contact: ${contact}`,
        status: 'new',
      });

      if (res.success) {
        setBookingId(res.id);
        confetti({
          particleCount: 110,
          spread: 85,
          origin: { y: 0.5 },
          colors: ['#008f51', '#d4af37', '#ffffff', '#ffd700'],
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Booking submission failed:', err);
      alert('Something went wrong. Please connect with us directly via phone or WhatsApp.');
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
      `🏢 Flat / Building: ${building || 'Not specified'}`,
      `📍 Address: ${address}`,
      `🧺 Services: ${selectedServices.join(', ')}`,
      `⚖️ Approx. Quantity: ${quantity || 'Not specified'}`,
      `📅 Pickup Date: ${date || 'Earliest available'}`,
      `⏰ Preferred Slot: ${time}`,
      `💬 Contact Via: ${contact}`,
      `👔 Garments Note: ${items || 'None'}`,
      `📝 Instructions: ${notes || 'None'}`,
      '',
      'Please confirm my pickup slot and charges.',
    ].join('\n');

    window.open('https://wa.me/917400474132?text=' + encodeURIComponent(msg), '_blank');
  };

  return (
    <div className="app-container min-h-screen bg-[#FAF6EE] relative flex flex-col pb-12 font-light antialiased">
      
      {/* 1. Executive Top Header Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#DECBB0] px-4 py-3 flex items-center justify-between shadow-2xs">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-semibold text-[#111827] hover:text-[#008f51] transition-colors py-1 px-3 rounded-full bg-[#FAF6EE] border border-[#DECBB0] active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Store</span>
        </Link>

        {/* Brand Center */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-[#008f51] to-[#05a862] rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-xs border border-white/20">
            U
          </div>
          <div className="text-left leading-none">
            <div className="flex items-center gap-1">
              <span className="text-xs font-black text-[#111827] tracking-tight">UCLEAN</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#008f51] animate-pulse" />
            </div>
            <span className="text-[9.5px] font-semibold text-[#008f51]">Nerul West Store</span>
          </div>
        </div>

        {/* Store Dial */}
        <a
          href="tel:+917400474132"
          className="flex items-center gap-1.5 text-[11px] font-bold text-[#008f51] bg-[#eaf8f1] border border-[#a7f3d0] px-3 py-1 rounded-full hover:bg-[#008f51] hover:text-white transition-all active:scale-95 shadow-2xs"
        >
          <Phone className="w-3 h-3" />
          <span>+91 74004 74132</span>
        </a>
      </header>

      <div className="p-3 sm:p-4 max-w-xl mx-auto w-full space-y-3">
        {bookingId ? (
          /* Professional Confirmation View */
          <div className="bg-white rounded-[22px] border border-[#DECBB0] p-5 sm:p-6 text-center shadow-xs space-y-4 animate-in fade-in duration-300">
            <div className="w-14 h-14 bg-gradient-to-br from-[#eaf8f1] to-[#d1fae5] rounded-2xl flex items-center justify-center mx-auto border border-[#008f51] text-[#008f51] shadow-xs">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <span className="inline-block text-[9.5px] font-extrabold uppercase tracking-widest text-[#008f51] bg-[#eaf8f1] px-3 py-0.5 rounded-full border border-[#a7f3d0] mb-2">
                Order Registered
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#111827]">
                Thank you, {name}!
              </h2>
              <p className="text-xs sm:text-[13px] text-[#008f51] font-bold mt-1.5 leading-relaxed flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse"></span>
                Automated WhatsApp confirmation sent to {phone}!
              </p>
            </div>

            {/* Tracking ID with Copy Button */}
            <div className="bg-[#FAF6EE] border border-[#DECBB0] p-3 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="text-[10.5px] text-[#6B7280] block font-medium">Tracking ID</span>
                <span className="font-mono font-bold text-[#008f51] text-sm">#{bookingId}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyId}
                className="flex items-center gap-1 text-[11px] font-semibold text-[#0c2b1e] bg-white border border-[#DECBB0] px-2.5 py-1 rounded-lg hover:bg-[#FAF6EE] transition-colors"
              >
                <Copy className="w-3 h-3 text-[#008f51]" />
                <span>{copiedId ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            {/* Receipt Summary Breakdown */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-3.5 text-left text-xs space-y-2 text-[#374151]">
              <div className="flex justify-between border-b border-[#F3F4F6] pb-1.5">
                <span className="text-[#6B7280]">Selected Services</span>
                <span className="font-bold text-[#111827] text-right max-w-[200px] truncate">{selectedServices.join(', ')}</span>
              </div>
              <div className="flex justify-between border-b border-[#F3F4F6] pb-1.5">
                <span className="text-[#6B7280]">Customer Mobile</span>
                <span className="font-semibold text-[#111827]">{phone}</span>
              </div>
              <div className="flex justify-between border-b border-[#F3F4F6] pb-1.5">
                <span className="text-[#6B7280]">Pickup Address</span>
                <span className="font-semibold text-[#111827] text-right max-w-[200px] truncate">{address}{building ? `, ${building}` : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Schedule Window</span>
                <span className="font-semibold text-[#008f51]">{date || 'Earliest available'} • {time}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={openWhatsAppDirect}
                className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs active:scale-98 transition-all"
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
          /* Executive Form Interface */
          <div className="space-y-3">
            
            {/* Header Hero Banner with Reassurance */}
            <div className="bg-white rounded-[22px] border border-[#DECBB0] p-4 sm:p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="inline-block text-[9px] font-extrabold tracking-widest uppercase text-[#008f51] bg-[#eaf8f1] px-2.5 py-0.5 rounded-full border border-[#a7f3d0]">
                  DOORSTEP PICKUP &bull; NERUL SECTOR 6
                </span>
                <span className="text-[9.5px] font-bold text-[#632608] bg-[#FAF6EE] border border-[#DECBB0] px-2.5 py-0.5 rounded-full">
                  ⚡ 0 Advance Fee
                </span>
              </div>
              <h1 className="text-lg sm:text-[21px] font-bold text-[#111827] leading-tight">
                Schedule Doorstep Laundry Pickup
              </h1>
              <p className="text-[11.5px] text-[#4B5563] mt-1 leading-relaxed">
                Choose services and share your address. Our pickup associate will arrive with sanitized bags and a digital weighing scale.
              </p>

              {/* 3 Executive Trust Pill Badges - Highly Highlighted with Color Gradients */}
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-[#F3F4F6] text-center text-[10.5px] font-black">
                <div className="flex items-center justify-center gap-1.5 bg-gradient-to-br from-[#eaf9f1] via-[#d1fae5] to-[#a7f3d0]/60 py-2 px-2 rounded-xl border border-[#008f51]/40 shadow-xs text-[#072618]">
                  <Truck className="w-4 h-4 text-[#008f51] shrink-0 drop-shadow-xs" />
                  <span>Free Pickup</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 bg-gradient-to-br from-[#eff6ff] via-[#dbeafe] to-[#bfdbfe]/60 py-2 px-2 rounded-xl border border-[#3b82f6]/40 shadow-xs text-[#072618]">
                  <ShieldCheck className="w-4 h-4 text-[#2563eb] shrink-0 drop-shadow-xs" />
                  <span>Fabric Safety</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 bg-gradient-to-br from-[#fffbeb] via-[#fef3c7] to-[#fde68a]/60 py-2 px-2 rounded-xl border border-[#f59e0b]/40 shadow-xs text-[#072618]">
                  <Clock className="w-4 h-4 text-[#d97706] shrink-0 drop-shadow-xs" />
                  <span>24-48h Delivery</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3">
              
              {/* Step 1: Services Selection with Glowing Search Bar & Highlight Animation */}
              <div className="bg-white rounded-[22px] border-2 border-[#a7f3d0]/80 p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,143,81,0.08)] space-y-3 relative overflow-hidden">
                {/* Subtle top emerald highlight line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#008f51] via-[#34d399] to-[#008f51] animate-pulse" />

                <div className="flex items-center justify-between pt-0.5">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-6 w-6">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#008f51] opacity-30"></span>
                      <span className="relative inline-flex rounded-full h-6 w-6 bg-gradient-to-br from-[#00b05b] to-[#007a3e] text-white text-[11px] font-black items-center justify-center shadow-md border border-white/60">
                        1
                      </span>
                    </span>
                    <span className="text-[14px] sm:text-[15px] font-heading font-black text-[#072618] tracking-tight">
                      Choose Service(s) <span className="text-red-500 animate-pulse">*</span>
                    </span>
                  </div>
                  
                  <span className="text-[10.5px] font-black text-[#006e3e] bg-gradient-to-r from-[#d1fae5] via-[#a7f3d0] to-[#d1fae5] px-3 py-1 rounded-full border border-[#34d399] shadow-xs animate-in fade-in transition-all">
                    ✓ {selectedServices.length} selected
                  </span>
                </div>

                {/* Glowing Animated Search Bar inside Form Step 1 */}
                <div className="relative group/search">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[#008f51] via-[#34d399] to-[#d4af37] rounded-2xl blur-xs opacity-40 group-hover/search:opacity-75 group-focus-within/search:opacity-100 transition duration-500" />
                  <div className="relative flex items-center bg-white rounded-xl border border-[#34d399]/70 shadow-inner">
                    <Search className="absolute left-3 w-4 h-4 text-[#008f51] shrink-0 animate-pulse" />
                    <input
                      type="text"
                      placeholder="Search service or garment (e.g. Wash, Suit, Saree, Shoes)..."
                      value={serviceSearch}
                      onChange={(e) => setServiceSearch(e.target.value)}
                      className="w-full h-9 sm:h-10 pl-9 pr-8 bg-transparent text-[12px] font-extrabold text-[#072618] placeholder:text-[#64748b] placeholder:font-medium focus:outline-none"
                    />
                    {serviceSearch && (
                      <button
                        type="button"
                        onClick={() => setServiceSearch('')}
                        className="absolute right-2.5 text-xs font-black text-gray-400 hover:text-gray-700 w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Live search feedback if searching */}
                {serviceSearch.trim() && (
                  <div className="flex items-center justify-between text-[11px] text-[#4B5563] px-1">
                    <span>
                      Found <strong className="text-[#008f51]">{filteredAvailableServices.length}</strong> service{filteredAvailableServices.length === 1 ? '' : 's'} for &ldquo;{serviceSearch}&rdquo;
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsServicesModalOpen(true)}
                      className="text-[#008f51] hover:underline font-bold cursor-pointer"
                    >
                      Browse in Popup &rarr;
                    </button>
                  </div>
                )}

                {/* Available Service Cards Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {filteredAvailableServices.length === 0 ? (
                    <div className="col-span-2 text-center py-6 px-3 bg-[#FAF6EE]/70 rounded-xl border border-dashed border-[#DECBB0]">
                      <p className="text-xs font-semibold text-[#111827]">
                        No service matching &ldquo;{serviceSearch}&rdquo;
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsServicesModalOpen(true)}
                        className="mt-2 text-xs font-bold text-[#008f51] underline cursor-pointer"
                      >
                        Browse all 100+ services in popup &rarr;
                      </button>
                    </div>
                  ) : (
                    filteredAvailableServices.slice(0, serviceSearch ? 20 : 6).map((srv) => {
                      const isChecked = selectedServices.some(
                        (s) => isServiceMatch(s, srv.id) || isServiceMatch(s, srv.name)
                      );
                      return (
                        <label
                          key={srv.id}
                          onClick={() => toggleService(srv.id)}
                          className={`relative flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-gradient-to-br from-[#eaf9f1] to-[#d1fae5]/70 border-[#008f51] ring-2 ring-[#008f51] shadow-xs'
                              : 'bg-gradient-to-br from-white to-[#FAF6EE]/60 border-[#DECBB0] hover:border-[#008f51]/60 hover:shadow-2xs'
                          }`}
                        >
                          <div className="min-w-0 pr-1 flex items-center gap-1.5">
                            <span className="text-base shrink-0">{srv.icon}</span>
                            <div className="min-w-0">
                              <span className="block text-[11.5px] sm:text-[12.5px] font-bold text-[#072618] truncate leading-tight">
                                {srv.name}
                              </span>
                              <span className="text-[10px] font-bold text-[#00874c]">
                                {srv.rate}
                              </span>
                            </div>
                          </div>

                          <div
                            className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                              isChecked
                                ? 'bg-gradient-to-br from-[#008f51] to-[#05a862] border-[#008f51] text-white shadow-xs'
                                : 'bg-white border-[#DECBB0]'
                            }`}
                          >
                            {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>

                {/* View More Services Button to open popup modal */}
                <div className="pt-0.5">
                  <button
                    type="button"
                    onClick={() => setIsServicesModalOpen(true)}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#FAF6EE] to-[#ECE0C6] hover:from-[#ECE0C6] hover:to-[#decbb0]/70 border border-[#DECBB0] text-[#072618] font-bold text-xs flex items-center justify-center gap-2 shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
                  >
                    <span className="w-5 h-5 rounded-lg bg-[#008f51]/10 text-[#008f51] flex items-center justify-center text-xs font-bold">
                      ⊞
                    </span>
                    <span>View More Services (100+ Catalog)</span>
                    <span className="text-[#008f51] group-hover:translate-x-1 transition-transform">&rarr;</span>
                  </button>
                </div>

                {/* Active Selected Services Badges / Chips */}
                {selectedServices.length > 0 && (
                  <div className="pt-2 border-t border-[#F3F4F6] space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-[#374151]">
                        Selected ({selectedServices.length}):
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedServices([])}
                        className="text-[10px] text-rose-500 hover:text-rose-700 font-semibold cursor-pointer"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                      {selectedServices.map((srvId) => (
                        <span
                          key={srvId}
                          className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-[#eaf8f1] text-[#006e3e] border border-[#a7f3d0] px-2.5 py-0.5 rounded-full shadow-2xs"
                        >
                          <span className="truncate max-w-[200px]">{srvId}</span>
                          <button
                            type="button"
                            onClick={() => toggleService(srvId)}
                            className="text-[#006e3e]/70 hover:text-rose-600 rounded-full hover:bg-rose-100 p-0.5 transition-colors cursor-pointer"
                            title="Remove"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Contact Details (2 Inputs in 1 Row on Mobile with Icons) */}
              <div className="bg-white rounded-[22px] border border-[#DECBB0] p-4 sm:p-5 shadow-2xs space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#008f51] text-white text-[10px] font-black flex items-center justify-center">
                    2
                  </span>
                  <span className="text-[13px] font-bold text-[#111827]">
                    Contact &amp; Address Details <span className="text-red-500">*</span>
                  </span>
                </div>

                {/* 2 Inputs in 1 Row: Name & Mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#374151] mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (nameError) setNameError('');
                        }}
                        className={`w-full h-10 pl-8 pr-2.5 rounded-xl border text-[12.5px] text-[#111827] placeholder:text-[#9CA3AF] placeholder:text-[11.5px] focus:outline-none focus:ring-2 transition-all ${
                          nameError
                            ? 'border-rose-500 bg-rose-50/50 focus:ring-rose-400'
                            : 'border-[#E5E7EB] bg-[#FAF6EE]/30 focus:bg-white focus:border-[#008f51] focus:ring-[#008f51]/15'
                        }`}
                      />
                    </div>
                    {nameError && (
                      <p className="text-[10px] text-rose-600 font-bold mt-1">
                        {nameError}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#374151] mb-1">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <div className="flex rounded-xl overflow-hidden shadow-2xs">
                      <div className="flex items-center gap-1 bg-[#FAF6EE] border border-r-0 border-[#DECBB0] px-2.5 text-[11px] font-bold text-[#0c2b1e] shrink-0">
                        <span>🇮🇳</span>
                        <span>+91</span>
                      </div>
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
                        className={`w-full h-10 px-3 rounded-r-xl border text-[12.5px] font-semibold text-[#111827] placeholder:text-[#9CA3AF] placeholder:text-[11.5px] focus:outline-none focus:ring-2 transition-all ${
                          phoneError
                            ? 'border-rose-500 bg-rose-50/50 focus:ring-rose-400'
                            : 'border-[#E5E7EB] bg-[#FAF6EE]/30 focus:bg-white focus:border-[#008f51] focus:ring-[#008f51]/15'
                        }`}
                      />
                    </div>
                    {phoneError && (
                      <p className="text-[10px] text-rose-600 font-bold mt-1">
                        {phoneError}
                      </p>
                    )}
                  </div>
                </div>

                {/* Address: Flat & PIN in 1 Row */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#374151] mb-1 truncate">
                      Flat / Building (Optional)
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]" />
                      <input
                        type="text"
                        placeholder="Flat 402, Sea Breeze"
                        value={building}
                        onChange={(e) => setBuilding(e.target.value)}
                        className="w-full h-10 pl-8 pr-2.5 rounded-xl border border-[#E5E7EB] bg-[#FAF6EE]/30 focus:bg-white text-[12.5px] text-[#111827] placeholder:text-[#9CA3AF] placeholder:text-[11.5px] focus:outline-none focus:border-[#008f51] focus:ring-2 focus:ring-[#008f51]/15 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#374151] mb-1">
                      PIN Code <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]" />
                      <input
                        type="text"
                        required
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        placeholder="400706"
                        className="w-full h-10 pl-8 pr-2.5 rounded-xl border border-[#E5E7EB] bg-[#FAF6EE]/30 focus:bg-white text-[12.5px] text-[#111827] placeholder:text-[#9CA3AF] placeholder:text-[11.5px] focus:outline-none focus:border-[#008f51] focus:ring-2 focus:ring-[#008f51]/15 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Street Address & Landmark */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#374151] mb-1">
                    Street Address &amp; Landmark <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-2.5 top-3 w-3.5 h-3.5 text-[#9CA3AF]" />
                    <textarea
                      rows={2}
                      required
                      placeholder="e.g. Sector 6, Near D-Mart, Nerul West"
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        if (addressError) setAddressError('');
                      }}
                      className={`w-full pl-8 pr-2.5 py-2 rounded-xl border text-[12.5px] text-[#111827] placeholder:text-[#9CA3AF] placeholder:text-[11.5px] focus:outline-none focus:ring-2 transition-all ${
                        addressError
                          ? 'border-rose-500 bg-rose-50/50 focus:ring-rose-400'
                          : 'border-[#E5E7EB] bg-[#FAF6EE]/30 focus:bg-white focus:border-[#008f51] focus:ring-[#008f51]/15'
                      }`}
                    />
                  </div>
                  {addressError && (
                    <p className="text-[10px] text-rose-600 font-bold mt-1">
                      {addressError}
                    </p>
                  )}
                </div>
              </div>

              {/* Step 3: Schedule, Garments & Preferences */}
              <div className="bg-white rounded-[22px] border border-[#DECBB0] p-4 sm:p-5 shadow-2xs space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#008f51] text-white text-[10px] font-black flex items-center justify-center">
                    3
                  </span>
                  <span className="text-[13px] font-bold text-[#111827]">
                    Pickup Schedule &amp; Preferences
                  </span>
                </div>

                {/* Date & Time Slot (2 Inputs in 1 Row) */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#374151] mb-1 truncate">
                      Pickup Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]" />
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full h-10 pl-8 pr-2 rounded-xl border border-[#E5E7EB] bg-[#FAF6EE]/30 focus:bg-white text-[12px] text-[#111827] focus:outline-none focus:border-[#008f51] focus:ring-2 focus:ring-[#008f51]/15 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#374151] mb-1 truncate">
                      Preferred Slot
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]" />
                      <select
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full h-10 pl-8 pr-2 rounded-xl border border-[#E5E7EB] bg-[#FAF6EE]/30 focus:bg-white text-[11.5px] text-[#111827] focus:outline-none focus:border-[#008f51] focus:ring-2 focus:ring-[#008f51]/15 transition-all"
                      >
                        <option value="Morning (9 AM - 12 PM)">Morning (9 - 12)</option>
                        <option value="Afternoon (12 PM - 4 PM)">Afternoon (12 - 4)</option>
                        <option value="Evening (4 PM - 8 PM)">Evening (4 - 8)</option>
                        <option value="Flexible / Call Before">Flexible Slot</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Garments Note & Approx Qty (2 Inputs in 1 Row) */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#374151] mb-1 truncate">
                      Garments (Optional)
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]" />
                      <input
                        type="text"
                        placeholder="e.g. 5 shirts, 2 suits"
                        value={items}
                        onChange={(e) => setItems(e.target.value)}
                        className="w-full h-10 pl-8 pr-2.5 rounded-xl border border-[#E5E7EB] bg-[#FAF6EE]/30 focus:bg-white text-[12.5px] text-[#111827] placeholder:text-[#9CA3AF] placeholder:text-[11.5px] focus:outline-none focus:border-[#008f51] focus:ring-2 focus:ring-[#008f51]/15 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#374151] mb-1 truncate">
                      Approx. Qty (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ~4-5 kg or 8 pcs"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-[#E5E7EB] bg-[#FAF6EE]/30 focus:bg-white text-[12.5px] text-[#111827] placeholder:text-[#9CA3AF] placeholder:text-[11.5px] focus:outline-none focus:border-[#008f51] focus:ring-2 focus:ring-[#008f51]/15 transition-all"
                    />
                  </div>
                </div>

                {/* Special Instructions Note */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#374151] mb-1 truncate">
                    Special Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ring flat bell, delicate silk care, collar stain"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E5E7EB] bg-[#FAF6EE]/30 focus:bg-white text-[12.5px] text-[#111827] placeholder:text-[#9CA3AF] placeholder:text-[11.5px] focus:outline-none focus:border-[#008f51] focus:ring-2 focus:ring-[#008f51]/15 transition-all"
                  />
                </div>

                {/* Confirmation Channel Switcher */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#374151] mb-1">
                    Confirmation Preference
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setContact('WhatsApp')}
                      className={`py-2 px-3 rounded-xl border text-[11.5px] font-bold flex items-center justify-center gap-2 transition-all ${
                        contact === 'WhatsApp'
                          ? 'bg-[#eaf8f1] border-[#008f51] text-[#008f51] ring-1 ring-[#008f51] shadow-2xs'
                          : 'bg-[#FAF6EE]/50 border-[#DECBB0] text-[#4B5563] hover:bg-[#FAF6EE]'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-[#25D366]" />
                      <span>WhatsApp Message</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setContact('Phone Call')}
                      className={`py-2 px-3 rounded-xl border text-[11.5px] font-bold flex items-center justify-center gap-2 transition-all ${
                        contact === 'Phone Call'
                          ? 'bg-[#eaf8f1] border-[#008f51] text-[#008f51] ring-1 ring-[#008f51] shadow-2xs'
                          : 'bg-[#FAF6EE]/50 border-[#DECBB0] text-[#4B5563] hover:bg-[#FAF6EE]'
                      }`}
                    >
                      <Phone className="w-3 h-3 text-[#008f51]" />
                      <span>Phone Call</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Security Reassurance Callout */}
              <div className="bg-[#eaf8f1]/60 border border-[#a7f3d0] rounded-xl p-2.5 px-3 flex items-center gap-2 text-[10.5px] text-[#072618]">
                <ShieldCheck className="w-4 h-4 text-[#008f51] shrink-0" />
                <span>Zero advance payment required &bull; Free digital doorstep weighing before order confirmation.</span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="group/btn relative overflow-hidden w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#005e34] via-[#009b56] to-[#014d2b] hover:from-[#004d2c] hover:via-[#008f51] hover:to-[#004225] text-white font-heading font-black text-[12.5px] uppercase tracking-wider shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_4px_16px_rgba(0,143,81,0.35)] hover:shadow-[0_6px_20px_rgba(0,143,81,0.45)] border border-[#34d399]/40 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-700"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin relative z-10" />
                  ) : (
                    <span className="relative z-10 font-black">CONFIRM &amp; BOOK DOORSTEP PICKUP &rarr;</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={openWhatsAppDirect}
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-[#FAF6EE] text-[#072618] font-semibold text-[11.5px] border border-[#DECBB0] shadow-2xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>Book Directly via WhatsApp</span>
                </button>

                <p className="text-[9.5px] text-[#6B7280] text-center pt-0.5">
                  Trusted laundry &amp; dry cleaning service in Nerul, Navi Mumbai
                </p>
              </div>

            </form>
          </div>
        )}
      </div>

      {/* Full Services & Garments Catalog Popup Modal */}
      <AllServicesModal
        isOpen={isServicesModalOpen}
        onClose={() => setIsServicesModalOpen(false)}
        selectedServices={selectedServices}
        onToggleService={toggleService}
        onClearAllServices={() => setSelectedServices([])}
      />

    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF6EE] flex flex-col items-center justify-center p-6 text-center font-light">
          <div className="w-7 h-7 border-3 border-[#008f51] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-semibold text-[#111827]">Loading pickup order form...</p>
        </div>
      }
    >
      <OrderFormContent />
    </Suspense>
  );
}
