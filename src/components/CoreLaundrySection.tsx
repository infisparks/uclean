'use client';

import React from 'react';

interface CoreLaundrySectionProps {
  onOpenBooking: (service: 'pickup') => void;
}

export function CoreLaundrySection({ onOpenBooking }: CoreLaundrySectionProps) {
  const coreServices = [
    {
      title: 'Wash & Fold',
      price: '₹109',
      unit: '/ Kg',
      desc: 'Everyday clothes washed with gentle detergents, dried and neatly folded ready for your wardrobe.',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="4"></rect>
          <circle cx="12" cy="12" r="5"></circle>
          <circle cx="17" cy="5" r="1"></circle>
        </svg>
      ),
    },
    {
      title: 'Wash & Iron',
      price: '₹149',
      unit: '/ Kg',
      desc: 'Complete hygienic wash followed by crisp steam-ironing on hangers or precision folding.',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 17h18a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H9L3 17z"></path>
          <circle cx="9" cy="12" r="1"></circle>
          <circle cx="14" cy="12" r="1"></circle>
        </svg>
      ),
    },
    {
      title: 'Dry Clean',
      price: 'From ₹149',
      unit: '/ Pc',
      desc: 'Eco-friendly solvent cleaning for delicate silks, designer suits, lehengas, coats and woolens.',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"></path>
        </svg>
      ),
    },
  ];

  return (
    <section className="p-4 py-6 bg-white border-b border-[#ECE0C6]" id="services">
      <div className="text-center mb-4">
        <span className="inline-block text-[10px] font-extrabold tracking-widest uppercase text-[#632608] bg-[#ECE0C6] px-3 py-1 rounded-full mb-1 border border-[#DECBB0]">
          Everyday Laundry Rates
        </span>
        <h2 className="font-heading text-[21px] font-black text-[#072618] leading-tight">
          Per-Kg &amp; Everyday Care
        </h2>
        <p className="text-[12px] text-[#4e6b5d] mt-0.5">
          Affordable weight-based solutions with free doorstep pickup.
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {coreServices.map((srv, idx) => (
          <div
            key={idx}
            onClick={() => onOpenBooking('pickup')}
            className="bg-white rounded-[18px] border-[1.5px] border-[#ECE0C6] p-3.5 flex gap-3 shadow-sm hover:-translate-y-0.5 hover:shadow-md hover:border-[#DECBB0] transition-all cursor-pointer"
          >
            <div className="w-11 h-11 rounded-[12px] bg-[#FAF6EE] text-[#008f51] border border-[#ECE0C6] flex items-center justify-center shrink-0">
              {srv.icon}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-0.5">
                <h3 className="font-heading text-[15px] font-bold text-[#072618]">
                  {srv.title}
                </h3>
                <div className="font-heading text-[14px] font-black text-[#00874c] bg-[#eaf9f1] border border-[#a7f3d0] px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-sm">
                  {srv.price} <span className="text-[10px] font-semibold text-[#4e6b5d]">{srv.unit}</span>
                </div>
              </div>
              <p className="text-[11.5px] text-[#4e6b5d] leading-[1.38] mb-2">
                {srv.desc}
              </p>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenBooking('pickup');
                  }}
                  className="h-7 px-3 rounded-full bg-[#008f51] hover:bg-[#072618] text-white font-heading font-black text-[11px] shadow-sm flex items-center gap-1 active:scale-95 transition-all"
                >
                  <span>Order Now &bull; Free Pickup &rarr;</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Specialty Home Care Quick Pills */}
      <div className="flex gap-2 mt-2.5">
        <div className="flex-1 bg-[#FAF6EE] border border-dashed border-[#DECBB0] rounded-[14px] p-2 text-center shadow-sm">
          <strong className="block text-[12px] text-[#072618]">🛋️ Carpet Cleaning</strong>
          <span className="text-[11.5px] font-black text-[#008f51]">₹30 / sq. ft.</span>
        </div>
        <div className="flex-1 bg-[#FAF6EE] border border-dashed border-[#DECBB0] rounded-[14px] p-2 text-center shadow-sm">
          <strong className="block text-[12px] text-[#072618]">🪟 Lining Curtains</strong>
          <span className="text-[11.5px] font-black text-[#008f51]">₹45 / sq. ft.</span>
        </div>
      </div>
    </section>
  );
}
