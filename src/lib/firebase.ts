import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import {
  getDatabase,
  ref,
  set,
  get,
  update,
  Database,
} from 'firebase/database';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';
import {
  sendWhatsAppMessage,
  generateBookingConfirmationTemplate,
  generateStoreAlertMessage,
} from './whatsapp';

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAnxsV_X4eyVnz2goQcLbvMkx05pstoYJM',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'uclean-1f6b2.firebaseapp.com',
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || 'https://uclean-1f6b2-default-rtdb.firebaseio.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'uclean-1f6b2',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'uclean-1f6b2.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '399010463552',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:399010463552:web:829fd71916b9f2f1d384a5',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-MTM1PSLT9J',
};

// Initialize Firebase App singleton
let app: FirebaseApp;
if (getApps().length > 0) {
  app = getApp();
} else {
  app = initializeApp(firebaseConfig);
}

// Initialize Firebase Auth
export const auth: Auth = getAuth(app);

// Initialize Firebase Realtime Database
export const rtdb: Database = getDatabase(app);

// Safe Client-side Analytics
let analyticsInstance: Analytics | null = null;
export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window !== 'undefined' && !analyticsInstance) {
    try {
      const supported = await isSupported();
      if (supported) {
        analyticsInstance = getAnalytics(app);
      }
    } catch (err) {
      console.warn('Firebase Analytics notice:', err);
    }
  }
  return analyticsInstance;
}

if (typeof window !== 'undefined') {
  getFirebaseAnalytics().catch(() => {});
}

export { app };

export interface BookingPayload {
  serviceType: 'pickup' | 'home-visit' | 'vip-membership' | 'general-inquiry' | string;
  tier?: 'Silver (₹5,000)' | 'Gold (₹7,000)' | 'Platinum (₹10,000)' | string;
  customerName: string;
  phone: string;
  address?: string;
  preferredDate?: string;
  preferredTimeSlot?: string;
  notes?: string;
  items?: { name: string; quantity: number; price: number }[] | string;
  totalEstimate?: number;
  status: 'new' | 'confirmed' | 'in-progress' | 'completed' | string;
  createdAt?: unknown;
}

/**
 * Saves a new customer order into Firebase Realtime Database & Local Storage
 * Immediately dispatches customer welcome WhatsApp confirmation
 */
export async function createBooking(
  payload: BookingPayload
): Promise<{ success: boolean; id: string; message: string; whatsappSent?: boolean }> {
  try {
    const bookingId = 'UC-' + Math.floor(26100 + Math.random() * 8000);
    const timestamp = new Date().toISOString();

    const bookingData = {
      ...payload,
      id: bookingId,
      orderId: bookingId,
      status: payload.status || 'New Request',
      createdAt: timestamp,
      timestamp,
      platform: 'web-mobile-app',
      locationServed: 'Nerul, Sector 6, Navi Mumbai',
    };

    // 1. Direct instant save to Firebase Realtime Database
    try {
      await set(ref(rtdb, `bookings/${bookingId}`), bookingData);
    } catch (rtdbErr) {
      console.warn('RTDB remote sync warning, persisting locally:', rtdbErr);
    }

    // 2. Also persist locally and sync to server backup
    saveLocalBooking(bookingData);
    if (typeof window !== 'undefined') {
      fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      }).catch(() => {});
    }

    // 3. Automated WhatsApp welcome confirmation to customer
    if (payload.phone) {
      const customerMsg = generateBookingConfirmationTemplate({
        customerName: payload.customerName,
        orderId: bookingId,
        address: payload.address || 'Nerul West',
        date: payload.preferredDate || 'Today / Earliest Available',
        time: payload.preferredTimeSlot || 'Standard Slot',
      });

      sendWhatsAppMessage(payload.phone, customerMsg).catch((err) =>
        console.warn('Customer WhatsApp send error:', err)
      );

      // Alert store manager
      const storePhone = process.env.NEXT_PUBLIC_STORE_NOTIFY_PHONE || '917400474132';
      const storeMsg = generateStoreAlertMessage({
        customerName: payload.customerName,
        phone: payload.phone,
        bookingId,
        serviceType: String(payload.serviceType),
        preferredDate: payload.preferredDate,
        preferredTimeSlot: payload.preferredTimeSlot,
        address: payload.address,
        notes: typeof payload.notes === 'string' ? payload.notes : undefined,
      });
      sendWhatsAppMessage(storePhone, storeMsg).catch(() => {});
    }

    return {
      success: true,
      id: bookingId,
      message: 'Your booking has been registered successfully with U CLEAN Nerul!',
      whatsappSent: true,
    };
  } catch (error) {
    console.error('Error creating booking:', error);
    return {
      success: false,
      id: '',
      message: 'Failed to record booking. Please connect via WhatsApp or Phone.',
    };
  }
}

function saveLocalBooking(data: Record<string, unknown>) {
  if (typeof window !== 'undefined') {
    try {
      const existing = JSON.parse(localStorage.getItem('uclean_local_bookings') || '[]');
      existing.unshift(data);
      localStorage.setItem('uclean_local_bookings', JSON.stringify(existing.slice(0, 50)));
    } catch (e) {
      console.warn('Local storage cache error:', e);
    }
  }
}
