import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ScrollView, StyleSheet, Keyboard, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { searchBooks } from '../api/googleBooks';
import { useUserBookLibraryStore } from '../features/library/store/userBookLibraryStore';
import { trackSearch, trackScreenView, track, EventType, EventCategory } from '../utils/analytics';
import { EmptyState } from '../components/ui';
import { NeuShadow } from '../components/ui/NeuShadow';
import { LibraryBookCard } from '../components/library/LibraryBookCard';
import { SkeletonShimmer } from '../components/home/SkeletonShimmer';
import { homeColors, spacing, borderWidth, textSizes, fonts } from '../theme';
import { SearchHeader, SEARCH_FILTERS } from './search/SearchHeader';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_COLUMNS = 2;
const GRID_PADDING = spacing.md;
const CARD_WIDTH = (SCREEN_WIDTH - GRID_PADDING * 2 - spacing.md) / 2;
const SKELETON_ROWS = 5;
const SKELETON_PLACEHOLDERS = Array.from({ length: SKELETON_ROWS * GRID_COLUMNS }, (_, i) => i);

// set to true to always show skeleton
const DEV_SHOW_SKELETON_ONLY = false;

function SearchSkeleton() {
  return (
    <ScrollView contentContainerStyle={skeletonStyles.grid} showsVerticalScrollIndicator={false}>
      {SKELETON_PLACEHOLDERS.map((i) => (
        <View key={i} style={skeletonStyles.card}>
          <NeuShadow offset={3}>
            <View style={skeletonStyles.cardFrame}>
              <SkeletonShimmer width={'100%'} height={CARD_WIDTH * 1.2} borderRadius={0} />
              <View style={skeletonStyles.titleStrip}>
                <SkeletonShimmer width={'100%'} height={10} borderRadius={2} />
              </View>
            </View>
          </NeuShadow>
        </View>
      ))}
    </ScrollView>
  );
}

const skeletonStyles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: GRID_PADDING,
  },
  card: {
    width: CARD_WIDTH,
    marginBottom: spacing.md,
  },
  cardFrame: {
    borderWidth: borderWidth.pixel,
    borderColor: homeColors.border,
    backgroundColor: homeColors.bgCard,
  },
  titleStrip: {
    borderTopWidth: borderWidth.normal,
    borderTopColor: homeColors.border,
    padding: spacing.xs,
    backgroundColor: '#FFFFFF',
    height: 30,
    justifyContent: 'center',
  },
});

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
    <View style={styles.screen}>
      <View style={[styles.safeArea, { height: insets.top }]} />
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
        {DEV_SHOW_SKELETON_ONLY || (loading && !results.length) ? (
          <SearchSkeleton />
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
            numColumns={GRID_COLUMNS}
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={styles.gridContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View style={styles.resultsHeader}>
                <View style={styles.resultChip}>
                  <Text style={styles.resultCount}>{totalItems.toLocaleString()} results</Text>
                </View>
                {filter !== 'all' && (
                  <View style={styles.resultChip}>
                    <Text style={styles.filterInfo}>#{filter}</Text>
                  </View>
                )}
              </View>
            }
            renderItem={({ item }) => (
              <LibraryBookCard
                book={item}
                shelf={getBookShelf(item.id)}
                onPress={() => navigation.navigate('BookDetail', { book: item })}
              />
            )}
            ListFooterComponent={
              results.length > 0 && results.length < totalItems ? (
                <View style={styles.loadMoreWrap}>
                  {loading ? (
                    <Text style={styles.loadingText}>Loading...</Text>
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
  safeArea: {
    backgroundColor: homeColors.navBg,
  },
  resultsContainer: {
    flex: 1,
  },
  loadingText: {
    fontFamily: fonts.body,
    fontSize: textSizes.sm,
    color: homeColors.textCaption,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: '#FBCA1F',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderWidth: 2,
    borderColor: '#000000',
    borderRightWidth: 4,
    borderBottomWidth: 4,
    marginTop: spacing.md,
  },
  retryText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: textSizes.sm,
    color: '#000000',
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    marginBottom: spacing.xs,
  },
  resultChip: {
    backgroundColor: '#FBCA1F',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderWidth: 2,
    borderColor: '#000000',
  },
  resultCount: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: textSizes.xxs,
    color: '#000000',
  },
  filterInfo: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: textSizes.xxs,
    color: '#000000',
  },
  gridContent: {
    paddingHorizontal: GRID_PADDING,
    paddingBottom: spacing.huge,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  loadMoreWrap: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  loadMoreBtn: {
    backgroundColor: '#FBCA1F',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderWidth: 2,
    borderColor: '#000000',
    borderRightWidth: 4,
    borderBottomWidth: 4,
  },
  loadMoreText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: textSizes.sm,
    color: '#000000',
  },
});
