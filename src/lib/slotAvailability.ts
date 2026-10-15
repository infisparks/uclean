/**
 * UClean Nerul West - Slot & Date Availability Utility
 * Prevents booking past dates and expired time slots.
 */

export interface TimeSlotOption {
  value: string;
  label: string;
  shortLabel: string;
  endHour: number; // 24-hour format: when this slot window closes
  isAvailable: boolean;
}

export const BASE_TIME_SLOTS: { value: string; label: string; shortLabel: string; endHour: number }[] = [
  {
    value: 'Morning (9:00 AM – 12:00 PM)',
    label: 'Morning · 9:00 AM – 12:00 PM',
    shortLabel: 'Morning (9 AM - 12 PM)',
    endHour: 12,
  },
  {
    value: 'Afternoon (12:00 PM – 4:00 PM)',
    label: 'Afternoon · 12:00 PM – 4:00 PM',
    shortLabel: 'Afternoon (12 PM - 4 PM)',
    endHour: 16,
  },
  {
    value: 'Evening (4:00 PM – 8:00 PM)',
    label: 'Evening · 4:00 PM – 8:00 PM',
    shortLabel: 'Evening (4 PM - 8 PM)',
    endHour: 20,
  },
];

/**
 * Returns today's date in local YYYY-MM-DD format
 */
export function getLocalTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns tomorrow's date in local YYYY-MM-DD format
 */
export function getLocalTomorrowDateString(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns the minimum selectable date string.
 * If all slots for today have already passed (after 8:00 PM / 20:00),
 * today is closed and minimum selectable date advances to tomorrow.
 */
export function getMinSelectableDateString(): string {
  const now = new Date();
  const currentHour = now.getHours();
  // If after 8 PM (20:00), today's operational window is closed
  if (currentHour >= 20) {
    return getLocalTomorrowDateString();
  }
  return getLocalTodayDateString();
}

/**
 * Returns available slots for a given date.
 * If date is today, filters out slots that have already passed based on current hour.
 * If date is in the future, all standard slots are available.
 */
export function getAvailableSlotsForDate(selectedDateString?: string): TimeSlotOption[] {
  const todayStr = getLocalTodayDateString();
  const targetDate = selectedDateString || todayStr;
  const isToday = targetDate === todayStr;

  const now = new Date();
  const currentHour = now.getHours();

  return BASE_TIME_SLOTS.map((slot) => {
    // If date is today, slot is available only if current hour is strictly before the slot's closing hour
    // (with buffer: if slot ends at 12, booking closes at 12:00)
    const isAvailable = !isToday || currentHour < slot.endHour;
    return {
      ...slot,
      isAvailable,
    };
  });
}

/**
 * Helper to get only active valid slot options (excluding expired ones for today)
 */
export function getActiveSlotsList(selectedDateString?: string): TimeSlotOption[] {
  const slots = getAvailableSlotsForDate(selectedDateString);
  const active = slots.filter((s) => s.isAvailable);
  // If no slots remain today (e.g. late evening), return tomorrow's slots
  if (active.length === 0) {
    return BASE_TIME_SLOTS.map((s) => ({ ...s, isAvailable: true }));
  }
  return active;
}

/**
 * Get the initial default slot based on current time
 */
export function getDefaultSlotForDate(selectedDateString?: string): string {
  const active = getActiveSlotsList(selectedDateString);
  return active[0]?.value || 'Morning (9:00 AM – 12:00 PM)';
}
