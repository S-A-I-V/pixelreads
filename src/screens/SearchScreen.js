import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, TextInput, Image, ActivityIndicator,
  ScrollView, Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { searchBooks } from '../api/googleBooks';
import useBookStore from '../store/bookStore';

/**
 * Search Screen User Stories:
 * 1. Search for books - Enter query, tap search, see results
 * 2. Filter by type - Select filter (All/Title/Author/Publisher/Subject/ISBN)
 * 3. Clear search - Reset button clears query, results, and filter
 * 4. View results - See book info (cover, title, author, year, pages, publisher, rating)
 * 5. Load more - Paginate through results
 * 6. Navigate to detail - Tap book to see full details
 * 7. See library status - Books in library show shelf badge
 */

const SEARCH_FILTERS = [
  { key: 'all', label: 'All', prefix: '' },
  { key: 'title', label: 'Title', prefix: 'intitle:' },
  { key: 'author', label: 'Author', prefix: 'inauthor:' },
  { key: 'publisher', label: 'Publisher', prefix: 'inpublisher:' },
  { key: 'subject', label: 'Subject', prefix: 'subject:' },
  { key: 'isbn', label: 'ISBN', prefix: 'isbn:' },
];

function BookRow({ book, shelf, onPress }) {
  const year = book.publishedDate?.slice(0, 4);
  const rating = book.averageRating;
  
  return (
    <TouchableOpacity onPress={onPress} style={styles.bookRow} activeOpacity={0.7}>
      {book.thumbnail ? (
        <Image source={{ uri: book.thumbnail }} style={styles.bookCover} />
      ) : (
        <View style={[styles.bookCover, styles.noCover]}>
          <Text style={styles.noCoverText}>No Cover</Text>
        </View>
      )}
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>{book.title}</Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>
          {book.authors?.join(', ') || 'Unknown author'}
        </Text>
        
        {/* Meta row */}
        <View style={styles.metaRow}>
          {year && <Text style={styles.metaText}>{year}</Text>}
          {book.pageCount > 0 && <Text style={styles.metaText}>{book.pageCount}p</Text>}
          {book.language && <Text style={styles.metaText}>{book.language.toUpperCase()}</Text>}
        </View>
        
        {/* Publisher */}
        {book.publisher && (
          <Text style={styles.publisherText} numberOfLines={1}>{book.publisher}</Text>
        )}
        
        {/* Rating and badges */}
        <View style={styles.metaRow}>
          {rating > 0 && (
            <View style={styles.ratingBadge}>
              <MaterialCommunityIcons name="star" size={12} color="#FFD700" />
              <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
            </View>
          )}
          {book.isEbook && (
            <View style={styles.ebookBadge}>
              <Text style={styles.badgeText}>EBOOK</Text>
            </View>
          )}
          {book.isFree && (
            <View style={styles.freeBadge}>
              <Text style={styles.badgeText}>FREE</Text>
            </View>
          )}
          {shelf && (
            <View style={styles.shelfBadge}>
              <Text style={styles.badgeText}>{shelf.replace('_', ' ').toUpperCase()}</Text>
            </View>
          )}
        </View>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
    </TouchableOpacity>
  );
}

export default function SearchScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const getBookShelf = useBookStore((s) => s.getBookShelf);

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [offset, setOffset] = useState(0);

  const abortRef = useRef(null);

  const doSearch = useCallback(async (q, searchFilter, startIndex = 0, append = false) => {
    if (!q.trim()) return;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    Keyboard.dismiss();
    setLoading(true);
    setError(null);
    if (!append) setSearched(true);

    try {
      const filterObj = SEARCH_FILTERS.find(f => f.key === searchFilter);
      const searchQuery = filterObj?.prefix ? `${filterObj.prefix}${q}` : q;
      
      const { items, totalItems: total } = await searchBooks(searchQuery, startIndex);
      setResults((prev) => {
        const combined = append ? [...prev, ...items] : items;
        const seen = new Set();
        return combined.filter((book) => {
          if (seen.has(book.id)) return false;
          seen.add(book.id);
          return true;
        });
      });
      setTotalItems(total);
      setOffset(startIndex);
    } catch (e) {
      if (e.name !== 'AbortError') {
        setError(e.message || 'Search failed');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = () => doSearch(query, filter);
  const loadMore = () => doSearch(query, filter, offset + 20, true);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    if (query.trim() && searched) {
      doSearch(query, newFilter);
    }
  };

  const handleReset = () => {
    setQuery('');
    setFilter('all');
    setResults([]);
    setSearched(false);
    setTotalItems(0);
    setOffset(0);
    setError(null);
  };

  const hasActiveSearch = query.trim() || filter !== 'all' || searched;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Fixed Header Section */}
      <View style={styles.fixedHeader}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Search</Text>
          {hasActiveSearch && (
            <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
              <MaterialCommunityIcons name="refresh" size={18} color="#e94560" />
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="magnify" size={20} color="#888" style={styles.inputIcon} />
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Search books..."
              placeholderTextColor="#666"
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')} style={styles.clearInputBtn}>
                <MaterialCommunityIcons name="close-circle" size={18} color="#666" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity onPress={handleSearch} style={styles.searchBtn}>
            <MaterialCommunityIcons name="magnify" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterBar}
          contentContainerStyle={styles.filterBarContent}
        >
          {SEARCH_FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
              onPress={() => handleFilterChange(f.key)}
            >
              <Text style={[styles.filterChipText, filter === f.key && styles.filterChipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results Section */}
      <View style={styles.resultsContainer}>
        {loading && !results.length ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#e94560" />
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <MaterialCommunityIcons name="alert-circle" size={48} color="#ff6b6b" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={handleSearch}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : searched && !results.length ? (
          <View style={styles.centered}>
            <MaterialCommunityIcons name="book-search" size={48} color="#666" />
            <Text style={styles.emptyTitle}>No books found</Text>
            <Text style={styles.emptySubtext}>Try different keywords or filters</Text>
          </View>
        ) : !searched ? (
          <View style={styles.centered}>
            <MaterialCommunityIcons name="book-open-page-variant" size={64} color="#444" />
            <Text style={styles.emptyTitle}>Find your next read</Text>
            <Text style={styles.emptySubtext}>Search by title, author, publisher, or ISBN</Text>
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(b, index) => `${b.id}-${index}`}
            renderItem={({ item }) => (
              <BookRow
                book={item}
                shelf={getBookShelf(item.id)}
                onPress={() => navigation.navigate('BookDetail', { book: item })}
              />
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
            ListHeaderComponent={
              <View style={styles.resultsHeader}>
                <Text style={styles.resultCount}>{totalItems.toLocaleString()} results</Text>
                <Text style={styles.filterInfo}>
                  {filter !== 'all' ? `Filtered by ${filter}` : ''}
                </Text>
              </View>
            }
            ListFooterComponent={
              results.length > 0 && results.length < totalItems ? (
                <View style={styles.loadMoreWrap}>
                  {loading ? (
                    <ActivityIndicator size="small" color="#e94560" />
                  ) : (
                    <TouchableOpacity style={styles.loadMoreBtn} onPress={loadMore}>
                      <Text style={styles.loadMoreText}>Load More</Text>
                      <MaterialCommunityIcons name="chevron-down" size={18} color="#fff" />
                    </TouchableOpacity>
                  )}
                </View>
              ) : null
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  fixedHeader: {
    backgroundColor: '#1a1a2e',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(233, 69, 96, 0.15)',
    borderRadius: 16,
  },
  resetText: {
    fontSize: 13,
    color: '#e94560',
    fontWeight: '500',
  },
  searchBar: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a4e',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    paddingVertical: 12,
  },
  clearInputBtn: {
    padding: 4,
  },
  searchBtn: {
    backgroundColor: '#e94560',
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBar: {
    flexGrow: 0,
  },
  filterBarContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#2a2a4e',
    borderWidth: 1,
    borderColor: '#444',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#e94560',
    borderColor: '#e94560',
  },
  filterChipText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    color: '#888',
  },
  errorText: {
    fontSize: 15,
    color: '#ff6b6b',
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: '#e94560',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  resultCount: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  filterInfo: {
    fontSize: 12,
    color: '#888',
  },
  bookRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bookCover: {
    width: 60,
    height: 90,
    borderRadius: 4,
    backgroundColor: '#444',
  },
  noCover: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noCoverText: {
    fontSize: 8,
    color: '#888',
    textAlign: 'center',
  },
  bookInfo: {
    flex: 1,
    gap: 3,
  },
  bookTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    lineHeight: 20,
  },
  bookAuthor: {
    fontSize: 13,
    color: '#e94560',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  metaText: {
    fontSize: 12,
    color: '#888',
  },
  publisherText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '600',
  },
  ebookBadge: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  freeBadge: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  shelfBadge: {
    backgroundColor: '#e94560',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 9,
    color: '#fff',
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: '#333',
    marginLeft: 88,
  },
  loadMoreWrap: {
    padding: 24,
    alignItems: 'center',
  },
  loadMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2a2a4e',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  loadMoreText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
