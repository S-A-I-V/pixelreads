/**
 * =========================================================================
 *  Library Feature Module
 * =========================================================================
 *
 *  Central export for book library management components, hooks,
 *  stores, and utilities.
 *
 * =========================================================================
 */

// ─── Hooks ──────────────────────────────────────────────────────────────────
export { useLibraryFilteredBooks } from './hooks/useLibraryFilteredBooks';

// ─── Store ──────────────────────────────────────────────────────────────────
export {
  useUserBookLibraryStore,
  selectBooksByShelf,
  selectShelfBookCount,
  selectIsBookInLibrary,
} from './store/userBookLibraryStore';

// ─── Constants ──────────────────────────────────────────────────────────────
export * from './constants/libraryFeatureConstants';
