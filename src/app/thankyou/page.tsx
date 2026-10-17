'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle,
  Phone,
  Send,
  Copy,
  Calendar,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BookingInfo {
  bookingId?: string;
  id?: string;
  orderId?: string;
  name?: string;
  customerName?: string;
  phone?: string;
  address?: string;
  building?: string;
  pin?: string;
  selectedServices?: string[];
  services?: string[];
  service?: string;
  serviceType?: string;
  date?: string;
  preferredDate?: string;
  time?: string;
  preferredTimeSlot?: string;
  items?: string;
  notes?: string;
  quantity?: string;
}

export default function ThankYouPage() {
  const router = useRouter();
  const [booking, setBooking] = useState<BookingInfo | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 1. Try to read last booking details from session or local storage
    try {
      let data: BookingInfo | null = null;

      const sessionRaw = sessionStorage.getItem('uclean_last_booking');
      if (sessionRaw) {
        data = JSON.parse(sessionRaw);
      }

      if (!data) {
        const localRaw = localStorage.getItem('uclean_last_booking');
        if (localRaw) {
          data = JSON.parse(localRaw);
        }
      }

      if (!data) {
        const listRaw = localStorage.getItem('uclean_local_bookings');
        if (listRaw) {
          const list = JSON.parse(listRaw);
          if (Array.isArray(list) && list.length > 0) {
            data = list[0];
          }
        }
      }

      if (data) {
        setBooking(data);
      }
    } catch (err) {
      console.warn('Could not read stored booking data:', err);
    } finally {
      setIsLoaded(true);
    }

    // 2. Trigger celebratory confetti
    try {
      confetti({
        particleCount: 110,
        spread: 85,
        origin: { y: 0.5 },
        colors: ['#008f51', '#d4af37', '#ffffff', '#ffd700'],
      });
    } catch {
      // ignore
    }
  }, []);

  const bookingId = booking?.bookingId || booking?.id || booking?.orderId || 'UC-NERUL';
  const customerName = booking?.name || booking?.customerName || 'Valued Customer';
  const customerPhone = booking?.phone || '';
  const customerAddress =
    booking?.address ||
    (booking?.building ? `${booking.building}, Nerul West` : 'Nerul West, Navi Mumbai');
  const servicesDisplay =
    (booking?.selectedServices && booking.selectedServices.length > 0)
      ? booking.selectedServices.join(', ')
      : (booking?.services && booking.services.length > 0)
      ? booking.services.join(', ')
      : booking?.service || booking?.serviceType || 'Laundry & Dry Cleaning';
  const scheduleDisplay =
    (booking?.date || booking?.preferredDate || 'Earliest available') +
    ' • ' +
    (booking?.time || booking?.preferredTimeSlot || 'Standard Slot');

  const handleCopyId = () => {
    if (!bookingId) return;
    navigator.clipboard.writeText(bookingId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const openWhatsAppConfirmation = () => {
    const msg = [
      'Hi UClean Nerul West, I have placed an order request.',
      '',
      `📌 Booking ID: ${bookingId}`,
      `👤 Name: ${customerName}`,
      customerPhone ? `📞 Mobile: ${customerPhone}` : '',
      `📍 Address: ${customerAddress}`,
      `🧺 Services: ${servicesDisplay}`,
      `📅 Schedule: ${scheduleDisplay}`,
      booking?.items ? `👔 Garments: ${booking.items}` : '',
      booking?.notes ? `📝 Instructions: ${booking.notes}` : '',
      '',
      'Please confirm my pickup slot and charges.',
    ]
      .filter(Boolean)
      .join('\n');

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

      {/* 2. Main Confirmation Content */}
      <div className="p-3 sm:p-4 max-w-xl mx-auto w-full space-y-3 pt-6">
        <div className="bg-white rounded-[22px] border border-[#DECBB0] p-5 sm:p-6 text-center shadow-xs space-y-4 animate-in fade-in duration-300">
          <div className="w-14 h-14 bg-gradient-to-br from-[#eaf8f1] to-[#d1fae5] rounded-2xl flex items-center justify-center mx-auto border border-[#008f51] text-[#008f51] shadow-xs">
            <CheckCircle className="w-8 h-8" />
          </div>

          <div>
            <span className="inline-block text-[9.5px] font-extrabold uppercase tracking-widest text-[#008f51] bg-[#eaf8f1] px-3 py-0.5 rounded-full border border-[#a7f3d0] mb-2">
              Order Registered
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-[#111827]">
              Thank you, {customerName}!
            </h1>
            {customerPhone ? (
              <p className="text-xs sm:text-[13px] text-[#008f51] font-bold mt-1.5 leading-relaxed flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse"></span>
                Automated WhatsApp confirmation sent to {customerPhone}!
              </p>
            ) : (
              <p className="text-xs sm:text-[13px] text-[#008f51] font-bold mt-1.5 leading-relaxed">
                Your pickup request has been received and logged successfully!
              </p>
            )}
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
              <span className="font-bold text-[#111827] text-right max-w-[220px] truncate">
                {servicesDisplay}
              </span>
            </div>
            {customerPhone && (
              <div className="flex justify-between border-b border-[#F3F4F6] pb-1.5">
                <span className="text-[#6B7280]">Customer Mobile</span>
                <span className="font-semibold text-[#111827]">{customerPhone}</span>
              </div>
            )}
            <div className="flex justify-between border-b border-[#F3F4F6] pb-1.5">
              <span className="text-[#6B7280]">Pickup Address</span>
              <span className="font-semibold text-[#111827] text-right max-w-[220px] truncate">
                {customerAddress}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Schedule Window</span>
              <span className="font-semibold text-[#008f51]">{scheduleDisplay}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={openWhatsAppConfirmation}
              className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs active:scale-98 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Send Details via WhatsApp (Fastest Response)</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="py-2.5 px-3 rounded-xl bg-[#FAF6EE] hover:bg-[#ECE0C6] text-[#111827] font-semibold text-xs border border-[#DECBB0] transition-colors"
              >
                Return to Store
              </button>
              <Link
                href="/order"
                className="py-2.5 px-3 rounded-xl bg-white hover:bg-[#FAF6EE] text-[#008f51] font-semibold text-xs border border-[#DECBB0] transition-colors text-center flex items-center justify-center gap-1"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Book Another</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Helpful Info Notice */}
        <div className="p-3.5 bg-white/70 rounded-2xl border border-[#DECBB0]/70 text-center text-xs text-[#6B7280] space-y-1">
          <p className="font-medium text-[#111827]">What happens next?</p>
          <p className="text-[11px] leading-relaxed">
            Our Nerul West associate will arrive with a sanitized bag and weigh your laundry at your doorstep. No payment is required until delivery.
          </p>
        </div>
      </div>
    </div>
  );
}
