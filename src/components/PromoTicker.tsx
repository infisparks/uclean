import React from 'react';

export function PromoTicker() {
  const tickerItems = [
    { text: 'Free pickup' },
    { text: 'Free delivery' },
    { text: 'Clear service pricing' },
  ];

  // Repeat items to fill marquee width seamlessly
  const displayItems = [...tickerItems, ...tickerItems, ...tickerItems];

  return (
    <div className="bg-[#072618] text-[#55fca7] py-2 px-0 border-b border-[#008f51]/40 overflow-hidden relative select-none">
      {/* Left/Right soft fade overlays */}
      <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#072618] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#072618] to-transparent z-10 pointer-events-none" />

      {/* Infinite Single-Line Continuous Moving Marquee */}
      <div className="animate-marquee flex items-center whitespace-nowrap">
        {/* Set 1 */}
        {displayItems.map((item, idx) => (
          <div key={`set1-${idx}`} className="flex items-center gap-1.5 mx-4 text-[12px] font-extrabold tracking-wide text-[#a8f0cf]">
            <span className="text-[#55fca7] font-black">✓</span>
            <span className="text-[#e6fbf1]">{item.text}</span>
            <span className="text-[#ffe57f] ml-3 text-xs">&bull;</span>
          </div>
        ))}

        {/* Set 2 (Duplicates for seamless infinite loop) */}
        {displayItems.map((item, idx) => (
          <div key={`set2-${idx}`} className="flex items-center gap-1.5 mx-4 text-[12px] font-extrabold tracking-wide text-[#a8f0cf]">
            <span className="text-[#55fca7] font-black">✓</span>
            <span className="text-[#e6fbf1]">{item.text}</span>
            <span className="text-[#ffe57f] ml-3 text-xs">&bull;</span>
          </div>
        ))}
      </div>
    </div>
  );
}
