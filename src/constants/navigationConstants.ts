/**
 * =========================================================================
 *  Navigation Constants
 * =========================================================================
 *
 *  Route names, screen keys, and navigation-related configuration
 *  for React Navigation.
 *
 * =========================================================================
 */

// ─── Screen Route Names ───────────────────────────────────────────────────────
/**
 * Login screen route name
 */
export const ROUTE_NAME_LOGIN_SCREEN = 'Login';

/**
 * Main tabs navigator route name
 */
export const ROUTE_NAME_TABS_NAVIGATOR = 'Tabs';

/**
 * Book detail screen route name
 */
export const ROUTE_NAME_BOOK_DETAIL_SCREEN = 'BookDetail';

/**
 * EPUB reader screen route name
 */
export const ROUTE_NAME_READER_SCREEN = 'Reader';

// ─── Tab Route Names ──────────────────────────────────────────────────────────
/**
 * Home tab route name
 */
export const ROUTE_NAME_HOME_TAB = 'Home';

/**
 * Search tab route name
 */
export const ROUTE_NAME_SEARCH_TAB = 'Search';

/**
 * Library tab route name
 */
export const ROUTE_NAME_LIBRARY_TAB = 'Library';

/**
 * Profile tab route name
 */
export const ROUTE_NAME_PROFILE_TAB = 'Profile';

// ─── Tab Icon Names (MaterialCommunityIcons) ──────────────────────────────────
/**
 * Icon name for Home tab
 */
export const TAB_ICON_HOME = 'home';

/**
 * Icon name for Search tab
 */
export const TAB_ICON_SEARCH = 'magnify';

/**
 * Icon name for Library tab
 */
export const TAB_ICON_LIBRARY = 'bookshelf';

/**
 * Icon name for Profile tab
 */
export const TAB_ICON_PROFILE = 'account';

// ─── Navigation Animation ─────────────────────────────────────────────────────
/**
 * Default screen transition animation
 */
export const SCREEN_TRANSITION_DEFAULT = 'slide_from_right';

/**
 * Screen transition for reader (fade for immersive experience)
 */
export const SCREEN_TRANSITION_READER = 'fade';

// ─── Deep Link Prefixes ───────────────────────────────────────────────────────
/**
 * App scheme for deep linking
 */
export const DEEP_LINK_SCHEME = 'pixelreads://';

/**
 * Deep link path for book details
 */
export const DEEP_LINK_PATH_BOOK = 'book';

/**
 * Deep link path for search
 */
export const DEEP_LINK_PATH_SEARCH = 'search';
