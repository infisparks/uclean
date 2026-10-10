'use client';

import React, { useState, useMemo } from 'react';
import { Search, Plus, Check } from 'lucide-react';
import { RATE_ITEMS, RateItem } from '@/lib/rateData';

interface RateCardSectionProps {
  onSelectItem?: (item: RateItem) => void;
  selectedItems?: Record<string, number>;
  onOpenBooking: () => void;
}

export function RateCardSection({ onOpenBooking }: RateCardSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cartItems, setCartItems] = useState<Record<string, number>>({});

  const categories = [
    { key: 'all', label: 'All Items' },
    { key: 'men-suits', label: '👔 Suits & Ethnic' },
    { key: 'women-ethnic', label: '👗 Women\'s Ethnic' },
    { key: 'winterwear', label: '🧥 Jackets & Winter' },
    { key: 'dailywear', label: '👕 Daily Wear' },
    { key: 'footwear', label: '👟 Footwear & Shawls' },
  ];

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return RATE_ITEMS.filter((item) => {
      const matchCat = selectedCategory === 'all' || item.categoryKey === selectedCategory;
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.categoryName.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [searchQuery, selectedCategory]);

  const toggleAddToCart = (item: RateItem) => {
    setCartItems((prev) => {
      const current = prev[item.id] || 0;
      if (current > 0) {
        const copy = { ...prev };
        delete copy[item.id];
        return copy;
      } else {
        return { ...prev, [item.id]: 1 };
      }
    });
  };

  const totalCartCount = Object.values(cartItems).reduce((a, b) => a + b, 0);
  const totalCartValue = Object.entries(cartItems).reduce((sum, [id, qty]) => {
    const it = RATE_ITEMS.find((x) => x.id === id);
    return sum + (it ? it.price * qty : 0);
  }, 0);

  const getDiscIcon = (scheme: string, name: string) => {
    if (scheme === 'disc-gold') {
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z" />
          <path d="M5 19h14" />
        </svg>
      );
    }
    if (scheme === 'disc-pink') {
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l4 6-2 14H10L8 8l4-6z" />
          <path d="M8 8h8" />
          <path d="M7 20h10" />
        </svg>
      );
    }
    if (scheme === 'disc-blue') {
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4l4 2v14l-4-2V4z" />
          <path d="M20 4l-4 2v14l4-2V4z" />
          <path d="M8 6h8v14H8z" />
          <path d="M12 6v14" />
        </svg>
      );
    }
    if (scheme === 'disc-purple') {
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16v4l-3 14H7L4 8V4z" />
          <path d="M12 8v14" />
        </svg>
      );
    }
    if (scheme === 'disc-amber') {
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 17l6-3 4 3 6-4v4H4v-4z" />
          <path d="M14 14l2-8 4 1-1 7" />
          <circle cx="8" cy="14" r="2" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 3h12l2 6-5 2-3-4-3 4-5-2 2-6z" />
        <path d="M12 7v14" />
        <path d="M6 9v12h12V9" />
        <path d="M9 13h6" />
      </svg>
    );
  };

  return (
    <section className="p-[30px_16px] bg-white border-t border-[#edf4f0] relative" id="rates">
      <div className="text-center mb-5">
        <span className="inline-block text-[10.5px] font-extrabold tracking-[1.4px] uppercase text-[#632608] bg-[#ECE0C6] px-3 py-1 rounded-full mb-1.5 border border-[#DECBB0]">
          Transparent Pricing
        </span>
        <h2 className="font-heading text-[25px] font-extrabold text-[#072618] leading-tight">
          Dry Cleaning Rate Card
        </h2>
        <p className="text-[13px] text-[#4e6b5d] mt-1">
          Search or filter prices for all Men&apos;s and Women&apos;s apparel.
        </p>
      </div>

      {/* Controls: Search & Category Tabs */}
      <div className="flex flex-col gap-2.5 mb-4">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-3 w-[18px] h-[18px] text-[#632608]" strokeWidth={2.2} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search garment (e.g. Suit, Blazer, Lehenga, Shoe)..."
            className="w-full h-11 bg-[#FAF6EE] border-[1.5px] border-[#ECE0C6] rounded-xl pl-10 pr-4 text-[13.5px] text-[#0c2b1e] outline-none shadow-sm focus:border-[#632608] focus:bg-white transition-all"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3 py-1.5 rounded-full text-[11.5px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.key
                  ? 'bg-[#632608] text-white border border-[#632608] shadow-sm'
                  : 'bg-[#FAF6EE] text-[#632608] border border-[#ECE0C6] hover:bg-[#ECE0C6]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rates Table Card */}
      <div className="bg-white border-[1.5px] border-[#DECBB0] rounded-[18px] overflow-hidden shadow-[0_6px_20px_rgba(0,30,15,0.06)] max-h-[480px] overflow-y-auto">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-[#4e6b5d] text-sm">
            No dry cleaning items found matching &quot;{searchQuery}&quot;.
          </div>
        ) : (
          filteredItems.map((item) => {
            const isSelected = !!cartItems[item.id];
            return (
              <div
                key={item.id}
                onClick={() => toggleAddToCart(item)}
                className="flex justify-between items-center p-[12px_14px] border-b border-[#f6efe2] hover:bg-[#FAF6EE] transition-all gap-2.5 cursor-pointer last:border-b-0 group"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.04)] ${item.colorScheme}`}>
                    {getDiscIcon(item.colorScheme, item.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[14.5px] text-[#0b2b1d] leading-tight block truncate">
                        {item.name}
                      </span>
                      {item.popular && (
                        <span className="text-[9px] font-black bg-[#fef3c7] text-[#b45309] px-1.5 py-0.5 rounded-full uppercase border border-[#fde68a]">
                          Popular
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-[#527362] block mt-0.5">
                      {item.categoryName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-heading text-[15px] font-extrabold text-[#00874c] bg-[#eaf8f1] border-[1.5px] border-[#a7f3d0] px-3 py-1 rounded-full whitespace-nowrap shadow-[0_2px_6px_rgba(0,143,81,0.08)] shrink-0">
                    ₹{item.price.toFixed(2)}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-[#008f51] text-white'
                        : 'bg-[#FAF6EE] text-[#632608] border border-[#DECBB0] opacity-70 group-hover:opacity-100'
                    }`}
                  >
                    {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Estimate Bar if items selected */}
      {totalCartCount > 0 && (
        <div className="mt-3 p-3 bg-gradient-to-r from-[#072618] to-[#0b3d27] text-white rounded-2xl flex items-center justify-between shadow-xl border border-[#d4af37]/40 animate-in slide-in-from-bottom-2">
          <div>
            <div className="text-xs font-semibold text-[#a8f0cf]">
              {totalCartCount} item{totalCartCount > 1 ? 's' : ''} selected
            </div>
            <div className="text-lg font-black text-[#ffe57f] font-heading">
              Total: ₹{totalCartValue.toFixed(2)}
            </div>
          </div>
          <button
            onClick={onOpenBooking}
            className="px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#ffd700] text-[#072618] rounded-full font-black text-xs uppercase tracking-wide shadow-md hover:scale-105 active:scale-95 transition-all"
          >
            Book Items Pickup
          </button>
        </div>
      )}
    </section>
  );
}
