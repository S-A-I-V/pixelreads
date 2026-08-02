/**
 * =========================================================================
 *  Google Books API Client
 * =========================================================================
 *
 *  TypeScript wrapper for Google Books API interactions.
 *
 * =========================================================================
 */

// Re-export from existing API module for gradual migration
// In a full migration, this file would contain the complete typed implementation

export {
  searchBooks as searchGoogleBooksApi,
  fetchBookById as fetchGoogleBookById,
  normalizeBook as normalizeGoogleBooksApiResponse,
} from '../../../api/googleBooks';
