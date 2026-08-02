import { GOOGLE_BOOKS_BASE_URL, GOOGLE_BOOKS_API_KEY } from './config';
import { ApiLogger, createSpan } from '../utils/logger';

/**
 * =========================================================================
 *  Google Books API Client
 * =========================================================================
 * 
 * API Reference: https://developers.google.com/books/docs/v1/reference/volumes
 * See docs/GOOGLE_BOOKS_API.md for complete field documentation.
 * 
 * Logging: Uses collapsible console groups
 * - Title shows essential info (status, count, duration, traceId)
 * - Expand to see granular details
 */

function buildUrl(path, params = {}) {
  const hasKey =
    GOOGLE_BOOKS_API_KEY && GOOGLE_BOOKS_API_KEY !== 'YOUR_GOOGLE_BOOKS_API_KEY_HERE';

  const query = new URLSearchParams({
    ...params,
    ...(hasKey ? { key: GOOGLE_BOOKS_API_KEY } : {}),
  }).toString();

  return `${GOOGLE_BOOKS_BASE_URL}${path}?${query}`;
}

/** Normalise a raw Google Books volume into a clean book object */
export function normalizeBook(item) {
  const vi = item?.volumeInfo ?? {};
  const si = item?.saleInfo ?? {};
  const ai = item?.accessInfo ?? {};
  
  const thumb =
    vi.imageLinks?.thumbnail ||
    vi.imageLinks?.smallThumbnail ||
    null;

  return {
    // Core
    id:             item.id,
    title:          vi.title ?? 'Unknown Title',
    subtitle:       vi.subtitle ?? '',
    authors:        vi.authors ?? [],
    description:    vi.description ?? '',
    
    // Publication
    publisher:      vi.publisher ?? '',
    publishedDate:  vi.publishedDate ?? '',
    pageCount:      vi.pageCount ?? 0,
    language:       vi.language ?? '',
    categories:     vi.categories ?? [],
    
    // Ratings
    averageRating:  vi.averageRating ?? null,
    ratingsCount:   vi.ratingsCount ?? 0,
    maturityRating: vi.maturityRating ?? '',
    
    // Identifiers
    isbn: vi.industryIdentifiers?.find((i) => i.type === 'ISBN_13')?.identifier ??
          vi.industryIdentifiers?.find((i) => i.type === 'ISBN_10')?.identifier ?? '',
    
    // Media
    thumbnail:      thumb ? thumb.replace('http://', 'https://') : null,
    previewLink:    vi.previewLink ?? '',
    infoLink:       vi.infoLink ?? '',
    
    // Sale
    saleability:    si.saleability ?? '',
    isEbook:        si.isEbook ?? false,
    isFree:         si.saleability === 'FREE' || ai.publicDomain === true,
    buyLink:        si.buyLink ?? '',
    price:          si.retailPrice ? `${si.retailPrice.amount} ${si.retailPrice.currencyCode}` : null,
    
    // Access
    viewability:    ai.viewability ?? '',
    publicDomain:   ai.publicDomain ?? false,
    epubAvailable:  ai.epub?.isAvailable ?? false,
    pdfAvailable:   ai.pdf?.isAvailable ?? false,
    webReaderLink:  ai.webReaderLink ?? '',
  };
}

/**
 * Search books by query string.
 * 
 * @param {string} query - Search query
 * @param {number} startIndex - Pagination offset (default 0)
 * @param {number} maxResults - Max items (default 20)
 * @param {boolean} verbose - Log individual book details (default false)
 */
export async function searchBooks(query, startIndex = 0, maxResults = 20, verbose = false) {
  console.log('\n========== SEARCH STARTED ==========');
  console.log('Query:', query);
  
  if (!query?.trim()) return { items: [], totalItems: 0 };

  const params = {
    q: query.trim(),
    startIndex,
    maxResults,
    langRestrict: 'en',
    printType: 'books',
    orderBy: 'relevance',
  };

  const url = buildUrl('/volumes', params);
  
  // Log request (collapsible)
  const span = ApiLogger.logRequest('GET', url, params);

  // Retry logic for transient errors
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url);
      const data = await res.json();

      // Log response (collapsible)
      ApiLogger.logResponse(span, res, data);

      if (!res.ok) {
        const msg = data?.error?.message ?? `HTTP ${res.status}`;
        
        // Retry on 503 (Service Unavailable) or 429 (Rate Limit)
        if ((res.status === 503 || res.status === 429) && attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 500; // 1s, 2s, 4s
          ApiLogger.logRetry(attempt, maxRetries, delay);
          await new Promise(r => setTimeout(r, delay));
          continue;
        }
        
        throw new Error(msg);
      }

      // Deduplicate by id
      const seen = new Set();
      const uniqueItems = (data.items ?? []).filter((item) => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      });

      const normalizedItems = uniqueItems.map(normalizeBook);
      const result = span.end('OK');

      // Log search summary (collapsible)
      ApiLogger.logSearchSummary(
        query, 
        normalizedItems, 
        data.totalItems ?? 0, 
        result.duration,
        span.traceId
      );

      // Log individual books if verbose
      if (verbose) {
        normalizedItems.slice(0, 3).forEach((book, i) => {
          ApiLogger.logBookDetails(book, i);
        });
        
        // Also log raw data for first item
        if (uniqueItems.length > 0) {
          ApiLogger.logRawVolume(uniqueItems[0], 0);
        }
      }

      return {
        items: normalizedItems,
        totalItems: data.totalItems ?? 0,
      };
    } catch (error) {
      lastError = error;
      
      // Retry on network errors
      if (attempt < maxRetries && error.name === 'TypeError') {
        const delay = Math.pow(2, attempt) * 500;
        ApiLogger.logRetry(attempt, maxRetries, delay);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
    }
  }

  // All retries failed
  ApiLogger.logError(lastError, { query, startIndex, retries: maxRetries });
  span.endWithError(lastError);
  throw lastError;
}

/**
 * Fetch a single book by its Google Books volume ID.
 * 
 * @param {string} id - Google Books volume ID
 * @param {boolean} verbose - Log detailed book info (default true)
 */
export async function fetchBookById(id, verbose = true) {
  const url = buildUrl(`/volumes/${id}`);
  const span = ApiLogger.logRequest('GET', url, { volumeId: id });

  try {
    const res = await fetch(url);
    const data = await res.json();

    ApiLogger.logResponse(span, res, { items: [data], totalItems: 1 });

    if (!res.ok) {
      throw new Error(`Book not found (HTTP ${res.status})`);
    }

    const book = normalizeBook(data);
    span.end('OK');

    // Log book details (collapsible)
    if (verbose) {
      ApiLogger.logBookDetails(book);
      ApiLogger.logRawVolume(data);
    }

    return book;
  } catch (error) {
    ApiLogger.logError(error, { bookId: id });
    span.endWithError(error);
    throw error;
  }
}

/**
 * Debug: Dump complete raw API response with all collapsible groups
 */
export async function debugApiResponse(query = 'javascript', maxResults = 3) {
  console.group(`[DEBUG] Full API inspection for "${query}"`);
  
  const results = await searchBooks(query, 0, maxResults, true);
  
  console.log('Normalized results:', results);
  
  console.groupEnd();
  
  return results;
}
