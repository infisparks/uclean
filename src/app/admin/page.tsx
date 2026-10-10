'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CrmPortal } from '@/components/CrmPortal';

export default function AdminPage() {
  const router = useRouter();

  return <CrmPortal onBackToStore={() => router.push('/')} />;
}
