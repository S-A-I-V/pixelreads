/**
 * =========================================================================
 *  Analytics & Event Tracking System
 * =========================================================================
 * 
 * Structured event logging for all user interactions.
 * Designed to be easily connected to analytics backends like:
 * - Firebase Analytics
 * - Mixpanel
 * - Amplitude
 * - PostHog
 * - Custom backend
 * 
 * Events are logged locally with full context. In production,
 * replace the `dispatch` function to send to your analytics service.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Configuration ────────────────────────────────────────────────────────────
const CONFIG = {
  enabled: true,
  logToConsole: __DEV__,       // Log to Metro in dev mode
  persistLocally: true,        // Store events in AsyncStorage
  maxStoredEvents: 500,        // Max events to keep locally
  sessionTimeout: 30 * 60000,  // 30 min session timeout
};

// ─── Session Management ───────────────────────────────────────────────────────
let sessionId = null;
let sessionStartTime = null;
let lastActivityTime = null;

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function getSession() {
  const now = Date.now();
  if (!sessionId || (now - lastActivityTime > CONFIG.sessionTimeout)) {
    sessionId = generateId();
    sessionStartTime = now;
  }
  lastActivityTime = now;
  return {
    sessionId,
    sessionDuration: now - sessionStartTime,
  };
}

// ─── Event Categories ─────────────────────────────────────────────────────────
export const EventCategory = {
  NAVIGATION: 'navigation',
  SEARCH: 'search',
  LIBRARY: 'library',
  READER: 'reader',
  USER: 'user',
  ERROR: 'error',
  PERFORMANCE: 'performance',
};

// ─── Event Types ──────────────────────────────────────────────────────────────
export const EventType = {
  // Navigation
  SCREEN_VIEW: 'screen_view',
  TAB_CHANGE: 'tab_change',
  MODAL_OPEN: 'modal_open',
  MODAL_CLOSE: 'modal_close',
  
  // Search
  SEARCH_START: 'search_start',
  SEARCH_COMPLETE: 'search_complete',
  SEARCH_FILTER: 'search_filter',
  SEARCH_RESULT_TAP: 'search_result_tap',
  
  // Library
  BOOK_ADD_TO_SHELF: 'book_add_to_shelf',
  BOOK_REMOVE_FROM_SHELF: 'book_remove_from_shelf',
  BOOK_CHANGE_SHELF: 'book_change_shelf',
  BOOK_RATE: 'book_rate',
  BOOK_UPDATE_PROGRESS: 'book_update_progress',
  
  // Reader
  READER_OPEN: 'reader_open',
  READER_CLOSE: 'reader_close',
  READER_PAGE_TURN: 'reader_page_turn',
  READER_BOOKMARK_ADD: 'reader_bookmark_add',
  READER_BOOKMARK_REMOVE: 'reader_bookmark_remove',
  READER_HIGHLIGHT_ADD: 'reader_highlight_add',
  READER_THEME_CHANGE: 'reader_theme_change',
  READER_FONT_SIZE_CHANGE: 'reader_font_size_change',
  READER_TOC_NAVIGATE: 'reader_toc_navigate',
  READER_SEARCH: 'reader_search',
  
  // File Management
  EPUB_IMPORT_START: 'epub_import_start',
  EPUB_IMPORT_SUCCESS: 'epub_import_success',
  EPUB_IMPORT_FAIL: 'epub_import_fail',
  EPUB_DELETE: 'epub_delete',
  
  // User
  LOGIN: 'login',
  LOGOUT: 'logout',
  
  // Errors
  ERROR_API: 'error_api',
  ERROR_RENDER: 'error_render',
  ERROR_STORAGE: 'error_storage',
  
  // Performance
  APP_START: 'app_start',
  API_LATENCY: 'api_latency',
};

// ─── ASCII Icons ──────────────────────────────────────────────────────────────
const ASCII_ICONS = {
  [EventCategory.NAVIGATION]: '[NAV]',
  [EventCategory.SEARCH]:     '[?]  ',
  [EventCategory.LIBRARY]:    '[#]  ',
  [EventCategory.READER]:     '[>]  ',
  [EventCategory.USER]:       '[@]  ',
  [EventCategory.ERROR]:      '[!]  ',
  [EventCategory.PERFORMANCE]:'[*]  ',
};

// ─── Event Queue & Dispatch ───────────────────────────────────────────────────
const eventQueue = [];
let eventCounter = 0;

/**
 * Generate short event ID for tracing
 */
function generateEventId() {
  eventCounter++;
  return `evt-${eventCounter.toString().padStart(4, '0')}`;
}

/**
 * Core event dispatch function.
 * In production, replace this to send to your analytics backend.
 */
async function dispatch(event) {
  if (!CONFIG.enabled) return;

  // Add event ID for tracing
  event.eventId = generateEventId();

  // Add to in-memory queue
  eventQueue.push(event);
  if (eventQueue.length > CONFIG.maxStoredEvents) {
    eventQueue.shift();
  }

  // Log to console in dev (ASCII only)
  if (CONFIG.logToConsole) {
    const icon = ASCII_ICONS[event.category] || '[~]  ';
    const timestamp = new Date(event.timestamp).toLocaleTimeString('en-US', { hour12: false });
    const sessionShort = event.sessionId.slice(-6);
    
    // Format: [ICON] event_type | time | #session | evt-id | {props}
    console.log(
      `${icon} ${event.type.padEnd(24)} | ${timestamp} | #${sessionShort} | ${event.eventId} |`,
      event.properties
    );
  }

  // Persist locally
  if (CONFIG.persistLocally) {
    try {
      const stored = await AsyncStorage.getItem('@analytics_events');
      const events = stored ? JSON.parse(stored) : [];
      events.push(event);
      if (events.length > CONFIG.maxStoredEvents) {
        events.splice(0, events.length - CONFIG.maxStoredEvents);
      }
      await AsyncStorage.setItem('@analytics_events', JSON.stringify(events));
    } catch (e) {
      // Silent fail for storage errors
    }
  }

  // TODO: In production, send to analytics backend
  // await sendToBackend(event);
}

// ─── Main Track Function ──────────────────────────────────────────────────────
/**
 * Track an analytics event
 * @param {string} type - Event type from EventType
 * @param {string} category - Event category from EventCategory
 * @param {object} properties - Custom properties for this event
 */
export function track(type, category, properties = {}) {
  const session = getSession();
  
  const event = {
    type,
    category,
    properties,
    timestamp: Date.now(),
    sessionId: session.sessionId,
    sessionDuration: session.sessionDuration,
    eventId: null, // Set in dispatch
  };

  dispatch(event);
  return event;
}

// ─── Convenience Functions ────────────────────────────────────────────────────

/** Track screen view */
export function trackScreenView(screenName, params = {}) {
  return track(EventType.SCREEN_VIEW, EventCategory.NAVIGATION, {
    screen: screenName,
    ...params,
  });
}

/** Track search */
export function trackSearch(query, filterType, resultCount, duration) {
  return track(EventType.SEARCH_COMPLETE, EventCategory.SEARCH, {
    query,
    filterType,
    resultCount,
    durationMs: duration,
  });
}

/** Track book added to shelf */
export function trackBookAddToShelf(bookId, bookTitle, shelf) {
  return track(EventType.BOOK_ADD_TO_SHELF, EventCategory.LIBRARY, {
    bookId,
    bookTitle,
    shelf,
  });
}

/** Track book removed from shelf */
export function trackBookRemoveFromShelf(bookId, bookTitle, previousShelf) {
  return track(EventType.BOOK_REMOVE_FROM_SHELF, EventCategory.LIBRARY, {
    bookId,
    bookTitle,
    previousShelf,
  });
}

/** Track book rating */
export function trackBookRate(bookId, bookTitle, rating, previousRating) {
  return track(EventType.BOOK_RATE, EventCategory.LIBRARY, {
    bookId,
    bookTitle,
    rating,
    previousRating,
  });
}

/** Track reading progress update */
export function trackProgressUpdate(bookId, progress, previousProgress) {
  return track(EventType.BOOK_UPDATE_PROGRESS, EventCategory.LIBRARY, {
    bookId,
    progress,
    previousProgress,
    progressDelta: progress - previousProgress,
  });
}

/** Track reader opened */
export function trackReaderOpen(bookId, bookTitle) {
  return track(EventType.READER_OPEN, EventCategory.READER, {
    bookId,
    bookTitle,
  });
}

/** Track reader closed */
export function trackReaderClose(bookId, readingDuration, progress) {
  return track(EventType.READER_CLOSE, EventCategory.READER, {
    bookId,
    readingDurationMs: readingDuration,
    finalProgress: progress,
  });
}

/** Track page turn */
export function trackPageTurn(bookId, progress, direction) {
  return track(EventType.READER_PAGE_TURN, EventCategory.READER, {
    bookId,
    progress,
    direction, // 'forward' | 'backward'
  });
}

/** Track bookmark */
export function trackBookmark(bookId, action, location) {
  const type = action === 'add' ? EventType.READER_BOOKMARK_ADD : EventType.READER_BOOKMARK_REMOVE;
  return track(type, EventCategory.READER, {
    bookId,
    location,
  });
}

/** Track highlight */
export function trackHighlight(bookId, color, textLength) {
  return track(EventType.READER_HIGHLIGHT_ADD, EventCategory.READER, {
    bookId,
    color,
    textLength,
  });
}

/** Track theme change */
export function trackThemeChange(bookId, newTheme, previousTheme) {
  return track(EventType.READER_THEME_CHANGE, EventCategory.READER, {
    bookId,
    newTheme,
    previousTheme,
  });
}

/** Track EPUB import */
export function trackEpubImport(bookId, success, fileSize, error = null) {
  const type = success ? EventType.EPUB_IMPORT_SUCCESS : EventType.EPUB_IMPORT_FAIL;
  return track(type, EventCategory.LIBRARY, {
    bookId,
    fileSize,
    error: error?.message,
  });
}

/** Track error */
export function trackError(errorType, message, context = {}) {
  return track(errorType, EventCategory.ERROR, {
    message,
    ...context,
  });
}

/** Track API latency */
export function trackApiLatency(endpoint, durationMs, success) {
  return track(EventType.API_LATENCY, EventCategory.PERFORMANCE, {
    endpoint,
    durationMs,
    success,
  });
}

/** Track login */
export function trackLogin(method = 'email') {
  return track(EventType.LOGIN, EventCategory.USER, { method });
}

/** Track logout */
export function trackLogout() {
  return track(EventType.LOGOUT, EventCategory.USER, {});
}

// ─── Utility Functions ────────────────────────────────────────────────────────

/** Get all stored events (for debugging/export) */
export async function getStoredEvents() {
  try {
    const stored = await AsyncStorage.getItem('@analytics_events');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/** Clear all stored events */
export async function clearStoredEvents() {
  try {
    await AsyncStorage.removeItem('@analytics_events');
    eventQueue.length = 0;
  } catch {
    // Silent fail
  }
}

/** Get in-memory event queue */
export function getEventQueue() {
  return [...eventQueue];
}

/** Get current session info */
export function getSessionInfo() {
  const session = getSession();
  return {
    ...session,
    eventCount: eventQueue.length,
  };
}

/** Export events as JSON string (for debugging) */
export async function exportEvents() {
  const events = await getStoredEvents();
  return JSON.stringify(events, null, 2);
}

// ─── Default Export ───────────────────────────────────────────────────────────
export default {
  track,
  trackScreenView,
  trackSearch,
  trackBookAddToShelf,
  trackBookRemoveFromShelf,
  trackBookRate,
  trackProgressUpdate,
  trackReaderOpen,
  trackReaderClose,
  trackPageTurn,
  trackBookmark,
  trackHighlight,
  trackThemeChange,
  trackEpubImport,
  trackError,
  trackApiLatency,
  trackLogin,
  trackLogout,
  getStoredEvents,
  clearStoredEvents,
  getEventQueue,
  getSessionInfo,
  exportEvents,
  EventType,
  EventCategory,
};
