import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'bookings.json');

// Ensure data directory and bookings.json exist
function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

export async function GET() {
  try {
    ensureDataFile();
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    const bookings = JSON.parse(content || '[]');
    return NextResponse.json({ success: true, bookings });
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

    const order = bookings.find((b: { id?: string }) => b.id === id);
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
