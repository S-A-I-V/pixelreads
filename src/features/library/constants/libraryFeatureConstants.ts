/**
 * =========================================================================
 *  Library Feature Constants
 * =========================================================================
 *
 *  Constants for the book library feature including shelf configuration,
 *  UI labels, filter options, tags, and custom shelves.
 *
 * =========================================================================
 */

import type { BookShelfKeyWithAll, BuiltInShelfKey } from '../../../shared/types/bookTypes';

/**
 * Tab filter configuration for library screen
 */
export interface LibraryShelfTabConfiguration {
  /** Internal key identifier */
  readonly key: BookShelfKeyWithAll;
  /** User-facing tab label */
  readonly label: string;
}

/**
 * Ordered list of shelf tabs for the library filter bar
 */
export const LIBRARY_SHELF_TAB_CONFIGURATIONS: ReadonlyArray<LibraryShelfTabConfiguration> = [
  { key: 'all', label: 'All' },
  { key: 'reading', label: 'Reading' },
  { key: 'want_to_read', label: 'Want' },
  { key: 'finished', label: 'Done' },
  { key: 'dnf', label: 'DNF' },
] as const;

/**
 * Built-in shelf keys (cannot be deleted)
 */
export const BUILT_IN_SHELF_KEYS: ReadonlyArray<BuiltInShelfKey> = [
  'reading',
  'want_to_read', 
  'finished',
  'dnf',
] as const;

/**
 * Shelf options for book detail shelf picker
 */
export interface LibraryShelfPickerOption {
  /** Internal key identifier */
  readonly key: 'reading' | 'want_to_read' | 'finished' | 'dnf';
  /** Full display label */
  readonly label: string;
}

/**
 * Ordered list of shelf options for the shelf picker modal
 */
export const LIBRARY_SHELF_PICKER_OPTIONS: ReadonlyArray<LibraryShelfPickerOption> = [
  { key: 'reading', label: 'Currently Reading' },
  { key: 'want_to_read', label: 'Want to Read' },
  { key: 'finished', label: 'Finished' },
  { key: 'dnf', label: 'Did Not Finish' },
] as const;

// ─── Filter Options ───────────────────────────────────────────────────────────
/**
 * eReader filter option values
 */
export const LIBRARY_EREADER_FILTER_OPTIONS = {
  /** Show all books regardless of eReader status */
  ALL: null,
  /** Show only books with uploaded EPUB */
  HAS_EPUB: true,
  /** Show only books without uploaded EPUB */
  NO_EPUB: false,
} as const;

/**
 * eReader filter option labels
 */
export const LIBRARY_EREADER_FILTER_LABELS = {
  ALL: 'All Books',
  HAS_EPUB: 'Has eReader',
  NO_EPUB: 'No eReader',
} as const;

/**
 * Filter section labels
 */
export const LIBRARY_FILTER_SECTION_LABELS = {
  SHELVES: 'Shelves',
  TAGS: 'Tags',
  EREADER: 'eReader',
  CUSTOM_SHELVES: 'Custom Shelves',
} as const;

// ─── Tag Management ───────────────────────────────────────────────────────────
/**
 * Default colors for new tags
 */
export const TAG_DEFAULT_COLORS: ReadonlyArray<string> = [
  '#e94560', // Pink/Red
  '#16a34a', // Green
  '#2563eb', // Blue
  '#7c3aed', // Purple
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#f97316', // Orange
  '#8b5cf6', // Violet
] as const;

/**
 * Maximum number of tags per book
 */
export const TAG_MAX_PER_BOOK = 10;

/**
 * Maximum length for tag label
 */
export const TAG_LABEL_MAX_LENGTH = 30;

/**
 * Minimum length for tag label
 */
export const TAG_LABEL_MIN_LENGTH = 1;

/**
 * Placeholder text for tag input
 */
export const TAG_INPUT_PLACEHOLDER = 'Enter tag name...';

/**
 * Button label to add new tag
 */
export const TAG_BUTTON_ADD = 'Add Tag';

/**
 * Button label to create new tag
 */
export const TAG_BUTTON_CREATE = 'Create Tag';

/**
 * Section title for tags on book detail
 */
export const BOOK_DETAIL_SECTION_TAGS = 'Tags';

/**
 * Empty state text when no tags exist
 */
export const TAG_EMPTY_STATE_TEXT = 'No tags yet';

/**
 * Empty state subtext when no tags exist
 */
export const TAG_EMPTY_STATE_SUBTEXT = 'Tap + to create your first tag';

/**
 * Confirmation dialog title for deleting tag
 */
export const TAG_DELETE_DIALOG_TITLE = 'Delete Tag?';

/**
 * Confirmation dialog message for deleting tag
 */
export const TAG_DELETE_DIALOG_MESSAGE = 'This tag will be removed from all books.';

// ─── Custom Shelf Management ──────────────────────────────────────────────────
/**
 * Default colors for new custom shelves
 */
export const CUSTOM_SHELF_DEFAULT_COLORS: ReadonlyArray<string> = [
  '#6366f1', // Indigo
  '#14b8a6', // Teal
  '#f43f5e', // Rose
  '#a855f7', // Purple
  '#eab308', // Yellow
] as const;

/**
 * Maximum number of custom shelves
 */
export const CUSTOM_SHELF_MAX_COUNT = 20;

/**
 * Maximum length for custom shelf label
 */
export const CUSTOM_SHELF_LABEL_MAX_LENGTH = 25;

/**
 * Minimum length for custom shelf label
 */
export const CUSTOM_SHELF_LABEL_MIN_LENGTH = 1;

/**
 * Placeholder text for custom shelf name input
 */
export const CUSTOM_SHELF_INPUT_PLACEHOLDER = 'Enter shelf name...';

/**
 * Button label to create new shelf
 */
export const CUSTOM_SHELF_BUTTON_CREATE = 'Create Shelf';

/**
 * Button label to add custom shelf
 */
export const CUSTOM_SHELF_BUTTON_ADD = 'New Shelf';

/**
 * Empty state text when no custom shelves exist
 */
export const CUSTOM_SHELF_EMPTY_STATE_TEXT = 'No custom shelves';

/**
 * Empty state subtext when no custom shelves exist
 */
export const CUSTOM_SHELF_EMPTY_STATE_SUBTEXT = 'Create shelves to organize your books';

/**
 * Confirmation dialog title for deleting custom shelf
 */
export const CUSTOM_SHELF_DELETE_DIALOG_TITLE = 'Delete Shelf?';

/**
 * Confirmation dialog message for deleting custom shelf
 */
export const CUSTOM_SHELF_DELETE_DIALOG_MESSAGE = 
  'Books on this shelf will be moved to "Want to Read".';

// ─── Filter Chip Labels ───────────────────────────────────────────────────────
/**
 * Label for filter chip showing active tag filter
 */
export const FILTER_CHIP_TAG_PREFIX = 'Tag:';

/**
 * Label for filter chip showing active eReader filter
 */
export const FILTER_CHIP_EREADER_PREFIX = 'eReader:';

/**
 * Label for clear all filters button
 */
export const FILTER_BUTTON_CLEAR_ALL = 'Clear Filters';

/**
 * Label for filter button/icon
 */
export const FILTER_BUTTON_LABEL = 'Filters';

// ─── Screen Headers ───────────────────────────────────────────────────────────
/**
 * Library screen header title
 */
export const LIBRARY_SCREEN_HEADER_TITLE = 'Library';

/**
 * Book detail screen header title
 */
export const BOOK_DETAIL_SCREEN_HEADER_TITLE = 'Book Details';

// ─── Empty State Messages ─────────────────────────────────────────────────────
/**
 * Message when library filter returns no results
 */
export const LIBRARY_EMPTY_STATE_NO_MATCHES_TITLE = 'No matches found';

/**
 * Subtext when library filter returns no results
 */
export const LIBRARY_EMPTY_STATE_NO_MATCHES_SUBTITLE = 'Try different keywords';

/**
 * Message when shelf is empty
 */
export const LIBRARY_EMPTY_STATE_EMPTY_SHELF_TITLE = 'Shelf is empty';

/**
 * Subtext when shelf is empty
 */
export const LIBRARY_EMPTY_STATE_EMPTY_SHELF_SUBTITLE = 'Add books from Search';

// ─── Filter Input ─────────────────────────────────────────────────────────────
/**
 * Placeholder text for library filter input
 */
export const LIBRARY_FILTER_INPUT_PLACEHOLDER = 'Filter library...';

/**
 * Minimum characters to trigger filter analytics
 */
export const LIBRARY_FILTER_ANALYTICS_TRIGGER_LENGTH = 3;

// ─── Book Detail ──────────────────────────────────────────────────────────────
/**
 * Button label when book is not in library
 */
export const BOOK_DETAIL_BUTTON_ADD_TO_LIBRARY = 'Add to Library';

/**
 * Button label when book is already in library
 */
export const BOOK_DETAIL_BUTTON_CHANGE_SHELF = 'Change Shelf';

/**
 * Section title for reading progress
 */
export const BOOK_DETAIL_SECTION_READING_PROGRESS = 'Reading Progress';

/**
 * Section title for user rating
 */
export const BOOK_DETAIL_SECTION_MY_RATING = 'My Rating';

/**
 * Section title for description
 */
export const BOOK_DETAIL_SECTION_DESCRIPTION = 'Description';

/**
 * Section title for categories
 */
export const BOOK_DETAIL_SECTION_CATEGORIES = 'Categories';

/**
 * Section title for publication details
 */
export const BOOK_DETAIL_SECTION_PUBLICATION_DETAILS = 'Publication Details';

/**
 * Section title for availability info
 */
export const BOOK_DETAIL_SECTION_AVAILABILITY = 'Availability';

/**
 * Section title for external links
 */
export const BOOK_DETAIL_SECTION_LINKS = 'Links';

/**
 * Section title for ebook reader
 */
export const BOOK_DETAIL_SECTION_EBOOK_READER = 'E-Book Reader';

/**
 * Section title for identifiers
 */
export const BOOK_DETAIL_SECTION_IDENTIFIERS = 'Identifiers';

// ─── Confirmation Dialogs ─────────────────────────────────────────────────────
/**
 * Title for remove book confirmation dialog
 */
export const BOOK_DETAIL_DIALOG_REMOVE_TITLE = 'Remove book?';

/**
 * Message for remove book confirmation dialog
 */
export const BOOK_DETAIL_DIALOG_REMOVE_MESSAGE = 'This will remove the book from your library.';

/**
 * Button label for cancel action
 */
export const BOOK_DETAIL_DIALOG_BUTTON_CANCEL = 'Cancel';

/**
 * Button label for confirm remove action
 */
export const BOOK_DETAIL_DIALOG_BUTTON_REMOVE = 'Remove';

/**
 * Title for remove ebook file dialog
 */
export const BOOK_DETAIL_DIALOG_REMOVE_EBOOK_TITLE = 'Remove E-Book?';

/**
 * Message for remove ebook file dialog
 */
export const BOOK_DETAIL_DIALOG_REMOVE_EBOOK_MESSAGE = 
  'This will delete the imported file. You can import it again later.';

// ─── EPUB Import ──────────────────────────────────────────────────────────────
/**
 * Button label for importing EPUB file
 */
export const BOOK_DETAIL_BUTTON_IMPORT_EPUB = 'Import EPUB File';

/**
 * Button label for reading imported book
 */
export const BOOK_DETAIL_BUTTON_READ_NOW = 'Read Now';

/**
 * Success message after EPUB import
 */
export const BOOK_DETAIL_EPUB_IMPORT_SUCCESS_TITLE = 'Success';

/**
 * Success message body after EPUB import
 */
export const BOOK_DETAIL_EPUB_IMPORT_SUCCESS_MESSAGE = 
  'EPUB imported! Tap "Read Now" to start reading.';

/**
 * Error title for invalid file type
 */
export const BOOK_DETAIL_EPUB_INVALID_FILE_TITLE = 'Invalid File';

/**
 * Error message for invalid file type
 */
export const BOOK_DETAIL_EPUB_INVALID_FILE_MESSAGE = 
  'Please select an EPUB (.epub) file.';

/**
 * Hint text explaining EPUB reader functionality
 */
export const BOOK_DETAIL_EPUB_READER_HINT = 
  'Import your own EPUB file to read within the app with bookmarks, highlights, and reading progress.';

// ─── Link Button Labels ───────────────────────────────────────────────────────
/**
 * Label for preview link button
 */
export const BOOK_DETAIL_LINK_BUTTON_PREVIEW = 'Preview';

/**
 * Label for more info link button
 */
export const BOOK_DETAIL_LINK_BUTTON_INFO = 'More Info';

/**
 * Label for buy link button
 */
export const BOOK_DETAIL_LINK_BUTTON_BUY = 'Buy';

/**
 * Label for web reader link button
 */
export const BOOK_DETAIL_LINK_BUTTON_WEB_READER = 'Read Online';

// ─── Progress Input ───────────────────────────────────────────────────────────
/**
 * Placeholder for progress input
 */
export const BOOK_DETAIL_PROGRESS_INPUT_PLACEHOLDER = '0';

/**
 * Button label for saving progress
 */
export const BOOK_DETAIL_BUTTON_SAVE_PROGRESS = 'Save';

// ─── Placeholder Text ─────────────────────────────────────────────────────────
/**
 * Text shown when book has no cover image
 */
export const BOOK_COVER_PLACEHOLDER_TEXT = 'No Cover';

/**
 * Text shown for unknown author
 */
export const BOOK_AUTHOR_UNKNOWN_TEXT = 'Unknown';

/**
 * Text shown for unknown author (full)
 */
export const BOOK_AUTHOR_UNKNOWN_FULL_TEXT = 'Unknown author';

/**
 * Text shown when book is not found
 */
export const BOOK_DETAIL_NOT_FOUND_TEXT = 'Book not found';

/**
 * Button label to go back
 */
export const BOOK_DETAIL_BUTTON_GO_BACK = 'Go Back';
