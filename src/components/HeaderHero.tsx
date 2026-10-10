'use client';

import React from 'react';
import { ArrowRight, Users } from 'lucide-react';

interface HeaderHeroProps {
  onOpenBooking: (service?: 'pickup' | 'home-visit' | 'vip-membership') => void;
}

export function HeaderHero({ onOpenBooking }: HeaderHeroProps) {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="relative w-full h-[100dvh] min-h-[680px] max-h-[890px] bg-cover bg-[center_bottom] bg-no-repeat flex flex-col p-[14px_14px_18px_14px] overflow-hidden"
      style={{
        backgroundImage: "url('https://res.cloudinary.com/zzbuyz8r/image/upload/f_auto,q_auto/bg')",
      }}
      id="hero"
    >
      <div className="relative z-10 flex flex-col h-full justify-between">
        
        {/* TOP: Branding & Titles */}
        <div className="flex flex-col items-center gap-1 w-full">
          
          {/* Official Logo Structure */}
          <div className="flex flex-col items-center justify-center text-center mt-0.5">
            <div className="flex items-center gap-1.5">
              <div className="w-7 h-7 bg-[#008f51] rounded-lg flex items-center justify-center shadow-[0_3px_10px_rgba(0,143,81,0.25)]">
                <span className="font-heading text-lg font-black text-white leading-none">U</span>
              </div>
              <div className="font-heading text-2xl font-black tracking-wide text-[#008f51] leading-none">
                CLEAN
              </div>
            </div>

            <div className="flex items-center justify-center gap-1 font-heading text-[9.5px] font-extrabold tracking-[1.6px] text-[#0c3322] mt-0.5">
              <span>WE</span>
              <svg className="w-[9px] h-[9px] fill-[#008f51]" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span>LAUNDRY</span>
            </div>

            <div className="text-[8px] font-extrabold tracking-[1.4px] text-[#3b5f4e] uppercase mt-0.5">
              CLEANER CLOTHES &bull; BRIGHTER YOU
            </div>
          </div>

          {/* Main Hero Headline */}
          <div className="text-center mt-2 w-full px-1">
            <h1 className="font-heading text-[clamp(29px,8.8vw,44px)] font-black leading-[1.05] tracking-[-0.7px] text-[#072618] flex flex-col items-center text-center w-full mx-auto drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">
              <span className="block whitespace-nowrap">Professional Laundry &amp;</span>
              <span className="text-[#008f51] relative inline-block whitespace-nowrap">
                Dry Cleaning
                <svg className="absolute left-0 -bottom-[3px] w-full h-[9px] pointer-events-none" viewBox="0 0 260 20" fill="none">
                  <path d="M6 15C75 4 185 4 254 15" stroke="#008f51" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
              <span className="block whitespace-nowrap">Services</span>
            </h1>

            <p className="text-[13px] font-semibold leading-[1.35] text-[#1e4533] max-w-[330px] mx-auto mt-1.5 text-center">
              From everyday wear to your most precious outfits &mdash; we clean, care and deliver with trust.
            </p>
          </div>
        </div>

        {/* Clearance in center to reveal high res clothing rack */}
        <div className="flex-1 min-h-[140px] pointer-events-none" />

        {/* BOTTOM HERO ACTIONS */}
        <div className="flex flex-col items-center gap-2 w-full z-10 mb-0.5">
          
          {/* Radiant Glowing Gold CTA */}
          <button
            onClick={() => scrollToSection('services')}
            className="btn-explore-wrap"
          >
            <div className="btn-explore-inner">
              <span>Explore Services</span>
              <ArrowRight className="w-[18px] h-[18px] arrow-icon-anim" strokeWidth={2.6} />
            </div>
          </button>

          {/* Luxury Referral Pill */}
          <button
            onClick={() => {
              scrollToSection('membership');
            }}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 bg-white/95 border-[1.5px] border-[#DECBB0] rounded-full backdrop-blur-md text-[11.5px] font-extrabold text-[#632608] shadow-[0_4px_14px_rgba(0,0,0,0.08),0_0_12px_rgba(255,215,0,0.25)] hover:-translate-y-0.5 hover:border-[#d4af37] transition-all"
          >
            <Users className="w-3.5 h-3.5 text-[#632608]" />
            <span>Refer a Friend &bull; Get 40% OFF</span>
          </button>
        </div>

      </div>
    </header>
  );
}
