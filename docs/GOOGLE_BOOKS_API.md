# Google Books API - Complete Reference

Official Documentation: https://developers.google.com/books/docs/v1/reference/volumes

## API Endpoint

```
GET https://www.googleapis.com/books/v1/volumes?q={query}&key={API_KEY}
```

## Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | string | Search query (required). Supports special keywords - see below |
| `startIndex` | number | Pagination offset (0-based) |
| `maxResults` | number | Max items to return (max 40) |
| `langRestrict` | string | Restrict to language code ("en", "es", etc.) |
| `printType` | string | "all", "books", "magazines" |
| `orderBy` | string | "relevance" (default), "newest" |
| `filter` | string | "partial", "full", "free-ebooks", "paid-ebooks", "ebooks" |
| `projection` | string | "full" (default), "lite" |
| `key` | string | API key (increases quota) |

### Special Query Keywords

```
intitle:      Search in title only        intitle:harry potter
inauthor:     Search by author            inauthor:rowling
inpublisher:  Search by publisher         inpublisher:penguin
subject:      Search by category/genre    subject:fiction
isbn:         Search by ISBN              isbn:9780545010221
lccn:         Library of Congress Number  lccn:2001012345
oclc:         OCLC Number                 oclc:123456789
```

Combine with `+` : `intitle:harry+potter+inauthor:rowling`

---

## Response Structure

```
{
  kind: "books#volumes",
  totalItems: number,
  items: Volume[]
}
```

---

## Volume Object - Complete Field Reference

### Root Level

| Field | Type | Description |
|-------|------|-------------|
| `kind` | string | Always "books#volume" |
| `id` | string | Unique volume ID (use for fetching single book) |
| `etag` | string | Version tag for caching |
| `selfLink` | string | API URL to fetch this volume |

---

### volumeInfo

Core book metadata.

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| `title` | string | "Six of Crows" | Main title |
| `subtitle` | string | "A Novel" | Often empty |
| `authors` | string[] | ["Leigh Bardugo"] | Can be multiple |
| `publisher` | string | "Henry Holt and Co." | |
| `publishedDate` | string | "2015-09-29" | May be just year "2015" |
| `description` | string | "<p>Ketterdam: a..." | HTML formatted, can be long |
| `pageCount` | number | 465 | |
| `printType` | string | "BOOK" | "BOOK" or "MAGAZINE" |
| `categories` | string[] | ["Young Adult Fiction"] | Genre/categories |
| `averageRating` | number | 4.5 | 1-5 scale, from Google users |
| `ratingsCount` | number | 1234 | Number of ratings |
| `maturityRating` | string | "NOT_MATURE" | "NOT_MATURE" or "MATURE" |
| `language` | string | "en" | ISO 639-1 code |
| `contentVersion` | string | "1.2.3" | Internal version |

#### volumeInfo.imageLinks

Book cover images at various resolutions.

| Field | Approx Size | Best For |
|-------|-------------|----------|
| `smallThumbnail` | ~80px wide | Tiny thumbnails |
| `thumbnail` | ~128px wide | List items, cards |
| `small` | ~300px wide | Detail pages |
| `medium` | ~575px wide | Detail pages (better quality) |
| `large` | ~800px wide | Full screen |
| `extraLarge` | ~1280px wide | High-DPI displays |

**Pro Tip:** Add `&zoom=2` or `&zoom=3` to any image URL to get larger versions:
```
Original:   http://books.google.com/books/content?id=xxx&printsec=frontcover&img=1&zoom=1
Larger:     http://books.google.com/books/content?id=xxx&printsec=frontcover&img=1&zoom=3
```

#### volumeInfo.industryIdentifiers

ISBNs and other standard identifiers.

| Type | Description |
|------|-------------|
| `ISBN_10` | 10-digit ISBN |
| `ISBN_13` | 13-digit ISBN (preferred) |
| `ISSN` | Serial publications |
| `OTHER` | Other identifier systems |

```javascript
// Example
[
  { "type": "ISBN_10", "identifier": "1627792120" },
  { "type": "ISBN_13", "identifier": "9781627792127" }
]
```

#### volumeInfo.links

| Field | Description | Use Case |
|-------|-------------|----------|
| `previewLink` | Google Books preview page | "Preview" button |
| `infoLink` | Google Books info page | "More Info" link |
| `canonicalVolumeLink` | Permanent URL | Sharing/bookmarking |

---

### saleInfo

Purchase and pricing information.

| Field | Type | Description |
|-------|------|-------------|
| `country` | string | Country code ("US", "IN") |
| `saleability` | string | See values below |
| `isEbook` | boolean | Available as ebook |
| `listPrice` | object | `{ amount: 9.99, currencyCode: "USD" }` |
| `retailPrice` | object | Actual price after discounts |
| `buyLink` | string | Google Play purchase URL |
| `offers` | array | Different format offers |

#### saleability Values

| Value | Meaning |
|-------|---------|
| `FOR_SALE` | Available for purchase |
| `FREE` | Free to download/read |
| `NOT_FOR_SALE` | Not available in this region |
| `FOR_PREORDER` | Coming soon |

---

### accessInfo

Reading access and availability.

| Field | Type | Description |
|-------|------|-------------|
| `country` | string | Access region |
| `viewability` | string | See values below |
| `embeddable` | boolean | Can embed in iframe |
| `publicDomain` | boolean | **FREE to read completely** |
| `textToSpeechPermission` | string | "ALLOWED" or "NOT_ALLOWED" |
| `quoteSharingAllowed` | boolean | Can share quotes |
| `webReaderLink` | string | Read in browser URL |
| `accessViewStatus` | string | "NONE", "SAMPLE", "FULL_PURCHASED", "FULL_PUBLIC_DOMAIN" |

#### viewability Values

| Value | Meaning |
|-------|---------|
| `NO_PAGES` | No preview available |
| `PARTIAL` | Some pages viewable |
| `ALL_PAGES` | Full book viewable |
| `PARTIAL_VIEW` | Limited preview |

#### accessInfo.epub / accessInfo.pdf

| Field | Type | Description |
|-------|------|-------------|
| `isAvailable` | boolean | Format available |
| `downloadLink` | string | Direct download URL (requires auth) |
| `acsTokenLink` | string | Adobe DRM token link |

---

### searchInfo

Only present in search results.

| Field | Type | Description |
|-------|------|-------------|
| `textSnippet` | string | Matching text with `<b>` highlighting |

---

## Feature Ideas by Field

| Feature | Fields to Use |
|---------|---------------|
| Star ratings display | `averageRating`, `ratingsCount` |
| Price/Buy button | `saleInfo.retailPrice`, `saleInfo.buyLink` |
| "Free Book" badge | `accessInfo.publicDomain` |
| "eBook" badge | `saleInfo.isEbook` |
| Download buttons | `accessInfo.epub.downloadLink`, `accessInfo.pdf.downloadLink` |
| Read online | `accessInfo.webReaderLink` |
| Age rating filter | `maturityRating` |
| Series detection | Parse `title` and `subtitle` |
| High-res covers | `imageLinks` with zoom parameter |
| Search highlighting | `searchInfo.textSnippet` |
| ISBN lookup | `industryIdentifiers` |
| Category browsing | `categories` |
| New releases | Query with `orderBy=newest` |
| Free ebooks | Query with `filter=free-ebooks` |

---

## Rate Limits

| Type | Limit |
|------|-------|
| Without API key | ~100 requests/day (shared quota) |
| With API key | 1,000 requests/day |
| Per-second | ~10 requests/second |

---

## Error Responses

```javascript
{
  "error": {
    "code": 403,
    "message": "Daily Limit Exceeded",
    "errors": [
      {
        "domain": "usageLimits",
        "reason": "dailyLimitExceeded",
        "message": "Daily Limit Exceeded"
      }
    ]
  }
}
```

Common error codes:
- `400` - Invalid request (bad query)
- `403` - Quota exceeded or invalid API key
- `404` - Volume not found
- `500` - Server error

---

## Normalized Book Object (Our App)

The `normalizeBook()` function in `src/api/googleBooks.js` converts the raw API response into this clean structure:

```javascript
{
  // Core
  id:             string,    // Unique ID
  title:          string,    // Main title
  subtitle:       string,    // Subtitle
  authors:        string[],  // Author names
  description:    string,    // HTML description
  
  // Publication
  publisher:      string,
  publishedDate:  string,    // "2015-09-29" or "2015"
  pageCount:      number,
  language:       string,    // "en"
  categories:     string[],  // Genre tags
  
  // Ratings
  averageRating:  number | null,  // 1-5
  ratingsCount:   number,
  maturityRating: string,         // "NOT_MATURE" | "MATURE"
  
  // Identifiers
  isbn:           string,    // ISBN-13 preferred
  
  // Media
  thumbnail:      string,    // HTTPS cover URL
  previewLink:    string,    // Google Books preview
  infoLink:       string,    // Google Books info
  
  // Sale
  saleability:    string,    // "FOR_SALE" | "FREE" | "NOT_FOR_SALE"
  isEbook:        boolean,
  buyLink:        string,    // Purchase URL
  price:          string | null,  // "9.99 USD"
  
  // Access
  viewability:    string,    // "NO_PAGES" | "PARTIAL" | "ALL_PAGES"
  publicDomain:   boolean,   // FREE to read!
  epubAvailable:  boolean,
  pdfAvailable:   boolean,
  webReaderLink:  string,    // Read online URL
}
```

---

## Debug Commands

In React Native debugger console:

```javascript
// Dump full API response for a query
import { debugApiResponse } from './src/api';
await debugApiResponse('six of crows');

// Fetch single book with verbose logging
import { fetchBookById } from './src/api';
await fetchBookById('dEGFaSD5h4C', true);

// Search with verbose logging (logs first result details)
import { searchBooks } from './src/api';
await searchBooks('harry potter', 0, 10, true);
```
