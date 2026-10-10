'use client';

import React, { useState, useMemo } from 'react';
import { Search, ArrowRight } from 'lucide-react';
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
    { key: 'men-suits', label: "👔 Men's Suits & Ethnic" },
    { key: 'men-winter', label: "🧥 Men's Winter & Jackets" },
    { key: 'men-daily', label: "👕 Men's Daily Wear" },
    { key: 'women-ethnic', label: "👗 Women's Ethnic & Festive" },
    { key: 'women-coats', label: "🧥 Women's Coats" },
    { key: 'footwear', label: '👟 Footwear & Shoe Spa' },
    { key: 'men-accessories', label: '🧣 Shawls & Accessories' },
  ];

  const filteredItems = useMemo(() => {
    const raw = (localSearch || '').toLowerCase().trim();
    if (!raw) {
      return activeCategory === 'all'
        ? RATE_ITEMS
        : RATE_ITEMS.filter((item) => item.categoryKey === activeCategory);
    }

    // Split search into individual words for broad multi-word search
    const searchTokens = raw
      .replace(/[–—/(),+]/g, ' ')
      .split(/\s+/)
      .filter(Boolean);

    return RATE_ITEMS.filter((item) => {
      const matchCat = activeCategory === 'all' || item.categoryKey === activeCategory;
      
      const searchableString = `${item.name} ${item.categoryName} ${item.gender || ''} ${item.id} ₹${item.price}`
        .toLowerCase()
        .replace(/[–—/(),+]/g, ' ');

      // Every typed word should match anywhere in the item data
      const matchSearch = searchTokens.every((token) => searchableString.includes(token));

      return (activeCategory === 'all' ? true : matchCat) && matchSearch;
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
          Tap <strong>&ldquo;Order&rdquo;</strong> on any garment to schedule instant free pickup.
        </p>
      </div>

      {/* Search & Category Filter */}
      <div className="space-y-2 mb-3">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#632608]" />
          <input
            type="text"
            placeholder="Search dry cleaning rates (e.g. Jacket, Sherwani, Saree, Shawl, Shoes)..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 bg-white border-[1.5px] border-[#DECBB0] rounded-xl text-xs text-[#0c2b1e] font-semibold focus:outline-none focus:ring-2 focus:ring-[#008f51] shadow-sm"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar select-none">
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

      {/* Rate Card Table with Exact User Rates */}
      <div className="bg-white rounded-[22px] border-[1.5px] border-[#DECBB0] overflow-hidden shadow-[0_4px_20px_rgba(0,30,15,0.06)] divide-y divide-[#f2e9dc] max-h-[540px] overflow-y-auto">
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
              {/* Left Garment Block with Item-Specific Icons and Colored Badges */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-xl shadow-xs border ${
                    item.colorScheme === 'disc-gold'
                      ? 'bg-[#fffbeb] border-[#fde68a]'
                      : item.colorScheme === 'disc-pink'
                      ? 'bg-[#fdf2f8] border-[#fbcfe8]'
                      : item.colorScheme === 'disc-blue'
                      ? 'bg-[#f0f9ff] border-[#bae6fd]'
                      : item.colorScheme === 'disc-purple'
                      ? 'bg-[#faf5ff] border-[#e9d5ff]'
                      : item.colorScheme === 'disc-amber'
                      ? 'bg-[#fff7ed] border-[#fed7aa]'
                      : 'bg-[#eaf9f1] border-[#a7f3d0]'
                  }`}
                >
                  <span>{item.icon}</span>
                </div>

                <div className="min-w-0 flex-1">
                  <span className="font-heading font-black text-[13px] sm:text-[14px] text-[#072618] block leading-snug group-hover:text-[#008f51] transition-colors truncate">
                    {item.name}
                  </span>
                  <span className="text-[11px] font-semibold text-[#527362] block mt-0.5 truncate">
                    {item.categoryName}
                  </span>
                </div>
              </div>

              {/* Price Tag & Action */}
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

      {/* Prominent Section Order Now Button */}
      <div className="mt-4 text-center">
        <button
          onClick={() => onOrderNow('Dry Cleaning — General Order', 'Dry Cleaning Rate Selection')}
          className="group/btn relative overflow-hidden w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#005e34] via-[#009b56] to-[#014d2b] hover:from-[#004d2c] hover:via-[#008f51] hover:to-[#004225] text-white font-heading font-black text-xs sm:text-[13px] uppercase tracking-wider shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_4px_16px_rgba(0,143,81,0.35)] hover:shadow-[0_6px_20px_rgba(0,143,81,0.45)] border border-[#34d399]/40 flex items-center justify-center gap-2 active:scale-98 transition-all before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-700"
        >
          <span className="truncate relative z-10 font-black">ORDER NOW &bull; SCHEDULE FREE PICKUP &rarr;</span>
        </button>
      </div>

    </section>
  );
}
