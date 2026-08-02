/**
 * =========================================================================
 *  Reader Feature Constants
 * =========================================================================
 *
 *  Constants for the EPUB reader including themes, font sizes,
 *  highlight colors, and UI configuration.
 *
 * =========================================================================
 */

import type { 
  EpubReaderThemeConfiguration, 
  EpubHighlightColorOption,
  EpubReaderUserSettings 
} from '../../../shared/types/readerTypes';

// ─── Theme Configurations ─────────────────────────────────────────────────────
/**
 * Light theme configuration
 */
export const READER_THEME_LIGHT: EpubReaderThemeConfiguration = {
  key: 'light',
  label: 'Light',
  iconName: 'white-balance-sunny',
  backgroundColor: '#ffffff',
  textColor: '#1a1a1a',
  cssStyles: {
    body: { background: '#ffffff', color: '#1a1a1a' },
    p: { color: '#1a1a1a' },
    '*': { color: '#1a1a1a' },
  },
};

/**
 * Dark theme configuration
 */
export const READER_THEME_DARK: EpubReaderThemeConfiguration = {
  key: 'dark',
  label: 'Dark',
  iconName: 'moon-waning-crescent',
  backgroundColor: '#1a1a2e',
  textColor: '#e0e0e0',
  cssStyles: {
    body: { background: '#1a1a2e !important', color: '#e0e0e0 !important' },
    p: { color: '#e0e0e0 !important' },
    '*': { color: '#e0e0e0 !important', background: 'transparent !important' },
  },
};

/**
 * Sepia theme configuration
 */
export const READER_THEME_SEPIA: EpubReaderThemeConfiguration = {
  key: 'sepia',
  label: 'Sepia',
  iconName: 'book-open-variant',
  backgroundColor: '#f4ecd8',
  textColor: '#5c4b37',
  cssStyles: {
    body: { background: '#f4ecd8', color: '#5c4b37' },
    p: { color: '#5c4b37' },
    '*': { color: '#5c4b37' },
  },
};

/**
 * All available reader themes
 */
export const READER_THEME_CONFIGURATIONS: Record<string, EpubReaderThemeConfiguration> = {
  light: READER_THEME_LIGHT,
  dark: READER_THEME_DARK,
  sepia: READER_THEME_SEPIA,
};

// ─── Highlight Colors ─────────────────────────────────────────────────────────
/**
 * Available highlight color options
 */
export const READER_HIGHLIGHT_COLOR_OPTIONS: ReadonlyArray<EpubHighlightColorOption> = [
  { color: '#ffeb3b', label: 'Yellow' },
  { color: '#4caf50', label: 'Green' },
  { color: '#2196f3', label: 'Blue' },
  { color: '#e91e63', label: 'Pink' },
  { color: '#ff9800', label: 'Orange' },
] as const;

// ─── Font Sizes ───────────────────────────────────────────────────────────────
/**
 * Available font size options (percentages)
 */
export const READER_FONT_SIZE_OPTIONS = [80, 90, 100, 110, 120, 130, 140, 150] as const;

/**
 * Minimum font size percentage
 */
export const READER_FONT_SIZE_MIN_PERCENT = 80;

/**
 * Maximum font size percentage
 */
export const READER_FONT_SIZE_MAX_PERCENT = 150;

/**
 * Default font size percentage
 */
export const READER_FONT_SIZE_DEFAULT_PERCENT = 100;

// ─── Default Settings ─────────────────────────────────────────────────────────
/**
 * Default reader settings
 */
export const READER_DEFAULT_USER_SETTINGS: EpubReaderUserSettings = {
  theme: 'light',
  fontSize: 100,
  fontFamily: 'default',
  lineHeight: 1.5,
  flow: 'paginated',
};

// ─── UI Labels ────────────────────────────────────────────────────────────────
/**
 * Settings modal title
 */
export const READER_SETTINGS_MODAL_TITLE = 'Reading Settings';

/**
 * Font size setting label
 */
export const READER_SETTINGS_FONT_SIZE_LABEL = 'Font Size';

/**
 * Theme setting label
 */
export const READER_SETTINGS_THEME_LABEL = 'Theme';

/**
 * Table of contents modal title
 */
export const READER_TOC_MODAL_TITLE = 'Table of Contents';

/**
 * Bookmarks modal title
 */
export const READER_BOOKMARKS_MODAL_TITLE = 'Bookmarks';

/**
 * Search modal title
 */
export const READER_SEARCH_MODAL_TITLE = 'Search in Book';

/**
 * Search input placeholder
 */
export const READER_SEARCH_INPUT_PLACEHOLDER = 'Search…';

// ─── Empty State Messages ─────────────────────────────────────────────────────
/**
 * Message when no TOC available
 */
export const READER_TOC_EMPTY_MESSAGE = 'No table of contents available.';

/**
 * Message when no bookmarks
 */
export const READER_BOOKMARKS_EMPTY_MESSAGE = 
  'No bookmarks yet.\nTap the bookmark icon while reading to add one.';

/**
 * Message when no search results
 */
export const READER_SEARCH_NO_RESULTS_MESSAGE = 'No results found.';

/**
 * Message prompting search
 */
export const READER_SEARCH_PROMPT_MESSAGE = 'Type something to search.';

// ─── Error Messages ───────────────────────────────────────────────────────────
/**
 * Title for no file error screen
 */
export const READER_NO_FILE_ERROR_TITLE = 'No E-Book File';

/**
 * Message for no file error screen
 */
export const READER_NO_FILE_ERROR_MESSAGE = 
  'Import an EPUB from the book detail page first.';

/**
 * Loading message while opening book
 */
export const READER_LOADING_MESSAGE = 'Opening book…';

// ─── Footer Labels ────────────────────────────────────────────────────────────
/**
 * Default chapter label when unknown
 */
export const READER_FOOTER_DEFAULT_CHAPTER_LABEL = 'Contents';

// ─── Timing ───────────────────────────────────────────────────────────────────
/**
 * Delay before restoring last read position (ms)
 */
export const READER_LOCATION_RESTORE_DELAY_MS = 1500;

/**
 * Timeout for dismissing loading indicator (ms)
 */
export const READER_LOADING_TIMEOUT_MS = 4000;
