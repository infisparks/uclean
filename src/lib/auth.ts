'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from './firebase';

export const ADMIN_AUTH_KEY = 'uclean_admin_session_v1';

export interface AdminSession {
  email: string;
  name: string;
  role: 'admin';
  loggedInAt: number;
}

/**
 * Validates login inputs
 */
export function validateLoginInputs(email: string, pass: string): { isValid: boolean; error?: string } {
  if (!email || !email.trim()) {
    return { isValid: false, error: 'Please enter your Firebase Auth email address.' };
  }
  if (!email.includes('@')) {
    return { isValid: false, error: 'Please enter a valid email address (e.g. admin@uclean.in).' };
  }
  if (!pass || !pass.trim()) {
    return { isValid: false, error: 'Please enter your password.' };
  }
  if (pass.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters.' };
  }
  return { isValid: true };
}

/**
 * Checks if admin session exists in browser storage
 */
export function getStoredAdminSession(): AdminSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ADMIN_AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AdminSession;
    // Session validity: 7 days
    const MAX_AGE = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - parsed.loggedInAt > MAX_AGE) {
      localStorage.removeItem(ADMIN_AUTH_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Save admin session to localStorage and document.cookie
 */
export function setStoredAdminSession(session: AdminSession) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(session));
    document.cookie = `uclean_admin_auth=1; path=/; max-age=${7 * 24 * 3600}; SameSite=Lax`;
  } catch (err) {
    console.error('Failed to save session:', err);
  }
}

/**
 * Clear admin session
 */
export function clearStoredAdminSession() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ADMIN_AUTH_KEY);
    document.cookie = 'uclean_admin_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
  } catch (err) {
    console.error('Failed to clear session:', err);
  }
}

/**
 * Admin Login Handler (Strict Firebase Authentication Only)
 */
export async function loginAdmin(
  email: string,
  pass: string
): Promise<{ success: boolean; error?: string; session?: AdminSession }> {
  const cleanEmail = email.trim();
  const cleanPass = pass.trim();

  const validation = validateLoginInputs(cleanEmail, cleanPass);
  if (!validation.isValid) {
    return { success: false, error: validation.error };
  }

  try {
    const userCred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
    const session: AdminSession = {
      email: userCred.user.email || cleanEmail,
      name: userCred.user.displayName || userCred.user.email?.split('@')[0] || 'Admin',
      role: 'admin',
      loggedInAt: Date.now(),
    };
    setStoredAdminSession(session);
    return { success: true, session };
  } catch (fbErr: any) {
    console.error('Firebase Auth sign in error:', fbErr);
    if (
      fbErr.code === 'auth/wrong-password' ||
      fbErr.code === 'auth/invalid-credential' ||
      fbErr.code === 'auth/user-not-found'
    ) {
      return {
        success: false,
        error: 'Invalid Firebase Auth email or password. Please verify your credentials.',
      };
    }
    if (fbErr.code === 'auth/invalid-email') {
      return {
        success: false,
        error: 'Invalid email address format.',
      };
    }
    if (fbErr.code === 'auth/too-many-requests') {
      return {
        success: false,
        error: 'Too many failed login attempts. Please wait a few moments and try again.',
      };
    }
    return {
      success: false,
      error: fbErr.message || 'Firebase authentication failed. Please check your credentials.',
    };
  }
}

/**
 * Admin Logout Handler
 */
export async function logoutAdmin(): Promise<void> {
  clearStoredAdminSession();
  try {
    await signOut(auth);
  } catch {
    // Ignore signout error
  }
}

/**
 * React Hook for Admin Authentication State & Route Guarding
 */
export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [session, setSession] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const checkAuth = useCallback(() => {
    // Check Firebase Auth state or stored session
    if (auth.currentUser) {
      const newSession: AdminSession = {
        email: auth.currentUser.email || 'admin',
        name: auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || 'Admin',
        role: 'admin',
        loggedInAt: Date.now(),
      };
      setStoredAdminSession(newSession);
      setIsAuthenticated(true);
      setSession(newSession);
      setLoading(false);
      return;
    }

    const current = getStoredAdminSession();
    if (current) {
      setIsAuthenticated(true);
      setSession(current);
      setLoading(false);
      return;
    }

    setIsAuthenticated(false);
    setSession(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();

    // Firebase Auth listener
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const newSession: AdminSession = {
          email: fbUser.email || 'admin',
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Admin',
          role: 'admin',
          loggedInAt: Date.now(),
        };
        setStoredAdminSession(newSession);
        setIsAuthenticated(true);
        setSession(newSession);
      }
      setLoading(false);
    });

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === ADMIN_AUTH_KEY) {
        checkAuth();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [checkAuth]);

  const handleLogout = async () => {
    await logoutAdmin();
    setIsAuthenticated(false);
    setSession(null);
  };

  return {
    isAuthenticated,
    session,
    loading,
    logout: handleLogout,
  };
}
