'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Search, ArrowRight, X } from 'lucide-react';
import { RATE_ITEMS, RateItem } from '@/lib/rateData';

interface ChooseServiceGridProps {
  onSelectService: (serviceTitle: string, defaultGarment?: string) => void;
  onCheckGarmentPrice?: () => void;
  onSearch?: (query: string) => void;
}

function CardImage({ src, alt }: { src: string; alt: string }) {
  const [currentSrc, setCurrentSrc] = useState(src);

  return (
    <Image
      src={currentSrc}
      alt={alt}
      fill
      unoptimized={true}
      sizes="(max-width: 480px) 50vw, 240px"
      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
      onError={() => {
        // High quality fallback if local image has issues or cache glitch
        setCurrentSrc('https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=600&q=80');
      }}
    />
  );
}

export function ChooseServiceHorizontal({
  onSelectService,
  onCheckGarmentPrice,
  onSearch,
}: ChooseServiceGridProps) {
  const [query, setQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(query.trim());
    if (onCheckGarmentPrice) onCheckGarmentPrice();
  };

  const handleQuickTagClick = (tag: string) => {
    setQuery(tag);
    if (onSearch) onSearch(tag);
  };

  const handleClearSearch = () => {
    setQuery('');
    if (onSearch) onSearch('');
  };

  // Instant Live Matches for search bar (case-insensitive, multi-word matching)
  const liveMatches = useMemo<RateItem[]>(() => {
    const raw = query.toLowerCase().trim();
    if (!raw) return [];

    const searchTokens = raw
      .replace(/[–—/(),+]/g, ' ')
      .split(/\s+/)
      .filter(Boolean);

    return RATE_ITEMS.filter((item) => {
      const searchable = `${item.name} ${item.categoryName} ${item.gender || ''} ${item.id} ₹${item.price}`
        .toLowerCase()
        .replace(/[–—/(),+]/g, ' ');

      return searchTokens.every((token) => searchable.includes(token));
    }).slice(0, 6);
  }, [query]);

  const allServices = [
    {
      id: 'men-suits',
      title: "Men's Suits & Ethnic",
      keywords: 'suit blazer coat tuxedo sherwani kurta dhoti pagdi indowestern wedding',
      pricePrefix: 'From',
      priceAmount: '₹119',
      priceUnit: '/item',
      image: '/images/dry-clean-luxury.jpg',
      action: () => onSelectService("Men's Suits & Ethnic", 'Suit / Blazer / Sherwani'),
    },
    {
      id: 'women-ethnic',
      title: "Women's Ethnic & Saree Spa",
      keywords: 'saree lehenga choli dupatta blouse chadar dhara bridal festive women',
      pricePrefix: 'From',
      priceAmount: '₹69',
      priceUnit: '/item',
      image: '/images/saree-lehenga-luxury.jpg',
      action: () => onSelectService("Women's Ethnic & Saree Spa", 'Silk Saree / Lehenga / Choli'),
    },
    {
      id: 'winterwear-jackets',
      title: 'Winterwear & Leather Care',
      keywords: 'jacket leather faux fur puffer parka coat sweater cardigan jumper thermal winter',
      pricePrefix: 'From',
      priceAmount: '₹99',
      priceUnit: '/item',
      image: '/images/winterwear-luxury.jpg',
      action: () => onSelectService('Winterwear & Leather Care', 'Leather Jacket / Coat / Sweater'),
    },
    {
      id: 'dailywear-steam',
      title: 'Shirts, Pants & Steam Press',
      keywords: 'shirt tshirt pants trousers jeans shorts joggers track pant combo safari steam press',
      pricePrefix: 'From',
      priceAmount: '₹25',
      priceUnit: '/item',
      image: '/images/steam-press-luxury.jpg',
      action: () => onSelectService('Shirts, Pants & Steam Press', 'Shirts & Trousers'),
    },
    {
      id: 'wash-fold',
      title: 'Wash & Fold Laundry',
      keywords: 'wash fold laundry kg clothes everyday standard regular',
      pricePrefix: '',
      priceAmount: '₹109',
      priceUnit: '/kg',
      image: '/images/wash-fold-luxury.jpg',
      action: () => onSelectService('Wash & Fold Laundry', 'Everyday Laundry (Per Kg)'),
    },
    {
      id: 'wash-iron',
      title: 'Wash & Steam Iron',
      keywords: 'wash iron steam pressed laundry kg',
      pricePrefix: '',
      priceAmount: '₹149',
      priceUnit: '/kg',
      image: '/images/wash-iron-luxury.jpg',
      action: () => onSelectService('Wash & Steam Iron', 'Steam Pressed Laundry'),
    },
    {
      id: 'shoe-spa',
      title: 'Footwear & Designer Shoe Spa',
      keywords: 'shoes sports leather boots suede nubuck sneakers footwear cleaning restoration',
      pricePrefix: 'From',
      priceAmount: '₹349',
      priceUnit: '/pair',
      image: '/images/shoe-spa-luxury.jpg',
      action: () => onSelectService('Footwear & Designer Shoe Spa', 'Leather Shoes / Sneakers / Boots'),
    },
    {
      id: 'shawls-accessories',
      title: 'Shawls, Pashmina & Ties',
      keywords: 'shawl toosh pashmina lohi naga muffler woolen gloves cap hat turban belt handkerchief pocket square tie wallet socks',
      pricePrefix: 'From',
      priceAmount: '₹25',
      priceUnit: '/item',
      image: '/images/shawls-luxury.jpg',
      action: () => onSelectService('Shawls, Pashmina & Ties', 'Pashmina / Muffler / Tie'),
    },
  ];

  return (
    <section className="p-3.5 sm:p-5 py-4 bg-[#FAF6EE] border-b border-[#ECE0C6]" id="choose-service-section">
      
      {/* 1. Clean Title Header */}
      <div className="mb-2.5">
        <h2 className="font-heading text-[22px] sm:text-[24px] font-black text-[#072618] leading-tight">
          Choose Your Service
        </h2>
      </div>

      {/* 2. Top Universal Search Bar with Live Suggestions & Quick Chips */}
      <div className="mb-3.5 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-[#DECBB0] shadow-xs">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#008f51]" strokeWidth={2.5} />
          <input
            type="text"
            placeholder="Search garment or rate (Suit, Saree, Jacket)..."
            value={query}
            onChange={(e) => {
              const val = e.target.value;
              setQuery(val);
              if (onSearch) onSearch(val);
            }}
            className="w-full h-10 pl-9 pr-20 bg-[#FAF6EE]/80 rounded-full text-[12px] font-bold text-[#0c2b1e] border border-[#d4af37]/60 shadow-inner focus:outline-none focus:ring-1 focus:ring-[#008f51] placeholder:text-[#64748b] truncate"
          />
          {query && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-20 top-3 text-gray-400 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 h-7 px-3.5 rounded-full bg-gradient-to-r from-[#008f51] to-[#05a862] hover:from-[#05a862] hover:to-[#008f51] text-white text-[11px] font-black shadow-xs active:scale-95 transition-all flex items-center gap-1"
          >
            <span>Search</span>
          </button>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 pt-2.5 no-scrollbar select-none">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#008f51] shrink-0 mr-0.5 flex items-center gap-0.5">
            🔥 Quick:
          </span>
          {[
            'Blazer / Suit',
            'Silk Saree',
            'Leather Jacket',
            'Pashmina Shawl',
            'Sports Shoes',
            'Sherwani',
            'Steam Ironing',
            'Lehenga Spa',
          ].map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => handleQuickTagClick(chip)}
              className="text-[10px] sm:text-[10.5px] font-extrabold text-[#072618] bg-[#eaf9f1] hover:bg-[#008f51] hover:text-white px-3 py-1 rounded-full border border-[#008f51] hover:border-[#008f51] transition-all shadow-xs active:scale-95 shrink-0 whitespace-nowrap"
            >
              ✦ {chip}
            </button>
          ))}
        </div>

        {/* Live Instant Matches Dropdown/Strip (Direct Tap to Order) */}
        {query.trim() && liveMatches.length > 0 && (
          <div className="mt-2.5 pt-2.5 border-t border-[#DECBB0]/60 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wide text-[#008f51]">
                ⚡ Live Matches ({liveMatches.length}):
              </span>
              {onCheckGarmentPrice && (
                <button
                  type="button"
                  onClick={onCheckGarmentPrice}
                  className="text-[10px] font-bold text-[#632608] hover:underline"
                >
                  View in Rate Table &rarr;
                </button>
              )}
            </div>

            <div className="divide-y divide-gray-100 bg-[#FAF6EE] rounded-xl border border-[#DECBB0] overflow-hidden">
              {liveMatches.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectService(`Dry Cleaning — ${item.name}`, item.name)}
                  className="p-2 px-2.5 flex items-center justify-between hover:bg-white transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-base">{item.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-heading font-black text-[12px] text-[#072618] truncate group-hover:text-[#008f51]">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-[#527362] truncate">
                        {item.categoryName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[11px] font-black text-[#00874c] bg-white px-2 py-0.5 rounded-md border border-[#a7f3d0]">
                      ₹{item.price.toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectService(`Dry Cleaning — ${item.name}`, item.name);
                      }}
                      className="px-2 py-0.5 rounded-md bg-[#008f51] hover:bg-[#072618] text-white text-[10px] font-black"
                    >
                      Book
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. Visual Commercial Category Cards */}
      <div className="grid grid-cols-2 gap-3">
        {allServices.map((srv) => (
          <div
            key={srv.id}
            onClick={srv.action}
            className="bg-white rounded-[18px] border border-[#DECBB0] hover:border-[#008f51] overflow-hidden flex flex-col justify-between shadow-2xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group"
          >

            {/* Flush Photo Fit */}
            <div className="relative w-full aspect-[4/3] bg-[#f6f4ee]">
              <CardImage
                src={srv.image}
                alt={srv.title}
              />
            </div>

            {/* Content Area with Luxury Alignment & Compact Height */}
            <div className="p-2.5 pt-2 flex flex-col justify-between flex-1">
              <h3 className="font-heading font-black text-[13px] sm:text-[14px] text-[#072618] leading-snug group-hover:text-[#008f51] transition-colors truncate">
                {srv.title}
              </h3>

              <div className="flex items-baseline gap-1 mt-1">
                {srv.pricePrefix && (
                  <span className="text-[10px] font-bold text-[#6B7280]">
                    {srv.pricePrefix}
                  </span>
                )}
                <span className="font-heading text-[15px] sm:text-[16px] font-black text-[#008f51] leading-none">
                  {srv.priceAmount}
                </span>
                <span className="text-[10px] sm:text-[10.5px] font-bold text-[#6B7280] leading-none">
                  {srv.priceUnit}
                </span>
              </div>

              {/* Luxury Executive Gradient Button with Splash Shimmer & Compact Height */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  srv.action();
                }}
                className="group/btn relative overflow-hidden w-full mt-2 h-7 sm:h-7.5 px-2.5 rounded-lg bg-gradient-to-r from-[#005e34] via-[#009b56] to-[#014d2b] hover:from-[#004d2c] hover:via-[#008f51] hover:to-[#004225] text-white font-heading font-black text-[10.5px] sm:text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 border border-[#34d399]/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_3px_10px_rgba(0,143,81,0.28)] hover:shadow-[0_4px_16px_rgba(0,143,81,0.45)] active:scale-95 transition-all before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-700"
              >
                <span className="relative z-10 font-black">Book Now</span>
                <ArrowRight className="w-3.5 h-3.5 text-white relative z-10 group-hover/btn:translate-x-0.5 transition-transform shrink-0" />
              </button>
            </div>

          </div>
        ))}
      </div>
    </section>
  );
}
