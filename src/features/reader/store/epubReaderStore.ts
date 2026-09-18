/**
 * =========================================================================
 *  EPUB Reader Store
 * =========================================================================
 *
 *  Zustand store for EPUB reader settings, bookmarks, and annotations.
 *  Settings are user-level preferences (not per-book).
 *  Reading data (progress, bookmarks, annotations) is per-book.
 *  All mutations sync to Supabase in the background.
 *
 * =========================================================================
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEY_READER_DATA } from '../../../constants/storageConstants';
import { READER_DEFAULT_USER_SETTINGS } from '../constants/readerFeatureConstants';
import {
  syncReaderPreferencesToSupabase,
  syncReadingProgressToSupabase,
  syncBookmarkToSupabase,
  removeBookmarkFromSupabase,
  syncAnnotationToSupabase,
  removeAnnotationFromSupabase,
} from '../../../lib/supabaseSync';
import type {
  EpubReaderUserSettings,
  EpubReaderThemeKey,
  EpubBookReadingSessionData,
  EpubBookmarkEntry,
  EpubTextAnnotationEntry,
  EpubUploadedFileMetadata,
} from '../../../shared/types/readerTypes';

// ─── State Interface ────────────────────────────────────────────────────────

interface EpubReaderStoreState {
  /** Global reader settings (user-level, not per-book) */
  settings: EpubReaderUserSettings;

  /** Per-book reading data */
  readingData: Record<string, EpubBookReadingSessionData>;

  /** Uploaded EPUB file metadata */
  uploadedFiles: Record<string, EpubUploadedFileMetadata>;
}

// ─── Actions Interface ──────────────────────────────────────────────────────

interface EpubReaderStoreActions {
  // Settings (user-level)
  updateSettings: (partial: Partial<EpubReaderUserSettings>) => void;
  resetSettings: () => void;

  // Reading data (per-book)
  getReadingData: (bookId: string) => EpubBookReadingSessionData;
  saveLocation: (bookId: string, location: string, progress: number) => void;
  addReadingTime: (bookId: string, seconds: number) => void;
  updatePageInfo: (bookId: string, currentPage: number, totalPages: number) => void;

  // Bookmarks (per-book, many per book)
  addBookmark: (bookId: string, bookmark: Omit<EpubBookmarkEntry, 'id' | 'createdAt'>) => string;
  removeBookmark: (bookId: string, bookmarkId: string) => void;
  getBookmarks: (bookId: string) => EpubBookmarkEntry[];
  isBookmarked: (bookId: string, location: string) => boolean;

  // Annotations (per-book, many per book)
  addAnnotation: (bookId: string, annotation: Omit<EpubTextAnnotationEntry, 'id' | 'createdAt'>) => string;
  removeAnnotation: (bookId: string, annotationId: string) => void;
  getAnnotations: (bookId: string) => EpubTextAnnotationEntry[];

  // Uploaded file management
  saveUploadedFile: (bookId: string, fileInfo: Omit<EpubUploadedFileMetadata, 'importedAt'>) => void;
  getUploadedFile: (bookId: string) => EpubUploadedFileMetadata | null;
  removeUploadedFile: (bookId: string) => void;
  hasUploadedFile: (bookId: string) => boolean;

  // Hydration from Supabase (login pull)
  hydrateFromSupabase: (data: {
    readerPreferences: any | null;
    readingProgress: any[];
    bookmarks: any[];
    annotations: any[];
  }) => void;

  // Reset
  clearAllData: () => void;
}

type EpubReaderStoreType = EpubReaderStoreState & EpubReaderStoreActions;

// ─── Helpers ────────────────────────────────────────────────────────────────

const createEmptyReadingData = (): EpubBookReadingSessionData => ({
  location: null,
  progress: 0,
  lastReadAt: null,
  totalReadingTimeSecs: 0,
  currentPage: 0,
  totalPages: 0,
  bookmarks: [],
  annotations: [],
});

/**
 * Generate a UUID v4 string without external dependencies.
 * Uses Math.random — sufficient for local IDs synced to Supabase.
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Build the progress payload for Supabase sync from current reading data.
 */
function buildProgressPayload(bookId: string, data: EpubBookReadingSessionData) {
  return {
    cfiLocation: data.location,
    progressPercent: data.progress,
    currentPage: data.currentPage,
    totalPages: data.totalPages,
    totalReadingTimeSecs: data.totalReadingTimeSecs,
    lastReadAt: data.lastReadAt,
  };
}

// ─── Store ──────────────────────────────────────────────────────────────────

export const useEpubReaderStore = create<EpubReaderStoreType>()(
  persist(
    (set, get): EpubReaderStoreType => ({
      // ─── State ──────────────────────────────────────────────────────
      settings: READER_DEFAULT_USER_SETTINGS,
      readingData: {},
      uploadedFiles: {},

      // ─── Settings Actions (user-level, synced) ──────────────────────

      updateSettings(partial) {
        set((state) => {
          const newSettings = { ...state.settings, ...partial };
          // Fire-and-forget sync
          syncReaderPreferencesToSupabase(newSettings).catch(() => {});
          return { settings: newSettings };
        });
      },

      resetSettings() {
        set({ settings: READER_DEFAULT_USER_SETTINGS });
        syncReaderPreferencesToSupabase(READER_DEFAULT_USER_SETTINGS).catch(() => {});
      },

      // ─── Reading Data Actions (per-book, synced) ───────────────────

      getReadingData(bookId) {
        return get().readingData[bookId] ?? createEmptyReadingData();
      },

      saveLocation(bookId, location, progress) {
        set((state) => {
          const existing = state.readingData[bookId] ?? createEmptyReadingData();
          const updated: EpubBookReadingSessionData = {
            ...existing,
            location,
            progress,
            lastReadAt: new Date().toISOString(),
          };
          // Sync progress to Supabase
          syncReadingProgressToSupabase(bookId, buildProgressPayload(bookId, updated)).catch(() => {});
          return {
            readingData: { ...state.readingData, [bookId]: updated },
          };
        });
      },

      addReadingTime(bookId, seconds) {
        set((state) => {
          const existing = state.readingData[bookId] ?? createEmptyReadingData();
          const updated: EpubBookReadingSessionData = {
            ...existing,
            totalReadingTimeSecs: existing.totalReadingTimeSecs + seconds,
            lastReadAt: new Date().toISOString(),
          };
          syncReadingProgressToSupabase(bookId, buildProgressPayload(bookId, updated)).catch(() => {});
          return {
            readingData: { ...state.readingData, [bookId]: updated },
          };
        });
      },

      updatePageInfo(bookId, currentPage, totalPages) {
        set((state) => {
          const existing = state.readingData[bookId] ?? createEmptyReadingData();
          const updated: EpubBookReadingSessionData = {
            ...existing,
            currentPage,
            totalPages,
          };
          // Don't sync on every page info update — saveLocation handles the sync
          return {
            readingData: { ...state.readingData, [bookId]: updated },
          };
        });
      },

      // ─── Bookmark Actions (per-book, synced) ───────────────────────

      addBookmark(bookId, bookmark) {
        const id = generateUUID();
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

        // Sync to Supabase
        syncBookmarkToSupabase(bookId, newBookmark).catch(() => {});
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

        // Sync removal to Supabase
        removeBookmarkFromSupabase(bookmarkId).catch(() => {});
      },

      getBookmarks(bookId) {
        return get().readingData[bookId]?.bookmarks ?? [];
      },

      isBookmarked(bookId, location) {
        const data = get().readingData[bookId];
        if (!data?.bookmarks) return false;
        return data.bookmarks.some((b) => b.location === location);
      },

      // ─── Annotation Actions (per-book, synced) ─────────────────────

      addAnnotation(bookId, annotation) {
        const id = generateUUID();
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

        // Sync to Supabase
        syncAnnotationToSupabase(bookId, newAnnotation).catch(() => {});
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

        // Sync removal to Supabase
        removeAnnotationFromSupabase(annotationId).catch(() => {});
      },

      getAnnotations(bookId) {
        return get().readingData[bookId]?.annotations ?? [];
      },

      // ─── Uploaded File Actions (local only — sync handled elsewhere) ─

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

      // ─── Hydration from Supabase ───────────────────────────────────

      hydrateFromSupabase({ readerPreferences, readingProgress, bookmarks, annotations }) {
        const state = get();
        const updates: Partial<EpubReaderStoreState> = {};

        // Hydrate settings from Supabase (if exists)
        if (readerPreferences) {
          updates.settings = {
            theme: (readerPreferences.theme as EpubReaderThemeKey) || state.settings.theme,
            fontSize: readerPreferences.font_size ?? state.settings.fontSize,
            fontFamily: readerPreferences.font_family ?? state.settings.fontFamily,
            lineHeight: readerPreferences.line_height ?? state.settings.lineHeight,
            flow: readerPreferences.flow ?? state.settings.flow,
          };
        }

        // Build reading data from progress + bookmarks + annotations
        if (readingProgress.length > 0 || bookmarks.length > 0 || annotations.length > 0) {
          const newReadingData: Record<string, EpubBookReadingSessionData> = {
            ...state.readingData,
          };

          // Merge progress rows
          for (const row of readingProgress) {
            const bookId = row.book_id;
            const existing = newReadingData[bookId] ?? createEmptyReadingData();
            newReadingData[bookId] = {
              ...existing,
              location: row.cfi_location ?? existing.location,
              progress: row.progress_percent ?? existing.progress,
              currentPage: row.current_page ?? existing.currentPage,
              totalPages: row.total_pages ?? existing.totalPages,
              totalReadingTimeSecs: row.total_reading_time_secs ?? existing.totalReadingTimeSecs,
              lastReadAt: row.last_read_at ?? existing.lastReadAt,
            };
          }

          // Group bookmarks by book_id
          for (const row of bookmarks) {
            const bookId = row.book_id;
            if (!newReadingData[bookId]) {
              newReadingData[bookId] = createEmptyReadingData();
            }
            const bm: EpubBookmarkEntry = {
              id: row.id,
              location: row.cfi_location,
              chapter: row.chapter_label || '',
              createdAt: row.created_at,
            };
            // Avoid duplicates by ID
            const existingIds = new Set(newReadingData[bookId].bookmarks.map((b) => b.id));
            if (!existingIds.has(bm.id)) {
              newReadingData[bookId].bookmarks = [...newReadingData[bookId].bookmarks, bm];
            }
          }

          // Group annotations by book_id
          for (const row of annotations) {
            const bookId = row.book_id;
            if (!newReadingData[bookId]) {
              newReadingData[bookId] = createEmptyReadingData();
            }
            const ann: EpubTextAnnotationEntry = {
              id: row.id,
              cfiRange: row.cfi_range,
              text: row.selected_text || '',
              color: row.color || '#ffeb3b',
              type: (row.annotation_type as 'highlight' | 'note') || 'highlight',
              note: row.note_text ?? undefined,
              createdAt: row.created_at,
            };
            const existingIds = new Set(newReadingData[bookId].annotations.map((a) => a.id));
            if (!existingIds.has(ann.id)) {
              newReadingData[bookId].annotations = [...newReadingData[bookId].annotations, ann];
            }
          }

          updates.readingData = newReadingData;
        }

        if (Object.keys(updates).length > 0) {
          set(updates);
        }
      },

      // ─── Reset ─────────────────────────────────────────────────────

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
