'use client';

import React, { useState } from 'react';
import { X, CheckCircle, Calendar, Clock, MapPin, Phone, User, Send } from 'lucide-react';
import confetti from 'canvas-confetti';
import { createBooking } from '@/lib/firebase';

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
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTimeSlot, setPreferredTimeSlot] = useState('Morning (8:00 AM - 12:00 PM)');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  // Update defaults when modal opens with new props
  React.useEffect(() => {
    if (isOpen) {
      setServiceType(defaultService);
      setTier(defaultTier);
      setSubmittedId(null);
    }
  }, [isOpen, defaultService, defaultTier]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim()) {
      alert('Please provide your name and contact phone number.');
      return;
    }

    setLoading(true);
    try {
      const res = await createBooking({
        serviceType,
        tier: serviceType === 'vip-membership' ? tier : undefined,
        customerName,
        phone,
        address,
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
                <p className="text-sm text-[#4e6b5d] mt-1">
                  Your request has been logged successfully into our system.
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
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full h-11 pl-9 pr-3 rounded-xl border border-[#DECBB0] bg-[#FAF6EE] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008f51]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0c2b1e] mb-1">
                    Phone Number (WhatsApp) *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-[#632608]" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full h-11 pl-9 pr-3 rounded-xl border border-[#DECBB0] bg-[#FAF6EE] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008f51]"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-bold text-[#0c2b1e] mb-1">
                  Pickup / Service Address in Nerul
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-[#632608]" />
                  <input
                    type="text"
                    placeholder="Building / Flat no., Sector 6 / Nerul East / West"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full h-11 pl-9 pr-3 rounded-xl border border-[#DECBB0] bg-[#FAF6EE] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008f51]"
                  />
                </div>
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
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
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
                      <option>Morning (8:00 AM - 12:00 PM)</option>
                      <option>Afternoon (12:00 PM - 4:00 PM)</option>
                      <option>Evening (4:00 PM - 9:00 PM)</option>
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
