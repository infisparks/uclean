/**
 * Production-level form validation utilities for UClean
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  formatted?: string;
}

/**
 * Validates Indian Mobile Number
 * - Compulsory
 * - Exactly 10 digits
 * - Must start with 6, 7, 8, or 9 (TRAI standard Indian mobile numbers)
 * - Handles optional prefixes: +91, 91, 0, spaces, dashes
 */
export function validateIndianMobile(phone: string): ValidationResult {
  if (!phone || !phone.trim()) {
    return {
      isValid: false,
      error: 'Mobile number is compulsory for booking & WhatsApp updates.',
    };
  }

  // Remove non-numeric characters
  let digits = phone.replace(/\D/g, '');

  // Strip leading international or trunk prefixes
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  if (digits.length !== 10) {
    return {
      isValid: false,
      error: `Mobile number must be exactly 10 digits (entered: ${digits.length}).`,
    };
  }

  // Must start with 6, 7, 8, or 9
  if (!/^[6-9]/.test(digits)) {
    return {
      isValid: false,
      error: 'Invalid Indian mobile number. Must start with 6, 7, 8, or 9.',
    };
  }

  return {
    isValid: true,
    formatted: digits,
  };
}

/**
 * Validates Customer Name
 * - Compulsory
 * - Minimum 3 characters
 * - Letters and spaces only
 */
export function validateCustomerName(name: string): ValidationResult {
  const trimmed = (name || '').trim();
  if (!trimmed) {
    return {
      isValid: false,
      error: 'Customer name is compulsory.',
    };
  }

  if (trimmed.length < 3) {
    return {
      isValid: false,
      error: 'Please enter a valid name (at least 3 characters).',
    };
  }

  // Allow alphabets, spaces, dots, hyphens
  if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) {
    return {
      isValid: false,
      error: 'Name should only contain letters and spaces.',
    };
  }

  return {
    isValid: true,
    formatted: trimmed,
  };
}

/**
 * Validates Complete Pickup Address
 * - Compulsory
 * - Minimum 6 characters (house/flat number, road, area)
 */
export function validateAddress(address: string): ValidationResult {
  const trimmed = (address || '').trim();
  if (!trimmed) {
    return {
      isValid: false,
      error: 'Complete pickup address is compulsory.',
    };
  }

  if (trimmed.length < 6) {
    return {
      isValid: false,
      error: 'Please enter a detailed address (e.g., Flat/Shop, Building, Sector 6).',
    };
  }

  return {
    isValid: true,
    formatted: trimmed,
  };
}
