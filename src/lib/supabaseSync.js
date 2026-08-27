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

// ─── Full Pull (hydration on login) ──────────────────────────────────────

export async function pullAllDataFromSupabase() {
  const userId = getUserId();
  if (!userId) return null;

  logSync('PULL', 'all', { userId });
  try {
    const [booksRes, tagsRes, shelvesRes] = await Promise.all([
      supabase.from('user_books').select('*').eq('user_id', userId),
      supabase.from('user_tags').select('*').eq('user_id', userId),
      supabase.from('custom_shelves').select('*').eq('user_id', userId),
    ]);

    if (booksRes.error) logError('PULL', 'books', booksRes.error);
    if (tagsRes.error) logError('PULL', 'tags', tagsRes.error);
    if (shelvesRes.error) logError('PULL', 'shelves', shelvesRes.error);

    const result = {
      books: booksRes.data || [],
      tags: tagsRes.data || [],
      customShelves: shelvesRes.data || [],
    };

    logSync('PULL ✓', 'all', { books: result.books.length, tags: result.tags.length, shelves: result.customShelves.length });
    return result;
  } catch (e) {
    logError('PULL', 'all', e);
    return null;
  }
}
