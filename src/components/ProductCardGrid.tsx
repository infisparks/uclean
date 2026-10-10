'use client';

import React from 'react';
import Image from 'next/image';
import { Star, Zap, SlidersHorizontal, Check, Sparkles } from 'lucide-react';

export interface ProductCardItem {
  id: string;
  badgeTop: string;
  videoBadge?: boolean;
  image: string;
  rating: number;
  reviewsCount: number;
  ordersCount: string;
  optionsBadge: string;
  title: string;
  description: string;
  priceRange: string;
  originalPrice?: string;
  serviceId: string;
}

interface ProductCardGridProps {
  onSelectProduct: (product: ProductCardItem) => void;
}

export const PRODUCT_CARDS: ProductCardItem[] = [
  {
    id: 'wash-fold-deluxe',
    badgeTop: 'POPULAR • PER KG',
    videoBadge: true,
    image: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    reviewsCount: 439,
    ordersCount: '1,310 washed',
    optionsBadge: '2 Wash Variants',
    title: 'Everyday Wash & Fold Care (Per Kg)',
    description: 'Hygienic anti-bacterial wash with organic fabric softener, dried & crisp wardrobe folding.',
    priceRange: '₹109 – 149',
    originalPrice: '₹180',
    serviceId: 'Wash & Fold — ₹109/kg',
  },
  {
    id: 'wash-iron-steam',
    badgeTop: 'PREMIUM • STEAM',
    videoBadge: true,
    image: 'https://images.unsplash.com/photo-1489274495757-95c7c837b101?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    reviewsCount: 518,
    ordersCount: '1,540 pressed',
    optionsBadge: 'Hanger / Fold',
    title: 'Wash & Steam Ironing (Per Kg)',
    description: 'Deep hygienic wash with wrinkle-free pressurized steam iron on customized hangers.',
    priceRange: '₹149 – 199',
    originalPrice: '₹220',
    serviceId: 'Wash & Iron — ₹149/kg',
  },
  {
    id: 'suit-blazer-dryclean',
    badgeTop: 'MEN • ETHNIC & SUIT',
    videoBadge: true,
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80',
    rating: 5.0,
    reviewsCount: 382,
    ordersCount: '890 suits',
    optionsBadge: '2 Pc / 3 Pc / Tux',
    title: 'Designer Suit & Blazer Dry Clean',
    description: 'Gentle solvent care, collar shaping, stain extraction & luxury breathable garment packing.',
    priceRange: '₹299 – 899',
    originalPrice: '₹1,200',
    serviceId: 'Dry Cleaning — Men Suits',
  },
  {
    id: 'bridal-lehenga-dryclean',
    badgeTop: 'BRIDAL • SILK CARE',
    videoBadge: true,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
    rating: 5.0,
    reviewsCount: 620,
    ordersCount: '940 lehengas',
    optionsBadge: 'Heavy Zari / Silk',
    title: 'Bridal Lehenga, Choli & Dupatta Spa',
    description: 'Zero-damage restoration for heavy zardozi, raw silk, sequins and designer couture.',
    priceRange: '₹399 – 1,499',
    originalPrice: '₹2,100',
    serviceId: 'Dry Cleaning — Women Bridal',
  },
  {
    id: 'shoe-spa-restoration',
    badgeTop: 'BUY 2 GET 1 FREE',
    videoBadge: true,
    image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
    reviewsCount: 295,
    ordersCount: '760 pairs',
    optionsBadge: 'Sneakers / Leather',
    title: 'Shoe Spa, Sneakers & Leather Care',
    description: 'Deep sole de-yellowing, suede restoration, inside ozone sanitizing & odor neutralization.',
    priceRange: '₹349 – 599',
    originalPrice: '₹750',
    serviceId: 'Shoe Dry Clean & Spa',
  },
  {
    id: 'sofa-curtain-shampoo',
    badgeTop: 'DOORSTEP • VISITS',
    videoBadge: true,
    image: 'https://res.cloudinary.com/zzbuyz8r/image/upload/f_auto,q_auto/people-cleaning-sofa',
    rating: 4.9,
    reviewsCount: 412,
    ordersCount: '620 homes',
    optionsBadge: 'Sofa / Parda / Carpet',
    title: 'Sofa Shampoo & Curtain (Parda) Care',
    description: 'Industrial wet-extraction machine treatment at your home. 100% germ-free sanitization.',
    priceRange: '₹30 – 45 / sq.ft',
    originalPrice: '₹60',
    serviceId: 'Home Upholstery Care',
  },
];

export function ProductCardGrid({ onSelectProduct }: ProductCardGridProps) {
  return (
    <section className="p-[26px_14px] bg-white border-t border-[#edf4f0]" id="product-catalog">
      <div className="text-center mb-5">
        <span className="inline-block text-[10.5px] font-extrabold tracking-[1.4px] uppercase text-[#632608] bg-[#ECE0C6] px-3 py-1 rounded-full mb-1.5 border border-[#DECBB0]">
          ✨ Curated Service Packages
        </span>
        <h2 className="font-heading text-[24px] font-extrabold text-[#072618] leading-tight">
          Select Your Laundry Package
        </h2>
        <p className="text-[12.5px] text-[#4e6b5d] mt-1">
          Tap any card to customize your pickup request &amp; receive instant slot confirmation.
        </p>
      </div>

      {/* 2-Column Grid matching reference UI */}
      <div className="grid grid-cols-2 gap-3.5">
        {PRODUCT_CARDS.map((prod) => (
          <div
            key={prod.id}
            className="bg-white rounded-[20px] border-[1.5px] border-[#ECE0C6] overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.06)] flex flex-col justify-between hover:shadow-[0_8px_24px_rgba(0,30,15,0.12)] hover:border-[#DECBB0] hover:-translate-y-1 transition-all"
          >
            {/* Top 1:1 Aspect Ratio Media Header */}
            <div className="relative aspect-square w-full bg-[#FAF6EE] overflow-hidden group">
              <Image
                src={prod.image}
                alt={prod.title}
                fill
                sizes="(max-width: 480px) 50vw, 240px"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              
              {/* Badges on Top */}
              <div className="absolute top-2 left-2 right-2 flex justify-between items-center gap-1">
                <span className="bg-[#072618]/90 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full backdrop-blur-sm shadow-sm border border-white/20 uppercase tracking-tight">
                  {prod.badgeTop}
                </span>

                {prod.videoBadge && (
                  <span className="bg-[#632608]/90 text-[#ffe57f] text-[9px] font-extrabold px-1.5 py-0.5 rounded-full backdrop-blur-sm shadow-sm border border-[#ffe57f]/30 flex items-center gap-0.5">
                    ▶ <span className="text-[8px]">Live</span>
                  </span>
                )}
              </div>
            </div>

            {/* Card Body */}
            <div className="p-3 flex flex-col flex-1 justify-between">
              <div>
                {/* Ratings & Orders */}
                <div className="flex items-center justify-between gap-1 mb-1.5 flex-wrap">
                  <div className="flex items-center gap-1 text-[10.5px] font-bold text-[#b45309]">
                    <div className="flex text-[#f59e0b]">
                      <Star className="w-3 h-3 fill-current" />
                    </div>
                    <span>{prod.rating}</span>
                    <span className="text-[#8c9e94]">({prod.reviewsCount})</span>
                  </div>

                  <span className="bg-[#FAF6EE] border border-[#DECBB0] text-[#632608] text-[9px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                    🔥 {prod.ordersCount}
                  </span>
                </div>

                {/* Option Pill */}
                <div className="mb-1.5">
                  <span className="inline-block bg-[#eaf8f1] border border-[#a7f3d0] text-[#008f51] text-[9.5px] font-extrabold px-2 py-0.5 rounded-md">
                    {prod.optionsBadge}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-heading text-[13.5px] font-extrabold text-[#072618] leading-[1.25] mb-1 line-clamp-2">
                  {prod.title}
                </h3>

                {/* Description */}
                <p className="text-[11px] text-[#527362] leading-snug line-clamp-2 mb-2">
                  {prod.description}
                </p>
              </div>

              {/* Pricing & CTA Buttons */}
              <div className="pt-1.5 border-t border-[#f0ebe0]">
                <div className="flex items-baseline gap-1.5 mb-2">
                  <span className="font-heading text-[15px] font-black text-[#072618]">
                    {prod.priceRange}
                  </span>
                  {prod.originalPrice && (
                    <span className="text-[10px] text-[#8c9e94] line-through">
                      {prod.originalPrice}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => onSelectProduct(prod)}
                    className="h-8 rounded-lg bg-[#FAF6EE] hover:bg-[#ECE0C6] text-[#632608] border border-[#DECBB0] text-[10.5px] font-extrabold flex items-center justify-center gap-1 transition-colors"
                  >
                    <SlidersHorizontal className="w-3 h-3" />
                    <span>Options</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectProduct(prod)}
                    className="group/btn relative overflow-hidden h-8 rounded-lg bg-gradient-to-r from-[#005e34] via-[#009b56] to-[#014d2b] hover:from-[#004d2c] hover:via-[#008f51] hover:to-[#004225] text-white text-[10.5px] font-black flex items-center justify-center gap-1 border border-[#34d399]/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_8px_rgba(0,143,81,0.25)] active:scale-95 transition-all before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-700"
                  >
                    <span className="relative z-10">Book Now</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
