/**
 * =========================================================================
 *  User Book Library Store
 * =========================================================================
 *
 *  Zustand store for managing the user's book library including
 *  shelves, ratings, progress tracking, uploaded files, tags, and custom shelves.
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
  BuiltInShelfKey,
  GoogleBooksNormalizedBookData,
  UserLibraryBookEntry,
  UserLibraryReadingStatistics,
  BookTag,
  CustomShelfDefinition,
} from '../../../shared/types/bookTypes';

// Analytics (will be converted to TypeScript later)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const analytics = require('../../../utils/analytics');
const { syncBookToSupabase, removeBookFromSupabase, updateBookInSupabase, updateBookTagsInSupabase, syncTagToSupabase, removeTagFromSupabase, syncShelfToSupabase, removeShelfFromSupabase } = require('../../../lib/supabaseSync');

/**
 * Built-in shelf keys
 */
const BUILT_IN_SHELF_KEYS: BuiltInShelfKey[] = ['reading', 'want_to_read', 'finished', 'dnf'];

/**
 * Default tag colors for new tags
 */
const DEFAULT_TAG_COLORS = [
  '#e94560', '#16a34a', '#2563eb', '#7c3aed', '#f59e0b',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#8b5cf6',
] as const;

/**
 * Default shelf colors for new custom shelves
 */
const DEFAULT_SHELF_COLORS = [
  '#6366f1', '#14b8a6', '#f43f5e', '#a855f7', '#eab308',
] as const;

/**
 * Book shelves state structure (built-in + custom)
 */
interface UserBookLibraryShelves {
  reading: UserLibraryBookEntry[];
  want_to_read: UserLibraryBookEntry[];
  finished: UserLibraryBookEntry[];
  dnf: UserLibraryBookEntry[];
  [customShelfId: string]: UserLibraryBookEntry[];
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
  /** File size in bytes */
  fileSize?: number;
  /** Original file name */
  fileName?: string;
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
  
  /** User-created tags */
  tags: BookTag[];
  
  /** User-created custom shelves */
  customShelves: CustomShelfDefinition[];
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
  
  // ─── Tag Management ─────────────────────────────────────────────────────
  
  /**
   * Create a new tag
   */
  createTag: (label: string, color?: string) => BookTag;
  
  /**
   * Delete a tag (removes from all books)
   */
  deleteTag: (tagId: string) => void;
  
  /**
   * Update tag properties
   */
  updateTag: (tagId: string, updates: Partial<Pick<BookTag, 'label' | 'color'>>) => void;
  
  /**
   * Add a tag to a book
   */
  addTagToBook: (bookId: string, tagId: string) => void;
  
  /**
   * Remove a tag from a book
   */
  removeTagFromBook: (bookId: string, tagId: string) => void;
  
  /**
   * Get all tags
   */
  getAllTags: () => BookTag[];
  
  /**
   * Get books by tag
   */
  getBooksByTag: (tagId: string) => UserLibraryBookEntry[];
  
  // ─── Custom Shelf Management ────────────────────────────────────────────
  
  /**
   * Create a new custom shelf
   */
  createCustomShelf: (label: string, color?: string) => CustomShelfDefinition;
  
  /**
   * Delete a custom shelf (moves books to want_to_read)
   */
  deleteCustomShelf: (shelfId: string) => void;
  
  /**
   * Update custom shelf properties
   */
  updateCustomShelf: (shelfId: string, updates: Partial<Pick<CustomShelfDefinition, 'label' | 'color'>>) => void;
  
  /**
   * Get all custom shelves
   */
  getCustomShelves: () => CustomShelfDefinition[];
  
  /**
   * Check if a shelf is custom
   */
  isCustomShelf: (shelfKey: string) => boolean;
  
  // ─── eReader Filter ─────────────────────────────────────────────────────
  
  /**
   * Get books with uploaded EPUBs
   */
  getBooksWithEpub: () => UserLibraryBookEntry[];
  
  /**
   * Mark book as having uploaded EPUB
   */
  setBookHasEpub: (bookId: string, hasEpub: boolean) => void;
  
  /**
   * Update book page info (current page, total pages)
   */
  updateBookPageInfo: (bookId: string, currentPage: number, totalPages?: number) => void;
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
      tags: [],
      customShelves: [],

      // ─── Actions ──────────────────────────────────────────────────────
      addBookToShelf(bookData, targetShelf) {
        const { shelves, getBookCurrentShelf, customShelves, uploadedFiles } = get();
        const previousShelf = getBookCurrentShelf(bookData.id);

        // Build list of all shelf keys (built-in + custom)
        const allShelfKeys = [...BUILT_IN_SHELF_KEYS, ...customShelves.map(s => s.id)];

        // Remove from all shelves first (handles move operation)
        const cleanedShelves: UserBookLibraryShelves = { ...shelves };
        for (const key of allShelfKeys) {
          if (cleanedShelves[key]) {
            cleanedShelves[key] = cleanedShelves[key].filter((b) => b.id !== bookData.id);
          }
        }

        // Check if book has uploaded EPUB
        const hasUploadedEpub = !!uploadedFiles[bookData.id];

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
          tags: 'tags' in bookData ? bookData.tags : [],
          hasUploadedEpub,
          currentPage: 'currentPage' in bookData ? bookData.currentPage : 0,
          totalPages: 'totalPages' in bookData ? bookData.totalPages : 0,
        };

        // Ensure target shelf exists
        if (!cleanedShelves[targetShelf]) {
          cleanedShelves[targetShelf] = [];
        }

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

        // Sync to Supabase — pass the fully hydrated libraryEntry, not raw bookData
        syncBookToSupabase(libraryEntry, targetShelf);
      },

      removeBookFromLibrary(bookId) {
        const { shelves, getBookById, getBookCurrentShelf, customShelves } = get();
        const bookData = getBookById(bookId);
        const previousShelf = getBookCurrentShelf(bookId);

        // Build list of all shelf keys
        const allShelfKeys = [...BUILT_IN_SHELF_KEYS, ...customShelves.map(s => s.id)];

        // Remove from all shelves
        const cleanedShelves: UserBookLibraryShelves = { ...shelves };
        for (const key of allShelfKeys) {
          if (cleanedShelves[key]) {
            cleanedShelves[key] = cleanedShelves[key].filter((b) => b.id !== bookId);
          }
        }

        set({ shelves: cleanedShelves });

        // Analytics
        if (bookData && previousShelf) {
          analytics.trackBookRemoveFromShelf(bookId, bookData.title, previousShelf);
          console.log(`[LibraryStore] Removed "${bookData.title}" from ${previousShelf}`);
        }

        // Sync to Supabase
        removeBookFromSupabase(bookId);
      },

      updateBookReadingProgress(bookId, progressPercent) {
        const { shelves, getBookById, customShelves } = get();
        const bookData = getBookById(bookId);
        const previousProgress = bookData?.progress ?? 0;

        const allShelfKeys = [...BUILT_IN_SHELF_KEYS, ...customShelves.map(s => s.id)];

        const updateShelfBooks = (books: UserLibraryBookEntry[]): UserLibraryBookEntry[] =>
          books.map((b) => (b.id === bookId ? { ...b, progress: progressPercent } : b));

        const updatedShelves: UserBookLibraryShelves = { ...shelves };
        for (const key of allShelfKeys) {
          if (updatedShelves[key]) {
            updatedShelves[key] = updateShelfBooks(updatedShelves[key]);
          }
        }

        set({ shelves: updatedShelves });

        // Analytics (only if meaningful change)
        if (Math.abs(progressPercent - previousProgress) >= 1) {
          analytics.trackProgressUpdate(bookId, progressPercent, previousProgress);
          console.log(
            `[LibraryStore] Progress "${bookData?.title}": ${previousProgress}% → ${progressPercent}%`
          );
        }

        // Sync to Supabase
        updateBookInSupabase(bookId, { progress: progressPercent });
      },

      rateBookWithReview(bookId, starRating, reviewText) {
        const { shelves, getBookById, customShelves } = get();
        const bookData = getBookById(bookId);
        const previousRating = bookData?.rating ?? 0;

        const allShelfKeys = [...BUILT_IN_SHELF_KEYS, ...customShelves.map(s => s.id)];

        const updateShelfBooks = (books: UserLibraryBookEntry[]): UserLibraryBookEntry[] =>
          books.map((b) =>
            b.id === bookId
              ? { ...b, rating: starRating, review: reviewText ?? b.review }
              : b
          );

        const updatedShelves: UserBookLibraryShelves = { ...shelves };
        for (const key of allShelfKeys) {
          if (updatedShelves[key]) {
            updatedShelves[key] = updateShelfBooks(updatedShelves[key]);
          }
        }

        set({ shelves: updatedShelves });

        // Analytics
        analytics.trackBookRate(bookId, bookData?.title, starRating, previousRating);
        console.log(
          `[LibraryStore] Rated "${bookData?.title}": ${previousRating}★ → ${starRating}★`
        );

        // Sync to Supabase
        updateBookInSupabase(bookId, { rating: starRating, review: reviewText || '' });
      },

      getBookCurrentShelf(bookId) {
        const { shelves, customShelves } = get();
        const allShelfKeys = [...BUILT_IN_SHELF_KEYS, ...customShelves.map(s => s.id)];
        
        for (const shelfKey of allShelfKeys) {
          const books = shelves[shelfKey];
          if (books?.find((b) => b.id === bookId)) {
            return shelfKey;
          }
        }
        return null;
      },

      getBookById(bookId) {
        const { shelves, customShelves } = get();
        const allShelfKeys = [...BUILT_IN_SHELF_KEYS, ...customShelves.map(s => s.id)];
        
        for (const shelfKey of allShelfKeys) {
          const books = shelves[shelfKey];
          const foundBook = books?.find((book: UserLibraryBookEntry) => book.id === bookId);
          if (foundBook) return foundBook;
        }
        return null;
      },

      getAllLibraryBooks() {
        const { shelves, customShelves } = get();
        const allShelfKeys = [...BUILT_IN_SHELF_KEYS, ...customShelves.map(s => s.id)];
        return allShelfKeys.flatMap(key => shelves[key] || []);
      },

      getLibraryStatistics() {
        const { shelves, customShelves, uploadedFiles } = get();
        const allBooks = get().getAllLibraryBooks();
        const booksWithEpub = allBooks.filter(b => uploadedFiles[b.id]);
        
        // Count per custom shelf
        const customShelfCounts: Record<string, number> = {};
        for (const shelf of customShelves) {
          customShelfCounts[shelf.id] = shelves[shelf.id]?.length || 0;
        }
        
        return {
          total: allBooks.length,
          reading: shelves.reading?.length || 0,
          wantToRead: shelves.want_to_read?.length || 0,
          finished: shelves.finished?.length || 0,
          dnf: shelves.dnf?.length || 0,
          withEpub: booksWithEpub.length,
          customShelves: customShelfCounts,
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
        const { shelves, customShelves, getBookById } = get();
        
        set((state) => ({
          uploadedFiles: { ...state.uploadedFiles, [bookId]: fileInfo },
        }));

        // Also update the book's hasUploadedEpub flag
        const book = getBookById(bookId);
        if (book) {
          const allShelfKeys = [...BUILT_IN_SHELF_KEYS, ...customShelves.map(s => s.id)];
          const updateShelfBooks = (books: UserLibraryBookEntry[]): UserLibraryBookEntry[] =>
            books.map((b) => (b.id === bookId ? { ...b, hasUploadedEpub: true } : b));

          const updatedShelves: UserBookLibraryShelves = { ...shelves };
          for (const key of allShelfKeys) {
            if (updatedShelves[key]) {
              updatedShelves[key] = updateShelfBooks(updatedShelves[key]);
            }
          }
          set({ shelves: updatedShelves });
        }
      },

      getBookUploadedFile(bookId) {
        return get().uploadedFiles[bookId] ?? null;
      },

      removeBookUploadedFile(bookId) {
        const { shelves, customShelves, getBookById } = get();
        
        set((state) => {
          const updatedFiles = { ...state.uploadedFiles };
          delete updatedFiles[bookId];
          return { uploadedFiles: updatedFiles };
        });

        // Also update the book's hasUploadedEpub flag
        const book = getBookById(bookId);
        if (book) {
          const allShelfKeys = [...BUILT_IN_SHELF_KEYS, ...customShelves.map(s => s.id)];
          const updateShelfBooks = (books: UserLibraryBookEntry[]): UserLibraryBookEntry[] =>
            books.map((b) => (b.id === bookId ? { ...b, hasUploadedEpub: false } : b));

          const updatedShelves: UserBookLibraryShelves = { ...shelves };
          for (const key of allShelfKeys) {
            if (updatedShelves[key]) {
              updatedShelves[key] = updateShelfBooks(updatedShelves[key]);
            }
          }
          set({ shelves: updatedShelves });
        }
      },

      // ─── Tag Management ─────────────────────────────────────────────────
      createTag(label, color) {
        const { tags } = get();
        const id = label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const uniqueId = tags.find(t => t.id === id) 
          ? `${id}-${Date.now()}` 
          : id;
        
        const tagColor = color || DEFAULT_TAG_COLORS[tags.length % DEFAULT_TAG_COLORS.length];
        const newTag: BookTag = { id: uniqueId, label, color: tagColor };
        
        set({ tags: [...tags, newTag] });
        console.log(`[LibraryStore] Created tag: "${label}" (${uniqueId})`);

        // Sync to Supabase
        syncTagToSupabase(newTag);
        return newTag;
      },

      deleteTag(tagId) {
        const { tags, shelves, customShelves } = get();
        
        // Remove tag from all books (handle legacy books without tags array)
        const allShelfKeys = [...BUILT_IN_SHELF_KEYS, ...customShelves.map(s => s.id)];
        const updateShelfBooks = (books: UserLibraryBookEntry[]): UserLibraryBookEntry[] =>
          books.map((b) => ({ ...b, tags: (b.tags || []).filter(t => t !== tagId) }));

        const updatedShelves: UserBookLibraryShelves = { ...shelves };
        for (const key of allShelfKeys) {
          if (updatedShelves[key]) {
            updatedShelves[key] = updateShelfBooks(updatedShelves[key]);
          }
        }

        set({
          tags: tags.filter(t => t.id !== tagId),
          shelves: updatedShelves,
        });
        console.log(`[LibraryStore] Deleted tag: ${tagId}`);

        // Sync to Supabase
        removeTagFromSupabase(tagId);
      },

      updateTag(tagId, updates) {
        const { tags } = get();
        set({
          tags: tags.map(t => t.id === tagId ? { ...t, ...updates } : t),
        });
        console.log(`[LibraryStore] Updated tag: ${tagId}`);
      },

      addTagToBook(bookId, tagId) {
        const { shelves, customShelves, getBookById } = get();
        const book = getBookById(bookId);
        // Handle books without tags array (legacy data)
        const bookTags = book?.tags || [];
        if (!book || bookTags.includes(tagId)) return;

        const allShelfKeys = [...BUILT_IN_SHELF_KEYS, ...customShelves.map(s => s.id)];
        const updateShelfBooks = (books: UserLibraryBookEntry[]): UserLibraryBookEntry[] =>
          books.map((b) => b.id === bookId ? { ...b, tags: [...(b.tags || []), tagId] } : b);

        const updatedShelves: UserBookLibraryShelves = { ...shelves };
        for (const key of allShelfKeys) {
          if (updatedShelves[key]) {
            updatedShelves[key] = updateShelfBooks(updatedShelves[key]);
          }
        }

        set({ shelves: updatedShelves });
        console.log(`[LibraryStore] Added tag "${tagId}" to "${book.title}"`);

        // Sync tags to Supabase
        const updatedBook = get().getBookById(bookId);
        if (updatedBook) updateBookTagsInSupabase(bookId, updatedBook.tags || []);
      },

      removeTagFromBook(bookId, tagId) {
        const { shelves, customShelves, getBookById } = get();
        const book = getBookById(bookId);
        if (!book) return;

        const allShelfKeys = [...BUILT_IN_SHELF_KEYS, ...customShelves.map(s => s.id)];
        const updateShelfBooks = (books: UserLibraryBookEntry[]): UserLibraryBookEntry[] =>
          books.map((b) => b.id === bookId ? { ...b, tags: (b.tags || []).filter(t => t !== tagId) } : b);

        const updatedShelves: UserBookLibraryShelves = { ...shelves };
        for (const key of allShelfKeys) {
          if (updatedShelves[key]) {
            updatedShelves[key] = updateShelfBooks(updatedShelves[key]);
          }
        }

        set({ shelves: updatedShelves });
        console.log(`[LibraryStore] Removed tag "${tagId}" from "${book.title}"`);

        // Sync tags to Supabase
        const updatedBook = get().getBookById(bookId);
        if (updatedBook) updateBookTagsInSupabase(bookId, updatedBook.tags || []);
      },

      getAllTags() {
        return get().tags;
      },

      getBooksByTag(tagId) {
        return get().getAllLibraryBooks().filter(b => (b.tags || []).includes(tagId));
      },

      // ─── Custom Shelf Management ────────────────────────────────────────
      createCustomShelf(label, color) {
        const { customShelves, shelves } = get();
        const id = label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const uniqueId = customShelves.find(s => s.id === id) || BUILT_IN_SHELF_KEYS.includes(id as BuiltInShelfKey)
          ? `${id}-${Date.now()}`
          : id;
        
        const shelfColor = color || DEFAULT_SHELF_COLORS[customShelves.length % DEFAULT_SHELF_COLORS.length];
        const newShelf: CustomShelfDefinition = {
          id: uniqueId,
          label,
          color: shelfColor,
          createdAt: new Date().toISOString(),
        };

        set({
          customShelves: [...customShelves, newShelf],
          shelves: { ...shelves, [uniqueId]: [] },
        });
        console.log(`[LibraryStore] Created custom shelf: "${label}" (${uniqueId})`);

        // Sync to Supabase
        syncShelfToSupabase(newShelf);
        return newShelf;
      },

      deleteCustomShelf(shelfId) {
        const { customShelves, shelves } = get();
        const booksOnShelf = shelves[shelfId] || [];

        // Move books to want_to_read
        const updatedShelves = { ...shelves };
        delete updatedShelves[shelfId];
        updatedShelves.want_to_read = [
          ...updatedShelves.want_to_read,
          ...booksOnShelf.map(b => ({ ...b, shelf: 'want_to_read' as BookShelfKey })),
        ];

        set({
          customShelves: customShelves.filter(s => s.id !== shelfId),
          shelves: updatedShelves,
        });
        console.log(`[LibraryStore] Deleted custom shelf: ${shelfId} (moved ${booksOnShelf.length} books to want_to_read)`);

        // Sync to Supabase
        removeShelfFromSupabase(shelfId);
      },

      updateCustomShelf(shelfId, updates) {
        const { customShelves } = get();
        set({
          customShelves: customShelves.map(s => s.id === shelfId ? { ...s, ...updates } : s),
        });
        console.log(`[LibraryStore] Updated custom shelf: ${shelfId}`);
      },

      getCustomShelves() {
        return get().customShelves;
      },

      isCustomShelf(shelfKey) {
        return !BUILT_IN_SHELF_KEYS.includes(shelfKey as BuiltInShelfKey);
      },

      // ─── eReader Filter ─────────────────────────────────────────────────
      getBooksWithEpub() {
        const { uploadedFiles } = get();
        return get().getAllLibraryBooks().filter(b => !!uploadedFiles[b.id]);
      },

      setBookHasEpub(bookId, hasEpub) {
        const { shelves, customShelves } = get();
        const allShelfKeys = [...BUILT_IN_SHELF_KEYS, ...customShelves.map(s => s.id)];

        const updateShelfBooks = (books: UserLibraryBookEntry[]): UserLibraryBookEntry[] =>
          books.map((b) => b.id === bookId ? { ...b, hasUploadedEpub: hasEpub } : b);

        const updatedShelves: UserBookLibraryShelves = { ...shelves };
        for (const key of allShelfKeys) {
          if (updatedShelves[key]) {
            updatedShelves[key] = updateShelfBooks(updatedShelves[key]);
          }
        }

        set({ shelves: updatedShelves });
      },

      updateBookPageInfo(bookId, currentPage, totalPages) {
        const { shelves, customShelves, getBookById } = get();
        const book = getBookById(bookId);
        if (!book) return;

        const allShelfKeys = [...BUILT_IN_SHELF_KEYS, ...customShelves.map(s => s.id)];

        const updateShelfBooks = (books: UserLibraryBookEntry[]): UserLibraryBookEntry[] =>
          books.map((b) => {
            if (b.id !== bookId) return b;
            const updates: Partial<UserLibraryBookEntry> = { currentPage };
            if (totalPages !== undefined) updates.totalPages = totalPages;
            // Auto-calculate progress if we have total pages
            if (totalPages && totalPages > 0) {
              updates.progress = Math.round((currentPage / totalPages) * 100);
            }
            return { ...b, ...updates };
          });

        const updatedShelves: UserBookLibraryShelves = { ...shelves };
        for (const key of allShelfKeys) {
          if (updatedShelves[key]) {
            updatedShelves[key] = updateShelfBooks(updatedShelves[key]);
          }
        }

        set({ shelves: updatedShelves });
        console.log(`[LibraryStore] Updated page info for "${book.title}": page ${currentPage}${totalPages ? ` of ${totalPages}` : ''}`);
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
