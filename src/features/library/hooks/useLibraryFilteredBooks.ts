/**
 * =========================================================================
 *  useLibraryFilteredBooks Hook
 * =========================================================================
 *
 *  Custom hook for filtering library books by shelf and search text.
 *
 * =========================================================================
 */

import { useState, useMemo, useCallback } from 'react';

import { useUserBookLibraryStore } from '../store/userBookLibraryStore';
import { LIBRARY_FILTER_ANALYTICS_TRIGGER_LENGTH } from '../constants/libraryFeatureConstants';
import type { BookShelfKey, BookShelfKeyWithAll, UserLibraryBookEntry } from '../../../shared/types/bookTypes';

// Analytics
// eslint-disable-next-line @typescript-eslint/no-var-requires
const analytics = require('../../../utils/analytics');

/**
 * Return type for the library filter hook
 */
interface LibraryFilteredBooksHookResult {
  /** Currently active shelf tab */
  activeShelfTabKey: BookShelfKeyWithAll;
  
  /** Update the active shelf tab */
  setActiveShelfTabKey: (tabKey: BookShelfKeyWithAll) => void;
  
  /** Current filter text input value */
  filterTextInputValue: string;
  
  /** Update the filter text */
  handleFilterTextChange: (text: string) => void;
  
  /** Books filtered by shelf and search text */
  filteredLibraryBooks: UserLibraryBookEntry[];
  
  /** All books across all shelves */
  allLibraryBooks: UserLibraryBookEntry[];
  
  /** Count of books per shelf (for tab badges) */
  shelfBookCounts: Record<BookShelfKeyWithAll, number>;
  
  /** Whether the filter is actively reducing results */
  hasActiveFilter: boolean;
}

/**
 * Hook for managing library filtering by shelf and text search.
 *
 * @param initialShelfKey - Initial shelf to display (defaults to 'all')
 *
 * @example
 * ```tsx
 * function LibraryScreen() {
 *   const {
 *     activeShelfTabKey,
 *     setActiveShelfTabKey,
 *     filterTextInputValue,
 *     handleFilterTextChange,
 *     filteredLibraryBooks,
 *     shelfBookCounts,
 *   } = useLibraryFilteredBooks('all');
 *
 *   return (
 *     <FlatList
 *       data={filteredLibraryBooks}
 *       renderItem={({ item }) => <BookListItem book={item} />}
 *     />
 *   );
 * }
 * ```
 */
export function useLibraryFilteredBooks(
  initialShelfKey: BookShelfKeyWithAll = 'all'
): LibraryFilteredBooksHookResult {
  // ─── Store State ──────────────────────────────────────────────────────
  const libraryShelves = useUserBookLibraryStore((state) => state.shelves);

  // ─── Local State ──────────────────────────────────────────────────────
  const [activeShelfTabKey, setActiveShelfTabKeyState] = 
    useState<BookShelfKeyWithAll>(initialShelfKey);
  const [filterTextInputValue, setFilterTextInputValue] = useState<string>('');

  // ─── Derived Data ─────────────────────────────────────────────────────
  /**
   * All books from all shelves combined
   */
  const allLibraryBooks = useMemo<UserLibraryBookEntry[]>(() => {
    return Object.values(libraryShelves).flat();
  }, [libraryShelves]);

  /**
   * Book counts per shelf
   */
  const shelfBookCounts = useMemo<Record<BookShelfKeyWithAll, number>>(() => ({
    all: allLibraryBooks.length,
    reading: libraryShelves.reading?.length ?? 0,
    want_to_read: libraryShelves.want_to_read?.length ?? 0,
    finished: libraryShelves.finished?.length ?? 0,
    dnf: libraryShelves.dnf?.length ?? 0,
  }), [allLibraryBooks.length, libraryShelves]);

  /**
   * Books filtered by active shelf and search text
   */
  const filteredLibraryBooks = useMemo<UserLibraryBookEntry[]>(() => {
    // Start with shelf-filtered books
    const shelfBooks = activeShelfTabKey === 'all'
      ? allLibraryBooks
      : (libraryShelves[activeShelfTabKey as BookShelfKey] ?? []);

    // Apply text filter if present
    if (!filterTextInputValue.trim()) {
      return shelfBooks;
    }

    const searchTermLower = filterTextInputValue.toLowerCase();
    return shelfBooks.filter((book) =>
      book.title.toLowerCase().includes(searchTermLower) ||
      book.authors?.join(' ').toLowerCase().includes(searchTermLower)
    );
  }, [activeShelfTabKey, allLibraryBooks, libraryShelves, filterTextInputValue]);

  // ─── Handlers ─────────────────────────────────────────────────────────
  /**
   * Handle shelf tab change with analytics
   */
  const setActiveShelfTabKey = useCallback((tabKey: BookShelfKeyWithAll): void => {
    setActiveShelfTabKeyState(tabKey);
    
    analytics.track(
      analytics.EventType.TAB_CHANGE,
      analytics.EventCategory.NAVIGATION,
      {
        screen: 'Library',
        tab: tabKey,
        bookCount: tabKey === 'all' 
          ? allLibraryBooks.length 
          : (libraryShelves[tabKey as BookShelfKey]?.length ?? 0),
      }
    );
    console.log(`[LibraryFilter] Tab changed to "${tabKey}"`);
  }, [allLibraryBooks.length, libraryShelves]);

  /**
   * Handle filter text change with analytics trigger
   */
  const handleFilterTextChange = useCallback((text: string): void => {
    setFilterTextInputValue(text);

    // Track when user starts meaningful filter
    if (text.length === LIBRARY_FILTER_ANALYTICS_TRIGGER_LENGTH) {
      analytics.track(
        analytics.EventType.SEARCH_FILTER,
        analytics.EventCategory.LIBRARY,
        { filterText: text, screen: 'Library' }
      );
      console.log(`[LibraryFilter] Filter started: "${text}"`);
    }
  }, []);

  /**
   * Whether filtering is active
   */
  const hasActiveFilter = filterTextInputValue.trim().length > 0;

  return {
    activeShelfTabKey,
    setActiveShelfTabKey,
    filterTextInputValue,
    handleFilterTextChange,
    filteredLibraryBooks,
    allLibraryBooks,
    shelfBookCounts,
    hasActiveFilter,
  };
}

export default useLibraryFilteredBooks;
