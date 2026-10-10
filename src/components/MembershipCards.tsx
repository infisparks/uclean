'use client';

import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface MembershipCardsProps {
  onClaimMembership: (tier: 'Silver (₹5,000)' | 'Gold (₹7,000)' | 'Platinum (₹10,000)') => void;
}

export function MembershipCards({ onClaimMembership }: MembershipCardsProps) {
  const [activeTier, setActiveTier] = useState<'silver' | 'gold' | 'platinum'>('gold');

  return (
    <section className="p-[28px_14px] bg-[#FAF6EE] border-t border-b border-[#ECE0C6] relative" id="membership">
      {/* Top Header */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <div className="w-[22px] h-[22px] bg-[#008f51] text-white rounded-[6px] font-heading font-black text-[15px] flex items-center justify-center leading-none">
            U
          </div>
          <span className="font-heading text-[17px] font-black text-[#008f51] tracking-wide">
            CLEAN
          </span>
        </div>
        <div className="text-[8.5px] font-extrabold text-[#0c3322] tracking-[1.5px] flex items-center justify-center gap-[3px]">
          <span>WE</span>
          <svg className="w-[11px] h-[11px] fill-[#008f51]" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <span>LAUNDRY</span>
        </div>
        <h2 className="font-heading text-[24px] font-black tracking-[1.5px] text-[#0c2b1e] uppercase mt-1.5 leading-tight">
          MEMBERSHIP CARD
        </h2>
        <div className="text-[9.5px] font-extrabold tracking-[2px] text-[#632608] uppercase mt-1">
          MORE CARE &bull; MORE VALUE &bull; FOR YOU
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-[#ECE0C6] rounded-full p-1 gap-1 my-4 border border-[#DECBB0]">
        <button
          onClick={() => setActiveTier('silver')}
          className={`flex-1 py-2 px-1 rounded-full font-heading text-[12px] font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1 ${
            activeTier === 'silver'
              ? 'bg-white text-[#632608] shadow-[0_3px_10px_rgba(99,38,8,0.15)]'
              : 'text-[#632608] hover:bg-white/40'
          }`}
        >
          🥈 Silver (₹5K)
        </button>

        <button
          onClick={() => setActiveTier('gold')}
          className={`flex-1 py-2 px-1 rounded-full font-heading text-[12px] font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1 ${
            activeTier === 'gold'
              ? 'bg-white text-[#632608] shadow-[0_3px_10px_rgba(99,38,8,0.15)]'
              : 'text-[#632608] hover:bg-white/40'
          }`}
        >
          🥇 Gold (₹7K) ⭐
        </button>

        <button
          onClick={() => setActiveTier('platinum')}
          className={`flex-1 py-2 px-1 rounded-full font-heading text-[12px] font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1 ${
            activeTier === 'platinum'
              ? 'bg-white text-[#632608] shadow-[0_3px_10px_rgba(99,38,8,0.15)]'
              : 'text-[#632608] hover:bg-white/40'
          }`}
        >
          👑 Platinum (₹10K)
        </button>
      </div>

      {/* 1. SILVER VIP CARD */}
      {activeTier === 'silver' && (
        <div className="theme-silver-card card-sheen rounded-[24px] p-[20px_16px_18px_16px] relative shadow-[0_18px_45px_rgba(148,163,184,0.25)] animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center mb-3.5 relative z-10">
            <div className="flex items-center gap-1.5 bg-white/95 px-3 py-1.5 rounded-[10px] shadow-sm">
              <div className="w-[22px] h-[22px] bg-[#008f51] rounded-[6px] flex items-center justify-center">
                <span className="font-heading text-[15px] font-black text-white">U</span>
              </div>
              <span className="font-heading text-[17px] font-black text-[#008f51]">CLEAN</span>
            </div>

            <div className="flex flex-col items-center text-center">
              <svg className="w-6 h-6 fill-[#334155] -mb-1" viewBox="0 0 24 24">
                <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5m14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
              </svg>
              <span className="font-heading text-[20px] font-black italic text-[#1e293b] leading-none tracking-tight">
                Silver
              </span>
              <span className="text-[7.5px] font-extrabold tracking-[1.5px] uppercase opacity-90 text-[#334155]">
                MEMBERSHIP
              </span>
            </div>

            <div className="font-heading text-[10px] font-extrabold tracking-wide uppercase px-3 py-1 rounded-full whitespace-nowrap bg-[#0f291e] text-[#55fca7] shadow-sm">
              Starter VIP
            </div>
          </div>

          {/* Hero Value */}
          <div className="bg-[#0f291e] text-[#55fca7] rounded-[16px] p-[12px_14px] text-center mb-3 relative z-10 shadow-md">
            <div className="font-heading text-[16.5px] font-black tracking-wide text-white">
              PAY ₹5,000 &rarr; GET ₹5,500+ VALUE
            </div>
            <div className="text-[11px] font-bold text-[#a8dec4] mt-0.5">
              Prepaid Balance + Free Extra Benefits Included
            </div>
          </div>

          {/* Benefits Box */}
          <div className="bg-white/95 rounded-[18px] p-[12px_14px] mb-3 relative z-10 flex flex-col gap-2.5 shadow-sm">
            <BenefitRow icon="💰" name="₹5,000 Laundry Wallet" desc="100% usable on all laundry & dry cleaning" pill="₹5,000" pillBg="bg-[#0f291e] text-white" />
            <BenefitRow icon="🎁" name="₹500 Bonus Credit" desc="Instant free extra wallet value added" pill="+₹500" pillBg="bg-[#0f291e] text-[#55fca7]" />
            <BenefitRow icon="👔" name="5× Free Steam Ironing" desc="Crisp wrinkle-free pressing included" pill="×5 Free" pillBg="bg-[#0f291e] text-white" />
            <BenefitRow icon="🚚" name="5× Free Pickup & Delivery" desc="Free doorstep pickup & delivery" pill="×5 Free" pillBg="bg-[#0f291e] text-white" />
            <BenefitRow icon="🏷️" name="5% Flat Discount" desc="Applicable across all additional services" pill="5% OFF" pillBg="bg-[#0f291e] text-white" />
            <BenefitRow icon="⚡" name="Priority Order Processing" desc="Fast turnaround & priority customer support" pill="VIP" pillBg="bg-[#0f291e] text-[#55fca7]" />
          </div>

          {/* Bottom Action */}
          <div className="flex flex-col gap-2 relative z-10">
            <div className="text-center text-[11.5px] font-extrabold p-1.5 rounded-[10px] bg-black/10 text-[#1e293b]">
              📅 Validity: 1 Month from Activation
            </div>
            <button
              onClick={() => onClaimMembership('Silver (₹5,000)')}
              className="w-full h-12 rounded-full bg-[#0f291e] hover:bg-[#072618] text-white font-extrabold text-[13px] sm:text-[14px] shadow-lg flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all"
            >
              <Sparkles className="w-4 h-4 text-[#55fca7] shrink-0" />
              <span>Claim Silver VIP &bull; ₹5,000</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. GOLD VIP CARD (Most Popular) */}
      {activeTier === 'gold' && (
        <div className="theme-gold-card card-sheen rounded-[24px] p-[20px_16px_18px_16px] relative shadow-[0_18px_45px_rgba(180,83,9,0.3)] animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center mb-3.5 relative z-10">
            <div className="flex items-center gap-1.5 bg-white/95 px-3 py-1.5 rounded-[10px] shadow-sm">
              <div className="w-[22px] h-[22px] bg-[#008f51] rounded-[6px] flex items-center justify-center">
                <span className="font-heading text-[15px] font-black text-white">U</span>
              </div>
              <span className="font-heading text-[17px] font-black text-[#008f51]">CLEAN</span>
            </div>

            <div className="flex flex-col items-center text-center">
              <svg className="w-6 h-6 fill-[#632608] -mb-1" viewBox="0 0 24 24">
                <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5m14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
              </svg>
              <span className="font-heading text-[20px] font-black italic text-[#3d2303] leading-none tracking-tight">
                Gold
              </span>
              <span className="text-[7.5px] font-extrabold tracking-[1.5px] uppercase opacity-90 text-[#632608]">
                MEMBERSHIP
              </span>
            </div>

            <div className="font-heading text-[10px] font-extrabold tracking-wide uppercase px-3 py-1 rounded-full whitespace-nowrap bg-[#632608] text-[#fde68a] shadow-sm">
              ⭐ Most Popular
            </div>
          </div>

          {/* Hero Value */}
          <div className="bg-[#632608] text-[#fde68a] rounded-[16px] p-[12px_14px] text-center mb-3 relative z-10 shadow-md">
            <div className="font-heading text-[16.5px] font-black tracking-wide text-[#ffe57f]">
              PAY ₹7,000 &rarr; GET ₹8,000+ VALUE
            </div>
            <div className="text-[11px] font-bold text-[#fde68a]/90 mt-0.5">
              Prepaid Balance + Free Extra Benefits Included
            </div>
          </div>

          {/* Benefits Box */}
          <div className="bg-white/95 rounded-[18px] p-[12px_14px] mb-3 relative z-10 flex flex-col gap-2.5 shadow-sm">
            <BenefitRow icon="💰" name="₹7,000 Laundry Wallet" desc="100% usable on all laundry & dry cleaning" pill="₹7,000" pillBg="bg-[#632608] text-[#fde68a]" />
            <BenefitRow icon="🎁" name="₹1,000 Bonus Credit" desc="Instant free extra wallet value added" pill="+₹1,000" pillBg="bg-[#632608] text-[#fde68a]" />
            <BenefitRow icon="👔" name="10× Free Steam Ironing" desc="Crisp wrinkle-free pressing included" pill="×10 Free" pillBg="bg-[#632608] text-[#fde68a]" />
            <BenefitRow icon="🚚" name="10× Free Pickup & Delivery" desc="Free doorstep pickup & delivery" pill="×10 Free" pillBg="bg-[#632608] text-[#fde68a]" />
            <BenefitRow icon="🏷️" name="10% Flat Discount" desc="Applicable across all additional services" pill="10% OFF" pillBg="bg-[#632608] text-[#fde68a]" />
            <BenefitRow icon="👟" name="1× Free Shoe Cleaning / Spa" desc="Deep cleaning & sole conditioning included" pill="1 Free" pillBg="bg-[#632608] text-[#fde68a]" />
            <BenefitRow icon="⚡" name="Priority VIP Order Handling" desc="Express turnaround & dedicated support" pill="VIP" pillBg="bg-[#632608] text-[#fde68a]" />
          </div>

          {/* Bottom Action */}
          <div className="flex flex-col gap-2 relative z-10">
            <div className="text-center text-[11.5px] font-extrabold p-1.5 rounded-[10px] bg-black/10 text-[#3d2303]">
              📅 Validity: 1 Month from Activation
            </div>
            <button
              onClick={() => onClaimMembership('Gold (₹7,000)')}
              className="w-full h-12 rounded-full bg-[#632608] hover:bg-[#4a1c06] text-white font-extrabold text-[13px] sm:text-[14px] shadow-lg flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all"
            >
              <Sparkles className="w-4 h-4 text-[#ffe57f] shrink-0" />
              <span>Claim Gold VIP &bull; ₹7,000</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. PLATINUM VIP CARD */}
      {activeTier === 'platinum' && (
        <div className="theme-platinum-card card-sheen rounded-[24px] p-[20px_16px_18px_16px] relative shadow-[0_18px_45px_rgba(0,0,0,0.45)] animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center mb-3.5 relative z-10">
            <div className="flex items-center gap-1.5 bg-white/15 border border-[#d4af37]/40 px-3 py-1.5 rounded-[10px] shadow-sm">
              <div className="w-[22px] h-[22px] bg-[#008f51] rounded-[6px] flex items-center justify-center">
                <span className="font-heading text-[15px] font-black text-white">U</span>
              </div>
              <span className="font-heading text-[17px] font-black text-white">CLEAN</span>
            </div>

            <div className="flex flex-col items-center text-center">
              <svg className="w-6 h-6 fill-[#ffd700] -mb-1" viewBox="0 0 24 24">
                <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5m14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
              </svg>
              <span className="font-heading text-[20px] font-black italic text-[#ffd700] leading-none tracking-tight">
                Platinum
              </span>
              <span className="text-[7.5px] font-extrabold tracking-[1.5px] uppercase opacity-90 text-[#cbd5e1]">
                MEMBERSHIP
              </span>
            </div>

            <div className="font-heading text-[10px] font-extrabold tracking-wide uppercase px-3 py-1 rounded-full whitespace-nowrap bg-gradient-to-r from-[#ffd700] to-[#d4af37] text-[#0f172a] shadow-sm">
              👑 VIP Elite
            </div>
          </div>

          {/* Hero Value */}
          <div className="bg-gradient-to-r from-[#1e293b] to-[#090d16] border border-[#d4af37] text-[#ffd700] rounded-[16px] p-[12px_14px] text-center mb-3 relative z-10 shadow-md">
            <div className="font-heading text-[16.5px] font-black tracking-wide text-[#ffe57f]">
              PAY ₹10,000 &rarr; GET ₹11,500+ VALUE
            </div>
            <div className="text-[11px] font-bold text-[#fde68a]/90 mt-0.5">
              Prepaid Balance + Free Extra Benefits Included
            </div>
          </div>

          {/* Benefits Box */}
          <div className="bg-[#0f172a]/90 border border-white/10 rounded-[18px] p-[12px_14px] mb-3 relative z-10 flex flex-col gap-2.5 shadow-sm text-white">
            <BenefitRow icon="💰" name="₹10,000 Laundry Wallet" desc="100% usable on all laundry & dry cleaning" pill="₹10,000" pillBg="bg-[#d4af37] text-[#0f172a]" isDark />
            <BenefitRow icon="🎁" name="₹1,500 Bonus Credit" desc="Instant free extra wallet value added" pill="+₹1,500" pillBg="bg-[#d4af37] text-[#0f172a]" isDark />
            <BenefitRow icon="👔" name="15× Free Steam Ironing" desc="Crisp wrinkle-free pressing included" pill="×15 Free" pillBg="bg-[#d4af37] text-[#0f172a]" isDark />
            <BenefitRow icon="🚚" name="15× Free Pickup & Delivery" desc="Free doorstep pickup & delivery" pill="×15 Free" pillBg="bg-[#d4af37] text-[#0f172a]" isDark />
            <BenefitRow icon="🏷️" name="15% Flat Discount" desc="Applicable across all additional services" pill="15% OFF" pillBg="bg-[#d4af37] text-[#0f172a]" isDark />
            <BenefitRow icon="👟" name="2× Free Shoe Cleaning / Spa" desc="Deep cleaning & sole conditioning included" pill="×2 Free" pillBg="bg-[#d4af37] text-[#0f172a]" isDark />
            <BenefitRow icon="🛏️" name="1× Free Blanket / Quilt Care" desc="Deep sanitization & protective packaging" pill="1 Free" pillBg="bg-[#d4af37] text-[#0f172a]" isDark />
            <BenefitRow icon="⚡" name="Priority Concierge & Express Slots" desc="Fastest turnaround & dedicated executive support" pill="VIP" pillBg="bg-[#d4af37] text-[#0f172a]" isDark />
          </div>

          {/* Bottom Action */}
          <div className="flex flex-col gap-2 relative z-10">
            <div className="text-center text-[11.5px] font-extrabold p-1.5 rounded-[10px] bg-white/10 text-[#cbd5e1]">
              📅 Validity: 1 Month from Activation
            </div>
            <button
              onClick={() => onClaimMembership('Platinum (₹10,000)')}
              className="w-full h-12 rounded-full bg-gradient-to-r from-[#ffd700] to-[#d4af37] text-[#0f172a] font-extrabold text-[13px] sm:text-[14px] shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
            >
              <Sparkles className="w-4 h-4 text-[#0f172a] shrink-0" />
              <span>Claim Platinum VIP &bull; ₹10,000</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function BenefitRow({
  icon,
  name,
  desc,
  pill,
  pillBg,
  isDark,
}: {
  icon: string;
  name: string;
  desc: string;
  pill: string;
  pillBg: string;
  isDark?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2.5 pb-2 border-b border-black/5 last:border-b-0 last:pb-0">
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-sm shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <span className={`text-[13px] font-bold leading-tight block ${isDark ? 'text-white' : 'text-[#0b2b1d]'}`}>
            {name}
          </span>
          <span className={`text-[10.5px] block ${isDark ? 'text-[#94a3b8]' : 'text-[#64748b]'}`}>
            {desc}
          </span>
        </div>
      </div>
      <span className={`font-heading text-[11px] font-extrabold px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0 ${pillBg}`}>
        {pill}
      </span>
    </div>
  );
}
