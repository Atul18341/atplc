// --- TYPES & INTERFACES ---

export interface CookieOptions {
  path?: string;
  expires?: number | Date | string;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
  domain?: string;
  [key: string]: any; // Allow indexing dynamically by string key names
}

// --- UTILITY FUNCTIONS ---

/**
 * Sets a client-side browser cookie with standard defaults.
 */
export function setCookie(name: string, value: any, options: CookieOptions = {}): void {
  if (typeof window === 'undefined') return; // Server-side execution guard

  let serializedValue = value;
  if (typeof value === 'object' && value !== null) {
    serializedValue = JSON.stringify(value);
  }

  // Modern production-ready security defaults
  const defaultOptions: CookieOptions = {
    path: '/',
    expires: 7, // 7 days default
    secure: true,
    sameSite: 'Strict'
  };

  const cookieOptions: CookieOptions = { ...defaultOptions, ...options };

  // Calculate and process date intervals safely
  if (cookieOptions.expires && typeof cookieOptions.expires === 'number') {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + cookieOptions.expires);
    cookieOptions.expires = expirationDate.toUTCString();
  } else if (cookieOptions.expires instanceof Date) {
    cookieOptions.expires = cookieOptions.expires.toUTCString();
  }

  // Build the underlying initialization string structure
  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(serializedValue)}`;

  Object.entries(cookieOptions).forEach(([key, val]) => {
    if (val === true) {
      cookieString += `; ${key}`;
    } else if (val) {
      cookieString += `; ${key}=${val}`;
    }
  });

  document.cookie = cookieString;
}

/**
 * Retrieves and automatically parses a client-side browser cookie value.
 */
export function getCookie(name: string): any | null {
  if (typeof window === 'undefined' || !document.cookie) return null; // Server-side execution guard

  const cookies = document.cookie.split(';').reduce<Record<string, any>>((acc, current) => {
    const parts = current.split('=');
    const rawKey = parts[0]?.trim();
    const rawValue = parts.slice(1).join('=')?.trim(); // Handle edge cases where values include '=' symbols

    if (!rawKey) return acc;

    const decodedKey = decodeURIComponent(rawKey);
    const decodedValue = rawValue ? decodeURIComponent(rawValue) : '';

    try {
      // Safely parse JSON formatted elements (objects, arrays, numerical primitives)
      acc[decodedKey] = JSON.parse(decodedValue);
    } catch {
      // Fall back directly onto raw string data if parsing flags exception events
      acc[decodedKey] = decodedValue;
    }
    return acc;
  }, {});

  return cookies[name] !== undefined ? cookies[name] : null;
}

/**
 * Deletes a browser cookie by forcing an immediate historical expiration timeframe.
 */
export function deleteCookie(name: string, path: string = '/'): void {
  if (typeof window === 'undefined') return; // Server-side execution guard
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
}

/**
 * Converts text into a normalized, url-safe hyphenated slug structure.
 */
export const convertToUrlSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');
};

/**
 * Deserializes an automated URL slug pattern back into structured capital case headers.
 */
export const convertUrlToText = (url: string): string => {
  if (!url) return '';
  return url
    .replace(/-/g, ' ') // Replace all hyphens with spaces
    .replace(/[^a-zA-Z0-9 ]/g, '') // Strips anomalous symbols out
    .split(' ')
    .filter(Boolean) // Discards extra consecutive space fragments securely
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};