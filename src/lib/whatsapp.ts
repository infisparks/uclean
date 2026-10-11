export interface WhatsAppResponse {
  success: boolean;
  message?: string;
  data?: unknown;
}

/**
 * Formats standard 10-digit Indian numbers or International numbers with country code
 */
export function formatWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `91${digits}`;
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return `91${digits.slice(1)}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits;
  }
  return digits;
}

/**
 * Triggers WhatsApp message via our internal API route
 */
export async function sendWhatsAppMessage(number: string, text: string): Promise<WhatsAppResponse> {
  try {
    const formatted = formatWhatsAppNumber(number);
    const res = await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ number: formatted, text }),
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Failed to trigger sendWhatsAppMessage:', error);
    return { success: false, message: (error as Error).message };
  }
}

/**
 * Template 1: Booking confirmation / Pickup request received
 * Provided by store operations (Faiz Faisal Ansari)
 */
export function generateBookingConfirmationTemplate(params: {
  customerName: string;
  orderId: string;
  address: string;
  date: string;
  time: string;
}): string {
  return [
    `Hi ${params.customerName}! 👋`,
    ``,
    `Thank you for choosing UClean Nerul West.`,
    ``,
    `Your pickup request #${params.orderId} has been received.`,
    ``,
    `📍 Pickup address: ${params.address || 'Nerul West'}`,
    `📅 Requested date: ${params.date || 'Today / Earliest'}`,
    `🕒 Preferred slot: ${params.time || 'Standard Slot'}`,
    ``,
    `Our team will confirm your pickup slot shortly.`,
    ``,
    `Pickup and delivery are FREE.`,
    ``,
    `Thank you,`,
    `Team UClean Nerul West`,
  ].join('\n');
}

/**
 * Template 2: Final quotation confirmation message
 * Provided by store operations (Faiz Faisal Ansari)
 */
export function generateQuotationTemplate(params: {
  customerName: string;
  orderId: string;
  services: string;
  amount: string | number;
}): string {
  return [
    `Hi ${params.customerName},`,
    ``,
    `We have checked your garments and prepared your order quotation.`,
    ``,
    `Order ID: ${params.orderId}`,
    `Services: ${params.services}`,
    `Final amount: ₹${params.amount}`,
    ``,
    `Please confirm the quotation so we can proceed with your order.`,
    ``,
    `Thank you,`,
    `Team UClean Nerul West`,
  ].join('\n');
}

/**
 * Template 3: Order ready for delivery
 * Provided by store operations (Faiz Faisal Ansari)
 */
export function generateReadyForDeliveryTemplate(params: {
  customerName: string;
  orderId: string;
  amount: string | number;
}): string {
  return [
    `Hi ${params.customerName}! 👋`,
    ``,
    `Your UClean order #${params.orderId} is ready for delivery.`,
    ``,
    `📦 Order amount: ₹${params.amount || 'As quoted'}`,
    `🚚 Delivery: FREE`,
    ``,
    `Our team will coordinate the delivery time with you.`,
    ``,
    `Thank you for choosing UClean Nerul West!`,
  ].join('\n');
}

/**
 * Store operations alert template
 */
export function generateStoreAlertMessage(params: {
  customerName: string;
  phone: string;
  bookingId: string;
  serviceType: string;
  preferredDate?: string;
  preferredTimeSlot?: string;
  address?: string;
  notes?: string;
}): string {
  return [
    `🚨 *NEW ORDER ALERT — UClean Nerul App*`,
    ``,
    `📌 *ID:* ${params.bookingId}`,
    `👤 *Customer:* ${params.customerName}`,
    `📞 *Phone:* ${params.phone}`,
    `🧺 *Service:* ${params.serviceType}`,
    params.preferredDate ? `📅 *Slot:* ${params.preferredDate} (${params.preferredTimeSlot || ''})` : '',
    params.address ? `📍 *Address:* ${params.address}` : '',
    params.notes ? `📝 *Notes:* ${params.notes}` : '',
    ``,
    `Open Admin Panel to manage this order and dispatch WhatsApp updates.`,
  ].filter(Boolean).join('\n');
}
