import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'bookings.json');

const FIREBASE_RTDB_URL = 'https://uclean-1f6b2-default-rtdb.firebaseio.com/bookings';

// Ensure data directory and bookings.json exist
function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

// Fetch live bookings from Firebase RTDB with a strict timeout
async function fetchFirebaseBookings(): Promise<any[] | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);
  try {
    const res = await fetch(`${FIREBASE_RTDB_URL}.json`, {
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || typeof data !== 'object') return [];

    return Object.keys(data).map((key) => {
      const item = data[key];
      return {
        ...item,
        id: item.id || item.orderId || key,
        orderId: item.orderId || item.id || key,
      };
    });
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

export async function GET() {
  try {
    ensureDataFile();
    let localBookings: any[] = [];
    try {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      localBookings = JSON.parse(content || '[]');
    } catch {
      localBookings = [];
    }

    // Always fetch live from Firebase RTDB so newly added Firebase bookings are never missed
    const firebaseBookings = await fetchFirebaseBookings();

    if (firebaseBookings) {
      const map = new Map<string, any>();
      // 1. Load local cache
      for (const b of localBookings) {
        if (b && (b.id || b.orderId)) map.set(b.id || b.orderId, b);
      }
      // 2. Merge Firebase bookings
      for (const b of firebaseBookings) {
        if (b && (b.id || b.orderId)) {
          const id = b.id || b.orderId;
          const prev = map.get(id);
          map.set(id, prev ? { ...prev, ...b } : b);
        }
      }

      const merged = Array.from(map.values()).sort((a, b) => {
        const timeA = new Date(a.createdAt || a.timestamp || 0).getTime();
        const timeB = new Date(b.createdAt || b.timestamp || 0).getTime();
        return timeB - timeA;
      });

      // Synchronize back to local file so cache stays complete
      try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(merged, null, 2), 'utf-8');
      } catch (writeErr) {
        console.warn('Failed to update local cache:', writeErr);
      }

      return NextResponse.json({ success: true, bookings: merged });
    }

    // Fallback to local bookings if Firebase is unreachable
    return NextResponse.json({ success: true, bookings: localBookings });
  } catch (error) {
    console.error('Failed to read bookings:', error);
    return NextResponse.json({ success: false, bookings: [] }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    ensureDataFile();
    const newBooking = await req.json();

    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    const bookings = JSON.parse(content || '[]');

    // Check if duplicate by ID
    const existingIndex = bookings.findIndex((b: { id?: string }) => b.id === newBooking.id);
    if (existingIndex >= 0) {
      bookings[existingIndex] = { ...bookings[existingIndex], ...newBooking };
    } else {
      bookings.unshift({
        ...newBooking,
        createdAt: newBooking.createdAt || new Date().toISOString(),
      });
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify(bookings.slice(0, 500), null, 2), 'utf-8');
    return NextResponse.json({ success: true, booking: newBooking });
  } catch (error) {
    console.error('Failed to save booking:', error);
    return NextResponse.json(
      { success: false, message: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    ensureDataFile();
    const { id, status } = await req.json();

    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    const bookings = JSON.parse(content || '[]');

    const order = bookings.find((b: { id?: string; orderId?: string }) => b.id === id || b.orderId === id);
    if (order) {
      order.status = status;
      fs.writeFileSync(DATA_FILE, JSON.stringify(bookings, null, 2), 'utf-8');
      return NextResponse.json({ success: true, booking: order });
    }

    return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    ensureDataFile();
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const clearAll = url.searchParams.get('clearAll');

    if (clearAll === 'true') {
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
      return NextResponse.json({ success: true, message: 'All bookings cleared' });
    }

    if (id) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      let bookings = JSON.parse(content || '[]');
      bookings = bookings.filter((b: { id?: string; orderId?: string }) => b.id !== id && b.orderId !== id);
      fs.writeFileSync(DATA_FILE, JSON.stringify(bookings, null, 2), 'utf-8');
      return NextResponse.json({ success: true, message: 'Booking deleted' });
    }

    return NextResponse.json({ success: false, message: 'Missing id or clearAll parameter' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: (error as Error).message },
      { status: 500 }
    );
  }
}

