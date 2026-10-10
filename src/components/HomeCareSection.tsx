'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';

interface HomeCareSectionProps {
  onOpenBooking: (service: 'home-visit') => void;
}

export function HomeCareSection({ onOpenBooking }: HomeCareSectionProps) {
  const homeServices = [
    {
      icon: '🛋️',
      title: 'Sofa & Couch Shampooing',
      desc: 'High-suction wet extraction for fabric, velvet, suede & leather sofas. Kills germs & removes stains.',
      badge: 'Deep Shampoo & Extraction',
    },
    {
      icon: '🪟',
      title: 'Curtains & Drapes (Parda)',
      desc: 'Delicate steam dry cleaning without shrinking or color fading. Removes trapped dust & odors.',
      badge: '₹45 / sq. ft. (Lining)',
    },
    {
      icon: '🧼',
      title: 'Carpet & Rug Washing',
      desc: 'Industrial rotary shampooing, deep fiber rinse & fast deodorizing dry.',
      badge: '₹30 / sq. ft.',
    },
    {
      icon: '🛏️',
      title: 'Mattress & Quilt Sanitization',
      desc: 'Anti-allergen high-temperature steam treatment for pillows, quilts & mattresses.',
      badge: '100% Germ-Free Sanitized',
    },
  ];

  return (
    <section className="p-4 py-6 bg-[#FAF6EE] border-b border-[#ECE0C6]" id="home-care">
      
      {/* Subtitle description on top matching Screenshot 4 */}
      <div className="text-center mb-3">
        <span className="inline-block text-[10px] font-extrabold tracking-widest uppercase text-[#632608] bg-[#ECE0C6] px-3 py-0.5 rounded-full mb-1 border border-[#DECBB0]">
          4th Section &bull; Home Care
        </span>
        <h2 className="font-heading text-[21px] font-black text-[#072618] leading-tight">
          Sofa &amp; Curtain (Parda) Cleaning
        </h2>
        <p className="text-[12px] font-semibold text-[#4e6b5d] mt-1">
          Professional deep shampooing, steam sanitization &amp; stain removal.
        </p>
      </div>

      {/* High-Res Showcase Image matching Screenshot 4 */}
      <div className="relative rounded-[22px] overflow-hidden shadow-[0_8px_25px_rgba(99,38,8,0.12)] mb-3.5 border-[1.5px] border-[#DECBB0] group">
        <div className="relative h-[210px] w-full">
          <Image
            src="https://res.cloudinary.com/zzbuyz8r/image/upload/f_auto,q_auto/people-cleaning-sofa"
            alt="Professional Staff Cleaning Sofa and Curtains"
            fill
            sizes="(max-width: 480px) 100vw, 480px"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      </div>

      {/* Home Services List matching Screenshot 4 */}
      <div className="flex flex-col gap-2.5">
        {homeServices.map((srv, idx) => (
          <div
            key={idx}
            onClick={() => onOpenBooking('home-visit')}
            className="bg-white border-[1.5px] border-[#DECBB0] rounded-[18px] p-3.5 flex gap-3 items-start hover:-translate-y-0.5 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#ECE0C6] text-[#632608] text-[20px] flex items-center justify-center shrink-0">
              {srv.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-heading text-[14.5px] font-bold text-[#0c2b1e] mb-0.5">
                {srv.title}
              </h4>
              <p className="text-[11.5px] text-[#4a6a5b] leading-[1.38] mb-2">
                {srv.desc}
              </p>
              <div className="flex items-center gap-2">
                <span className="inline-block font-heading text-[10.5px] font-extrabold text-[#632608] bg-[#ECE0C6] px-3 py-1 rounded-full border border-[#DECBB0]/50 whitespace-nowrap">
                  {srv.badge}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-3.5">
        <button
          onClick={() => onOpenBooking('home-visit')}
          className="inline-flex items-center justify-center gap-2 bg-[#082d1c] hover:bg-[#008f51] text-white py-2.5 px-6 rounded-full font-heading font-black text-xs shadow-md active:scale-95 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#ffe57f]" />
          <span>Book Home Visit / Inspection</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </section>
  );
}
