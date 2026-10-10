'use client';

import React from 'react';
import { Phone, MapPin, Clock } from 'lucide-react';

export function FooterStore() {
  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  const handleWhatsApp = () => {
    const phoneNumber = '917400474132';
    const msg = encodeURIComponent('Hello U CLEAN Nerul! I would like to schedule a laundry & dry cleaning pickup.');
    window.open(`https://wa.me/${phoneNumber}?text=${msg}`, '_blank');
  };

  return (
    <footer className="bg-gradient-to-b from-[#072618] to-[#04170e] text-white p-[32px_16px_36px_16px] flex flex-col items-center text-center border-t-2 border-[#008f51] relative">
      {/* Brand */}
      <div className="mb-5">
        <div className="flex items-center justify-center gap-1.5">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-md">
            <span className="font-heading text-[22px] font-black text-[#008f51] leading-none">U</span>
          </div>
          <span className="font-heading text-2xl font-black text-white tracking-wide">
            CLEAN
          </span>
        </div>
        <div className="flex items-center justify-center gap-1 font-heading text-[9.5px] font-extrabold tracking-[1.6px] text-[#a8dec4] mt-1">
          <span>WE</span>
          <svg className="w-[10px] h-[10px] fill-[#55fca7]" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <span>LAUNDRY</span>
        </div>
        <p className="text-[10.5px] text-[#87b8a1] mt-1">
          Clean Today, Happier Tomorrow &hearts;
        </p>
      </div>

      {/* Contact Card */}
      <div className="bg-white/5 border border-[#DECBB0]/20 rounded-[18px] p-4 w-full max-w-[420px] mb-5 flex flex-col gap-3 backdrop-blur-md text-left">
        <div className="flex items-start gap-3 text-[12.5px] text-[#d1fae5] leading-snug">
          <MapPin className="w-5 h-5 min-w-[20px] text-[#55fca7] mt-0.5 shrink-0" />
          <div>
            <strong className="text-white text-[13px] block mb-0.5">Visit Store / Dropoff:</strong>
            Shop number-1, Plot no.219, Sector 6, Nerul, Navi Mumbai
          </div>
        </div>

        <div className="flex items-start gap-3 text-[12.5px] text-[#d1fae5] leading-snug">
          <Phone className="w-5 h-5 min-w-[20px] text-[#55fca7] mt-0.5 shrink-0" />
          <div>
            <strong className="text-white text-[13px] block mb-0.5">Direct Booking Hotlines:</strong>
            +91 74004 74132 &bull; +91 81088 21353
          </div>
        </div>

        <div className="flex items-start gap-3 text-[12.5px] text-[#d1fae5] leading-snug">
          <Clock className="w-5 h-5 min-w-[20px] text-[#55fca7] mt-0.5 shrink-0" />
          <div>
            <strong className="text-white text-[13px] block mb-0.5">Pickup &amp; Delivery Timings:</strong>
            8:00 AM &ndash; 9:00 PM (All 7 Days)
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2.5 w-full max-w-[420px] mb-5">
        <button
          onClick={() => handleCall('+917400474132')}
          className="flex-1 flex items-center justify-center gap-2 p-3 rounded-full bg-white text-[#072618] font-bold text-[13px] shadow-lg hover:bg-[#f0fdf4] hover:-translate-y-0.5 transition-all"
        >
          <Phone className="w-4 h-4 text-[#008f51]" />
          <span>+91 74004 74132</span>
        </button>

        <button
          onClick={handleWhatsApp}
          className="flex-1 flex items-center justify-center gap-2 p-3 rounded-full bg-[#25D366] text-white font-bold text-[13px] shadow-lg hover:bg-[#20bd5a] hover:-translate-y-0.5 transition-all"
        >
          <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67Z" />
          </svg>
          <span>WhatsApp Us</span>
        </button>
      </div>

      {/* Footer Bottom */}
      <div className="text-[11px] text-[#87b8a1] leading-relaxed max-w-[320px] border-t border-white/10 pt-4 w-full flex flex-col items-center gap-1">
        <span>&copy; 2026 U CLEAN WE ♥ LAUNDRY. All rights reserved.</span>
        <span>Free Pickup &amp; Delivery across Sector 6 &amp; Nerul.</span>
      </div>
    </footer>
  );
}
