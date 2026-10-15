'use client';

import React, { useState } from 'react';
import { X, CheckCircle, Calendar, Clock, MapPin, Phone, User, Send } from 'lucide-react';
import confetti from 'canvas-confetti';
import { createBooking } from '@/lib/firebase';
import {
  validateIndianMobile,
  validateCustomerName,
  validateAddress,
} from '@/lib/validation';
import {
  getMinSelectableDateString,
  getActiveSlotsList,
  getDefaultSlotForDate,
} from '@/lib/slotAvailability';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultService?: 'pickup' | 'home-visit' | 'vip-membership' | 'general-inquiry';
  defaultTier?: 'Silver (₹5,000)' | 'Gold (₹7,000)' | 'Platinum (₹10,000)';
  prefilledItems?: { name: string; quantity: number; price: number }[];
  totalEstimate?: number;
}

export function BookingModal({
  isOpen,
  onClose,
  defaultService = 'pickup',
  defaultTier,
  prefilledItems = [],
  totalEstimate = 0,
}: BookingModalProps) {
  const [serviceType, setServiceType] = useState<'pickup' | 'home-visit' | 'vip-membership' | 'general-inquiry'>(
    defaultService
  );
  const [tier, setTier] = useState<typeof defaultTier>(defaultTier);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const initialMinDate = getMinSelectableDateString();
  const [preferredDate, setPreferredDate] = useState(initialMinDate);
  const [preferredTimeSlot, setPreferredTimeSlot] = useState(getDefaultSlotForDate(initialMinDate));
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  // Validation error states
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [addressError, setAddressError] = useState('');

  // Update defaults when modal opens with new props
  React.useEffect(() => {
    if (isOpen) {
      const minD = getMinSelectableDateString();
      setServiceType(defaultService);
      setTier(defaultTier);
      setSubmittedId(null);
      setNameError('');
      setPhoneError('');
      setAddressError('');
      setPreferredDate(minD);
      setPreferredTimeSlot(getDefaultSlotForDate(minD));
    }
  }, [isOpen, defaultService, defaultTier]);

  const handleDateChange = (newDate: string) => {
    setPreferredDate(newDate);
    const validSlots = getActiveSlotsList(newDate);
    if (!validSlots.some((s) => s.value === preferredTimeSlot)) {
      setPreferredTimeSlot(validSlots[0]?.value || '');
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validate Customer Name
    const nameVal = validateCustomerName(customerName);
    if (!nameVal.isValid) {
      setNameError(nameVal.error || 'Please enter a valid customer name.');
      return;
    }
    setNameError('');

    // 2. Validate Indian Mobile
    const phoneVal = validateIndianMobile(phone);
    if (!phoneVal.isValid) {
      setPhoneError(phoneVal.error || 'Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    setPhoneError('');

    // 3. Validate Address (required for pickup & home-visit)
    if (serviceType === 'pickup' || serviceType === 'home-visit') {
      const addressVal = validateAddress(address);
      if (!addressVal.isValid) {
        setAddressError(addressVal.error || 'Please provide your complete address.');
        return;
      }
      setAddressError('');
    }

    setLoading(true);
    try {
      const res = await createBooking({
        serviceType,
        tier: serviceType === 'vip-membership' ? tier : undefined,
        customerName: nameVal.formatted || customerName.trim(),
        phone: phoneVal.formatted || phone.trim(),
        address: address.trim(),
        preferredDate,
        preferredTimeSlot,
        notes,
        items: prefilledItems.length > 0 ? prefilledItems : undefined,
        totalEstimate: totalEstimate > 0 ? totalEstimate : undefined,
        status: 'new',
      });

      if (res.success) {
        setSubmittedId(res.id);
        confetti({
          particleCount: 80,
          spread: 70,
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

  const openWhatsAppConfirmation = () => {
    const phoneNumber = '917400474132';
    const message = encodeURIComponent(
      `Hello U CLEAN Nerul! 🧼\n\nI have submitted a booking request via your App:\n` +
      `📌 Booking ID: ${submittedId || 'New Inquiry'}\n` +
      `👤 Name: ${customerName}\n` +
      `📞 Phone: ${phone}\n` +
      `🧺 Service: ${serviceType.toUpperCase()}${tier ? ` - ${tier}` : ''}\n` +
      (address ? `📍 Address: ${address}\n` : '') +
      (preferredDate ? `📅 Date: ${preferredDate} (${preferredTimeSlot})\n` : '') +
      (totalEstimate > 0 ? `💰 Estimate: ₹${totalEstimate}\n` : '') +
      (notes ? `📝 Note: ${notes}\n` : '') +
      `\nPlease confirm my slot!`
    );
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border-2 border-[#DECBB0] max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#072618] via-[#0b3d27] to-[#072618] text-white p-5 flex items-center justify-between border-b border-[#008f51]/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#008f51] flex items-center justify-center font-bold text-white shadow-md">
              U
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-wide font-heading">
                {submittedId ? 'Booking Confirmed!' : 'Book Service & Pickup'}
              </h3>
              <p className="text-xs text-[#a8dec4]">
                {submittedId ? 'Stored in Firebase & Local Cache' : 'U CLEAN Nerul • Sector 6 Doorstep Service'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1">
          {submittedId ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-[#eaf8f1] rounded-full flex items-center justify-center mx-auto border-2 border-[#008f51] text-[#008f51] animate-bounce">
                <CheckCircle className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-2xl font-black text-[#072618] font-heading">Thank You, {customerName}!</h4>
                <p className="text-xs text-[#008f51] font-bold mt-1.5 flex items-center justify-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse"></span>
                  Automated WhatsApp confirmation sent to {phone}!
                </p>
                <div className="mt-3 inline-block bg-[#FAF6EE] border border-[#DECBB0] px-4 py-2 rounded-xl text-xs font-bold text-[#632608]">
                  Booking Reference: <span className="text-[#008f51] font-mono font-extrabold">{submittedId}</span>
                </div>
              </div>

              <div className="p-4 bg-[#FAF6EE] rounded-2xl border border-[#ECE0C6] text-left text-xs text-[#0c2b1e] space-y-1.5">
                <p><strong>Service:</strong> {serviceType.replace('-', ' ').toUpperCase()} {tier && `(${tier})`}</p>
                <p><strong>Phone:</strong> {phone}</p>
                {address && <p><strong>Address:</strong> {address}</p>}
                {preferredDate && <p><strong>Time Slot:</strong> {preferredDate} • {preferredTimeSlot}</p>}
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={openWhatsAppConfirmation}
                  className="w-full h-12 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Confirmation via WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full h-11 rounded-full bg-[#FAF6EE] hover:bg-[#ECE0C6] text-[#632608] font-bold text-sm transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Service Type Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#632608] mb-1.5">
                  Select Booking Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'pickup', label: '🧺 Laundry Pickup' },
                    { id: 'home-visit', label: '🛋️ Sofa / Curtain Visit' },
                    { id: 'vip-membership', label: '👑 VIP Card Claim' },
                    { id: 'general-inquiry', label: '💬 General Inquiry' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setServiceType(s.id as any)}
                      className={`p-2.5 rounded-xl text-xs font-bold text-left border transition-all ${
                        serviceType === s.id
                          ? 'bg-[#072618] text-[#55fca7] border-[#072618] shadow-sm'
                          : 'bg-[#FAF6EE] text-[#0c2b1e] border-[#DECBB0] hover:bg-[#ECE0C6]'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* VIP Tier Selector if VIP membership selected */}
              {serviceType === 'vip-membership' && (
                <div className="p-3 bg-[#FAF6EE] rounded-2xl border border-[#DECBB0]">
                  <label className="block text-xs font-bold text-[#632608] mb-1.5">
                    Choose VIP Tier
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'Silver (₹5,000)', label: '🥈 Silver\n₹5,000' },
                      { id: 'Gold (₹7,000)', label: '🥇 Gold ⭐\n₹7,000' },
                      { id: 'Platinum (₹10,000)', label: '👑 Platinum\n₹10,000' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTier(t.id as any)}
                        className={`p-2 rounded-xl text-xs font-bold text-center border whitespace-pre-line ${
                          tier === t.id
                            ? 'bg-[#632608] text-[#fde68a] border-[#632608] shadow-md'
                            : 'bg-white text-[#0c2b1e] border-[#DECBB0]'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0c2b1e] mb-1">
                    Your Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-[#632608]" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={customerName}
                      onChange={(e) => {
                        setCustomerName(e.target.value);
                        if (nameError) setNameError('');
                      }}
                      className={`w-full h-11 pl-9 pr-3 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                        nameError
                          ? 'border-rose-500 bg-rose-50/50 focus:ring-rose-400'
                          : 'border-[#DECBB0] bg-[#FAF6EE] focus:bg-white focus:ring-[#008f51]'
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
                  <label className="block text-xs font-bold text-[#0c2b1e] mb-1">
                    Phone Number (WhatsApp) *
                  </label>
                  <div className="flex rounded-xl overflow-hidden shadow-2xs">
                    <div className="flex items-center gap-1 bg-[#FAF6EE] border border-r-0 border-[#DECBB0] px-3 text-xs font-bold text-[#0c2b1e] shrink-0">
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
                      className={`w-full h-11 px-3 rounded-r-xl border text-sm font-semibold focus:outline-none focus:ring-2 ${
                        phoneError
                          ? 'border-rose-500 bg-rose-50/50 focus:ring-rose-400'
                          : 'border-[#DECBB0] bg-[#FAF6EE] focus:bg-white focus:ring-[#008f51]'
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

              {/* Address */}
              <div>
                <label className="block text-xs font-bold text-[#0c2b1e] mb-1">
                  Pickup / Service Address in Nerul {serviceType === 'pickup' || serviceType === 'home-visit' ? '*' : ''}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-[#632608]" />
                  <input
                    type="text"
                    placeholder="Building / Flat no., Sector 6 / Nerul East / West"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      if (addressError) setAddressError('');
                    }}
                    className={`w-full h-11 pl-9 pr-3 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                      addressError
                        ? 'border-rose-500 bg-rose-50/50 focus:ring-rose-400'
                        : 'border-[#DECBB0] bg-[#FAF6EE] focus:bg-white focus:ring-[#008f51]'
                    }`}
                  />
                </div>
                {addressError && (
                  <p className="text-[10px] text-rose-600 font-bold mt-1">
                    {addressError}
                  </p>
                )}
              </div>

              {/* Date & Time Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0c2b1e] mb-1">
                    Preferred Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 w-4 h-4 text-[#632608]" />
                    <input
                      type="date"
                      min={getMinSelectableDateString()}
                      value={preferredDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className="w-full h-11 pl-9 pr-3 rounded-xl border border-[#DECBB0] bg-[#FAF6EE] text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008f51]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0c2b1e] mb-1">
                    Time Slot
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 w-4 h-4 text-[#632608]" />
                    <select
                      value={preferredTimeSlot}
                      onChange={(e) => setPreferredTimeSlot(e.target.value)}
                      className="w-full h-11 pl-9 pr-3 rounded-xl border border-[#DECBB0] bg-[#FAF6EE] text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008f51]"
                    >
                      {getActiveSlotsList(preferredDate).map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block text-xs font-bold text-[#0c2b1e] mb-1">
                  Special Notes or Garment Types (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. 2 silk sarees + 1 tuxedo for urgent dry clean..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#DECBB0] bg-[#FAF6EE] text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008f51]"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-full bg-gradient-to-r from-[#008f51] to-[#05a862] hover:from-[#05a862] hover:to-[#008f51] text-white font-extrabold text-sm tracking-wide shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-60"
              >
                {loading ? (
                  <span>Recording in Firebase...</span>
                ) : (
                  <span>Confirm Booking &amp; Free Pickup</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
