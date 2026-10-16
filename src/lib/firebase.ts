import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import {
  getDatabase,
  ref,
  set,
  get,
  update,
  remove,
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
  serviceType: string;
  service?: string;
  services?: string[];
  selectedServices?: string[];
  tier?: 'Silver (₹5,000)' | 'Gold (₹7,000)' | 'Platinum (₹10,000)' | string;
  customerName: string;
  phone: string;
  address?: string;
  preferredDate?: string;
  preferredTimeSlot?: string;
  quantity?: string;
  items?: { name: string; quantity: number; price: number }[] | string;
  contactPreference?: string;
  customerNotes?: string;
  notes?: string;
  totalEstimate?: number;
  total?: string;
  qty?: string;
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

    const servicesList =
      payload.services ||
      payload.selectedServices ||
      (payload.service ? [payload.service] : (payload.serviceType ? [payload.serviceType] : []));
    const serviceName =
      payload.service ||
      (servicesList.length > 0 ? servicesList.join(', ') : payload.serviceType) ||
      'Laundry Service';

    const bookingData = {
      ...payload,
      id: bookingId,
      orderId: bookingId,
      service: serviceName,
      serviceType: serviceName,
      services: servicesList,
      quantity: payload.quantity || '',
      qty: payload.qty || payload.quantity || '',
      total: payload.total || (payload.totalEstimate ? `₹${payload.totalEstimate}` : 'To confirm'),
      items: typeof payload.items === 'string' ? payload.items : '',
      contactPreference: payload.contactPreference || 'WhatsApp',
      notes: payload.notes || payload.customerNotes || '',
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

    // 2. Also persist locally in browser storage
    saveLocalBooking(bookingData);

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

      const storePhone =
        process.env.STORE_NOTIFY_PHONE ||
        process.env.NEXT_PUBLIC_STORE_NOTIFY_PHONE ||
        '918369298947';
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

export function getDeletedOrderIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem('uclean_deleted_order_ids');
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

export function deleteLocalBooking(orderId: string) {
  if (typeof window === 'undefined' || !orderId) return;
  try {
    const cleanId = orderId.replace(/^#/, '');
    const existing = JSON.parse(localStorage.getItem('uclean_local_bookings') || '[]');
    if (Array.isArray(existing)) {
      const updated = existing.filter(
        (b: any) =>
          b &&
          b.id !== orderId &&
          b.id !== cleanId &&
          b.orderId !== orderId &&
          b.orderId !== cleanId
      );
      localStorage.setItem('uclean_local_bookings', JSON.stringify(updated));
    }
    const set = getDeletedOrderIds();
    set.add(orderId);
    set.add(cleanId);
    localStorage.setItem('uclean_deleted_order_ids', JSON.stringify(Array.from(set)));
  } catch (e) {
    console.warn('Local storage delete warning:', e);
  }
}

export async function deleteBooking(orderId: string): Promise<boolean> {
  if (!orderId) return false;
  const cleanId = orderId.replace(/^#/, '');

  // 1. Immediately delete from local cache & blacklist from reloading
  deleteLocalBooking(orderId);
  deleteLocalBooking(cleanId);

  // 2. Erase permanently from Firebase Realtime Database
  try {
    // Delete direct keys
    await remove(ref(rtdb, `bookings/${cleanId}`)).catch(() => {});
    if (orderId !== cleanId) {
      await remove(ref(rtdb, `bookings/${orderId}`)).catch(() => {});
    }

    // Scan bookings root to catch any node created with custom/push key
    const snap = await get(ref(rtdb, 'bookings')).catch(() => null);
    if (snap && snap.exists()) {
      const val = snap.val();
      for (const k of Object.keys(val)) {
        const item = val[k];
        if (
          k === cleanId ||
          k === orderId ||
          item?.id === cleanId ||
          item?.id === orderId ||
          item?.orderId === cleanId ||
          item?.orderId === orderId
        ) {
          await remove(ref(rtdb, `bookings/${k}`)).catch(() => {});
        }
      }
    }
    return true;
  } catch (err) {
    console.error('deleteBooking RTDB error:', err);
    return false;
  }
}

