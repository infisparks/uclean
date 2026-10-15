'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';

interface CoreLaundrySectionProps {
  onSelectService?: (serviceTitle: string, defaultGarment?: string) => void;
  onCheckGarmentPrice?: () => void;
  onOpenBooking?: (service: string) => void;
}

export function CoreLaundrySection({
  onSelectService,
  onCheckGarmentPrice,
  onOpenBooking,
}: CoreLaundrySectionProps) {
  const handleSelect = (serviceTitle: string, defaultGarment: string = '') => {
    if (onSelectService) {
      onSelectService(serviceTitle, defaultGarment);
    } else if (onOpenBooking) {
      onOpenBooking(serviceTitle);
    }
  };

  const handleRateClick = () => {
    if (onCheckGarmentPrice) {
      onCheckGarmentPrice();
    } else if (onSelectService) {
      onSelectService('Dry Cleaning (Per Piece)', 'Garment Dry Clean');
    } else if (onOpenBooking) {
      onOpenBooking('Dry Cleaning');
    }
  };

  return (
    <section className="p-3.5 sm:p-5 py-4 sm:py-5 bg-[#FAF8F5] border-b border-[#ECE0C6]" id="core-services-section">
      {/* 1. Header matching Reference Photo 2 */}
      <div className="mb-3.5">
        <h2 className="font-heading text-[22px] sm:text-[24px] font-black text-[#142A20] leading-tight">
          Choose the service you need
        </h2>
        <p className="text-[12px] sm:text-[12.5px] text-[#4E6357] leading-relaxed mt-1">
          Everyday laundry, garment-specific dry cleaning and selected home-textile services—all with free pickup and delivery for eligible locations.
        </p>
      </div>

      {/* 2. 2x2 Grid of 4 Service Cards */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
        {/* Card 1: Wash & Fold */}
        <div
          onClick={() => handleSelect('Wash & Fold — ₹109/kg', 'Everyday Laundry (Per Kg)')}
          className="bg-white rounded-2xl p-3 sm:p-4 border border-[#E5ECE7] hover:border-[#008f51] shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer group active:scale-[0.99]"
        >
          <div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#E6F4EA] flex items-center justify-center text-[#0f5132] group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2a3 3 0 0 0-3 3c0 .87.37 1.66.97 2.21A3.5 3.5 0 0 0 7 10.5 3.5 3.5 0 0 0 10.5 14c.26 0 .5-.03.75-.08L11 21a1 1 0 0 0 2 0l-.25-7.08c.25.05.49.08.75.08a3.5 3.5 0 0 0 3.5-3.5 3.5 3.5 0 0 0-2.97-3.29C14.63 6.66 15 5.87 15 5a3 3 0 0 0-3-3z"/>
              </svg>
            </div>
            <h3 className="font-heading font-black text-[15px] sm:text-[16px] text-[#142A20] leading-snug mt-2.5 sm:mt-3">
              Wash &amp; Fold
            </h3>
            <div className="font-heading font-black text-[18px] sm:text-[20px] text-[#0f5132] tracking-tight mt-1 mb-1.5">
              ₹109<span className="text-[12px] sm:text-[13px] font-bold text-[#55695D]">/kg</span>
            </div>
            <p className="text-[11px] sm:text-[11.5px] text-[#55695D] leading-snug mb-3">
              Everyday laundry, washed and folded.
            </p>
          </div>
          <div className="pt-2 mt-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSelect('Wash & Fold — ₹109/kg', 'Everyday Laundry (Per Kg)');
              }}
              className="btn-splash-shine group/btn w-full h-8 sm:h-8.5 px-2 rounded-xl bg-gradient-to-r from-[#005e34] via-[#009252] to-[#014d2b] hover:from-[#004d2c] hover:via-[#008f51] hover:to-[#004225] text-white font-heading font-black text-[9.5px] sm:text-[10.5px] uppercase tracking-wider flex items-center justify-center gap-1 sm:gap-1.5 border border-[#34d399]/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_3px_10px_rgba(0,143,81,0.28)] hover:shadow-[0_4px_16px_rgba(0,143,81,0.48)] active:scale-95 transition-all cursor-pointer"
            >
              <span className="relative z-10 font-black">ORDER THIS SERVICE</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white relative z-10 group-hover/btn:translate-x-1 transition-transform duration-300 shrink-0" />
            </button>
          </div>
        </div>

        {/* Card 2: Wash & Iron */}
        <div
          onClick={() => handleSelect('Wash & Steam Iron — ₹149/kg', 'Steam Pressed Laundry')}
          className="bg-white rounded-2xl p-3 sm:p-4 border border-[#E5ECE7] hover:border-[#008f51] shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer group active:scale-[0.99]"
        >
          <div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#E6F4EA] flex items-center justify-center text-[#0f5132] group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2a3 3 0 0 0-3 3c0 .87.37 1.66.97 2.21A3.5 3.5 0 0 0 7 10.5 3.5 3.5 0 0 0 10.5 14c.26 0 .5-.03.75-.08L11 21a1 1 0 0 0 2 0l-.25-7.08c.25.05.49.08.75.08a3.5 3.5 0 0 0 3.5-3.5 3.5 3.5 0 0 0-2.97-3.29C14.63 6.66 15 5.87 15 5a3 3 0 0 0-3-3z"/>
              </svg>
            </div>
            <h3 className="font-heading font-black text-[15px] sm:text-[16px] text-[#142A20] leading-snug mt-2.5 sm:mt-3">
              Wash &amp; Iron
            </h3>
            <div className="font-heading font-black text-[18px] sm:text-[20px] text-[#0f5132] tracking-tight mt-1 mb-1.5">
              ₹149<span className="text-[12px] sm:text-[13px] font-bold text-[#55695D]">/kg</span>
            </div>
            <p className="text-[11px] sm:text-[11.5px] text-[#55695D] leading-snug mb-3">
              Laundry washed and ironed.
            </p>
          </div>
          <div className="pt-2 mt-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSelect('Wash & Steam Iron — ₹149/kg', 'Steam Pressed Laundry');
              }}
              className="btn-splash-shine group/btn w-full h-8 sm:h-8.5 px-2 rounded-xl bg-gradient-to-r from-[#005e34] via-[#009252] to-[#014d2b] hover:from-[#004d2c] hover:via-[#008f51] hover:to-[#004225] text-white font-heading font-black text-[9.5px] sm:text-[10.5px] uppercase tracking-wider flex items-center justify-center gap-1 sm:gap-1.5 border border-[#34d399]/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_3px_10px_rgba(0,143,81,0.28)] hover:shadow-[0_4px_16px_rgba(0,143,81,0.48)] active:scale-95 transition-all cursor-pointer"
            >
              <span className="relative z-10 font-black">ORDER THIS SERVICE</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white relative z-10 group-hover/btn:translate-x-1 transition-transform duration-300 shrink-0" />
            </button>
          </div>
        </div>

        {/* Card 3: Dry Cleaning */}
        <div
          onClick={handleRateClick}
          className="bg-white rounded-2xl p-3 sm:p-4 border border-[#E5ECE7] hover:border-[#008f51] shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer group active:scale-[0.99]"
        >
          <div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#E6F4EA] flex items-center justify-center text-[#0f5132] group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2L14.2 9.8L22 12L14.2 14.2L12 22L9.8 14.2L2 12L9.8 9.8L12 2Z"/>
              </svg>
            </div>
            <h3 className="font-heading font-black text-[15px] sm:text-[16px] text-[#142A20] leading-snug mt-2.5 sm:mt-3">
              Dry Cleaning
            </h3>
            <div className="font-heading font-black text-[18px] sm:text-[20px] text-[#0f5132] tracking-tight mt-1 mb-1.5">
              From ₹149
            </div>
            <p className="text-[11px] sm:text-[11.5px] text-[#55695D] leading-snug mb-3">
              Per item; final price depends on garment.
            </p>
          </div>
          <div className="pt-2 mt-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRateClick();
              }}
              className="btn-splash-shine group/btn w-full h-8 sm:h-8.5 px-2 rounded-xl bg-gradient-to-r from-[#005e34] via-[#009252] to-[#014d2b] hover:from-[#004d2c] hover:via-[#008f51] hover:to-[#004225] text-white font-heading font-black text-[9.5px] sm:text-[10.5px] uppercase tracking-wider flex items-center justify-center gap-1 sm:gap-1.5 border border-[#34d399]/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_3px_10px_rgba(0,143,81,0.28)] hover:shadow-[0_4px_16px_rgba(0,143,81,0.48)] active:scale-95 transition-all cursor-pointer"
            >
              <span className="relative z-10 font-black">CHECK GARMENT PRICE</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white relative z-10 group-hover/btn:translate-x-1 transition-transform duration-300 shrink-0" />
            </button>
          </div>
        </div>

        {/* Card 4: Home Textiles */}
        <div
          onClick={() => handleSelect('Home Textiles & Upholstery Care', 'Carpets & Lining Curtains')}
          className="bg-white rounded-2xl p-3 sm:p-4 border border-[#E5ECE7] hover:border-[#008f51] shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer group active:scale-[0.99]"
        >
          <div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#E6F4EA] flex items-center justify-center text-[#0f5132] group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 stroke-current fill-none stroke-[2.2] stroke-linecap-round stroke-linejoin-round" viewBox="0 0 24 24">
                <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
              </svg>
            </div>
            <h3 className="font-heading font-black text-[15px] sm:text-[16px] text-[#142A20] leading-snug mt-2.5 sm:mt-3">
              Home Textiles
            </h3>
            <div className="font-heading font-black text-[18px] sm:text-[20px] text-[#0f5132] tracking-tight mt-1 mb-1.5">
              From ₹30<span className="text-[12px] sm:text-[13px] font-bold text-[#55695D]">/sq. ft.</span>
            </div>
            <p className="text-[11px] sm:text-[11.5px] text-[#55695D] leading-snug mb-3">
              Carpets ₹30/sq. ft. &middot; Lining curtains ₹45/sq. ft.
            </p>
          </div>
          <div className="pt-2 mt-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSelect('Home Textiles & Upholstery Care', 'Carpets & Lining Curtains');
              }}
              className="btn-splash-shine group/btn w-full h-8 sm:h-8.5 px-2 rounded-xl bg-gradient-to-r from-[#005e34] via-[#009252] to-[#014d2b] hover:from-[#004d2c] hover:via-[#008f51] hover:to-[#004225] text-white font-heading font-black text-[9.5px] sm:text-[10.5px] uppercase tracking-wider flex items-center justify-center gap-1 sm:gap-1.5 border border-[#34d399]/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_3px_10px_rgba(0,143,81,0.28)] hover:shadow-[0_4px_16px_rgba(0,143,81,0.48)] active:scale-95 transition-all cursor-pointer"
            >
              <span className="relative z-10 font-black">REQUEST SERVICE</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white relative z-10 group-hover/btn:translate-x-1 transition-transform duration-300 shrink-0" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Disclaimer Footer Note matching Photo 2 */}
      <p className="text-[11px] sm:text-[11.5px] text-[#697970] leading-relaxed mt-3.5 px-0.5">
        Final garment prices, measurements, service availability and order charges are confirmed before processing.
      </p>
    </section>
  );
}
