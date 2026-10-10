import React from 'react';

export function PromoTicker() {
  const tickerItems = [
    { icon: '🚚', text: 'Free Pickup & Delivery (Min ₹499)' },
    { icon: '⚡', text: '24–48 Hr Fast Delivery' },
    { icon: '🌿', text: '100% Eco-Friendly Detergents' },
    { icon: '👔', text: 'Crisp Italian Steam Ironing' },
    { icon: '✨', text: 'Germ-Free Deep Sanitization' },
  ];

  return (
    <div className="bg-[#072618] text-[#55fca7] py-2 px-0 border-b border-[#008f51]/40 overflow-hidden relative select-none">
      {/* Left/Right soft fade overlays */}
      <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#072618] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#072618] to-transparent z-10 pointer-events-none" />

      {/* Infinite Single-Line Continuous Moving Marquee */}
      <div className="animate-marquee flex items-center whitespace-nowrap">
        {/* Set 1 */}
        {tickerItems.map((item, idx) => (
          <div key={`set1-${idx}`} className="flex items-center gap-1.5 mx-4 text-[11.5px] font-extrabold tracking-wide text-[#a8f0cf]">
            <span>{item.icon}</span>
            <span>{item.text}</span>
            <span className="text-[#ffe57f] ml-3 text-xs">&bull;</span>
          </div>
        ))}

        {/* Set 2 (Duplicates for seamless infinite loop) */}
        {tickerItems.map((item, idx) => (
          <div key={`set2-${idx}`} className="flex items-center gap-1.5 mx-4 text-[11.5px] font-extrabold tracking-wide text-[#a8f0cf]">
            <span>{item.icon}</span>
            <span>{item.text}</span>
            <span className="text-[#ffe57f] ml-3 text-xs">&bull;</span>
          </div>
        ))}
      </div>
    </div>
  );
}
