/**
 * =========================================================================
 *  useBookSearchState Hook
 * =========================================================================
 *
 *  Custom hook for managing book search state, API calls, and pagination.
 *
 * =========================================================================
 */

import { useState, useCallback, useRef } from 'react';
import { Keyboard } from 'react-native';

import {
  SEARCH_FILTER_CONFIGURATIONS,
  SEARCH_DEFAULT_FILTER_KEY,
  SEARCH_INITIAL_PAGINATION_OFFSET,
  SEARCH_RESULTS_PAGE_SIZE,
} from '../constants/searchFeatureConstants';
import type { GoogleBooksNormalizedBookData } from '../../../shared/types/bookTypes';

// API client (will be converted to TypeScript later)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const googleBooksApi = require('../../../api/googleBooks');

// Analytics
// eslint-disable-next-line @typescript-eslint/no-var-requires
const analytics = require('../../../utils/analytics');

/**
 * Search state hook return type
 */
interface BookSearchStateHookResult {
  /** Current search query */
  searchQueryInputValue: string;
  /** Update search query */
  setSearchQueryInputValue: (value: string) => void;
  /** Active filter key */
  activeSearchFilterKey: string;
  /** Update filter key */
  setActiveSearchFilterKey: (key: string) => void;
  /** Search results */
  searchResultBooks: GoogleBooksNormalizedBookData[];
  /** Whether search is loading */
  isSearchLoading: boolean;
  /** Error message if search failed */
  searchErrorMessage: string | null;
  /** Whether a search has been performed */
  hasSearchBeenPerformed: boolean;
  /** Total results count from API */
  totalSearchResultsCount: number;
  /** Current pagination offset */
  currentPaginationOffset: number;
  /** Execute search */
  executeBookSearch: () => void;
  /** Load more results */
  loadMoreSearchResults: () => void;
  /** Handle filter change (with auto-search if query exists) */
  handleSearchFilterChange: (filterKey: string) => void;
  /** Reset search state */
  resetSearchState: () => void;
  /** Whether there's an active search (query, filter, or results) */
  hasActiveSearchState: boolean;
  /** Whether more results can be loaded */
  canLoadMoreResults: boolean;
}

/**
 * Hook for managing book search state and API interactions.
 */
export function useBookSearchState(): BookSearchStateHookResult {
  // ─── State ────────────────────────────────────────────────────────────
  const [searchQueryInputValue, setSearchQueryInputValue] = useState('');
  const [activeSearchFilterKey, setActiveSearchFilterKeyState] = useState(SEARCH_DEFAULT_FILTER_KEY);
  const [searchResultBooks, setSearchResultBooks] = useState<GoogleBooksNormalizedBookData[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [searchErrorMessage, setSearchErrorMessage] = useState<string | null>(null);
  const [hasSearchBeenPerformed, setHasSearchBeenPerformed] = useState(false);
  const [totalSearchResultsCount, setTotalSearchResultsCount] = useState(0);
  const [currentPaginationOffset, setCurrentPaginationOffset] = useState(SEARCH_INITIAL_PAGINATION_OFFSET);

  // ─── Refs ─────────────────────────────────────────────────────────────
  const abortControllerRef = useRef<AbortController | null>(null);

  // ─── Core Search Logic ────────────────────────────────────────────────
  const performSearch = useCallback(async (
    query: string,
    filterKey: string,
    startIndex: number,
    appendResults: boolean
  ): Promise<void> => {
    if (!query.trim()) return;

    // Cancel previous request
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    Keyboard.dismiss();
    setIsSearchLoading(true);
    setSearchErrorMessage(null);
    
    if (!appendResults) {
      setHasSearchBeenPerformed(true);
    }

    const searchStartTime = Date.now();
    console.log(`[Search] Starting: "${query}" (filter: ${filterKey}, page: ${startIndex / SEARCH_RESULTS_PAGE_SIZE + 1})`);

    try {
      // Build query with filter prefix
      const filterConfig = SEARCH_FILTER_CONFIGURATIONS.find(f => f.key === filterKey);
      const apiQuery = filterConfig?.queryPrefix 
        ? `${filterConfig.queryPrefix}${query}` 
        : query;

      const { items, totalItems } = await googleBooksApi.searchBooks(apiQuery, startIndex);

      // Deduplicate results
      setSearchResultBooks((prev) => {
        const combined = appendResults ? [...prev, ...items] : items;
        const seenIds = new Set<string>();
        return combined.filter((book: GoogleBooksNormalizedBookData) => {
          if (seenIds.has(book.id)) return false;
          seenIds.add(book.id);
          return true;
        });
      });

      setTotalSearchResultsCount(totalItems);
      setCurrentPaginationOffset(startIndex);

      // Analytics
      const searchDuration = Date.now() - searchStartTime;
      analytics.trackSearch(query, filterKey, items.length, searchDuration);
      console.log(`[Search] Complete: ${items.length}/${totalItems} results in ${searchDuration}ms`);
    } catch (error: unknown) {
      const errorObj = error as Error;
      if (errorObj.name !== 'AbortError') {
        setSearchErrorMessage(errorObj.message || 'Search failed');
        console.log(`[Search] Error: ${errorObj.message}`);
      }
    } finally {
      setIsSearchLoading(false);
    }
  }, []);

  // ─── Public Actions ───────────────────────────────────────────────────
  const executeBookSearch = useCallback(() => {
    performSearch(searchQueryInputValue, activeSearchFilterKey, SEARCH_INITIAL_PAGINATION_OFFSET, false);
  }, [searchQueryInputValue, activeSearchFilterKey, performSearch]);

  const loadMoreSearchResults = useCallback(() => {
    const nextOffset = currentPaginationOffset + SEARCH_RESULTS_PAGE_SIZE;
    performSearch(searchQueryInputValue, activeSearchFilterKey, nextOffset, true);
  }, [searchQueryInputValue, activeSearchFilterKey, currentPaginationOffset, performSearch]);

  const handleSearchFilterChange = useCallback((filterKey: string) => {
    setActiveSearchFilterKeyState(filterKey);
    if (searchQueryInputValue.trim() && hasSearchBeenPerformed) {
      performSearch(searchQueryInputValue, filterKey, SEARCH_INITIAL_PAGINATION_OFFSET, false);
    }
  }, [searchQueryInputValue, hasSearchBeenPerformed, performSearch]);

  const resetSearchState = useCallback(() => {
    setSearchQueryInputValue('');
    setActiveSearchFilterKeyState(SEARCH_DEFAULT_FILTER_KEY);
    setSearchResultBooks([]);
    setHasSearchBeenPerformed(false);
    setTotalSearchResultsCount(0);
    setCurrentPaginationOffset(SEARCH_INITIAL_PAGINATION_OFFSET);
    setSearchErrorMessage(null);
  }, []);

  // ─── Derived State ────────────────────────────────────────────────────
  const hasActiveSearchState = 
    searchQueryInputValue.trim().length > 0 || 
    activeSearchFilterKey !== SEARCH_DEFAULT_FILTER_KEY || 
    hasSearchBeenPerformed;

  const canLoadMoreResults = 
    searchResultBooks.length > 0 && 
    searchResultBooks.length < totalSearchResultsCount;

  return {
    searchQueryInputValue,
    setSearchQueryInputValue,
    activeSearchFilterKey,
    setActiveSearchFilterKey: setActiveSearchFilterKeyState,
    searchResultBooks,
    isSearchLoading,
    searchErrorMessage,
    hasSearchBeenPerformed,
    totalSearchResultsCount,
    currentPaginationOffset,
    executeBookSearch,
    loadMoreSearchResults,
    handleSearchFilterChange,
    resetSearchState,
    hasActiveSearchState,
    canLoadMoreResults,
  };
}

export default useBookSearchState;
