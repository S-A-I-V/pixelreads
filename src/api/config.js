/**
 * =========================================================================
 *  API Configuration
 * =========================================================================
 *
 *  For production, use environment variables.
 *  For development, values are set directly here.
 *
 *  To use .env files in production:
 *  - Use expo-constants with app.config.js extra field
 *  - Or use EAS secrets for builds
 *
 * =========================================================================
 */

// =========================================================================
//  Google Books API
// =========================================================================

// In production, replace with process.env or Constants.expoConfig.extra
export const GOOGLE_BOOKS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY || '';

export const GOOGLE_BOOKS_BASE_URL = 'https://www.googleapis.com/books/v1';

// =========================================================================
//  API Settings
// =========================================================================

export const API_TIMEOUT = 30000; // 30 seconds
export const API_MAX_RETRIES = 3;

// =========================================================================
//  Validation
// =========================================================================

export function validateConfig() {
  const warnings = [];
  
  if (!GOOGLE_BOOKS_API_KEY || GOOGLE_BOOKS_API_KEY === 'your_google_books_api_key_here') {
    warnings.push('[CONFIG] GOOGLE_BOOKS_API_KEY not set - using unauthenticated quota (100 req/day)');
  }
  
  warnings.forEach(w => console.warn(w));
  
  return {
    isValid: true,
    warnings,
  };
}

// =========================================================================
//  Config Summary (for debugging)
// =========================================================================

export function getConfigSummary() {
  return {
    googleBooksApiKey: GOOGLE_BOOKS_API_KEY ? '***' + GOOGLE_BOOKS_API_KEY.slice(-4) : 'NOT SET',
    googleBooksBaseUrl: GOOGLE_BOOKS_BASE_URL,
    apiTimeout: API_TIMEOUT,
    apiMaxRetries: API_MAX_RETRIES,
  };
}
