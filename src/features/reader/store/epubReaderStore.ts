/**
 * =========================================================================
 *  EPUB Reader Store
 * =========================================================================
 *
 *  Zustand store for EPUB reader settings, bookmarks, and annotations.
 *  Persists reader preferences and reading progress per book.
 *
 * =========================================================================
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEY_READER_DATA } from '../../../constants/storageConstants';
import { READER_DEFAULT_USER_SETTINGS } from '../constants/readerFeatureConstants';
import type {
  EpubReaderUserSettings,
  EpubReaderThemeKey,
  EpubBookReadingSessionData,
  EpubBookmarkEntry,
  EpubTextAnnotationEntry,
  EpubUploadedFileMetadata,
} from '../../../shared/types/readerTypes';

/**
 * Reader store state
 */
interface EpubReaderStoreState {
  /** Global reader settings */
  settings: EpubReaderUserSettings;
  
  /** Per-book reading data */
  readingData: Record<string, EpubBookReadingSessionData>;
  
  /** Uploaded EPUB file metadata */
  uploadedFiles: Record<string, EpubUploadedFileMetadata>;
}

/**
 * Reader store actions
 */
interface EpubReaderStoreActions {
  /** Update reader settings */
  updateSettings: (partial: Partial<EpubReaderUserSettings>) => void;
  
  /** Reset to default settings */
  resetSettings: () => void;
  
  /** Get reading data for a book */
  getReadingData: (bookId: string) => EpubBookReadingSessionData;
  
  /** Save reading location and progress */
  saveLocation: (bookId: string, location: string, progress: number) => void;
  
  /** Add bookmark */
  addBookmark: (bookId: string, bookmark: Omit<EpubBookmarkEntry, 'id' | 'createdAt'>) => string;
  
  /** Remove bookmark */
  removeBookmark: (bookId: string, bookmarkId: string) => void;
  
  /** Get bookmarks for a book */
  getBookmarks: (bookId: string) => EpubBookmarkEntry[];
  
  /** Check if location is bookmarked */
  isBookmarked: (bookId: string, location: string) => boolean;
  
  /** Add annotation */
  addAnnotation: (bookId: string, annotation: Omit<EpubTextAnnotationEntry, 'id' | 'createdAt'>) => string;
  
  /** Remove annotation */
  removeAnnotation: (bookId: string, annotationId: string) => void;
  
  /** Get annotations for a book */
  getAnnotations: (bookId: string) => EpubTextAnnotationEntry[];
  
  /** Save uploaded file metadata */
  saveUploadedFile: (bookId: string, fileInfo: Omit<EpubUploadedFileMetadata, 'importedAt'>) => void;
  
  /** Get uploaded file metadata */
  getUploadedFile: (bookId: string) => EpubUploadedFileMetadata | null;
  
  /** Remove uploaded file metadata */
  removeUploadedFile: (bookId: string) => void;
  
  /** Check if book has uploaded file */
  hasUploadedFile: (bookId: string) => boolean;
  
  /** Clear all reader data */
  clearAllData: () => void;
}

type EpubReaderStoreType = EpubReaderStoreState & EpubReaderStoreActions;

const createEmptyReadingData = (): EpubBookReadingSessionData => ({
  location: null,
  progress: 0,
  lastReadAt: null,
  bookmarks: [],
  annotations: [],
});

/**
 * EPUB Reader store
 */
export const useEpubReaderStore = create<EpubReaderStoreType>()(
  persist(
    (set, get): EpubReaderStoreType => ({
      // ─── State ────────────────────────────────────────────────────────
      settings: READER_DEFAULT_USER_SETTINGS,
      readingData: {},
      uploadedFiles: {},

      // ─── Actions ──────────────────────────────────────────────────────
      updateSettings(partial) {
        set((state) => ({
          settings: { ...state.settings, ...partial },
        }));
      },

      resetSettings() {
        set({ settings: READER_DEFAULT_USER_SETTINGS });
      },

      getReadingData(bookId) {
        return get().readingData[bookId] ?? createEmptyReadingData();
      },

      saveLocation(bookId, location, progress) {
        set((state) => ({
          readingData: {
            ...state.readingData,
            [bookId]: {
              ...(state.readingData[bookId] ?? createEmptyReadingData()),
              location,
              progress,
              lastReadAt: new Date().toISOString(),
            },
          },
        }));
      },

      addBookmark(bookId, bookmark) {
        const id = `bm-${Date.now()}`;
        const newBookmark: EpubBookmarkEntry = {
          ...bookmark,
          id,
          createdAt: new Date().toISOString(),
        };

        set((state) => {
          const data = state.readingData[bookId] ?? createEmptyReadingData();
          return {
            readingData: {
              ...state.readingData,
              [bookId]: {
                ...data,
                bookmarks: [...data.bookmarks, newBookmark],
              },
            },
          };
        });

        return id;
      },

      removeBookmark(bookId, bookmarkId) {
        set((state) => {
          const data = state.readingData[bookId];
          if (!data) return state;
          return {
            readingData: {
              ...state.readingData,
              [bookId]: {
                ...data,
                bookmarks: data.bookmarks.filter((b) => b.id !== bookmarkId),
              },
            },
          };
        });
      },

      getBookmarks(bookId) {
        return get().readingData[bookId]?.bookmarks ?? [];
      },

      isBookmarked(bookId, location) {
        const data = get().readingData[bookId];
        if (!data?.bookmarks) return false;
        return data.bookmarks.some((b) => b.location === location);
      },

      addAnnotation(bookId, annotation) {
        const id = `ann-${Date.now()}`;
        const newAnnotation: EpubTextAnnotationEntry = {
          ...annotation,
          id,
          createdAt: new Date().toISOString(),
        };

        set((state) => {
          const data = state.readingData[bookId] ?? createEmptyReadingData();
          return {
            readingData: {
              ...state.readingData,
              [bookId]: {
                ...data,
                annotations: [...data.annotations, newAnnotation],
              },
            },
          };
        });

        return id;
      },

      removeAnnotation(bookId, annotationId) {
        set((state) => {
          const data = state.readingData[bookId];
          if (!data) return state;
          return {
            readingData: {
              ...state.readingData,
              [bookId]: {
                ...data,
                annotations: data.annotations.filter((a) => a.id !== annotationId),
              },
            },
          };
        });
      },

      getAnnotations(bookId) {
        return get().readingData[bookId]?.annotations ?? [];
      },

      saveUploadedFile(bookId, fileInfo) {
        set((state) => ({
          uploadedFiles: {
            ...state.uploadedFiles,
            [bookId]: {
              ...fileInfo,
              importedAt: new Date().toISOString(),
            },
          },
        }));
      },

      getUploadedFile(bookId) {
        return get().uploadedFiles[bookId] ?? null;
      },

      removeUploadedFile(bookId) {
        set((state) => {
          const updated = { ...state.uploadedFiles };
          delete updated[bookId];
          return { uploadedFiles: updated };
        });
      },

      hasUploadedFile(bookId) {
        return !!get().uploadedFiles[bookId];
      },

      clearAllData() {
        set({
          settings: READER_DEFAULT_USER_SETTINGS,
          readingData: {},
          uploadedFiles: {},
        });
      },
    }),
    {
      name: STORAGE_KEY_READER_DATA,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// ─── Selectors ──────────────────────────────────────────────────────────────
export function selectReaderTheme(state: EpubReaderStoreType): EpubReaderThemeKey {
  return state.settings.theme;
}

export function selectReaderFontSize(state: EpubReaderStoreType): number {
  return state.settings.fontSize;
}

export default useEpubReaderStore;
