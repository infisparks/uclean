'use client';

import React from 'react';
import Image from 'next/image';

interface CompactHeroProps {
  onSearch?: (query: string) => void;
  onExplore?: () => void;
}

export function CompactHero({ onSearch, onExplore }: CompactHeroProps) {
  return (
    <header
      className="relative w-full min-h-[430px] sm:min-h-[460px] flex flex-col justify-start overflow-hidden border-b border-[#008f51]/30 shadow-2xl"
      id="hero"
    >
      {/* High-Definition Hero Background (Native Resolution & Crisp Clarity) */}
      <Image
        src="/images/hero-clean-bg.jpg"
        alt="Professional Laundry & Dry Cleaning"
        fill
        priority
        unoptimized
        sizes="(max-width: 480px) 100vw, 480px"
        className="object-cover object-top select-none pointer-events-none"
      />

      {/* 0. Top Static Announcement Strip (Single Row, Dark Green) */}
      <div className="relative z-20 w-full bg-[#072618] text-[#a8f0cf] py-1.5 px-1.5 sm:px-3 border-b border-[#008f51]/30 shadow-xs select-none flex items-center justify-center">
        <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-[9.5px] min-[375px]:text-[10px] min-[420px]:text-[11px] sm:text-[11.5px] font-bold tracking-tight sm:tracking-normal whitespace-nowrap">
          <span className="text-white font-black tracking-wide">🚚 FREE PICKUP &amp; DELIVERY</span>
          <span className="text-[#ffe57f] font-black mx-0.5 sm:mx-1">&middot;</span>
          <span className="text-[#a8f0cf] font-medium">For eligible addresses around Nerul West</span>
        </div>
      </div>

      {/* Subtle top daylight gradient - ONLY covers the top text area (height 180px), leaving clothes 100% crisp and unblurred */}
      <div className="absolute inset-x-0 top-0 h-[180px] bg-gradient-to-b from-white/85 via-white/35 to-transparent pointer-events-none z-10" />

      {/* TOP: Pure Brand Header, Tag, Headline & Description */}
      <div className="relative z-10 flex flex-col items-center text-center px-3 pt-1.5 sm:pt-2 pb-2">
        {/* 1. Logo: Green Squircle + Solid Green CLEAN */}
        <div className="inline-flex items-center gap-1.5 mb-1 sm:mb-1.5">
          <div className="w-6 h-6 sm:w-7 sm:h-7 bg-[#008f51] rounded-lg sm:rounded-xl flex items-center justify-center shadow-md border border-white/60">
            <span className="font-heading text-xs sm:text-sm font-black text-white leading-none">U</span>
          </div>
          <span
            className="font-heading text-lg sm:text-xl font-black tracking-wide leading-none text-[#008f51]"
            style={{
              filter: 'drop-shadow(0 1px 2px rgba(255,255,255,0.9))',
            }}
          >
            CLEAN
          </span>
        </div>

        {/* 2. Tag: YOUR NEIGHBOURHOOD LAUNDRY SERVICE */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-xs border border-[#008f51]/35 shadow-xs mb-1.5 sm:mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#008f51]" />
          <span className="text-[9px] sm:text-[10px] font-black tracking-wider text-[#052818] uppercase">
            YOUR NEIGHBOURHOOD LAUNDRY SERVICE
          </span>
        </div>

        {/* 3. MAIN HEADLINE */}
        <h1 className="font-heading flex flex-col items-center select-none text-center">
          {/* Line 1 */}
          <span
            className="text-[20px] sm:text-[24px] md:text-[27px] font-black tracking-tight leading-[1.12] text-[#042817]"
            style={{
              WebkitTextStroke: '1px #ffffff',
              paintOrder: 'stroke fill',
              textShadow:
                '-1.5px -1.5px 0 #ffffff, 1.5px -1.5px 0 #ffffff, -1.5px 1.5px 0 #ffffff, 1.5px 1.5px 0 #ffffff, 0 2px 4px rgba(0,20,10,0.2)',
            }}
          >
            Laundry &amp; dry cleaning.
          </span>

          {/* Line 2 */}
          <span
            className="relative inline-block text-[22px] sm:text-[26px] md:text-[29px] font-black tracking-tight leading-[1.12] text-[#008f51] mt-0.5"
            style={{
              WebkitTextStroke: '1px #ffffff',
              paintOrder: 'stroke fill',
              textShadow:
                '-1.5px -1.5px 0 #ffffff, 1.5px -1.5px 0 #ffffff, -1.5px 1.5px 0 #ffffff, 1.5px 1.5px 0 #ffffff, 0 2px 4px rgba(0,20,10,0.2)',
            }}
          >
            Right to your door.
          </span>
        </h1>

        {/* 4. Description (compact 2-line layout that sits cleanly above the clothing rack) */}
        <p
          className="mt-1.5 sm:mt-2 max-w-[370px] sm:max-w-[420px] text-[11px] sm:text-[11.5px] font-medium text-[#0c2b1e] leading-snug text-center px-2 select-none"
          style={{
            textShadow: '0 1px 2px rgba(255,255,255,0.95)',
          }}
        >
          Get everyday laundry washed and folded, clothes washed and ironed, or eligible garments dry-cleaned&mdash;without travelling to the store.
        </p>
      </div>
    </header>
  );
}
