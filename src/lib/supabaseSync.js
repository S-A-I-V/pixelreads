import { supabase } from './supabase';
import { useAuthUserSessionStore } from '../features/auth/store/authUserSessionStore';

function getUserId() {
  const id = useAuthUserSessionStore.getState().userId;
  if (!id) console.log('[Sync] ⚠️ No userId available — user may not be logged in');
  return id;
}

function logSync(action, entity, details) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[Sync] ${timestamp} | ${action} | ${entity} | ${JSON.stringify(details)}`);
}

function logError(action, entity, error) {
  const timestamp = new Date().toLocaleTimeString();
  console.error(`[Sync] ❌ ${timestamp} | ${action} FAILED | ${entity} | ${error.message || error}`);
  if (error.details) console.error(`[Sync]    Details: ${error.details}`);
  if (error.hint) console.error(`[Sync]    Hint: ${error.hint}`);
}

// ─── Books ────────────────────────────────────────────────────────────────

export async function syncBookToSupabase(book, shelf) {
  const userId = getUserId();
  if (!userId) return;

  logSync('UPSERT', 'book', { bookId: book.id, title: book.title, shelf });

  try {
    const { data, error } = await supabase.from('user_books').upsert(
      {
        user_id: userId,
        book_id: book.id,
        title: book.title || '',
        authors: book.authors || [],
        thumbnail: book.thumbnail || null,
        shelf: shelf,
        rating: book.rating || 0,
        review: book.review || '',
        progress: book.progress || 0,
        current_page: book.currentPage || 0,
        total_pages: book.totalPages || 0,
        page_count: book.pageCount || 0,
        categories: book.categories || [],
        publisher: book.publisher || '',
        published_date: book.publishedDate || '',
        language: book.language || '',
        isbn: book.isbn || '',
        tags: book.tags || [],
      },
      { onConflict: 'user_id,book_id' }
    );

    if (error) logError('UPSERT', `book:${book.title}`, error);
    else logSync('UPSERT ✓', 'book', { title: book.title, shelf });
  } catch (e) {
    logError('UPSERT', `book:${book.title}`, e);
  }
}

export async function removeBookFromSupabase(bookId) {
  const userId = getUserId();
  if (!userId) return;

  logSync('DELETE', 'book', { bookId });
  try {
    const { error } = await supabase.from('user_books').delete().eq('user_id', userId).eq('book_id', bookId);
    if (error) logError('DELETE', `book:${bookId}`, error);
    else logSync('DELETE ✓', 'book', { bookId });
  } catch (e) { logError('DELETE', `book:${bookId}`, e); }
}

export async function updateBookInSupabase(bookId, updates) {
  const userId = getUserId();
  if (!userId) return;

  logSync('UPDATE', 'book', { bookId, updates });
  try {
    const { error } = await supabase.from('user_books').update(updates).eq('user_id', userId).eq('book_id', bookId);
    if (error) logError('UPDATE', `book:${bookId}`, error);
    else logSync('UPDATE ✓', 'book', { bookId });
  } catch (e) { logError('UPDATE', `book:${bookId}`, e); }
}

export async function updateBookTagsInSupabase(bookId, tags) {
  const userId = getUserId();
  if (!userId) return;

  logSync('UPDATE_TAGS', 'book', { bookId, tags });
  try {
    const { error } = await supabase.from('user_books').update({ tags }).eq('user_id', userId).eq('book_id', bookId);
    if (error) logError('UPDATE_TAGS', `book:${bookId}`, error);
    else logSync('UPDATE_TAGS ✓', 'book', { bookId, tags });
  } catch (e) { logError('UPDATE_TAGS', `book:${bookId}`, e); }
}

// ─── Tags ─────────────────────────────────────────────────────────────────

export async function syncTagToSupabase(tag) {
  const userId = getUserId();
  if (!userId) return;

  logSync('UPSERT', 'tag', { id: tag.id, label: tag.label });
  try {
    const { error } = await supabase.from('user_tags').upsert(
      { id: tag.id, user_id: userId, label: tag.label, color: tag.color },
      { onConflict: 'user_id,id' }
    );
    if (error) logError('UPSERT', `tag:${tag.label}`, error);
    else logSync('UPSERT ✓', 'tag', { label: tag.label });
  } catch (e) { logError('UPSERT', `tag:${tag.label}`, e); }
}

export async function removeTagFromSupabase(tagId) {
  const userId = getUserId();
  if (!userId) return;

  logSync('DELETE', 'tag', { tagId });
  try {
    const { error } = await supabase.from('user_tags').delete().eq('user_id', userId).eq('id', tagId);
    if (error) logError('DELETE', `tag:${tagId}`, error);
    else logSync('DELETE ✓', 'tag', { tagId });
  } catch (e) { logError('DELETE', `tag:${tagId}`, e); }
}

// ─── Custom Shelves ───────────────────────────────────────────────────────

export async function syncShelfToSupabase(shelf) {
  const userId = getUserId();
  if (!userId) return;

  logSync('UPSERT', 'shelf', { id: shelf.id, label: shelf.label });
  try {
    const { error } = await supabase.from('custom_shelves').upsert(
      { id: shelf.id, user_id: userId, label: shelf.label, color: shelf.color },
      { onConflict: 'user_id,id' }
    );
    if (error) logError('UPSERT', `shelf:${shelf.label}`, error);
    else logSync('UPSERT ✓', 'shelf', { label: shelf.label });
  } catch (e) { logError('UPSERT', `shelf:${shelf.label}`, e); }
}

export async function removeShelfFromSupabase(shelfId) {
  const userId = getUserId();
  if (!userId) return;

  logSync('DELETE', 'shelf', { shelfId });
  try {
    const { error } = await supabase.from('custom_shelves').delete().eq('user_id', userId).eq('id', shelfId);
    if (error) logError('DELETE', `shelf:${shelfId}`, error);
    else logSync('DELETE ✓', 'shelf', { shelfId });
  } catch (e) { logError('DELETE', `shelf:${shelfId}`, e); }
}

// ─── Reader Preferences (user-level settings) ────────────────────────────

export async function syncReaderPreferencesToSupabase(preferences) {
  const userId = getUserId();
  if (!userId) return;

  logSync('UPSERT', 'reader-prefs', { theme: preferences.theme, fontSize: preferences.fontSize });
  try {
    const { error } = await supabase.from('user_reader_preferences').upsert(
      {
        user_id: userId,
        theme: preferences.theme || 'light',
        font_size: preferences.fontSize || 100,
        font_family: preferences.fontFamily || 'default',
        line_height: preferences.lineHeight || 1.5,
        flow: preferences.flow || 'paginated',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );
    if (error) logError('UPSERT', 'reader-prefs', error);
    else logSync('UPSERT ✓', 'reader-prefs', { theme: preferences.theme });
  } catch (e) { logError('UPSERT', 'reader-prefs', e); }
}

// ─── Reading Progress (per-book position & time) ─────────────────────────

export async function syncReadingProgressToSupabase(bookId, progressData) {
  const userId = getUserId();
  if (!userId) return;

  logSync('UPSERT', 'reading-progress', { bookId, progress: progressData.progressPercent });
  try {
    const { error } = await supabase.from('user_reading_progress').upsert(
      {
        user_id: userId,
        book_id: bookId,
        cfi_location: progressData.cfiLocation || null,
        progress_percent: progressData.progressPercent || 0,
        current_page: progressData.currentPage || 0,
        total_pages: progressData.totalPages || 0,
        total_reading_time_secs: progressData.totalReadingTimeSecs || 0,
        last_read_at: progressData.lastReadAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,book_id' }
    );
    if (error) logError('UPSERT', `reading-progress:${bookId}`, error);
    else logSync('UPSERT ✓', 'reading-progress', { bookId });
  } catch (e) { logError('UPSERT', `reading-progress:${bookId}`, e); }
}

export async function removeReadingProgressFromSupabase(bookId) {
  const userId = getUserId();
  if (!userId) return;

  logSync('DELETE', 'reading-progress', { bookId });
  try {
    const { error } = await supabase.from('user_reading_progress')
      .delete().eq('user_id', userId).eq('book_id', bookId);
    if (error) logError('DELETE', `reading-progress:${bookId}`, error);
    else logSync('DELETE ✓', 'reading-progress', { bookId });
  } catch (e) { logError('DELETE', `reading-progress:${bookId}`, e); }
}

// ─── Bookmarks (per-book, many per book) ─────────────────────────────────

export async function syncBookmarkToSupabase(bookId, bookmark) {
  const userId = getUserId();
  if (!userId) return;

  // Skip if not a valid UUID (legacy local-only bookmarks)
  if (!bookmark.id || !String(bookmark.id).match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    logSync('SKIP', 'bookmark-sync', { bookId, reason: 'non-UUID ID' });
    return;
  }

  logSync('UPSERT', 'bookmark', { bookId, chapter: bookmark.chapter });
  try {
    const { error } = await supabase.from('user_bookmarks').upsert(
      {
        id: bookmark.id,
        user_id: userId,
        book_id: bookId,
        cfi_location: bookmark.location,
        chapter_label: bookmark.chapter || '',
        created_at: bookmark.createdAt || new Date().toISOString(),
      },
      { onConflict: 'user_id,book_id,cfi_location' }
    );
    if (error) logError('UPSERT', `bookmark:${bookId}`, error);
    else logSync('UPSERT ✓', 'bookmark', { bookId, chapter: bookmark.chapter });
  } catch (e) { logError('UPSERT', `bookmark:${bookId}`, e); }
}

export async function removeBookmarkFromSupabase(bookmarkId) {
  const userId = getUserId();
  if (!userId) return;

  // Skip if not a valid UUID (legacy local-only bookmarks)
  if (!bookmarkId || !String(bookmarkId).match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    logSync('SKIP', 'bookmark-delete', { bookmarkId, reason: 'non-UUID ID' });
    return;
  }

  logSync('DELETE', 'bookmark', { bookmarkId });
  try {
    const { error } = await supabase.from('user_bookmarks')
      .delete().eq('user_id', userId).eq('id', bookmarkId);
    if (error) logError('DELETE', `bookmark:${bookmarkId}`, error);
    else logSync('DELETE ✓', 'bookmark', { bookmarkId });
  } catch (e) { logError('DELETE', `bookmark:${bookmarkId}`, e); }
}

export async function removeAllBookmarksForBookFromSupabase(bookId) {
  const userId = getUserId();
  if (!userId) return;

  logSync('DELETE_ALL', 'bookmarks', { bookId });
  try {
    const { error } = await supabase.from('user_bookmarks')
      .delete().eq('user_id', userId).eq('book_id', bookId);
    if (error) logError('DELETE_ALL', `bookmarks:${bookId}`, error);
    else logSync('DELETE_ALL ✓', 'bookmarks', { bookId });
  } catch (e) { logError('DELETE_ALL', `bookmarks:${bookId}`, e); }
}

// ─── Annotations (per-book, many per book) ───────────────────────────────

export async function syncAnnotationToSupabase(bookId, annotation) {
  const userId = getUserId();
  if (!userId) return;

  // Skip if not a valid UUID (legacy local-only annotations)
  if (!annotation.id || !String(annotation.id).match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    logSync('SKIP', 'annotation-sync', { bookId, reason: 'non-UUID ID' });
    return;
  }

  logSync('UPSERT', 'annotation', { bookId, type: annotation.type, color: annotation.color });
  try {
    const { error } = await supabase.from('user_annotations').upsert(
      {
        id: annotation.id,
        user_id: userId,
        book_id: bookId,
        cfi_range: annotation.cfiRange,
        selected_text: annotation.text || '',
        color: annotation.color || '#ffeb3b',
        annotation_type: annotation.type || 'highlight',
        note_text: annotation.note || null,
        created_at: annotation.createdAt || new Date().toISOString(),
      },
      { onConflict: 'user_id,book_id,cfi_range' }
    );
    if (error) logError('UPSERT', `annotation:${bookId}`, error);
    else logSync('UPSERT ✓', 'annotation', { bookId, type: annotation.type });
  } catch (e) { logError('UPSERT', `annotation:${bookId}`, e); }
}

export async function removeAnnotationFromSupabase(annotationId) {
  const userId = getUserId();
  if (!userId) return;

  // Skip if not a valid UUID (legacy local-only annotations)
  if (!annotationId || !String(annotationId).match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    logSync('SKIP', 'annotation-delete', { annotationId, reason: 'non-UUID ID' });
    return;
  }

  logSync('DELETE', 'annotation', { annotationId });
  try {
    const { error } = await supabase.from('user_annotations')
      .delete().eq('user_id', userId).eq('id', annotationId);
    if (error) logError('DELETE', `annotation:${annotationId}`, error);
    else logSync('DELETE ✓', 'annotation', { annotationId });
  } catch (e) { logError('DELETE', `annotation:${annotationId}`, e); }
}

export async function removeAllAnnotationsForBookFromSupabase(bookId) {
  const userId = getUserId();
  if (!userId) return;

  logSync('DELETE_ALL', 'annotations', { bookId });
  try {
    const { error } = await supabase.from('user_annotations')
      .delete().eq('user_id', userId).eq('book_id', bookId);
    if (error) logError('DELETE_ALL', `annotations:${bookId}`, error);
    else logSync('DELETE_ALL ✓', 'annotations', { bookId });
  } catch (e) { logError('DELETE_ALL', `annotations:${bookId}`, e); }
}

// ─── Full Pull (hydration on login) ──────────────────────────────────────

export async function pullAllDataFromSupabase() {
  const userId = getUserId();
  if (!userId) return null;

  logSync('PULL', 'all', { userId });
  try {
    const [
      booksRes, tagsRes, shelvesRes, epubsRes,
      readerPrefsRes, readingProgressRes, bookmarksRes, annotationsRes,
    ] = await Promise.all([
      supabase.from('user_books').select('*').eq('user_id', userId),
      supabase.from('user_tags').select('*').eq('user_id', userId),
      supabase.from('custom_shelves').select('*').eq('user_id', userId),
      supabase.from('user_epub_files').select('book_id, storage_path, file_name, file_size, imported_at').eq('user_id', userId),
      supabase.from('user_reader_preferences').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('user_reading_progress').select('*').eq('user_id', userId),
      supabase.from('user_bookmarks').select('*').eq('user_id', userId),
      supabase.from('user_annotations').select('*').eq('user_id', userId),
    ]);

    if (booksRes.error) logError('PULL', 'books', booksRes.error);
    if (tagsRes.error) logError('PULL', 'tags', tagsRes.error);
    if (shelvesRes.error) logError('PULL', 'shelves', shelvesRes.error);
    if (epubsRes.error) logError('PULL', 'epubs', epubsRes.error);
    if (readerPrefsRes.error) logError('PULL', 'reader-prefs', readerPrefsRes.error);
    if (readingProgressRes.error) logError('PULL', 'reading-progress', readingProgressRes.error);
    if (bookmarksRes.error) logError('PULL', 'bookmarks', bookmarksRes.error);
    if (annotationsRes.error) logError('PULL', 'annotations', annotationsRes.error);

    const result = {
      books: booksRes.data || [],
      tags: tagsRes.data || [],
      customShelves: shelvesRes.data || [],
      epubFiles: epubsRes.data || [],
      readerPreferences: readerPrefsRes.data || null,
      readingProgress: readingProgressRes.data || [],
      bookmarks: bookmarksRes.data || [],
      annotations: annotationsRes.data || [],
    };

    logSync('PULL ✓', 'all', {
      books: result.books.length,
      tags: result.tags.length,
      shelves: result.customShelves.length,
      epubs: result.epubFiles.length,
      readerPrefs: result.readerPreferences ? 'yes' : 'no',
      progress: result.readingProgress.length,
      bookmarks: result.bookmarks.length,
      annotations: result.annotations.length,
    });
    return result;
  } catch (e) {
    logError('PULL', 'all', e);
    return null;
  }
}

// ─── EPUB Files ───────────────────────────────────────────────────────────

const EPUB_BUCKET = 'epub-files';

export async function uploadEpubToSupabase(bookId, localUri, fileName, fileSize) {
  const userId = getUserId();
  if (!userId) return null;

  const storagePath = `${userId}/${bookId}.epub`;
  logSync('UPLOAD', 'epub', { bookId, fileName, storagePath });

  try {
    const response = await fetch(localUri);
    const blob = await response.blob();

    const { error: uploadError } = await supabase.storage
      .from(EPUB_BUCKET)
      .upload(storagePath, blob, {
        contentType: 'application/epub+zip',
        upsert: true,
      });

    if (uploadError) {
      logError('UPLOAD', `epub:${bookId}`, uploadError);
      return null;
    }

    logSync('UPLOAD ✓', 'epub-storage', { storagePath });

    const { error: dbError } = await supabase.from('user_epub_files').upsert(
      {
        user_id: userId,
        book_id: bookId,
        storage_path: storagePath,
        file_name: fileName,
        file_size: fileSize,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,book_id' }
    );

    if (dbError) logError('UPSERT', `epub-meta:${bookId}`, dbError);
    else logSync('UPSERT ✓', 'epub-meta', { bookId, fileName });

    return { storagePath };
  } catch (e) {
    logError('UPLOAD', `epub:${bookId}`, e);
    return null;
  }
}

export async function deleteEpubFromSupabase(bookId) {
  const userId = getUserId();
  if (!userId) return;

  const storagePath = `${userId}/${bookId}.epub`;
  logSync('DELETE', 'epub', { bookId, storagePath });

  try {
    const { error: storageErr } = await supabase.storage
      .from(EPUB_BUCKET)
      .remove([storagePath]);

    if (storageErr) logError('DELETE', `epub-storage:${bookId}`, storageErr);
    else logSync('DELETE ✓', 'epub-storage', { storagePath });

    const { error: dbErr } = await supabase
      .from('user_epub_files')
      .delete()
      .eq('user_id', userId)
      .eq('book_id', bookId);

    if (dbErr) logError('DELETE', `epub-meta:${bookId}`, dbErr);
    else logSync('DELETE ✓', 'epub-meta', { bookId });
  } catch (e) {
    logError('DELETE', `epub:${bookId}`, e);
  }
}

export async function downloadEpubFromSupabase(storagePath, localDestUri) {
  logSync('DOWNLOAD', 'epub', { storagePath });

  try {
    const { data, error } = await supabase.storage
      .from(EPUB_BUCKET)
      .download(storagePath);

    if (error || !data) {
      logError('DOWNLOAD', `epub:${storagePath}`, error || { message: 'No data returned' });
      return false;
    }

    const FileSystem = require('expo-file-system/legacy');
    const reader = new FileReader();

    await new Promise((resolve, reject) => {
      reader.onload = async () => {
        try {
          const base64 = reader.result.split(',')[1];
          await FileSystem.writeAsStringAsync(localDestUri, base64, {
            encoding: FileSystem.EncodingType.Base64,
          });
          resolve();
        } catch (writeErr) {
          reject(writeErr);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(data);
    });

    logSync('DOWNLOAD ✓', 'epub', { storagePath, localDestUri });
    return true;
  } catch (e) {
    logError('DOWNLOAD', `epub:${storagePath}`, e);
    return false;
  }
}

export async function pullEpubFilesFromSupabase() {
  const userId = getUserId();
  if (!userId) return [];

  logSync('PULL', 'epub-files', { userId });

  try {
    const { data, error } = await supabase
      .from('user_epub_files')
      .select('book_id, storage_path, file_name, file_size, imported_at')
      .eq('user_id', userId);

    if (error) {
      logError('PULL', 'epub-files', error);
      return [];
    }

    logSync('PULL ✓', 'epub-files', { count: data.length });
    return data;
  } catch (e) {
    logError('PULL', 'epub-files', e);
    return [];
  }
}
