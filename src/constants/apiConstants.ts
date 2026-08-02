/**
 * =========================================================================
 *  API Constants
 * =========================================================================
 *
 *  Configuration values for external API integrations,
 *  request timeouts, retry logic, and pagination.
 *
 * =========================================================================
 */

// ─── Google Books API ─────────────────────────────────────────────────────────
/**
 * Base URL for Google Books API v1
 */
export const GOOGLE_BOOKS_API_BASE_URL = 'https://www.googleapis.com/books/v1';

/**
 * Default number of results per search request
 */
export const GOOGLE_BOOKS_SEARCH_PAGE_SIZE = 20;

/**
 * Maximum results per request (API limit)
 */
export const GOOGLE_BOOKS_MAX_RESULTS_PER_REQUEST = 40;

/**
 * Starting index for first page of results
 */
export const GOOGLE_BOOKS_PAGINATION_START_INDEX = 0;

/**
 * Default language restriction for search
 */
export const GOOGLE_BOOKS_DEFAULT_LANGUAGE = 'en';

/**
 * Print type filter for books only (excludes magazines)
 */
export const GOOGLE_BOOKS_PRINT_TYPE_BOOKS = 'books';

/**
 * Default result ordering
 */
export const GOOGLE_BOOKS_ORDER_BY_RELEVANCE = 'relevance';

// ─── Request Configuration ────────────────────────────────────────────────────
/**
 * API request timeout in milliseconds
 */
export const API_REQUEST_TIMEOUT_MS = 30000;

/**
 * Maximum number of retry attempts for failed requests
 */
export const API_MAX_RETRY_ATTEMPTS = 3;

/**
 * Base delay for exponential backoff (milliseconds)
 */
export const API_RETRY_BASE_DELAY_MS = 500;

/**
 * HTTP status codes that trigger retry
 */
export const API_RETRY_STATUS_CODES = [429, 503, 502, 504] as const;

// ─── Rate Limiting ────────────────────────────────────────────────────────────
/**
 * Unauthenticated Google Books API daily quota
 */
export const GOOGLE_BOOKS_UNAUTHENTICATED_DAILY_QUOTA = 100;

/**
 * Debounce delay for search input to avoid excessive API calls
 */
export const SEARCH_INPUT_DEBOUNCE_DELAY_MS = 300;

// ─── Cache Settings ───────────────────────────────────────────────────────────
/**
 * Search results cache duration in milliseconds (5 minutes)
 */
export const SEARCH_CACHE_DURATION_MS = 5 * 60 * 1000;

/**
 * Book details cache duration in milliseconds (1 hour)
 */
export const BOOK_DETAILS_CACHE_DURATION_MS = 60 * 60 * 1000;

// ─── Search Filters ───────────────────────────────────────────────────────────
/**
 * Search filter key for general/all fields search
 */
export const SEARCH_FILTER_KEY_ALL = 'all';

/**
 * Search filter key for title-specific search
 */
export const SEARCH_FILTER_KEY_TITLE = 'title';

/**
 * Search filter key for author-specific search
 */
export const SEARCH_FILTER_KEY_AUTHOR = 'author';

/**
 * Search filter key for publisher-specific search
 */
export const SEARCH_FILTER_KEY_PUBLISHER = 'publisher';

/**
 * Search filter key for subject/category search
 */
export const SEARCH_FILTER_KEY_SUBJECT = 'subject';

/**
 * Search filter key for ISBN search
 */
export const SEARCH_FILTER_KEY_ISBN = 'isbn';

/**
 * Google Books API query prefix for title search
 */
export const GOOGLE_BOOKS_QUERY_PREFIX_TITLE = 'intitle:';

/**
 * Google Books API query prefix for author search
 */
export const GOOGLE_BOOKS_QUERY_PREFIX_AUTHOR = 'inauthor:';

/**
 * Google Books API query prefix for publisher search
 */
export const GOOGLE_BOOKS_QUERY_PREFIX_PUBLISHER = 'inpublisher:';

/**
 * Google Books API query prefix for subject search
 */
export const GOOGLE_BOOKS_QUERY_PREFIX_SUBJECT = 'subject:';

/**
 * Google Books API query prefix for ISBN search
 */
export const GOOGLE_BOOKS_QUERY_PREFIX_ISBN = 'isbn:';
