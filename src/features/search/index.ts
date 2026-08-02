/**
 * =========================================================================
 *  Search Feature Module
 * =========================================================================
 *
 *  Central export for book search components, hooks, and utilities.
 *
 * =========================================================================
 */

// ─── Hooks ──────────────────────────────────────────────────────────────────
export { useBookSearchState } from './hooks/useBookSearchState';

// ─── API ────────────────────────────────────────────────────────────────────
export {
  searchGoogleBooksApi,
  fetchGoogleBookById,
  normalizeGoogleBooksApiResponse,
} from './api/googleBooksApiClient';

// ─── Constants ──────────────────────────────────────────────────────────────
export * from './constants/searchFeatureConstants';
