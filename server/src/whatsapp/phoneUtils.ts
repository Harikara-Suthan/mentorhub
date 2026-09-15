/**
 * Phone Sanitization and E.164 Format Validation Utility
 * Supports international phone numbers with default Indian country code (+91)
 */

export interface PhoneValidationResult {
  isValid: boolean;
  formattedPhone: string;
  countryCode: string;
  nationalNumber: string;
  error?: string;
}

export function sanitizeAndValidatePhone(rawPhone?: string | null, defaultCountryCode = "91"): PhoneValidationResult {
  if (!rawPhone || typeof rawPhone !== "string" || rawPhone.trim().length === 0) {
    return {
      isValid: false,
      formattedPhone: "",
      countryCode: defaultCountryCode,
      nationalNumber: "",
      error: "Phone number is empty or missing on the institutional record.",
    };
  }

  // Strip all non-numeric characters except leading +
  let cleaned = rawPhone.trim().replace(/[^\d+]/g, "");

  if (cleaned.startsWith("+")) {
    cleaned = cleaned.substring(1);
  }

  // If starts with 0 (e.g., 09876543210), strip leading zero
  if (cleaned.startsWith("0")) {
    cleaned = cleaned.substring(1);
  }

  // Handle 10-digit standard Indian mobile numbers
  if (cleaned.length === 10) {
    cleaned = `${defaultCountryCode}${cleaned}`;
  }

  // International E.164 standard: between 10 and 15 digits
  if (cleaned.length < 10 || cleaned.length > 15) {
    return {
      isValid: false,
      formattedPhone: cleaned,
      countryCode: defaultCountryCode,
      nationalNumber: cleaned,
      error: `Invalid phone length (${cleaned.length} digits). E.164 numbers must be 10-15 digits.`,
    };
  }

  return {
    isValid: true,
    formattedPhone: `+${cleaned}`,
    countryCode: defaultCountryCode,
    nationalNumber: cleaned,
  };
}

/**
 * Clean phone number for Meta WhatsApp Cloud API (numeric digits only without +)
 */
export function getWhatsAppApiRecipient(e164Phone: string): string {
  return e164Phone.replace(/[^\d]/g, "");
}
