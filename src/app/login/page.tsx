'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAdminAuth, loginAdmin } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAdminAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // If already logged in, automatically redirect to /admin
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/admin');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }
    if (!password.trim()) {
      setError('Password is required.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await loginAdmin(email, password);
      if (result.success) {
        router.replace('/admin');
      } else {
        setError(result.error || 'Authentication failed. Please check your credentials.');
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred during login.');
    } finally {
      setSubmitting(false);
    }
  };

  // While checking existing session, show minimal loading state
  if (authLoading || isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F5F6F8] flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-medium text-[#6B7280]">Checking admin session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F6F8] flex flex-col justify-center items-center p-4 sm:p-6 font-sans antialiased text-[#111827]">
      
      {/* Container Card */}
      <div className="w-full max-w-[420px]">
        
        {/* Brand & Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold text-xl mb-3 shadow-sm ring-4 ring-indigo-50">
            U
          </div>
          <h1 className="text-[22px] font-bold text-[#111827] tracking-tight">
            Admin Portal Login
          </h1>
          <p className="text-[13px] text-[#6B7280] mt-1">
            UClean Nerul West &bull; Store Operations &amp; CRM
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-8 shadow-sm">
          
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[13px] flex items-start gap-2">
              <span className="shrink-0 text-base leading-none mt-0.5">⚠️</span>
              <span className="leading-snug">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Field 1: Email */}
            <div>
              <label className="block text-[12px] font-medium text-[#111827] mb-1.5">
                Admin Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full h-11 pl-3.5 pr-3.5 rounded-[8px] border border-[#E5E7EB] bg-white text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>
            </div>

            {/* Field 2: Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[12px] font-medium text-[#111827]">
                  Password <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full h-11 pl-3.5 pr-11 rounded-[8px] border border-[#E5E7EB] bg-white text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#111827] transition-colors p-1 cursor-pointer"
                  tabIndex={-1}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-[10px] bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-[14px] transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Admin Panel</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>
        </div>

        {/* Back Link */}
        <div className="text-center mt-5">
          <Link
            href="/"
            className="text-[13px] text-[#6B7280] hover:text-[#111827] transition-colors font-medium inline-flex items-center gap-1"
          >
            &larr; Back to UClean Customer Storefront
          </Link>
        </div>

      </div>

    </div>
  );
}
