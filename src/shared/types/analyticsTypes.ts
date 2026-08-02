/**
 * =========================================================================
 *  Analytics Types
 * =========================================================================
 *
 *  Type definitions for the analytics and event tracking system.
 *
 * =========================================================================
 */

/**
 * Analytics event category
 */
export type AnalyticsEventCategory =
  | 'navigation'
  | 'search'
  | 'library'
  | 'reader'
  | 'user'
  | 'error'
  | 'performance';

/**
 * Analytics event type identifiers
 */
export type AnalyticsEventTypeIdentifier =
  // Navigation
  | 'screen_view'
  | 'tab_change'
  | 'modal_open'
  | 'modal_close'
  // Search
  | 'search_start'
  | 'search_complete'
  | 'search_filter'
  | 'search_result_tap'
  // Library
  | 'book_add_to_shelf'
  | 'book_remove_from_shelf'
  | 'book_change_shelf'
  | 'book_rate'
  | 'book_update_progress'
  // Reader
  | 'reader_open'
  | 'reader_close'
  | 'reader_page_turn'
  | 'reader_bookmark_add'
  | 'reader_bookmark_remove'
  | 'reader_highlight_add'
  | 'reader_theme_change'
  | 'reader_font_size_change'
  | 'reader_toc_navigate'
  | 'reader_search'
  // File
  | 'epub_import_start'
  | 'epub_import_success'
  | 'epub_import_fail'
  | 'epub_delete'
  // User
  | 'login'
  | 'logout'
  // Error
  | 'error_api'
  | 'error_render'
  | 'error_storage'
  // Performance
  | 'app_start'
  | 'api_latency';

/**
 * Base analytics event structure
 */
export interface AnalyticsEventPayload {
  /** Event type identifier */
  readonly type: AnalyticsEventTypeIdentifier;
  
  /** Event category */
  readonly category: AnalyticsEventCategory;
  
  /** Custom event properties */
  readonly properties: Record<string, unknown>;
  
  /** Unix timestamp in milliseconds */
  readonly timestamp: number;
  
  /** Session identifier */
  readonly sessionId: string;
  
  /** Session duration at event time (ms) */
  readonly sessionDuration: number;
  
  /** Unique event identifier */
  readonly eventId: string | null;
}

/**
 * Session information
 */
export interface AnalyticsSessionInfo {
  /** Current session ID */
  readonly sessionId: string;
  
  /** Session duration (ms) */
  readonly sessionDuration: number;
  
  /** Number of events in current queue */
  readonly eventCount: number;
}

/**
 * Analytics configuration
 */
export interface AnalyticsConfiguration {
  /** Whether analytics is enabled */
  readonly enabled: boolean;
  
  /** Whether to log to console (dev mode) */
  readonly logToConsole: boolean;
  
  /** Whether to persist events locally */
  readonly persistLocally: boolean;
  
  /** Maximum events to store locally */
  readonly maxStoredEvents: number;
  
  /** Session timeout in milliseconds */
  readonly sessionTimeout: number;
}

/**
 * Screen view event properties
 */
export interface AnalyticsScreenViewProperties {
  readonly screen: string;
  readonly [key: string]: unknown;
}

/**
 * Search event properties
 */
export interface AnalyticsSearchEventProperties {
  readonly query: string;
  readonly filterType: string;
  readonly resultCount: number;
  readonly durationMs: number;
}

/**
 * Book shelf event properties
 */
export interface AnalyticsBookShelfEventProperties {
  readonly bookId: string;
  readonly bookTitle: string;
  readonly shelf?: string;
  readonly previousShelf?: string;
}

/**
 * Book rating event properties
 */
export interface AnalyticsBookRatingEventProperties {
  readonly bookId: string;
  readonly bookTitle: string;
  readonly rating: number;
  readonly previousRating: number;
}

/**
 * Reader event properties
 */
export interface AnalyticsReaderEventProperties {
  readonly bookId: string;
  readonly bookTitle?: string;
  readonly readingDurationMs?: number;
  readonly finalProgress?: number;
  readonly progress?: number;
  readonly direction?: 'forward' | 'backward';
  readonly location?: string;
  readonly color?: string;
  readonly textLength?: number;
  readonly newTheme?: string;
  readonly previousTheme?: string;
  readonly fontSize?: number;
}

/**
 * Error event properties
 */
export interface AnalyticsErrorEventProperties {
  readonly message: string;
  readonly [key: string]: unknown;
}
