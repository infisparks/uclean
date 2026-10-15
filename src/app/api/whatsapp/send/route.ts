import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// In-memory rate limiting to prevent spam / gateway flooding
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string, limit = 30, windowMs = 60000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count++;
  return true;
}

export async function POST(req: Request) {
  try {
    // 1. IP-based rate limiting
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown-client';

    if (!checkRateLimit(ip, 30, 60000)) {
      return NextResponse.json(
        { success: false, message: 'Too many requests. Please wait a minute.' },
        { status: 429 }
      );
    }

    // 2. Body parsing and validation
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid JSON request payload.' },
        { status: 400 }
      );
    }

    const { number, text } = body || {};

    if (!number || !text || typeof text !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Phone number and message text are required.' },
        { status: 400 }
      );
    }

    // Text length cap to prevent oversized payloads
    const sanitizedText = text.trim();
    if (sanitizedText.length === 0 || sanitizedText.length > 4000) {
      return NextResponse.json(
        { success: false, message: 'Message text must be between 1 and 4000 characters.' },
        { status: 400 }
      );
    }

    // 3. Format phone number to clean digits (e.g. 10 digit Indian number gets 91 prepended)
    let cleanedNumber = String(number).replace(/\D/g, '');
    if (cleanedNumber.length === 10) {
      cleanedNumber = '91' + cleanedNumber;
    } else if (cleanedNumber.length === 11 && cleanedNumber.startsWith('0')) {
      cleanedNumber = '91' + cleanedNumber.slice(1);
    }

    if (!/^\d{10,15}$/.test(cleanedNumber)) {
      return NextResponse.json(
        { success: false, message: 'Invalid phone number format.' },
        { status: 400 }
      );
    }

    // 4. Secure Gateway API dispatch
    const apiUrl =
      process.env.WHATSAPP_API_URL ||
      'https://evo.infispark.in/message/sendText/mudassir';
    const apiKey =
      process.env.WHATSAPP_API_KEY ||
      'vR39h6avY69g7kAU3YQbS6V6XEvudson';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: apiKey,
      },
      body: JSON.stringify({
        number: cleanedNumber,
        text: sanitizedText,
        delay: 0,
        linkPreview: false,
        mentionsEveryOne: false,
      }),
      signal: AbortSignal.timeout(9000),
    });

    const data = await response.json().catch(() => null);

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: 'WhatsApp message sent successfully',
        data,
      });
    } else {
      console.error('WhatsApp gateway error:', response.status, data);
      return NextResponse.json(
        {
          success: false,
          message: data?.message || 'Failed to deliver message via WhatsApp gateway.',
        },
        { status: response.status }
      );
    }
  } catch (err: unknown) {
    console.error('WhatsApp route exception:', (err as Error)?.message);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal error while processing WhatsApp message',
      },
      { status: 500 }
    );
  }
}
