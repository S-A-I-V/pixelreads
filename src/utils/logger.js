/**
 * =========================================================================
 *  OpenTelemetry-style Logger with Collapsible Groups
 * =========================================================================
 * 
 * Uses console.groupCollapsed() for expandable trace logs.
 * Title shows essential info, expand for granular details.
 */

const LOG_LEVELS = {
  DEBUG: { value: 0, marker: 'DEBUG' },
  INFO:  { value: 1, marker: 'INFO' },
  WARN:  { value: 2, marker: 'WARN' },
  ERROR: { value: 3, marker: 'ERROR' },
};

let minLevel = LOG_LEVELS.DEBUG.value;

function generateTraceId() {
  return 'xxxxxxxx'.replace(/[x]/g, () =>
    ((Math.random() * 16) | 0).toString(16)
  );
}

function generateSpanId() {
  return 'xxxx'.replace(/[x]/g, () =>
    ((Math.random() * 16) | 0).toString(16)
  );
}

function getTimestamp() {
  return new Date().toISOString().split('T')[1].slice(0, 8);
}

function formatDuration(ms) {
  if (ms < 1) return `${(ms * 1000).toFixed(0)}us`;
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
}

function truncate(str, maxLen = 100) {
  if (!str || str.length <= maxLen) return str;
  return str.slice(0, maxLen) + '...';
}

function line(char = '-', width = 60) {
  return char.repeat(width);
}

// =========================================================================
//  Core Logger
// =========================================================================

function log(level, message, attributes = {}) {
  if (level.value < minLevel) return;
  const ts = getTimestamp();
  console.warn(`[${ts}] ${level.marker}: ${message}`);
}

// =========================================================================
//  Span for Tracing
// =========================================================================

function createSpan(name, attributes = {}) {
  const traceId = generateTraceId();
  const spanId = generateSpanId();
  const startTime = performance.now();

  return {
    traceId,
    spanId,
    name,
    startTime,
    attributes: { ...attributes },

    setAttribute(key, value) {
      this.attributes[key] = value;
    },

    end(status = 'OK') {
      const duration = performance.now() - this.startTime;
      this.attributes.duration_ms = duration;
      this.attributes.status = status;
      return { duration, status, traceId: this.traceId };
    },

    endWithError(error) {
      this.setAttribute('error.message', error.message);
      this.setAttribute('error.type', error.name);
      return this.end('ERROR');
    },
  };
}

// =========================================================================
//  API Logger - ASCII Art Style for Metro Terminal
// =========================================================================

const ASCII = {
  // Box drawing
  TOP_LEFT: '+',
  TOP_RIGHT: '+',
  BOT_LEFT: '+',
  BOT_RIGHT: '+',
  HORIZONTAL: '-',
  VERTICAL: '|',
  
  // Arrows
  REQUEST: '>>>',
  RESPONSE: '<<<',
  
  // Status indicators
  OK: '[OK]',
  FAIL: '[!!]',
  RETRY: '[~~]',
  
  // Decorations
  BOOK: '[#]',
  SEARCH: '[?]',
  ERROR: '[X]',
  TIME: '@',
  
  // Progress bar chars
  FULL: '#',
  EMPTY: '-',
};

function box(title, content, width = 60) {
  const lines = [];
  const titlePad = Math.max(0, width - title.length - 4);
  
  lines.push(`${ASCII.TOP_LEFT}${ASCII.HORIZONTAL.repeat(2)} ${title} ${ASCII.HORIZONTAL.repeat(titlePad)}${ASCII.TOP_RIGHT}`);
  
  content.forEach(line => {
    const padded = line.padEnd(width - 2);
    lines.push(`${ASCII.VERTICAL} ${padded}${ASCII.VERTICAL}`);
  });
  
  lines.push(`${ASCII.BOT_LEFT}${ASCII.HORIZONTAL.repeat(width)}${ASCII.BOT_RIGHT}`);
  
  return lines.join('\n');
}

function progressBar(current, total, width = 20) {
  const ratio = total > 0 ? current / total : 0;
  const filled = Math.round(ratio * width);
  const empty = width - filled;
  return `[${ASCII.FULL.repeat(filled)}${ASCII.EMPTY.repeat(empty)}]`;
}

const ApiLogger = {
  
  verbose: true,  // Show detailed book info

  /**
   * Log API Request
   * >>>  GET /volumes  q="harry"  @17:21:12  #abc123
   */
  logRequest(method, url, params = {}) {
    const span = createSpan(`HTTP ${method}`, {
      'http.method': method,
      'http.url': url,
    });

    const ts = getTimestamp();
    const query = params.q || '';
    const path = url.split('?')[0].split('/').slice(-1)[0];
    
    console.log(`\n${ASCII.REQUEST}  ${method} /${path}  q="${truncate(query, 25)}"  ${ASCII.TIME}${ts}  #${span.traceId}`);

    return span;
  },

  /**
   * Log API Response  
   * <<<  200 [OK]  20/300 items  49KB  1.73s  #abc123
   */
  logResponse(span, response, data) {
    const status = response.status;
    const ok = status >= 200 && status < 300;
    const dataStr = JSON.stringify(data);
    const size = new Blob([dataStr]).size;
    const duration = performance.now() - span.startTime;
    const itemCount = data.items?.length || 0;
    const totalItems = data.totalItems || 0;

    span.setAttribute('http.status_code', status);
    span.setAttribute('http.response_size', size);

    const statusIcon = ok ? ASCII.OK : ASCII.FAIL;
    console.log(`${ASCII.RESPONSE}  ${status} ${statusIcon}  ${itemCount}/${totalItems} items  ${formatBytes(size)}  ${formatDuration(duration)}  #${span.traceId}`);
  },

  /**
   * Log Search Summary with ASCII box
   */
  logSearchSummary(query, results, totalItems, duration, traceId) {
    const ts = getTimestamp();
    const bar = progressBar(results.length, Math.min(totalItems, 100));
    
    console.log('');
    console.log(`${ASCII.SEARCH} SEARCH COMPLETE  ${ASCII.TIME}${ts}  #${traceId}`);
    console.log(`    Query:   "${truncate(query, 40)}"`);
    console.log(`    Results: ${results.length}/${totalItems} ${bar}`);
    console.log(`    Time:    ${formatDuration(duration)}`);
    
    if (results.length > 0) {
      console.log('');
      console.log('    +' + ASCII.HORIZONTAL.repeat(70) + '+');
      console.log('    | # | Title                          | Author              | Pages | Rating |');
      console.log('    +' + ASCII.HORIZONTAL.repeat(70) + '+');
      
      results.forEach((book, i) => {
        const num = String(i + 1).padStart(2);
        const title = truncate(book.title || '?', 30).padEnd(30);
        const author = truncate(book.authors?.[0] || '?', 19).padEnd(19);
        const pages = String(book.pageCount || '-').padStart(5);
        const rating = book.averageRating ? book.averageRating.toFixed(1) : ' - ';
        console.log(`    | ${num} | ${title} | ${author} | ${pages} | ${rating}   |`);
      });
      
      console.log('    +' + ASCII.HORIZONTAL.repeat(70) + '+');
      
      // Show detailed metadata for ALL books
      console.log('');
      console.log('    DETAILED METADATA:');
      console.log('    ' + ASCII.HORIZONTAL.repeat(60));
      
      results.forEach((book, i) => {
        console.log(`    [${i + 1}] "${truncate(book.title, 45)}"`);
        console.log(`        ID:         ${book.id}`);
        console.log(`        Authors:    ${book.authors?.join(', ') || 'N/A'}`);
        console.log(`        Publisher:  ${book.publisher || 'N/A'}`);
        console.log(`        Published:  ${book.publishedDate || 'N/A'}`);
        console.log(`        Pages:      ${book.pageCount || 'N/A'}`);
        console.log(`        ISBN-13:    ${book.isbn || 'N/A'}`);
        console.log(`        Categories: ${book.categories?.join(', ') || 'N/A'}`);
        console.log(`        Rating:     ${book.averageRating || '-'}/5 (${book.ratingsCount || 0} reviews)`);
        console.log(`        Language:   ${book.language || 'N/A'}`);
        console.log(`        Preview:    ${book.previewLink ? 'YES' : 'NO'}`);
        console.log(`        Ebook:      ${book.isEbook ? 'YES' : 'NO'}`);
        console.log(`        Price:      ${book.price || 'N/A'}`);
        console.log(`        Free:       ${book.publicDomain ? 'YES (Public Domain)' : 'NO'}`);
        console.log('        ' + ASCII.HORIZONTAL.repeat(50));
      });
    }
  },

  /**
   * Log Book Details
   */
  logBookDetails(book, index = null) {
    if (!this.verbose) return;
    
    const num = index !== null ? `${index + 1}` : '#';
    const title = truncate(book.title, 35);
    const author = truncate(book.authors?.join(', ') || '?', 20);
    const stars = book.averageRating ? '*'.repeat(Math.round(book.averageRating)) : '-----';
    
    console.log(`${ASCII.BOOK} [${num}] "${title}"`);
    console.log(`        by ${author}  [${stars}]`);
  },

  /**
   * Log Raw Volume
   */
  logRawVolume(item, index = null) {
    if (!this.verbose) return;
    
    const vi = item?.volumeInfo || {};
    const num = index !== null ? `${index + 1}` : '#';
    console.log(`    [RAW ${num}] ${item.id}`);
  },

  /**
   * Log Error with ASCII box
   */
  logError(error, context = {}) {
    const ts = getTimestamp();
    
    console.error('');
    console.error(`${ASCII.ERROR}${ASCII.HORIZONTAL.repeat(50)}${ASCII.ERROR}`);
    console.error(`${ASCII.ERROR}  ERROR  ${ASCII.TIME}${ts}`);
    console.error(`${ASCII.ERROR}  ${error.message}`);
    if (context.query) {
      console.error(`${ASCII.ERROR}  Query: "${context.query}"`);
    }
    if (context.retries) {
      console.error(`${ASCII.ERROR}  Retries: ${context.retries}`);
    }
    console.error(`${ASCII.ERROR}${ASCII.HORIZONTAL.repeat(50)}${ASCII.ERROR}`);
  },

  /**
   * Log Retry attempt
   */
  logRetry(attempt, maxRetries, delay) {
    console.warn(`${ASCII.RETRY}  Retry ${attempt}/${maxRetries} in ${delay}ms...`);
  },
};

// =========================================================================
//  Exports
// =========================================================================

export {
  LOG_LEVELS,
  log,
  createSpan,
  ApiLogger,
  formatDuration,
  formatBytes,
  truncate,
  generateTraceId,
  line,
};

export const debug = (msg, attrs) => log(LOG_LEVELS.DEBUG, msg, attrs);
export const info = (msg, attrs) => log(LOG_LEVELS.INFO, msg, attrs);
export const warn = (msg, attrs) => log(LOG_LEVELS.WARN, msg, attrs);
export const error = (msg, attrs) => log(LOG_LEVELS.ERROR, msg, attrs);

export default ApiLogger;
