import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { searchBooks } from '../api/googleBooks';
import { useUserBookLibraryStore } from '../features/library/store/userBookLibraryStore';
import { trackSearch, trackScreenView, track, EventType, EventCategory } from '../utils/analytics';
import { BookListItem, EmptyState } from '../components/ui';
import { BookCardSkeleton } from '../components/home';
import { homeColors, spacing, radius, elevation, textSizes, fontWeights } from '../theme';
import { SearchHeader, SEARCH_FILTERS } from './search/SearchHeader';

const SKELETON_PLACEHOLDERS = Array.from({ length: 4 }, (_, i) => i);

export default function SearchScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const getBookShelf = useUserBookLibraryStore((s) => s.getBookCurrentShelf);

  const initialQuery = route?.params?.initialQuery || '';
  const [query, setQuery] = useState(initialQuery);
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

  // Auto-search when navigated with an initialQuery
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      doSearch(initialQuery, filter);
    }
  }, [initialQuery]); // eslint-disable-line react-hooks/exhaustive-deps

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
      const filterObj = SEARCH_FILTERS.find((f) => f.key === searchFilter);
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
    <View style={[styles.screen, { paddingTop: insets.top }]}>
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
          <View style={styles.loadingContainer}>
            <FlatList
              data={SKELETON_PLACEHOLDERS}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.skeletonList}
              keyExtractor={(item) => `skeleton-${item}`}
              renderItem={() => <BookCardSkeleton />}
              ItemSeparatorComponent={() => <View style={{ width: spacing.sm }} />}
            />
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
                <Text style={styles.resultCount}>
                  {totalItems.toLocaleString()} results
                </Text>
                {filter !== 'all' && (
                  <Text style={styles.filterInfo}>Filtered by {filter}</Text>
                )}
              </View>
            }
            ListFooterComponent={
              results.length > 0 && results.length < totalItems ? (
                <View style={styles.loadMoreWrap}>
                  {loading ? (
                    <View style={styles.loadMoreLoading}>
                      <Text style={styles.loadingText}>Loading...</Text>
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.loadMoreBtn} onPress={loadMore}>
                      <Text style={styles.loadMoreText}>Load More</Text>
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
  screen: {
    flex: 1,
    backgroundColor: homeColors.bgMain,
  },
  resultsContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xl,
    padding: spacing.xxl,
  },
  skeletonList: {
    paddingHorizontal: spacing.lg,
  },
  loadingText: {
    fontSize: textSizes.md,
    color: homeColors.textCaption,
  },
  retryBtn: {
    backgroundColor: homeColors.accent,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    marginTop: spacing.md,
    ...elevation.accent,
  },
  retryText: {
    color: homeColors.textOnAccent,
    fontSize: textSizes.md,
    fontWeight: fontWeights.semibold,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: homeColors.border,
  },
  resultCount: {
    fontSize: textSizes.md,
    color: homeColors.textDark,
    fontWeight: fontWeights.medium,
  },
  filterInfo: {
    fontSize: textSizes.sm,
    color: homeColors.accent,
    fontWeight: fontWeights.medium,
  },
  separator: {
    height: 1,
    backgroundColor: homeColors.border,
    marginLeft: 88,
  },
  loadMoreWrap: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  loadMoreLoading: {
    paddingVertical: spacing.md,
  },
  loadMoreBtn: {
    backgroundColor: homeColors.bgCard,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: homeColors.border,
    ...elevation.sm,
  },
  loadMoreText: {
    color: homeColors.accent,
    fontSize: textSizes.md,
    fontWeight: fontWeights.semibold,
  },
});
