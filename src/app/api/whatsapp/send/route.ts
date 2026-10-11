import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { number, text } = body;

    if (!number || !text) {
      return NextResponse.json(
        { success: false, message: 'Phone number and message text are required.' },
        { status: 400 }
      );
    }

    const apiUrl =
      process.env.WHATSAPP_API_URL ||
      'https://evo.infispark.in/message/sendText/mudassir';
    const apiKey =
      process.env.WHATSAPP_API_KEY ||
      'vR39h6avY69g7kAU3YQbS6V6XEvudson';

    // Format phone number to clean digits (e.g. 10 digit Indian number gets 91 prepended)
    let cleanedNumber = String(number).replace(/\D/g, '');
    if (cleanedNumber.length === 10) {
      cleanedNumber = '91' + cleanedNumber;
    } else if (cleanedNumber.length === 11 && cleanedNumber.startsWith('0')) {
      cleanedNumber = '91' + cleanedNumber.slice(1);
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: apiKey,
      },
      body: JSON.stringify({
        number: cleanedNumber,
        text,
      }),
    });

    const data = await response.json().catch(() => null);

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: 'WhatsApp message sent successfully',
        data,
      });
    } else {
      console.error('WhatsApp Evolution API responded with error:', data);
      return NextResponse.json(
        {
          success: false,
          message: data?.message || 'Failed to deliver message via WhatsApp gateway.',
          data,
        },
        { status: response.status }
      );
    }
  } catch (err: unknown) {
    console.error('WhatsApp route handler exception:', err);
    return NextResponse.json(
      {
        success: false,
        message: (err as Error)?.message || 'Internal Server Error while sending WhatsApp message',
      },
      { status: 500 }
    );
  }
}
