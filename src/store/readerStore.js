import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Reader Store - Manages reading data, settings, and uploaded files
 * 
 * Data per book:
 * - currentLocation (CFI)
 * - progress (%)
 * - bookmarks
 * - annotations (highlights + notes)
 * 
 * Global settings:
 * - theme (light/dark/sepia)
 * - fontSize
 * - fontFamily
 */

const DEFAULT_SETTINGS = {
  theme: 'light',           // 'light' | 'dark' | 'sepia'
  fontSize: 100,            // percentage (80-150)
  fontFamily: 'default',    // 'default' | 'serif' | 'sans-serif' | 'monospace'
  lineHeight: 1.5,
  flow: 'paginated',        // 'paginated' | 'scrolled'
};

const useReaderStore = create(
  persist(
    (set, get) => ({
      // ── Global Settings ─────────────────────────────────────
      settings: DEFAULT_SETTINGS,

      updateSettings(partial) {
        set((s) => ({
          settings: { ...s.settings, ...partial },
        }));
      },

      resetSettings() {
        set({ settings: DEFAULT_SETTINGS });
      },

      // ── Per-Book Reading Data ───────────────────────────────
      // { [bookId]: { location, progress, lastReadAt, bookmarks, annotations } }
      readingData: {},

      getReadingData(bookId) {
        return get().readingData[bookId] ?? {
          location: null,
          progress: 0,
          lastReadAt: null,
          bookmarks: [],
          annotations: [],
        };
      },

      saveLocation(bookId, location, progress) {
        set((s) => ({
          readingData: {
            ...s.readingData,
            [bookId]: {
              ...(s.readingData[bookId] ?? {}),
              location,
              progress,
              lastReadAt: new Date().toISOString(),
            },
          },
        }));
      },

      // ── Bookmarks ────────────────────────────────────────────
      addBookmark(bookId, bookmark) {
        const id = `bm-${Date.now()}`;
        const newBookmark = {
          id,
          ...bookmark,
          createdAt: new Date().toISOString(),
        };
        set((s) => {
          const data = s.readingData[bookId] ?? { bookmarks: [] };
          return {
            readingData: {
              ...s.readingData,
              [bookId]: {
                ...data,
                bookmarks: [...(data.bookmarks ?? []), newBookmark],
              },
            },
          };
        });
        return id;
      },

      removeBookmark(bookId, bookmarkId) {
        set((s) => {
          const data = s.readingData[bookId];
          if (!data) return s;
          return {
            readingData: {
              ...s.readingData,
              [bookId]: {
                ...data,
                bookmarks: data.bookmarks.filter((b) => b.id !== bookmarkId),
              },
            },
          };
        });
      },

      isBookmarked(bookId, location) {
        const data = get().readingData[bookId];
        if (!data?.bookmarks) return false;
        return data.bookmarks.some((b) => b.location === location);
      },

      getBookmarks(bookId) {
        return get().readingData[bookId]?.bookmarks ?? [];
      },

      // ── Annotations (Highlights) ─────────────────────────────
      addAnnotation(bookId, annotation) {
        const id = `ann-${Date.now()}`;
        const newAnnotation = {
          id,
          ...annotation,
          createdAt: new Date().toISOString(),
        };
        set((s) => {
          const data = s.readingData[bookId] ?? { annotations: [] };
          return {
            readingData: {
              ...s.readingData,
              [bookId]: {
                ...data,
                annotations: [...(data.annotations ?? []), newAnnotation],
              },
            },
          };
        });
        return id;
      },

      updateAnnotation(bookId, annotationId, updates) {
        set((s) => {
          const data = s.readingData[bookId];
          if (!data) return s;
          return {
            readingData: {
              ...s.readingData,
              [bookId]: {
                ...data,
                annotations: data.annotations.map((a) =>
                  a.id === annotationId ? { ...a, ...updates } : a
                ),
              },
            },
          };
        });
      },

      removeAnnotation(bookId, annotationId) {
        set((s) => {
          const data = s.readingData[bookId];
          if (!data) return s;
          return {
            readingData: {
              ...s.readingData,
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

      // ── Uploaded Files ───────────────────────────────────────
      // { [bookId]: { uri, fileName, fileSize, importedAt } }
      uploadedFiles: {},

      saveUploadedFile(bookId, fileInfo) {
        set((s) => ({
          uploadedFiles: {
            ...s.uploadedFiles,
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
        set((s) => {
          const next = { ...s.uploadedFiles };
          delete next[bookId];
          return { uploadedFiles: next };
        });
      },

      hasUploadedFile(bookId) {
        return !!get().uploadedFiles[bookId];
      },

      // ── Clear All ────────────────────────────────────────────
      clearAllData() {
        set({
          settings: DEFAULT_SETTINGS,
          readingData: {},
          uploadedFiles: {},
        });
      },
    }),
    {
      name: 'pixelreads-reader',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useReaderStore;
