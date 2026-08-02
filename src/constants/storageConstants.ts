/**
 * =========================================================================
 *  Storage Constants
 * =========================================================================
 *
 *  AsyncStorage keys, file paths, and persistence configuration
 *  for local data storage.
 *
 * =========================================================================
 */

// ─── AsyncStorage Keys (Zustand Persist) ──────────────────────────────────────
/**
 * Storage key for authentication state
 */
export const STORAGE_KEY_AUTH_STATE = 'pixelreads-auth';

/**
 * Storage key for book library data
 */
export const STORAGE_KEY_BOOK_LIBRARY = 'pixelreads-books';

/**
 * Storage key for reader settings and bookmarks
 */
export const STORAGE_KEY_READER_DATA = 'pixelreads-reader';

/**
 * Storage key for analytics events
 */
export const STORAGE_KEY_ANALYTICS_EVENTS = '@analytics_events';

// ─── File System Paths ────────────────────────────────────────────────────────
/**
 * Directory name for storing imported EPUB files
 */
export const FILE_DIRECTORY_BOOKS = 'books/';

/**
 * File extension for EPUB files
 */
export const FILE_EXTENSION_EPUB = '.epub';

/**
 * MIME type for EPUB files
 */
export const FILE_MIME_TYPE_EPUB = 'application/epub+zip';

// ─── Session Configuration ────────────────────────────────────────────────────
/**
 * Session timeout duration in milliseconds (30 minutes)
 */
export const SESSION_TIMEOUT_DURATION_MS = 30 * 60 * 1000;

/**
 * Maximum stored analytics events before pruning
 */
export const ANALYTICS_MAX_STORED_EVENTS = 500;

// ─── Library Shelves ──────────────────────────────────────────────────────────
/**
 * Shelf key for currently reading books
 */
export const SHELF_KEY_READING = 'reading';

/**
 * Shelf key for books user wants to read
 */
export const SHELF_KEY_WANT_TO_READ = 'want_to_read';

/**
 * Shelf key for finished books
 */
export const SHELF_KEY_FINISHED = 'finished';

/**
 * Shelf key for did-not-finish books
 */
export const SHELF_KEY_DNF = 'dnf';

/**
 * Virtual shelf key for all books combined
 */
export const SHELF_KEY_ALL = 'all';

// ─── Shelf Display Labels ─────────────────────────────────────────────────────
/**
 * Display label for Reading shelf
 */
export const SHELF_LABEL_READING = 'Currently Reading';

/**
 * Display label for Want to Read shelf
 */
export const SHELF_LABEL_WANT_TO_READ = 'Want to Read';

/**
 * Display label for Finished shelf
 */
export const SHELF_LABEL_FINISHED = 'Finished';

/**
 * Display label for DNF shelf
 */
export const SHELF_LABEL_DNF = 'Did Not Finish';

/**
 * Display label for All books view
 */
export const SHELF_LABEL_ALL = 'All';
