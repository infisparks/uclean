'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Phone,
  ShoppingBag,
  Star,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Truck,
  Sparkles,
  Heart,
  Clock,
} from 'lucide-react';

interface ShowcaseHeroProps {
  onOpenBooking: (service?: string) => void;
  cartCount?: number;
  onOpenCrm: () => void;
}

export function ShowcaseHero({ onOpenBooking, cartCount = 1, onOpenCrm }: ShowcaseHeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      title: 'Professional Laundry & Dry Cleaning',
      subtitle: 'From everyday wear to designer lehengas & suits — we clean & deliver with trust.',
      tag: '⭐ 5.0 RATED IN NERUL',
      priceBadge: 'From ₹109 / Kg',
      image: 'https://res.cloudinary.com/zzbuyz8r/image/upload/f_auto,q_auto/bg',
      feature1: '100% Eco-Safe Wash',
      feature2: 'Crisp Steam Press',
      feature3: 'Free Pickup & Drop',
    },
    {
      title: 'Bridal Lehenga & Luxury Suit Spa',
      subtitle: 'Gentle organic solvent extraction, zero color fade, handcrafted finishing.',
      tag: '✨ DESIGNER WEAR SPECIALIST',
      priceBadge: 'From ₹299 / Pc',
      image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
      feature1: 'Zero Shrinkage',
      feature2: 'Stain Eraser Tech',
      feature3: 'Luxury Packing',
    },
    {
      title: 'Sofa Shampoo & Curtain (Parda) Care',
      subtitle: 'Deep suction wet-extraction at your doorstep. 100% sanitization for rugs & couches.',
      tag: '🏡 DOORSTEP HOME VISITS',
      priceBadge: '₹30 – 45 / sq.ft',
      image: 'https://res.cloudinary.com/zzbuyz8r/image/upload/f_auto,q_auto/people-cleaning-sofa',
      feature1: 'Deep Extraction',
      feature2: 'Kills 99.9% Germs',
      feature3: 'Fast Deodorizing Dry',
    },
  ];

  const customerReviews = [
    {
      name: 'Pooja Deshmukh',
      location: 'Sector 6, Nerul',
      rating: '★ 5.0',
      text: 'My wedding lehenga looked completely brand new after their dry clean! The packaging and scent were incredible. Highly recommended!',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Ankit Mehta',
      location: 'Nerul West',
      rating: '★ 5.0',
      text: 'Super fast 24hr pickup and delivery. Clothes were ironed with crisp lines on premium hangers. Extremely reasonable per-kg pricing.',
      image: 'https://images.unsplash.com/photo-1489274495757-95c7c837b101?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Dr. Farhana Siddiqui',
      location: 'Palm Beach Rd',
      rating: '★ 5.0',
      text: 'Their sofa shampooing team did a miraculous job. Removed deep coffee stains completely and dried within 3 hours. Great staff!',
      image: 'https://res.cloudinary.com/zzbuyz8r/image/upload/f_auto,q_auto/people-cleaning-sofa',
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const current = heroSlides[currentSlide];

  return (
    <div className="w-full bg-[#0b1a13] text-white flex flex-col">
      
      {/* 1. Top Notice Ticker Bar */}
      <div className="bg-[#072618] border-b border-white/10 px-3 py-2 flex items-center justify-between text-[11px] font-bold text-[#a8f0cf]">
        <span className="flex items-center gap-1 truncate">
          <Truck className="w-3.5 h-3.5 text-[#55fca7] shrink-0" />
          <span>FREE PICKUP &amp; DELIVERY across Sector 6 &amp; Nerul West</span>
        </span>
        <a
          href="tel:+917400474132"
          className="flex items-center gap-1 text-[#ffe57f] hover:underline shrink-0 ml-2"
        >
          <Phone className="w-3 h-3" />
          <span>+91 74004 74132</span>
        </a>
      </div>

      {/* 2. Top Header Brand Nav */}
      <div className="p-3.5 px-4 flex items-center justify-between border-b border-white/10 bg-[#072618]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#008f51] flex items-center justify-center font-heading font-black text-xl text-white shadow-md border border-[#55fca7]/30">
            U
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading text-lg font-black tracking-wider text-white">
                UCLEAN
              </span>
              <span className="text-[9px] font-extrabold text-[#ffe57f] bg-[#632608] px-1.5 py-0.2 rounded border border-[#d4af37]/40 uppercase">
                NERUL
              </span>
            </div>
            <div className="flex items-center gap-1 text-[8.5px] font-extrabold tracking-[1.5px] text-[#a8dec4] uppercase">
              <span>WE</span>
              <Heart className="w-2.5 h-2.5 fill-[#55fca7] text-[#55fca7]" />
              <span>LAUNDRY</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* CRM portal button */}
          <button
            onClick={onOpenCrm}
            className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-[#a8dec4] text-[10.5px] font-extrabold border border-white/20 transition-all flex items-center gap-1"
          >
            <span>📊 CRM Desk</span>
          </button>

          {/* Cart / Bookings Bag */}
          <button
            onClick={() => onOpenBooking('Wash & Fold — ₹109/kg')}
            className="relative w-9 h-9 rounded-xl bg-[#008f51] hover:bg-[#05a862] text-white flex items-center justify-center shadow-md transition-all active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#d4af37] text-[#072618] font-black text-[9px] flex items-center justify-center shadow-sm">
              {cartCount}
            </span>
          </button>
        </div>
      </div>

      {/* 3. 1:1 Aspect Ratio Showcase Banner Header (Matching Reference Image) */}
      <div className="p-3.5 pb-2">
        <div className="relative aspect-square w-full rounded-[24px] overflow-hidden border-2 border-[#d4af37]/60 shadow-[0_12px_36px_rgba(0,0,0,0.6)] group">
          {/* Background Image */}
          <Image
            src={current.image}
            alt={current.title}
            fill
            sizes="(max-width: 480px) 100vw, 480px"
            className="object-cover object-center transition-all duration-700 brightness-[0.88] group-hover:scale-105"
            priority
          />

          {/* Gradient Overlay for Crisp Text Contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#072618] via-[#072618]/40 to-transparent" />

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-[#008f51] text-white flex items-center justify-center backdrop-blur-sm border border-white/20 transition-all z-10"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-[#008f51] text-white flex items-center justify-center backdrop-blur-sm border border-white/20 transition-all z-10"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Content Inside the 1:1 Showcase Frame */}
          <div className="absolute inset-0 p-4 flex flex-col justify-between z-10 pointer-events-none">
            
            {/* Top Brand Badges */}
            <div className="flex items-center justify-between gap-2">
              <span className="bg-[#008f51] text-white text-[9.5px] font-black px-2.5 py-1 rounded-full shadow-md border border-white/20 uppercase tracking-wide">
                {current.tag}
              </span>

              <span className="bg-[#632608]/90 text-[#ffe57f] text-[9.5px] font-black px-2.5 py-1 rounded-full shadow-md border border-[#d4af37]/50 uppercase">
                ⚡ 24-48 HR FAST
              </span>
            </div>

            {/* Bottom Showcase Info */}
            <div className="space-y-2">
              <h2 className="font-heading text-[22px] sm:text-[25px] font-black leading-tight text-white drop-shadow-md">
                {current.title}
              </h2>

              <p className="text-[11.5px] text-[#e1ece4] leading-snug line-clamp-2 drop-shadow-sm">
                {current.subtitle}
              </p>

              {/* Combo Offer Pill inside frame */}
              <div className="bg-gradient-to-r from-[#632608]/95 to-[#072618]/95 border border-[#d4af37] rounded-xl p-2 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#ffe57f]" />
                  <div>
                    <span className="text-[10px] font-bold text-[#a8dec4] block">Offer Price</span>
                    <strong className="font-heading text-sm font-black text-[#ffe57f]">
                      {current.priceBadge}
                    </strong>
                  </div>
                </div>

                <span className="bg-[#008f51] text-white text-[9.5px] font-extrabold px-2.5 py-1 rounded-full uppercase">
                  Free Pickup
                </span>
              </div>

              {/* 3 Value Pillars */}
              <div className="grid grid-cols-3 gap-1 pt-0.5 text-center text-[9px] font-bold text-[#d1fae5]">
                <div className="bg-black/40 rounded-lg py-1 border border-white/10">
                  ✓ {current.feature1}
                </div>
                <div className="bg-black/40 rounded-lg py-1 border border-white/10">
                  ✓ {current.feature2}
                </div>
                <div className="bg-black/40 rounded-lg py-1 border border-white/10">
                  ✓ {current.feature3}
                </div>
              </div>
            </div>

          </div>

          {/* Dots Indicator */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  currentSlide === idx ? 'w-5 bg-[#ffe57f]' : 'w-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 4. Customer Reviews Section Below 1:1 Hero (Matching Reference Image) */}
      <div className="p-3.5 pt-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <div className="flex text-[#f59e0b]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <span className="font-heading text-xs font-black text-white">
              Customer Reviews (4.9 / 5.0)
            </span>
          </div>

          <span className="text-[10.5px] text-[#a8dec4] font-bold flex items-center gap-0.5">
            🔍 Verified Nerul Residents
          </span>
        </div>

        {/* 3 Review Cards in Horizontal Scroll / Grid */}
        <div className="grid grid-cols-3 gap-2">
          {customerReviews.map((rev, idx) => (
            <div
              key={idx}
              className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-[#DECBB0]/30 bg-[#072618] group shadow-md flex flex-col justify-end p-2"
            >
              <Image
                src={rev.image}
                alt={rev.name}
                fill
                sizes="(max-width: 480px) 33vw, 150px"
                className="object-cover object-center opacity-40 group-hover:opacity-60 transition-opacity"
              />
              <div className="relative z-10 space-y-1">
                <span className="inline-block bg-[#008f51] text-white text-[8px] font-black px-1.5 py-0.2 rounded-md">
                  {rev.rating}
                </span>
                <p className="text-[9px] text-[#d1fae5] leading-tight line-clamp-3">
                  &ldquo;{rev.text}&rdquo;
                </p>
                <div className="text-[8.5px] font-extrabold text-[#ffe57f] truncate">
                  {rev.name}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
