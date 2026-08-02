/**
 * =========================================================================
 *  User Book Library Store
 * =========================================================================
 *
 *  Zustand store for managing the user's book library including
 *  shelves, ratings, progress tracking, and uploaded files.
 *
 * =========================================================================
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEY_BOOK_LIBRARY } from '../../../constants/storageConstants';
import { READING_PROGRESS_FINISHED_PERCENT } from '../../../constants/uiConstants';
import type {
  BookShelfKey,
  GoogleBooksNormalizedBookData,
  UserLibraryBookEntry,
  UserLibraryReadingStatistics,
} from '../../../shared/types/bookTypes';

// Analytics (will be converted to TypeScript later)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const analytics = require('../../../utils/analytics');

/**
 * Book shelves state structure
 */
interface UserBookLibraryShelves {
  reading: UserLibraryBookEntry[];
  want_to_read: UserLibraryBookEntry[];
  finished: UserLibraryBookEntry[];
  dnf: UserLibraryBookEntry[];
}

/**
 * Uploaded file metadata for EPUB imports
 */
interface UserBookUploadedFileInfo {
  /** File system URI */
  uri: string;
  /** Original file name */
  name?: string;
  /** File type */
  type?: string;
  /** File extension */
  ext?: string;
}

/**
 * Store state interface
 */
interface UserBookLibraryState {
  /** Book collections organized by shelf */
  shelves: UserBookLibraryShelves;
  
  /** Reading positions for books (page index) */
  readingPositions: Record<string, number>;
  
  /** Uploaded file metadata for EPUB imports */
  uploadedFiles: Record<string, UserBookUploadedFileInfo>;
}

/**
 * Store actions interface
 */
interface UserBookLibraryActions {
  /**
   * Add a book to a specific shelf (or move if already in library)
   */
  addBookToShelf: (
    bookData: GoogleBooksNormalizedBookData | UserLibraryBookEntry,
    targetShelf: BookShelfKey
  ) => void;
  
  /**
   * Remove a book from library entirely
   */
  removeBookFromLibrary: (bookId: string) => void;
  
  /**
   * Update reading progress for a book
   */
  updateBookReadingProgress: (bookId: string, progressPercent: number) => void;
  
  /**
   * Rate a book and optionally add review
   */
  rateBookWithReview: (bookId: string, starRating: number, reviewText?: string) => void;
  
  /**
   * Get the shelf a book is currently on (or null if not in library)
   */
  getBookCurrentShelf: (bookId: string) => BookShelfKey | null;
  
  /**
   * Get full book data by ID
   */
  getBookById: (bookId: string) => UserLibraryBookEntry | null;
  
  /**
   * Get all books across all shelves
   */
  getAllLibraryBooks: () => UserLibraryBookEntry[];
  
  /**
   * Get reading statistics
   */
  getLibraryStatistics: () => UserLibraryReadingStatistics;
  
  /**
   * Save reading position for a book
   */
  saveBookReadingPosition: (bookId: string, pageIndex: number) => void;
  
  /**
   * Get reading position for a book
   */
  getBookReadingPosition: (bookId: string) => number;
  
  /**
   * Save uploaded file info for a book
   */
  saveBookUploadedFile: (bookId: string, fileInfo: UserBookUploadedFileInfo) => void;
  
  /**
   * Get uploaded file info for a book
   */
  getBookUploadedFile: (bookId: string) => UserBookUploadedFileInfo | null;
  
  /**
   * Remove uploaded file info for a book
   */
  removeBookUploadedFile: (bookId: string) => void;
}

/**
 * Combined store type
 */
type UserBookLibraryStoreType = UserBookLibraryState & UserBookLibraryActions;

/**
 * Book library store for managing user's book collection
 *
 * @example
 * ```tsx
 * // Add book to shelf
 * const addBookToShelf = useUserBookLibraryStore((state) => state.addBookToShelf);
 * addBookToShelf(bookData, 'reading');
 *
 * // Get current shelf
 * const getBookCurrentShelf = useUserBookLibraryStore((state) => state.getBookCurrentShelf);
 * const shelf = getBookCurrentShelf(bookId);
 *
 * // Update progress
 * const updateProgress = useUserBookLibraryStore((state) => state.updateBookReadingProgress);
 * updateProgress(bookId, 45);
 * ```
 */
export const useUserBookLibraryStore = create<UserBookLibraryStoreType>()(
  persist(
    (set, get): UserBookLibraryStoreType => ({
      // ─── Initial State ────────────────────────────────────────────────
      shelves: {
        reading: [],
        want_to_read: [],
        finished: [],
        dnf: [],
      },
      readingPositions: {},
      uploadedFiles: {},

      // ─── Actions ──────────────────────────────────────────────────────
      addBookToShelf(bookData, targetShelf) {
        const { shelves, getBookCurrentShelf } = get();
        const previousShelf = getBookCurrentShelf(bookData.id);

        // Remove from all shelves first (handles move operation)
        const cleanedShelves: UserBookLibraryShelves = {
          reading: shelves.reading.filter((b) => b.id !== bookData.id),
          want_to_read: shelves.want_to_read.filter((b) => b.id !== bookData.id),
          finished: shelves.finished.filter((b) => b.id !== bookData.id),
          dnf: shelves.dnf.filter((b) => b.id !== bookData.id),
        };

        // Create library entry with metadata
        const libraryEntry: UserLibraryBookEntry = {
          ...bookData,
          shelf: targetShelf,
          addedAt: new Date().toISOString(),
          progress: targetShelf === 'finished' 
            ? READING_PROGRESS_FINISHED_PERCENT 
            : ('progress' in bookData ? bookData.progress : 0),
          rating: 'rating' in bookData ? bookData.rating : 0,
          review: 'review' in bookData ? bookData.review : '',
        };

        // Add to target shelf
        set({
          shelves: {
            ...cleanedShelves,
            [targetShelf]: [...cleanedShelves[targetShelf], libraryEntry],
          },
        });

        // Analytics
        analytics.trackBookAddToShelf(bookData.id, bookData.title, targetShelf);
        console.log(
          `[LibraryStore] Added "${bookData.title}" to ${targetShelf}` +
          (previousShelf ? ` (moved from ${previousShelf})` : '')
        );
      },

      removeBookFromLibrary(bookId) {
        const { shelves, getBookById, getBookCurrentShelf } = get();
        const bookData = getBookById(bookId);
        const previousShelf = getBookCurrentShelf(bookId);

        set({
          shelves: {
            reading: shelves.reading.filter((b) => b.id !== bookId),
            want_to_read: shelves.want_to_read.filter((b) => b.id !== bookId),
            finished: shelves.finished.filter((b) => b.id !== bookId),
            dnf: shelves.dnf.filter((b) => b.id !== bookId),
          },
        });

        // Analytics
        if (bookData && previousShelf) {
          analytics.trackBookRemoveFromShelf(bookId, bookData.title, previousShelf);
          console.log(`[LibraryStore] Removed "${bookData.title}" from ${previousShelf}`);
        }
      },

      updateBookReadingProgress(bookId, progressPercent) {
        const { shelves, getBookById } = get();
        const bookData = getBookById(bookId);
        const previousProgress = bookData?.progress ?? 0;

        const updateShelfBooks = (books: UserLibraryBookEntry[]): UserLibraryBookEntry[] =>
          books.map((b) => (b.id === bookId ? { ...b, progress: progressPercent } : b));

        set({
          shelves: {
            reading: updateShelfBooks(shelves.reading),
            want_to_read: updateShelfBooks(shelves.want_to_read),
            finished: updateShelfBooks(shelves.finished),
            dnf: updateShelfBooks(shelves.dnf),
          },
        });

        // Analytics (only if meaningful change)
        if (Math.abs(progressPercent - previousProgress) >= 1) {
          analytics.trackProgressUpdate(bookId, progressPercent, previousProgress);
          console.log(
            `[LibraryStore] Progress "${bookData?.title}": ${previousProgress}% → ${progressPercent}%`
          );
        }
      },

      rateBookWithReview(bookId, starRating, reviewText) {
        const { shelves, getBookById } = get();
        const bookData = getBookById(bookId);
        const previousRating = bookData?.rating ?? 0;

        const updateShelfBooks = (books: UserLibraryBookEntry[]): UserLibraryBookEntry[] =>
          books.map((b) =>
            b.id === bookId
              ? { ...b, rating: starRating, review: reviewText ?? b.review }
              : b
          );

        set({
          shelves: {
            reading: updateShelfBooks(shelves.reading),
            want_to_read: updateShelfBooks(shelves.want_to_read),
            finished: updateShelfBooks(shelves.finished),
            dnf: updateShelfBooks(shelves.dnf),
          },
        });

        // Analytics
        analytics.trackBookRate(bookId, bookData?.title, starRating, previousRating);
        console.log(
          `[LibraryStore] Rated "${bookData?.title}": ${previousRating}★ → ${starRating}★`
        );
      },

      getBookCurrentShelf(bookId) {
        const { shelves } = get();
        const shelfEntries = Object.entries(shelves) as [BookShelfKey, UserLibraryBookEntry[]][];
        
        for (const [shelfKey, books] of shelfEntries) {
          if (books.find((b) => b.id === bookId)) {
            return shelfKey;
          }
        }
        return null;
      },

      getBookById(bookId) {
        const { shelves } = get();
        
        for (const books of Object.values(shelves)) {
          const foundBook = books.find((book: UserLibraryBookEntry) => book.id === bookId);
          if (foundBook) return foundBook;
        }
        return null;
      },

      getAllLibraryBooks() {
        return Object.values(get().shelves).flat();
      },

      getLibraryStatistics() {
        const { shelves } = get();
        const allBooks = Object.values(shelves).flat();
        
        return {
          total: allBooks.length,
          reading: shelves.reading.length,
          wantToRead: shelves.want_to_read.length,
          finished: shelves.finished.length,
          dnf: shelves.dnf.length,
        };
      },

      saveBookReadingPosition(bookId, pageIndex) {
        set((state) => ({
          readingPositions: { ...state.readingPositions, [bookId]: pageIndex },
        }));
      },

      getBookReadingPosition(bookId) {
        return get().readingPositions[bookId] ?? 0;
      },

      saveBookUploadedFile(bookId, fileInfo) {
        set((state) => ({
          uploadedFiles: { ...state.uploadedFiles, [bookId]: fileInfo },
        }));
      },

      getBookUploadedFile(bookId) {
        return get().uploadedFiles[bookId] ?? null;
      },

      removeBookUploadedFile(bookId) {
        set((state) => {
          const updatedFiles = { ...state.uploadedFiles };
          delete updatedFiles[bookId];
          return { uploadedFiles: updatedFiles };
        });
      },
    }),
    {
      name: STORAGE_KEY_BOOK_LIBRARY,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// ─── Selectors ──────────────────────────────────────────────────────────────
/**
 * Selector: Get all books from a specific shelf
 */
export function selectBooksByShelf(
  state: UserBookLibraryStoreType,
  shelfKey: BookShelfKey
): UserLibraryBookEntry[] {
  return state.shelves[shelfKey];
}

/**
 * Selector: Get count of books on a shelf
 */
export function selectShelfBookCount(
  state: UserBookLibraryStoreType,
  shelfKey: BookShelfKey
): number {
  return state.shelves[shelfKey].length;
}

/**
 * Selector: Check if a book is in the library
 */
export function selectIsBookInLibrary(
  state: UserBookLibraryStoreType,
  bookId: string
): boolean {
  return state.getBookCurrentShelf(bookId) !== null;
}

// Re-export as default for backward compatibility
export default useUserBookLibraryStore;
