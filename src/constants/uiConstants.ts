/**
 * =========================================================================
 *  UI Constants
 * =========================================================================
 *
 *  Visual design constants including colors, dimensions, animations,
 *  and touch targets for the PixelReads 8-bit aesthetic.
 *
 * =========================================================================
 */

// ─── Touch Targets ────────────────────────────────────────────────────────────
/**
 * Minimum touch target size for iOS (44pt) per Apple HIG
 */
export const TOUCH_TARGET_MIN_SIZE_IOS_PT = 44;

/**
 * Minimum touch target size for Android (48dp) per Material Design
 */
export const TOUCH_TARGET_MIN_SIZE_ANDROID_DP = 48;

/**
 * Minimum spacing between touchable elements to prevent mis-taps
 */
export const TOUCH_TARGET_SPACING_MIN_PX = 8;

// ─── Animation Durations ──────────────────────────────────────────────────────
/**
 * Duration for micro-interactions (button press feedback, toggle)
 */
export const ANIMATION_DURATION_MICRO_MS = 150;

/**
 * Duration for standard UI transitions (modals, sheets)
 */
export const ANIMATION_DURATION_STANDARD_MS = 250;

/**
 * Duration for page/screen transitions
 */
export const ANIMATION_DURATION_PAGE_MS = 300;

/**
 * Duration for complex choreographed animations
 */
export const ANIMATION_DURATION_COMPLEX_MS = 450;

/**
 * Minimum loading indicator display to avoid flashing
 */
export const LOADING_INDICATOR_MIN_DISPLAY_MS = 300;

// ─── Layout Dimensions ────────────────────────────────────────────────────────
/**
 * Standard book cover width for list items
 */
export const BOOK_COVER_LIST_ITEM_WIDTH_PX = 60;

/**
 * Standard book cover height for list items
 */
export const BOOK_COVER_LIST_ITEM_HEIGHT_PX = 90;

/**
 * Book cover width for detail screens
 */
export const BOOK_COVER_DETAIL_WIDTH_PX = 120;

/**
 * Book cover height for detail screens
 */
export const BOOK_COVER_DETAIL_HEIGHT_PX = 180;

/**
 * Tab bar height including padding
 */
export const TAB_BAR_HEIGHT_PX = 60;

/**
 * Header height (excluding safe area)
 */
export const SCREEN_HEADER_HEIGHT_PX = 52;

/**
 * Progress bar height for reading progress indicators
 */
export const PROGRESS_BAR_HEIGHT_PX = 4;

/**
 * Progress bar height for larger displays
 */
export const PROGRESS_BAR_HEIGHT_LARGE_PX = 8;

// ─── Typography ───────────────────────────────────────────────────────────────
/**
 * Minimum body text size for accessibility compliance
 */
export const BODY_TEXT_MIN_SIZE_PX = 16;

/**
 * Line height multiplier for optimal readability
 */
export const LINE_HEIGHT_MULTIPLIER_DEFAULT = 1.5;

/**
 * Maximum characters per line for comfortable reading
 */
export const MAX_CHARACTERS_PER_LINE = 80;

// ─── Star Rating ──────────────────────────────────────────────────────────────
/**
 * Maximum rating value (5-star system)
 */
export const RATING_MAX_STARS = 5;

/**
 * Default star icon size for compact displays
 */
export const STAR_RATING_SIZE_COMPACT_PX = 14;

/**
 * Star icon size for standard displays
 */
export const STAR_RATING_SIZE_DEFAULT_PX = 18;

/**
 * Star icon size for interactive rating input
 */
export const STAR_RATING_SIZE_INPUT_PX = 32;

// ─── Progress Values ──────────────────────────────────────────────────────────
/**
 * Minimum reading progress percentage
 */
export const READING_PROGRESS_MIN_PERCENT = 0;

/**
 * Maximum reading progress percentage
 */
export const READING_PROGRESS_MAX_PERCENT = 100;

/**
 * Progress auto-set when book marked as finished
 */
export const READING_PROGRESS_FINISHED_PERCENT = 100;

// ─── List/Grid ────────────────────────────────────────────────────────────────
/**
 * Maximum items in bottom navigation (per UX best practices)
 */
export const BOTTOM_NAV_MAX_ITEMS = 5;

/**
 * Number of skeleton items to show during loading
 */
export const SKELETON_ITEMS_COUNT = 6;

// ─── Contrast Ratios (WCAG) ───────────────────────────────────────────────────
/**
 * Minimum contrast ratio for normal text (WCAG AA)
 */
export const CONTRAST_RATIO_TEXT_MIN = 4.5;

/**
 * Minimum contrast ratio for large text (WCAG AA)
 */
export const CONTRAST_RATIO_LARGE_TEXT_MIN = 3.0;
