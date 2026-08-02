import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Book shape:
 * {
 *   id, title, authors[], thumbnail, description,
 *   pageCount, publishedDate, categories[], language,
 *   isbn, publisher,
 *   shelf, addedAt, rating, review, progress (0-100)
 * }
 */

const useBookStore = create(
  persist(
    (set, get) => ({
      // ── Shelves ──────────────────────────────────────────────
      shelves: {
        reading:      [],
        want_to_read: [],
        finished:     [],
        dnf:          [],
      },

      addToShelf(book, shelf) {
        const { shelves } = get();
        // Remove from every shelf first (move semantics)
        const cleaned = {
          reading:      shelves.reading.filter((b) => b.id !== book.id),
          want_to_read: shelves.want_to_read.filter((b) => b.id !== book.id),
          finished:     shelves.finished.filter((b) => b.id !== book.id),
          dnf:          shelves.dnf.filter((b) => b.id !== book.id),
        };
        const entry = {
          ...book,
          shelf,
          addedAt: new Date().toISOString(),
          progress: shelf === 'finished' ? 100 : (book.progress ?? 0),
          rating: book.rating ?? 0,
          review: book.review ?? '',
        };
        set({ shelves: { ...cleaned, [shelf]: [...cleaned[shelf], entry] } });
      },

      removeFromShelf(bookId) {
        const { shelves } = get();
        set({
          shelves: {
            reading:      shelves.reading.filter((b) => b.id !== bookId),
            want_to_read: shelves.want_to_read.filter((b) => b.id !== bookId),
            finished:     shelves.finished.filter((b) => b.id !== bookId),
            dnf:          shelves.dnf.filter((b) => b.id !== bookId),
          },
        });
      },

      updateProgress(bookId, progress) {
        const { shelves } = get();
        const update = (list) =>
          list.map((b) => (b.id === bookId ? { ...b, progress } : b));
        set({
          shelves: {
            reading:      update(shelves.reading),
            want_to_read: update(shelves.want_to_read),
            finished:     update(shelves.finished),
            dnf:          update(shelves.dnf),
          },
        });
      },

      rateBook(bookId, rating, review) {
        const { shelves } = get();
        const update = (list) =>
          list.map((b) =>
            b.id === bookId
              ? { ...b, rating, review: review ?? b.review }
              : b
          );
        set({
          shelves: {
            reading:      update(shelves.reading),
            want_to_read: update(shelves.want_to_read),
            finished:     update(shelves.finished),
            dnf:          update(shelves.dnf),
          },
        });
      },

      getBookShelf(bookId) {
        const { shelves } = get();
        for (const [shelf, books] of Object.entries(shelves)) {
          if (books.find((b) => b.id === bookId)) return shelf;
        }
        return null;
      },

      getBook(bookId) {
        const { shelves } = get();
        for (const books of Object.values(shelves)) {
          const found = books.find((b) => b.id === bookId);
          if (found) return found;
        }
        return null;
      },

      getAllBooks() {
        return Object.values(get().shelves).flat();
      },

      getStats() {
        const { shelves } = get();
        const all = Object.values(shelves).flat();
        return {
          total:      all.length,
          reading:    shelves.reading.length,
          wantToRead: shelves.want_to_read.length,
          finished:   shelves.finished.length,
          dnf:        shelves.dnf.length,
        };
      },

      // ── Reading positions (page index per book) ────────────
      readingPositions: {},

      saveReadingPosition(bookId, position) {
        set((s) => ({
          readingPositions: { ...s.readingPositions, [bookId]: position },
        }));
      },

      getReadingPosition(bookId) {
        return get().readingPositions[bookId] ?? 0;
      },

      // ── Uploaded file metadata (uri stored on device FS) ───
      uploadedFiles: {},

      saveUploadedFile(bookId, fileInfo) {
        // fileInfo: { uri, name, type, ext }
        set((s) => ({
          uploadedFiles: { ...s.uploadedFiles, [bookId]: fileInfo },
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
    }),
    {
      name: 'pixelreads-books',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useBookStore;
