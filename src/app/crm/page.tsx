'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CrmPortal } from '@/components/CrmPortal';

export default function CrmPage() {
  const router = useRouter();

  return <CrmPortal onBackToStore={() => router.push('/')} />;
}
