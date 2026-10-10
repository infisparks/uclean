'use client';

import React from 'react';

interface CompactHeroProps {
  onSearch?: (query: string) => void;
  onExplore?: () => void;
}

export function CompactHero({ onSearch, onExplore }: CompactHeroProps) {
  return (
    <header
      className="relative w-full aspect-square bg-cover bg-no-repeat px-3 pt-2 sm:pt-3 pb-3 flex flex-col justify-start overflow-hidden border-b border-[#008f51]/30 shadow-2xl"
      style={{
        backgroundImage: "url('/images/hero-clean-bg.jpg')",
        backgroundPosition: 'center 42%',
      }}
      id="hero"
    >
      {/* Subtle top daylight gradient to ensure text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-transparent pointer-events-none" />

      {/* TOP: Pure Brand Header & Headline */}
      <div className="relative z-10 flex flex-col items-center text-center pt-0">
        {/* 1. Logo matching Reference: Green Squircle + Solid Green CLEAN */}
        <div className="inline-flex items-center gap-1.5">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#008f51] rounded-xl flex items-center justify-center shadow-md border border-white/60">
            <span className="font-heading text-sm sm:text-base font-black text-white leading-none">U</span>
          </div>
          <span
            className="font-heading text-xl sm:text-2xl font-black tracking-wide leading-none text-[#008f51]"
            style={{
              filter: 'drop-shadow(0 1px 2px rgba(255,255,255,0.9))',
            }}
          >
            CLEAN
          </span>
        </div>

        {/* 2. WE ❤ LAUNDRY */}
        <div
          className="flex items-center gap-1 font-heading text-[8.5px] sm:text-[9.5px] font-black tracking-[2px] text-[#052818] mt-0.5 uppercase"
          style={{
            textShadow: '0 1px 1px rgba(255,255,255,0.9)',
          }}
        >
          <span>WE</span>
          <svg className="w-2.5 h-2.5 fill-[#008f51]" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <span>LAUNDRY</span>
        </div>

        {/* 3. CLEANER CLOTHES • BRIGHTER YOU */}
        <div
          className="text-[7.5px] sm:text-[8px] font-black tracking-[1.6px] text-[#052818] mt-0.5 uppercase"
          style={{
            textShadow: '0 1px 1px rgba(255,255,255,0.9)',
          }}
        >
          CLEANER CLOTHES &bull; BRIGHTER YOU
        </div>

        {/* 4. MAIN HEADLINE - 1:1 Matching Reference Screenshot with White Border and Green Arc */}
        <h1 className="font-heading flex flex-col items-center mt-1 sm:mt-1.5 select-none">
          {/* Line 1: Professional Laundry & (Forest Green with Crisp White Outline) */}
          <span
            className="text-[26px] sm:text-[33px] md:text-[37px] font-black tracking-tight leading-[1.05] text-[#042817]"
            style={{
              WebkitTextStroke: '1.2px #ffffff',
              paintOrder: 'stroke fill',
              textShadow:
                '-1.5px -1.5px 0 #ffffff, 1.5px -1.5px 0 #ffffff, -1.5px 1.5px 0 #ffffff, 1.5px 1.5px 0 #ffffff, 0 2px 4px rgba(0,20,10,0.2)',
            }}
          >
            Professional Laundry &amp;
          </span>

          {/* Line 2: Dry Cleaning (Solid Emerald Green with Green Arc Underline) */}
          <span
            className="relative inline-block text-[31px] sm:text-[38px] md:text-[43px] font-black tracking-tight leading-[1.05] text-[#008f51] my-0.5"
            style={{
              WebkitTextStroke: '1.2px #ffffff',
              paintOrder: 'stroke fill',
              textShadow:
                '-1.5px -1.5px 0 #ffffff, 1.5px -1.5px 0 #ffffff, -1.5px 1.5px 0 #ffffff, 1.5px 1.5px 0 #ffffff, 0 2px 4px rgba(0,20,10,0.2)',
            }}
          >
            Dry Cleaning
            {/* Green Arc Swoosh Underline matching screenshot */}
            <svg
              className="absolute left-0 right-0 -bottom-1.5 w-full h-3 text-[#008f51] pointer-events-none"
              viewBox="0 0 200 12"
              fill="none"
              preserveAspectRatio="none"
            >
              <path
                d="M 4,3 Q 100,11 196,3"
                stroke="#008f51"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </svg>
          </span>

          {/* Line 3: Services (Forest Green with Crisp White Outline) */}
          <span
            className="text-[26px] sm:text-[33px] md:text-[37px] font-black tracking-tight leading-[1.05] text-[#042817]"
            style={{
              WebkitTextStroke: '1.2px #ffffff',
              paintOrder: 'stroke fill',
              textShadow:
                '-1.5px -1.5px 0 #ffffff, 1.5px -1.5px 0 #ffffff, -1.5px 1.5px 0 #ffffff, 1.5px 1.5px 0 #ffffff, 0 2px 4px rgba(0,20,10,0.2)',
            }}
          >
            Services
          </span>
        </h1>
      </div>
    </header>
  );
}
