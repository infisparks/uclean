'use client';

import React, { useState } from 'react';
import { CompactHero } from '@/components/CompactHero';
import { PromoTicker } from '@/components/PromoTicker';
import { ChooseServiceHorizontal } from '@/components/ChooseServiceHorizontal';
import { RateCardListSection } from '@/components/RateCardListSection';
import { HomeCareSection } from '@/components/HomeCareSection';
import { CoreLaundrySection } from '@/components/CoreLaundrySection';
import { MembershipCards } from '@/components/MembershipCards';
import { FooterStore } from '@/components/FooterStore';
import { CrmPortal } from '@/components/CrmPortal';
import { useRouter } from 'next/navigation';



export default function Home() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'store' | 'crm'>('store');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleOpenOrderForm = (service: string = 'Wash & Fold — ₹109/kg', garment: string = '') => {
    const params = new URLSearchParams();
    if (service) params.set('service', service);
    if (garment) params.set('garment', garment);
    router.push(`/order?${params.toString()}`);
  };

  const handleClaimMembership = (tier: string) => {
    const params = new URLSearchParams();
    params.set('service', `VIP Membership Claim (${tier})`);
    params.set('garment', `VIP ${tier} Tier Package`);
    router.push(`/order?${params.toString()}`);
  };

  const handleScrollToRateCard = () => {
    const el = document.getElementById('rate-list-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  if (viewMode === 'crm') {
    return <CrmPortal onBackToStore={() => setViewMode('store')} />;
  }

  return (
    <main className="app-container relative pb-6">

      {/* 1. Hero Section (Adjusted to Half Screen with Search Feature & Branding) */}
      <CompactHero
        onSearch={(q) => {
          setSearchQuery(q);
          if (q) {
            handleScrollToRateCard();
          }
        }}
        onExplore={() => {
          const el = document.getElementById('choose-service-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Promo Ticker */}
      <PromoTicker />

      {/* 2. Choose The Service You Need - Horizontal 1:1 Professional Cards */}
      <ChooseServiceHorizontal
        onSelectService={(srv, garment) => handleOpenOrderForm(srv, garment)}
        onCheckGarmentPrice={handleScrollToRateCard}
      />

      {/* 3. Third Section: Clean Rate Card List with Prominent ORDER NOW Button (Matching Screenshot 3) */}
      <RateCardListSection
        onOrderNow={(srv, item) => handleOpenOrderForm(srv, item)}
        searchFilter={searchQuery}
      />

      {/* 4. Fourth Section: Sofa & Curtain (Parda) Cleaning (Matching Screenshot 4) */}
      <HomeCareSection onOpenBooking={() => handleOpenOrderForm('Home Upholstery Care', 'Sofa & Curtain Deep Shampooing')} />

      {/* 5. Core Everyday Laundry Rates */}
      <CoreLaundrySection onOpenBooking={() => handleOpenOrderForm('Wash & Fold — ₹109/kg')} />

      {/* 6. VIP Membership Cards (Silver, Gold, Platinum In-Card Poster Styles) */}
      <MembershipCards onClaimMembership={handleClaimMembership} />

      {/* 7. Store Location & Contact Footer */}
      <FooterStore />


    </main>
  );
}
