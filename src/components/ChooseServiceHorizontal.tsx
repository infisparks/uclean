'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';

interface ChooseServiceGridProps {
  onSelectService: (serviceTitle: string, defaultGarment?: string) => void;
  onCheckGarmentPrice?: () => void;
}

export function ChooseServiceHorizontal({
  onSelectService,
  onCheckGarmentPrice,
}: ChooseServiceGridProps) {
  const services = [
    {
      id: 'wash-fold',
      title: 'Wash & Fold',
      priceAmount: '₹109',
      priceUnit: '/kg',
      buttonText: 'Order Now',
      image: '/images/wash-fold-luxury.jpg',
      action: () => onSelectService('Wash & Fold — ₹109/kg', 'Everyday Laundry (Per Kg)'),
    },
    {
      id: 'wash-iron',
      title: 'Wash & Iron',
      priceAmount: '₹149',
      priceUnit: '/kg',
      buttonText: 'Order Now',
      image: '/images/wash-iron-luxury.jpg',
      action: () => onSelectService('Wash & Iron — ₹149/kg', 'Steam Pressed Laundry'),
    },
    {
      id: 'dry-cleaning',
      title: 'Dry Cleaning',
      priceAmount: 'From ₹149',
      priceUnit: '/item',
      buttonText: 'Check Rates',
      image: '/images/dry-clean-luxury.jpg',
      action: () => {
        if (onCheckGarmentPrice) {
          onCheckGarmentPrice();
        } else {
          onSelectService('Dry Cleaning — General Order', 'Suits & Garments');
        }
      },
    },
    {
      id: 'home-textiles',
      title: 'Home Textiles',
      priceAmount: 'From ₹30',
      priceUnit: '/sq.ft',
      buttonText: 'Request Visit',
      image: '/images/home-textiles-luxury.jpg',
      action: () => onSelectService('Home Textiles & Upholstery Care', 'Sofa, Carpet & Curtains'),
    },
  ];

  return (
    <section className="p-3.5 py-4 bg-[#FAF6EE] border-b border-[#ECE0C6]" id="choose-service-section">
      
      {/* Eyebrow & Title */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="inline-block text-[9.5px] font-extrabold tracking-widest uppercase text-[#008f51] bg-[#eaf9f1] px-2.5 py-0.5 rounded-full mb-1 border border-[#a7f3d0]">
            SIMPLE PRICING &bull; DOORSTEP PICKUP
          </span>
          <h2 className="font-heading text-[20px] font-black text-[#072618] leading-tight">
            Choose Your Service
          </h2>
        </div>
        <span className="text-[10px] font-extrabold text-[#008f51] bg-white border border-[#DECBB0] px-2.5 py-1 rounded-full shadow-xs">
          ⚡ 4 Care Plans
        </span>
      </div>

      {/* Clean 2-Cards Per Row Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {services.map((srv) => (
          <div
            key={srv.id}
            onClick={srv.action}
            className="bg-white rounded-[18px] border border-[#DECBB0] p-2.5 flex flex-col justify-between shadow-2xs hover:shadow-md hover:border-[#008f51] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
          >
            {/* Landscape 4:3 Aspect Ratio Image */}
            <div className="relative w-full aspect-[4/3] rounded-[13px] overflow-hidden mb-2 bg-[#f6f4ee] border border-[#ECE0C6]">
              <Image
                src={srv.image}
                alt={srv.title}
                fill
                unoptimized={true}
                sizes="(max-width: 480px) 50vw, 240px"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Content Area with Compact Spacing */}
            <div className="flex flex-col justify-between flex-1">
              <div>
                <h3 className="font-sans font-bold text-[14px] text-[#111827] leading-snug group-hover:text-[#008f51] transition-colors truncate">
                  {srv.title}
                </h3>
                
                {/* Clean Price Presentation */}
                <div className="flex items-baseline gap-0.5 mt-0.5">
                  <span className="font-sans text-[14.5px] font-extrabold text-[#00874c]">
                    {srv.priceAmount}
                  </span>
                  <span className="text-[10px] text-[#6B7280] font-semibold">
                    {srv.priceUnit}
                  </span>
                </div>
              </div>

              {/* High-End Action Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  srv.action();
                }}
                className="w-full mt-2.5 py-1.5 px-3 rounded-full bg-[#008f51] group-hover:bg-[#072618] text-white font-sans font-bold text-[11px] tracking-normal flex items-center justify-center gap-1 shadow-2xs group-hover:shadow-xs active:scale-95 transition-all"
              >
                <span>{srv.buttonText}</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* 2. Compact Arranged Order Now Button */}
      <div className="mt-3">
        <button
          type="button"
          onClick={() => onSelectService('Wash & Fold — ₹109/kg', 'Standard Laundry Service')}
          className="w-full py-2.5 px-4 rounded-full bg-gradient-to-r from-[#008f51] to-[#05a862] hover:from-[#05a862] hover:to-[#072618] text-white font-heading font-bold text-[12.5px] tracking-tight shadow-md flex items-center justify-center gap-1.5 active:scale-98 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#ffe57f] shrink-0" />
          <span>ORDER NOW &bull; BOOK DOORSTEP PICKUP &rarr;</span>
        </button>
      </div>

      {/* Footnote text */}
      <p className="text-[9.5px] text-[#6b8276] mt-2 italic text-center">
        Final garment prices, measurements, service availability and order charges are confirmed before processing.
      </p>

    </section>
  );
}

