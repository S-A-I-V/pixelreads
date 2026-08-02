/**
 * =========================================================================
 *  Search Feature Constants
 * =========================================================================
 *
 *  Constants for book search functionality including filter options,
 *  UI labels, and screen configuration.
 *
 * =========================================================================
 */

/**
 * Search filter configuration for Google Books queries
 */
export interface SearchFilterConfiguration {
  /** Internal key identifier */
  readonly key: string;
  /** User-facing label */
  readonly label: string;
  /** Google Books API query prefix */
  readonly queryPrefix: string;
}

/**
 * Available search filters for Google Books API
 */
export const SEARCH_FILTER_CONFIGURATIONS: ReadonlyArray<SearchFilterConfiguration> = [
  { key: 'all', label: 'All', queryPrefix: '' },
  { key: 'title', label: 'Title', queryPrefix: 'intitle:' },
  { key: 'author', label: 'Author', queryPrefix: 'inauthor:' },
  { key: 'publisher', label: 'Publisher', queryPrefix: 'inpublisher:' },
  { key: 'subject', label: 'Subject', queryPrefix: 'subject:' },
  { key: 'isbn', label: 'ISBN', queryPrefix: 'isbn:' },
] as const;

// ─── Screen Text ──────────────────────────────────────────────────────────────
/**
 * Search screen header title
 */
export const SEARCH_SCREEN_HEADER_TITLE = 'Search';

/**
 * Search input placeholder text
 */
export const SEARCH_INPUT_PLACEHOLDER = 'Search books...';

/**
 * Reset button label
 */
export const SEARCH_BUTTON_RESET_LABEL = 'Reset';

/**
 * Retry button label
 */
export const SEARCH_BUTTON_RETRY_LABEL = 'Retry';

/**
 * Load more button label
 */
export const SEARCH_BUTTON_LOAD_MORE_LABEL = 'Load More';

// ─── Empty/Loading States ─────────────────────────────────────────────────────
/**
 * Loading indicator text
 */
export const SEARCH_LOADING_TEXT = 'Searching...';

/**
 * Title for no results state
 */
export const SEARCH_EMPTY_NO_RESULTS_TITLE = 'No books found';

/**
 * Subtitle for no results state
 */
export const SEARCH_EMPTY_NO_RESULTS_SUBTITLE = 'Try different keywords or filters';

/**
 * Title for initial search state
 */
export const SEARCH_EMPTY_INITIAL_TITLE = 'Find your next read';

/**
 * Subtitle for initial search state
 */
export const SEARCH_EMPTY_INITIAL_SUBTITLE = 'Search by title, author, publisher, or ISBN';

// ─── Results Display ──────────────────────────────────────────────────────────
/**
 * Format string for results count (use with template literal)
 */
export const SEARCH_RESULTS_COUNT_SUFFIX = 'results';

/**
 * Format string for filtered by indicator
 */
export const SEARCH_FILTERED_BY_PREFIX = 'Filtered by';

// ─── Badge Labels ─────────────────────────────────────────────────────────────
/**
 * Badge label for ebook format
 */
export const SEARCH_BADGE_EBOOK_LABEL = 'EBOOK';

/**
 * Badge label for free books
 */
export const SEARCH_BADGE_FREE_LABEL = 'FREE';

// ─── Default Values ───────────────────────────────────────────────────────────
/**
 * Default filter key when search starts
 */
export const SEARCH_DEFAULT_FILTER_KEY = 'all';

/**
 * Initial pagination offset
 */
export const SEARCH_INITIAL_PAGINATION_OFFSET = 0;

/**
 * Page size for search results
 */
export const SEARCH_RESULTS_PAGE_SIZE = 20;
