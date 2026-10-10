'use client';

import React, { useState, useMemo } from 'react';
import { Search, Sparkles, ArrowRight, Plus } from 'lucide-react';
import { RATE_ITEMS } from '@/lib/rateData';

interface RateCardListSectionProps {
  onOrderNow: (service?: string, itemName?: string) => void;
  searchFilter?: string;
}

export function RateCardListSection({ onOrderNow, searchFilter = '' }: RateCardListSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [localSearch, setLocalSearch] = useState<string>(searchFilter);

  React.useEffect(() => {
    if (searchFilter) {
      setLocalSearch(searchFilter);
    }
  }, [searchFilter]);

  const categories = [
    { key: 'all', label: 'All Items' },
    { key: 'men-suits', label: '👔 Suits & Ethnic' },
    { key: 'women-ethnic', label: '👗 Women\'s Ethnic' },
    { key: 'winterwear', label: '🧥 Winterwear' },
    { key: 'dailywear', label: '👕 Daily Wear' },
    { key: 'footwear', label: '👟 Footwear & Shawls' },
  ];

  const filteredItems = useMemo(() => {
    const q = (localSearch || '').toLowerCase().trim();
    return RATE_ITEMS.filter((item) => {
      const matchCat = activeCategory === 'all' || item.categoryKey === activeCategory;
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.categoryName.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [localSearch, activeCategory]);

  return (
    <section className="p-4 py-6 bg-[#FAF6EE] border-b border-[#ECE0C6]" id="rate-list-section">
      
      {/* Section Header */}
      <div className="text-center mb-4">
        <span className="inline-block text-[10px] font-extrabold tracking-widest uppercase text-[#632608] bg-[#ECE0C6] px-3 py-1 rounded-full mb-1 border border-[#DECBB0]">
          Rate Card &bull; Itemized Pricing
        </span>
        <h2 className="font-heading text-[22px] font-black text-[#072618] leading-tight">
          Dry Cleaning &amp; Garment Care
        </h2>
        <p className="text-[12px] text-[#4e6b5d] mt-0.5">
          Tap <strong>&ldquo;+ Book&rdquo;</strong> on any garment to schedule instant free pickup.
        </p>
      </div>

      {/* Search & Category Filter */}
      <div className="space-y-2 mb-3">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#632608]" />
          <input
            type="text"
            placeholder="Search dry cleaning rates..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 bg-white border-[1.5px] border-[#DECBB0] rounded-xl text-xs text-[#0c2b1e] font-semibold focus:outline-none focus:ring-2 focus:ring-[#008f51] shadow-sm"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
                activeCategory === cat.key
                  ? 'bg-[#072618] text-[#55fca7] shadow-sm'
                  : 'bg-white text-[#632608] border border-[#DECBB0] hover:bg-[#ECE0C6]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rate Card Table matching user screenshot layout */}
      <div className="bg-white rounded-[22px] border-[1.5px] border-[#DECBB0] overflow-hidden shadow-[0_4px_20px_rgba(0,30,15,0.06)] divide-y divide-[#f2e9dc] max-h-[520px] overflow-y-auto">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#64748b]">
            No items found matching &quot;{localSearch}&quot;.
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onOrderNow(`Dry Cleaning — ${item.name}`, item.name)}
              className="p-3 px-3.5 flex items-center justify-between gap-3 hover:bg-[#FAF6EE] active:bg-[#f0ece1] transition-colors group cursor-pointer"
            >
              {/* Left Garment Block matching exact user screenshot */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-2xl bg-[#eaf9f1] border border-[#a7f3d0] flex items-center justify-center shrink-0 text-lg shadow-sm">
                  {item.colorScheme === 'disc-gold' ? '👑' : item.colorScheme === 'disc-pink' ? '👗' : item.colorScheme === 'disc-blue' ? '🧥' : '🎁'}
                </div>

                <div className="min-w-0 flex-1">
                  <span className="font-heading font-black text-[14px] sm:text-[15px] text-[#072618] block leading-snug group-hover:text-[#008f51] transition-colors">
                    {item.name}
                  </span>
                  <span className="text-[11px] font-semibold text-[#527362] block mt-0.5">
                    {item.categoryName}
                  </span>
                </div>
              </div>

              {/* Price Pill Tag & Arranged Compact Order Now Action */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="font-heading text-[12.5px] sm:text-[13px] font-black text-[#00874c] bg-[#eaf9f1] border border-[#a7f3d0] px-2.5 py-1 rounded-full whitespace-nowrap shadow-xs">
                  ₹{item.price.toFixed(2)}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOrderNow(`Dry Cleaning — ${item.name}`, item.name);
                  }}
                  className="font-heading text-[11px] font-black text-white bg-[#008f51] hover:bg-[#072618] px-2.5 py-1 rounded-full whitespace-nowrap shadow-xs active:scale-95 transition-all flex items-center gap-0.5"
                >
                  <span>Order</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </button>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Prominent Section Order Now Button with clean responsive alignment */}
      <div className="mt-4 text-center">
        <button
          onClick={() => onOrderNow('Dry Cleaning — General Order', 'Dry Cleaning Rate Selection')}
          className="w-full py-3.5 px-4 rounded-full bg-gradient-to-r from-[#008f51] to-[#05a862] hover:from-[#05a862] hover:to-[#008f51] text-white font-heading font-black text-xs sm:text-[13.5px] tracking-wide shadow-lg flex items-center justify-center gap-2 active:scale-98 transition-all"
        >
          <Sparkles className="w-4 h-4 text-[#ffe57f] shrink-0" />
          <span className="truncate">ORDER NOW &bull; SCHEDULE FREE PICKUP &rarr;</span>
        </button>
      </div>

    </section>
  );
}
