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
      price: '₹109/kg',
      desc: 'Everyday laundry, washed and folded neatly.',
      buttonText: 'Order Now →',
      image: '/images/wash-fold-luxury.jpg',
      action: () => onSelectService('Wash & Fold — ₹109/kg', 'Everyday Laundry (Per Kg)'),
    },
    {
      id: 'wash-iron',
      title: 'Wash & Iron',
      price: '₹149/kg',
      desc: 'Laundry washed & crisp steam ironed on hangers.',
      buttonText: 'Order Now →',
      image: '/images/wash-iron-luxury.jpg',
      action: () => onSelectService('Wash & Iron — ₹149/kg', 'Steam Pressed Laundry'),
    },
    {
      id: 'dry-cleaning',
      title: 'Dry Cleaning',
      price: 'From ₹149',
      desc: 'Delicate care for suits, gowns, silks & woolens.',
      buttonText: 'Check Rates →',
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
      price: 'From ₹30/sq. ft.',
      desc: 'Carpets ₹30/sq.ft · Lining curtains ₹45/sq.ft',
      buttonText: 'Request Visit →',
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
        <span className="text-[10px] font-extrabold text-[#008f51] bg-white border border-[#DECBB0] px-2.5 py-1 rounded-full shadow-sm">
          ⚡ 4 Key Care Plans
        </span>
      </div>

      {/* Clean 2-Cards Per Row Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {services.map((srv) => (
          <div
            key={srv.id}
            onClick={srv.action}
            className="bg-white rounded-[18px] border-[1.5px] border-[#DECBB0] p-2.5 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-[#008f51] hover:-translate-y-0.5 transition-all cursor-pointer group"
          >
            {/* Earlier Landscape 4:3 Aspect Ratio Image */}
            <div className="relative w-full aspect-[4/3] rounded-[12px] overflow-hidden mb-2 bg-[#f6f4ee] border border-[#ECE0C6]">
              <Image
                src={srv.image}
                alt={srv.title}
                fill
                unoptimized={true}
                sizes="(max-width: 480px) 50vw, 240px"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1 justify-between">
              <div>
                <h3 className="font-sans font-bold text-[14px] text-[#111827] leading-tight group-hover:text-[#008f51] transition-colors truncate tracking-tight">
                  {srv.title}
                </h3>
                
                {/* Bold Green Price */}
                <div className="font-sans text-[14.5px] font-extrabold text-[#00874c] mt-0.5 tracking-tight">
                  {srv.price}
                </div>

                <p className="font-sans text-[11.5px] text-[#374151] font-medium leading-[1.45] mt-1 mb-2.5 line-clamp-2">
                  {srv.desc}
                </p>
              </div>

              {/* Brand Styled Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  srv.action();
                }}
                className="w-full py-1.5 px-2 rounded-full bg-[#008f51] hover:bg-[#072618] text-white font-sans font-semibold text-[11.5px] tracking-normal flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all"
              >
                <span>{srv.buttonText}</span>
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

