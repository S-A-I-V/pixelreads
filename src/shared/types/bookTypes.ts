/**
 * =========================================================================
 *  Book Domain Types
 * =========================================================================
 *
 *  Type definitions for book entities, search results, and library management.
 *
 * =========================================================================
 */

/**
 * Shelf identifier for library organization
 */
export type BookShelfKey = 'reading' | 'want_to_read' | 'finished' | 'dnf';

/**
 * Extended shelf key including virtual "all" shelf
 */
export type BookShelfKeyWithAll = BookShelfKey | 'all';

/**
 * Core book data normalized from Google Books API
 */
export interface GoogleBooksNormalizedBookData {
  /** Google Books volume ID */
  readonly id: string;
  
  /** Book title */
  readonly title: string;
  
  /** Book subtitle (optional) */
  readonly subtitle: string;
  
  /** List of author names */
  readonly authors: ReadonlyArray<string>;
  
  /** Book description/synopsis */
  readonly description: string;
  
  /** Publisher name */
  readonly publisher: string;
  
  /** Publication date (YYYY-MM-DD or YYYY) */
  readonly publishedDate: string;
  
  /** Total page count */
  readonly pageCount: number;
  
  /** Language code (e.g., "en") */
  readonly language: string;
  
  /** Genre/category classifications */
  readonly categories: ReadonlyArray<string>;
  
  /** Average user rating (1-5) */
  readonly averageRating: number | null;
  
  /** Total number of ratings */
  readonly ratingsCount: number;
  
  /** Content maturity rating */
  readonly maturityRating: string;
  
  /** ISBN identifier */
  readonly isbn: string;
  
  /** HTTPS URL to book cover thumbnail */
  readonly thumbnail: string | null;
  
  /** URL to preview the book on Google */
  readonly previewLink: string;
  
  /** URL to book info on Google */
  readonly infoLink: string;
  
  /** Sale status (FOR_SALE, FREE, NOT_FOR_SALE) */
  readonly saleability: string;
  
  /** Whether the book is an e-book */
  readonly isEbook: boolean;
  
  /** Whether the book is free */
  readonly isFree: boolean;
  
  /** URL to purchase the book */
  readonly buyLink: string;
  
  /** Formatted price string (e.g., "9.99 USD") */
  readonly price: string | null;
  
  /** Viewability status (PARTIAL, FULL, NO_PAGES) */
  readonly viewability: string;
  
  /** Whether book is in public domain */
  readonly publicDomain: boolean;
  
  /** Whether EPUB format is available */
  readonly epubAvailable: boolean;
  
  /** Whether PDF format is available */
  readonly pdfAvailable: boolean;
  
  /** URL to web reader */
  readonly webReaderLink: string;
}

/**
 * Book stored in user's library with tracking metadata
 */
export interface UserLibraryBookEntry extends GoogleBooksNormalizedBookData {
  /** Current shelf assignment */
  shelf: BookShelfKey;
  
  /** ISO timestamp when book was added to library */
  addedAt: string;
  
  /** User's rating (0-5, 0 means unrated) */
  rating: number;
  
  /** User's review text */
  review: string;
  
  /** Reading progress percentage (0-100) */
  progress: number;
}

/**
 * Search results from Google Books API
 */
export interface GoogleBooksSearchApiResponse {
  /** Normalized book items */
  readonly items: ReadonlyArray<GoogleBooksNormalizedBookData>;
  
  /** Total number of matching results (for pagination) */
  readonly totalItems: number;
}

/**
 * Shelf configuration for UI rendering
 */
export interface BookShelfDisplayConfiguration {
  /** Internal shelf key */
  readonly key: BookShelfKeyWithAll;
  
  /** User-facing label */
  readonly label: string;
}

/**
 * Reading statistics aggregation
 */
export interface UserLibraryReadingStatistics {
  /** Total books in library */
  readonly total: number;
  
  /** Books currently being read */
  readonly reading: number;
  
  /** Books user wants to read */
  readonly wantToRead: number;
  
  /** Completed books */
  readonly finished: number;
  
  /** Did-not-finish books */
  readonly dnf: number;
}

/**
 * Props for book list item rendering
 */
export interface BookListItemRenderProps {
  /** Book data to render */
  readonly book: UserLibraryBookEntry | GoogleBooksNormalizedBookData;
  
  /** Handler for item press */
  readonly onPress: () => void;
  
  /** Current shelf (optional, for status badge) */
  readonly currentShelf?: BookShelfKey | null;
}

/**
 * Props for book card rendering
 */
export interface BookCardRenderProps extends BookListItemRenderProps {
  /** Whether to show progress bar */
  readonly showProgressIndicator?: boolean;
}
