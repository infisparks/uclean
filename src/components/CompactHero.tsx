'use client';

import React, { useState } from 'react';
import { Search, Sparkles, Truck, ShieldCheck, Clock } from 'lucide-react';

interface CompactHeroProps {
  onSearch: (query: string) => void;
  onExplore: () => void;
}

export function CompactHero({ onSearch, onExplore }: CompactHeroProps) {
  const [query, setQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      const el = document.getElementById('rate-list-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className="relative w-full aspect-square bg-cover bg-center bg-no-repeat p-4 flex flex-col justify-between overflow-hidden border-b-2 border-[#008f51] shadow-2xl"
      style={{
        backgroundImage: "url('/images/hero-banner.jpg')",
      }}
      id="hero"
    >
      {/* Rich Emerald & Gold atmospheric overlay with deep vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#072618]/92 via-[#072618]/65 to-[#072618]/95 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(7,38,24,0.7)_100%)] pointer-events-none" />

      {/* TOP: Brand Bar */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-br from-[#008f51] to-[#05a862] rounded-xl flex items-center justify-center shadow-lg border border-[#ffe57f]/50">
            <span className="font-heading text-xl font-black text-white leading-none">U</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading text-xl font-black text-white tracking-wider leading-none drop-shadow-md">
                UCLEAN
              </span>
              <span className="text-[9px] font-black text-[#ffe57f] bg-[#632608]/90 px-2 py-0.5 rounded-full border border-[#d4af37]/60 uppercase shadow-sm">
                NERUL
              </span>
            </div>
            <div className="flex items-center gap-1 font-heading text-[8px] font-extrabold tracking-[1.4px] text-[#a8dec4] mt-0.5 uppercase">
              <span>WE</span>
              <svg className="w-[8px] h-[8px] fill-[#55fca7]" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span>LAUNDRY</span>
            </div>
          </div>
        </div>

        <a
          href="tel:+917400474132"
          className="bg-gradient-to-r from-[#008f51] to-[#05a862] hover:from-[#05a862] hover:to-[#008f51] text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg border border-[#ffe57f]/40 uppercase tracking-tight flex items-center gap-1.5 active:scale-95 transition-all"
        >
          <Truck className="w-3.5 h-3.5 text-[#ffe57f]" />
          <span>Free Pickup</span>
        </a>
      </div>

      {/* Main Center Content */}
      <div className="relative z-10 text-center my-auto px-2">
        <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold tracking-widest text-[#ffe57f] bg-black/50 px-3.5 py-1 rounded-full border border-[#d4af37]/60 mb-2 uppercase backdrop-blur-md shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-[#ffe57f]" />
          <span>Premium Boutique Quality</span>
        </div>

        <h1 className="font-heading text-[30px] sm:text-[34px] font-black leading-[1.12] tracking-tight text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)]">
          Professional Laundry &amp;{' '}
          <span className="text-[#55fca7] relative inline-block">
            Dry Cleaning
            <svg className="absolute left-0 -bottom-1 w-full h-[7px] pointer-events-none" viewBox="0 0 260 20" fill="none">
              <path d="M6 15C75 4 185 4 254 15" stroke="#55fca7" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </span>
        </h1>

        <p className="text-[14px] sm:text-[15px] font-semibold text-[#e1faee] mt-2.5 max-w-[360px] mx-auto drop-shadow-md leading-relaxed">
          Doorstep pickup in Sector 6 &amp; Nerul &bull; 24&ndash;48 Hr express delivery
        </p>
      </div>

      {/* Bottom Search Bar */}
      <div className="relative z-10 space-y-2 pt-1">
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-[400px] mx-auto">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#008f51]" strokeWidth={2.5} />
          <input
            type="text"
            placeholder="Search dry cleaning (e.g. Blazer, Suit, Dress)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              onSearch(e.target.value);
            }}
            className="w-full h-11 pl-10 pr-24 bg-white/95 backdrop-blur-md rounded-full text-xs font-bold text-[#0c2b1e] border-2 border-[#d4af37] shadow-2xl focus:outline-none focus:ring-2 focus:ring-[#008f51]"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 h-8 px-4 rounded-full bg-gradient-to-r from-[#008f51] to-[#05a862] hover:from-[#05a862] hover:to-[#008f51] text-white text-[11px] font-black shadow-md active:scale-95 transition-all flex items-center gap-1"
          >
            <span>Search</span>
          </button>
        </form>
      </div>
    </header>
  );
}
