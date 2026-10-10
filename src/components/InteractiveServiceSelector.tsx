'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Check, Sparkles, ArrowRight } from 'lucide-react';

export interface GarmentCard {
  id: string;
  name: string;
  price: number;
  category: 'laundry' | 'dryclean' | 'premium';
  image: string;
  badge?: string;
  unit?: string;
}

export const GARMENTS: GarmentCard[] = [
  // 1. Laundry
  {
    id: 'blazer',
    name: 'Blazer / Coat',
    price: 149,
    category: 'laundry',
    badge: 'Popular',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'shirt',
    name: 'Formal Shirt',
    price: 99,
    category: 'laundry',
    badge: 'Steam Pressed',
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'dress',
    name: 'Evening Dress',
    price: 199,
    category: 'laundry',
    badge: 'Gentle Care',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'jeans',
    name: 'Denim Jeans',
    price: 129,
    category: 'laundry',
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'tshirt-combo',
    name: 'T-Shirt / Polo',
    price: 89,
    category: 'laundry',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'trousers',
    name: 'Formal Trousers',
    price: 119,
    category: 'laundry',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&auto=format&fit=crop&q=80',
  },

  // 2. Dry Clean
  {
    id: 'suit-2pc',
    name: 'Suit (2 Pc)',
    price: 359,
    category: 'dryclean',
    badge: 'Best Seller',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'wedding-suit',
    name: 'Wedding Suit (3 Pc)',
    price: 899,
    category: 'dryclean',
    badge: 'Luxury',
    image: 'https://images.unsplash.com/photo-1593032465175-481ac7f401a0?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'lehenga-bridal',
    name: 'Bridal Lehenga',
    price: 999,
    category: 'dryclean',
    badge: 'Zari Care',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'sherwani-designer',
    name: 'Designer Sherwani',
    price: 399,
    category: 'dryclean',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'jacket-leather',
    name: 'Leather Jacket',
    price: 799,
    category: 'dryclean',
    badge: 'Conditioned',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'saree-silk',
    name: 'Silk Saree & Blouse',
    price: 299,
    category: 'dryclean',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=500&auto=format&fit=crop&q=80',
  },

  // 3. Premium Care
  {
    id: 'shoes-spa',
    name: 'Shoe Spa & Clean',
    price: 349,
    category: 'premium',
    badge: 'Buy 2 Get 1',
    image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'pashmina-shawl',
    name: 'Pashmina Shawl',
    price: 699,
    category: 'premium',
    badge: 'Delicate',
    image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'carpet-clean',
    name: 'Carpet (sq. ft.)',
    price: 30,
    unit: '/sq.ft',
    category: 'premium',
    image: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'curtain-lining',
    name: 'Lining Curtain (sq. ft.)',
    price: 45,
    unit: '/sq.ft',
    category: 'premium',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&auto=format&fit=crop&q=80',
  },
];

interface InteractiveServiceSelectorProps {
  selectedGarments: Record<string, number>;
  onToggleGarment: (garment: GarmentCard) => void;
  onOrderNow: () => void;
  searchFilter?: string;
}

export function InteractiveServiceSelector({
  selectedGarments,
  onToggleGarment,
  onOrderNow,
  searchFilter = '',
}: InteractiveServiceSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<'laundry' | 'dryclean' | 'premium'>('laundry');

  const filteredGarments = GARMENTS.filter((g) => {
    const matchCat = g.category === activeCategory;
    const matchSearch = !searchFilter || g.name.toLowerCase().includes(searchFilter.toLowerCase().trim());
    return matchSearch && (searchFilter ? true : matchCat);
  });

  const selectedCount = Object.values(selectedGarments).reduce((a, b) => a + b, 0);
  const selectedTotal = Object.entries(selectedGarments).reduce((sum, [id, qty]) => {
    const item = GARMENTS.find((x) => x.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  return (
    <section className="p-4 bg-white border-t border-b border-[#ECE0C6]" id="product-selector">
      
      {/* Header matching Image 2 */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="font-heading text-[21px] font-black text-[#0c2b1e]">
            Select Service
          </h2>
          <p className="text-[11.5px] text-[#4e6b5d]">
            Choose garments for instant doorstep pickup in Nerul.
          </p>
        </div>
        <span className="text-[11px] font-extrabold text-[#008f51] bg-[#eaf8f1] px-3 py-1 rounded-full border border-[#a7f3d0] shadow-sm whitespace-nowrap">
          ⚡ Instant Pickup
        </span>
      </div>

      {/* Category Pills matching Image 2 */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveCategory('laundry')}
          className={`px-4 py-2 rounded-full text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap transition-all shadow-sm ${
            activeCategory === 'laundry'
              ? 'bg-[#008f51] text-white shadow-[#008f51]/25 ring-2 ring-[#008f51]/30'
              : 'bg-white text-[#0c2b1e] border border-[#d7e0d7] hover:bg-[#FAF6EE]'
          }`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10a2 2 0 002 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z" />
          </svg>
          <span>👕 Laundry</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('dryclean')}
          className={`px-4 py-2 rounded-full text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap transition-all shadow-sm ${
            activeCategory === 'dryclean'
              ? 'bg-[#008f51] text-white shadow-[#008f51]/25 ring-2 ring-[#008f51]/30'
              : 'bg-white text-[#0c2b1e] border border-[#d7e0d7] hover:bg-[#FAF6EE]'
          }`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M6 3h12l2 6-5 2-3-4-3 4-5-2 2-6z" />
            <path d="M12 7v14" />
          </svg>
          <span>🧥 Dry Clean</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('premium')}
          className={`px-4 py-2 rounded-full text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap transition-all shadow-sm ${
            activeCategory === 'premium'
              ? 'bg-[#008f51] text-white shadow-[#008f51]/25 ring-2 ring-[#008f51]/30'
              : 'bg-white text-[#0c2b1e] border border-[#d7e0d7] hover:bg-[#FAF6EE]'
          }`}
        >
          <span>Premium Care</span>
        </button>
      </div>

      {/* 2-CARDS IN ONE LINE (Grid cols 2) with high definition photos */}
      <div className="grid grid-cols-2 gap-3 mt-3">
        {filteredGarments.map((g) => {
          const isSelected = !!selectedGarments[g.id];
          return (
            <div
              key={g.id}
              onClick={() => onToggleGarment(g)}
              className={`relative bg-white rounded-2xl p-2.5 flex flex-col justify-between cursor-pointer transition-all border-2 shadow-sm group ${
                isSelected
                  ? 'border-[#008f51] shadow-[0_6px_20px_rgba(0,143,81,0.22)] bg-[#f0faf4] -translate-y-0.5'
                  : 'border-[#e0e7df] hover:border-[#b4d4bf] hover:shadow-md'
              }`}
            >
              {/* Badge Top Left */}
              {g.badge && (
                <div className="absolute top-2 left-2 z-10 bg-[#072618]/90 text-[#ffe57f] text-[9px] font-black px-2 py-0.5 rounded-md backdrop-blur-sm shadow-sm border border-white/10 uppercase">
                  {g.badge}
                </div>
              )}

              {/* Checkmark Badge Top Right */}
              <div
                className={`absolute top-2 right-2 z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-[#008f51] text-white shadow-md ring-2 ring-white'
                    : 'bg-white/80 border border-[#d7e0d7] text-transparent hover:border-[#008f51]'
                }`}
              >
                <Check className={`w-3.5 h-3.5 stroke-[3] ${isSelected ? 'text-white' : 'text-gray-300'}`} />
              </div>

              {/* High-Definition Studio Garment Image */}
              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-2 bg-[#f6f5f0]">
                <Image
                  src={g.image}
                  alt={g.name}
                  fill
                  unoptimized={true}
                  sizes="(max-width: 480px) 50vw, 240px"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Title & Price Row */}
              <div className="w-full flex items-end justify-between gap-1 pt-1 mb-2">
                <div className="min-w-0">
                  <h3 className="font-heading font-black text-[13.5px] text-[#0c2b1e] leading-tight truncate">
                    {g.name}
                  </h3>
                  <span className="text-[10px] text-[#4e6b5d] font-semibold block mt-0.5 truncate">
                    {g.category === 'dryclean' ? 'Dry Cleaning' : g.category === 'premium' ? 'Spa & Care' : 'Eco Wash'}
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-heading text-[15px] font-black text-[#00874c] leading-none block">
                    ₹{g.price}
                  </span>
                  {g.unit && (
                    <span className="text-[9px] font-bold text-[#64748b] block">{g.unit}</span>
                  )}
                </div>
              </div>

              {/* Explicit Order Now / Select Button on each card */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleGarment(g);
                }}
                className={`w-full py-1.5 px-2 rounded-xl font-heading font-black text-[11px] flex items-center justify-center gap-1 transition-all shadow-sm ${
                  isSelected
                    ? 'bg-[#008f51] text-white'
                    : 'bg-[#FAF6EE] hover:bg-[#072618] text-[#072618] hover:text-white border border-[#DECBB0]'
                }`}
              >
                <Check className={`w-3 h-3 stroke-[3] ${isSelected ? 'inline' : 'hidden'}`} />
                <span>{isSelected ? 'Selected (Added)' : '+ Order / Add'}</span>
              </button>

            </div>
          );
        })}
      </div>

      {/* Floating Bottom Selection Bar matching User Screenshot */}
      <div className="mt-4 p-3.5 rounded-2xl bg-[#072618] border-2 border-[#d4af37]/60 text-white flex items-center justify-between shadow-xl">
        <div>
          <span className="text-[11px] font-bold text-[#55fca7] block">
            {selectedCount > 0 ? `${selectedCount} items selected` : 'Select your garments'}
          </span>
          <div className="text-[19px] font-black text-[#ffe57f] font-heading leading-tight mt-0.5">
            Total: ₹{selectedTotal > 0 ? selectedTotal : 576}
          </div>
        </div>

        <button
          onClick={onOrderNow}
          className="h-11 px-6 rounded-full bg-gradient-to-r from-[#d4af37] via-[#eab308] to-[#f59e0b] hover:from-[#f59e0b] hover:to-[#d4af37] text-[#3d2303] font-heading font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-1.5 active:scale-95 transition-all"
        >
          <span>ORDER NOW</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </section>
  );
}
