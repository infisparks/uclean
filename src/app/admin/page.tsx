'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CrmPortal } from '@/components/CrmPortal';
import { useAdminAuth } from '@/lib/auth';

export default function AdminPage() {
  const router = useRouter();
  const { isAuthenticated, loading, logout } = useAdminAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F5F6F8] flex flex-col items-center justify-center p-4 admin-poppins text-[#111827]">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-medium text-[#6B7280]">Verifying admin authorization...</p>
      </div>
    );
  }

  return (
    <CrmPortal
      onBackToStore={() => router.push('/')}
      onLogout={async () => {
        await logout();
        router.replace('/login');
      }}
    />
  );
}
