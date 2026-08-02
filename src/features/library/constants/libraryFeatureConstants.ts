/**
 * =========================================================================
 *  Library Feature Constants
 * =========================================================================
 *
 *  Constants for the book library feature including shelf configuration,
 *  UI labels, and filter options.
 *
 * =========================================================================
 */

import type { BookShelfKeyWithAll } from '../../../shared/types/bookTypes';

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
