/**
 * =========================================================================
 *  Analytics Constants
 * =========================================================================
 *
 *  Event names, categories, and tracking configuration for
 *  the analytics system.
 *
 * =========================================================================
 */

// ─── Event Categories ─────────────────────────────────────────────────────────
/**
 * Category for navigation events (screen views, tab changes)
 */
export const ANALYTICS_CATEGORY_NAVIGATION = 'navigation';

/**
 * Category for search-related events
 */
export const ANALYTICS_CATEGORY_SEARCH = 'search';

/**
 * Category for library management events
 */
export const ANALYTICS_CATEGORY_LIBRARY = 'library';

/**
 * Category for EPUB reader events
 */
export const ANALYTICS_CATEGORY_READER = 'reader';

/**
 * Category for user account events
 */
export const ANALYTICS_CATEGORY_USER = 'user';

/**
 * Category for error tracking
 */
export const ANALYTICS_CATEGORY_ERROR = 'error';

/**
 * Category for performance metrics
 */
export const ANALYTICS_CATEGORY_PERFORMANCE = 'performance';

// ─── Navigation Events ────────────────────────────────────────────────────────
/**
 * Event type for screen view tracking
 */
export const ANALYTICS_EVENT_SCREEN_VIEW = 'screen_view';

/**
 * Event type for tab navigation
 */
export const ANALYTICS_EVENT_TAB_CHANGE = 'tab_change';

/**
 * Event type for modal opening
 */
export const ANALYTICS_EVENT_MODAL_OPEN = 'modal_open';

/**
 * Event type for modal closing
 */
export const ANALYTICS_EVENT_MODAL_CLOSE = 'modal_close';

// ─── Search Events ────────────────────────────────────────────────────────────
/**
 * Event type for search initiation
 */
export const ANALYTICS_EVENT_SEARCH_START = 'search_start';

/**
 * Event type for search completion
 */
export const ANALYTICS_EVENT_SEARCH_COMPLETE = 'search_complete';

/**
 * Event type for filter application
 */
export const ANALYTICS_EVENT_SEARCH_FILTER = 'search_filter';

/**
 * Event type for search result selection
 */
export const ANALYTICS_EVENT_SEARCH_RESULT_TAP = 'search_result_tap';

// ─── Library Events ───────────────────────────────────────────────────────────
/**
 * Event type for adding book to shelf
 */
export const ANALYTICS_EVENT_BOOK_ADD_TO_SHELF = 'book_add_to_shelf';

/**
 * Event type for removing book from shelf
 */
export const ANALYTICS_EVENT_BOOK_REMOVE_FROM_SHELF = 'book_remove_from_shelf';

/**
 * Event type for changing book's shelf
 */
export const ANALYTICS_EVENT_BOOK_CHANGE_SHELF = 'book_change_shelf';

/**
 * Event type for rating a book
 */
export const ANALYTICS_EVENT_BOOK_RATE = 'book_rate';

/**
 * Event type for updating reading progress
 */
export const ANALYTICS_EVENT_BOOK_UPDATE_PROGRESS = 'book_update_progress';

// ─── Reader Events ────────────────────────────────────────────────────────────
/**
 * Event type for opening the reader
 */
export const ANALYTICS_EVENT_READER_OPEN = 'reader_open';

/**
 * Event type for closing the reader
 */
export const ANALYTICS_EVENT_READER_CLOSE = 'reader_close';

/**
 * Event type for page turn
 */
export const ANALYTICS_EVENT_READER_PAGE_TURN = 'reader_page_turn';

/**
 * Event type for adding bookmark
 */
export const ANALYTICS_EVENT_READER_BOOKMARK_ADD = 'reader_bookmark_add';

/**
 * Event type for removing bookmark
 */
export const ANALYTICS_EVENT_READER_BOOKMARK_REMOVE = 'reader_bookmark_remove';

/**
 * Event type for adding highlight
 */
export const ANALYTICS_EVENT_READER_HIGHLIGHT_ADD = 'reader_highlight_add';

/**
 * Event type for theme change
 */
export const ANALYTICS_EVENT_READER_THEME_CHANGE = 'reader_theme_change';

/**
 * Event type for font size change
 */
export const ANALYTICS_EVENT_READER_FONT_SIZE_CHANGE = 'reader_font_size_change';

// ─── File Events ──────────────────────────────────────────────────────────────
/**
 * Event type for starting EPUB import
 */
export const ANALYTICS_EVENT_EPUB_IMPORT_START = 'epub_import_start';

/**
 * Event type for successful EPUB import
 */
export const ANALYTICS_EVENT_EPUB_IMPORT_SUCCESS = 'epub_import_success';

/**
 * Event type for failed EPUB import
 */
export const ANALYTICS_EVENT_EPUB_IMPORT_FAIL = 'epub_import_fail';

/**
 * Event type for EPUB deletion
 */
export const ANALYTICS_EVENT_EPUB_DELETE = 'epub_delete';

// ─── User Events ──────────────────────────────────────────────────────────────
/**
 * Event type for user login
 */
export const ANALYTICS_EVENT_LOGIN = 'login';

/**
 * Event type for user logout
 */
export const ANALYTICS_EVENT_LOGOUT = 'logout';

// ─── Error Events ─────────────────────────────────────────────────────────────
/**
 * Event type for API errors
 */
export const ANALYTICS_EVENT_ERROR_API = 'error_api';

/**
 * Event type for render errors
 */
export const ANALYTICS_EVENT_ERROR_RENDER = 'error_render';

/**
 * Event type for storage errors
 */
export const ANALYTICS_EVENT_ERROR_STORAGE = 'error_storage';

// ─── Performance Events ───────────────────────────────────────────────────────
/**
 * Event type for app startup
 */
export const ANALYTICS_EVENT_APP_START = 'app_start';

/**
 * Event type for API latency tracking
 */
export const ANALYTICS_EVENT_API_LATENCY = 'api_latency';
