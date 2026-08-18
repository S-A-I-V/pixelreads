import React, { useState, useCallback, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { searchBooks } from '../api/googleBooks';
import { useUserBookLibraryStore } from '../features/library/store/userBookLibraryStore';
import { trackSearch, trackScreenView, track, EventType, EventCategory } from '../utils/analytics';
import { BookListItem, EmptyState } from '../components/ui';
import { colors, spacing, borderWidth } from '../theme';
import { SearchHeader, SEARCH_FILTERS } from './search/SearchHeader';

export default function SearchScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const getBookShelf = useUserBookLibraryStore((s) => s.getBookCurrentShelf);

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [offset, setOffset] = useState(0);
  const abortRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      trackScreenView('Search', { resultsCount: results.length });
    }, [results.length])
  );

  const doSearch = useCallback(async (q, searchFilter, startIndex = 0, append = false) => {
    if (!q.trim()) return;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    Keyboard.dismiss();
    setLoading(true);
    setError(null);
    if (!append) setSearched(true);

    const startTime = Date.now();
    try {
      const filterObj = SEARCH_FILTERS.find(f => f.key === searchFilter);
      const searchQuery = filterObj?.prefix ? `${filterObj.prefix}${q}` : q;
      const { items, totalItems: total } = await searchBooks(searchQuery, startIndex);

      setResults((prev) => {
        const combined = append ? [...prev, ...items] : items;
        const seen = new Set();
        return combined.filter((book) => { if (seen.has(book.id)) return false; seen.add(book.id); return true; });
      });
      setTotalItems(total);
      setOffset(startIndex);
      trackSearch(q, searchFilter, items.length, Date.now() - startTime);
    } catch (e) {
      if (e.name !== 'AbortError') setError(e.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = () => doSearch(query, filter);
  const loadMore = () => doSearch(query, filter, offset + 20, true);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    if (query.trim() && searched) doSearch(query, newFilter);
  };

  const handleReset = () => {
    setQuery(''); setFilter('all'); setResults([]); setSearched(false); setTotalItems(0); setOffset(0); setError(null);
  };

  const hasActiveSearch = query.trim() || filter !== 'all' || searched;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <SearchHeader
        query={query}
        filter={filter}
        hasActiveSearch={hasActiveSearch}
        onQueryChange={setQuery}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
      />

      <View style={styles.resultsContainer}>
        {loading && !results.length ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        ) : error ? (
          <EmptyState icon="alert-circle" title={error}>
            <TouchableOpacity style={styles.retryBtn} onPress={handleSearch}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </EmptyState>
        ) : searched && !results.length ? (
          <EmptyState icon="book-search" title="No books found" subtitle="Try different keywords or filters" />
        ) : !searched ? (
          <EmptyState icon="book-open-page-variant" title="Find your next read" subtitle="Search by title, author, publisher, or ISBN" />
        ) : (
          <FlatList
            data={results}
            keyExtractor={(b, index) => `${b.id}-${index}`}
            renderItem={({ item }) => (
              <BookListItem
                book={item}
                variant="detailed"
                shelf={getBookShelf(item.id)}
                onPress={() => navigation.navigate('BookDetail', { book: item })}
              />
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
            ListHeaderComponent={
              <View style={styles.resultsHeader}>
                <Text style={styles.resultCount}>{totalItems.toLocaleString()} results</Text>
                <Text style={styles.filterInfo}>{filter !== 'all' ? `Filtered by ${filter}` : ''}</Text>
              </View>
            }
            ListFooterComponent={
              results.length > 0 && results.length < totalItems ? (
                <View style={styles.loadMoreWrap}>
                  {loading ? (
                    <ActivityIndicator size="small" color={colors.accent} />
                  ) : (
                    <TouchableOpacity style={styles.loadMoreBtn} onPress={loadMore}>
                      <Text style={styles.loadMoreText}>Load More</Text>
                      <MaterialCommunityIcons name="chevron-down" size={18} color={colors.textPrimary} />
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
  container: { flex: 1, backgroundColor: colors.bgPrimary },
  resultsContainer: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md, padding: spacing.xxl },
  loadingText: { fontSize: 16, color: colors.textMuted },
  retryBtn: { backgroundColor: colors.accent, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginTop: spacing.sm },
  retryText: { color: colors.textPrimary, fontSize: 16, fontWeight: '600' },
  resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, borderBottomWidth: borderWidth.thin, borderBottomColor: colors.border },
  resultCount: { fontSize: 14, color: colors.textPrimary, fontWeight: '500' },
  filterInfo: { fontSize: 12, color: colors.textMuted },
  separator: { height: 1, backgroundColor: colors.border, marginLeft: 88 },
  loadMoreWrap: { padding: spacing.xxl, alignItems: 'center' },
  loadMoreBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.bgSecondary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, borderWidth: borderWidth.thin, borderColor: colors.borderLight },
  loadMoreText: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
});
