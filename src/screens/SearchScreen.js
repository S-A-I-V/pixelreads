import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { searchBooks } from '../api/googleBooks';
import { GOOGLE_BOOKS_API_KEY } from '../api/config';
import useBookStore from '../store/bookStore';
import {
  BookCover, ShelfBadge, LoadingSpinner,
  EmptyState, PixelButton, Toast,
} from '../components';
import useToast from '../hooks/useToast';
import useDebounce from '../hooks/useDebounce';
import { colors, fonts, textSizes, spacing, borderWidth } from '../theme';

const GENRES = ['Fiction','Fantasy','Sci-Fi','Mystery','Romance','Horror','History','Science'];

const NO_KEY = !GOOGLE_BOOKS_API_KEY || GOOGLE_BOOKS_API_KEY === 'YOUR_GOOGLE_BOOKS_API_KEY_HERE';

// ── Book result row ──────────────────────────────────────────────
function BookRow({ book, shelf, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.bookRow} activeOpacity={0.8}>
      <BookCover uri={book.thumbnail} title={book.title} width={56} />
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>{book.title}</Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>
          {book.authors?.join(', ') || 'Unknown author'}
        </Text>
        <View style={styles.bookMeta}>
          {book.publishedDate ? (
            <Text style={styles.metaText}>{book.publishedDate.slice(0, 4)}</Text>
          ) : null}
          {book.pageCount > 0 ? (
            <Text style={styles.metaText}>{book.pageCount}p</Text>
          ) : null}
          {shelf ? <ShelfBadge shelf={shelf} /> : null}
        </View>
      </View>
      <Text style={styles.arrow}>▶</Text>
    </TouchableOpacity>
  );
}

// ── Screen ───────────────────────────────────────────────────────
export default function SearchScreen() {
  const navigation    = useNavigation();
  const insets        = useSafeAreaInsets();
  const getBookShelf  = useBookStore((s) => s.getBookShelf);
  const { toastMsg, toastVisible, showToast, hideToast } = useToast();

  const [query,      setQuery]      = useState('');
  const [results,    setResults]    = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);
  const [searched,   setSearched]   = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [offset,     setOffset]     = useState(0);

  const abortRef = useRef(null);

  const doSearch = useCallback(async (q, startIndex = 0, append = false) => {
    if (!q.trim()) return;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);
    setError(null);
    if (!append) setSearched(true);

    try {
      const { items, totalItems: total } = await searchBooks(q, startIndex);
      setResults((prev) => {
        const combined = append ? [...prev, ...items] : items;
        // Deduplicate by id to avoid React key warnings
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

  const handleSearch = () => doSearch(query);
  const handleGenre  = (g)  => { setQuery(`subject:${g}`); doSearch(`subject:${g}`); };
  const loadMore     = ()   => doSearch(query, offset + 20, true);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Toast message={toastMsg} visible={toastVisible} onHide={hideToast} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SEARCH</Text>
      </View>

      {/* API key warning */}
      {NO_KEY && (
        <View style={styles.apiWarning}>
          <Text style={styles.apiWarningText}>
            ⚠ Add API key in src/api/config.js for full access
          </Text>
        </View>
      )}

      {/* Search bar */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search books, authors..."
          placeholderTextColor={colors.textMuted}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity onPress={handleSearch} style={styles.searchBtn}>
          <Text style={styles.searchBtnText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Genre chips */}
      {!searched && (
        <View style={styles.genres}>
          <Text style={styles.genresLabel}>BROWSE BY GENRE</Text>
          <FlatList
            data={GENRES}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(g) => g}
            contentContainerStyle={styles.genreList}
            ItemSeparatorComponent={() => <View style={{ width: spacing.sm }} />}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleGenre(item)} style={styles.genreChip}>
                <Text style={styles.genreText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Results */}
      {loading && !results.length ? (
        <LoadingSpinner message="SEARCHING..." />
      ) : error ? (
        <View style={styles.errorWrap}>
          <Text style={styles.errorText}>{error}</Text>
          <PixelButton label="RETRY" onPress={handleSearch} />
        </View>
      ) : searched && !results.length ? (
        <EmptyState icon="🔍" title="NO BOOKS FOUND" sub="Try different keywords" />
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
          contentContainerStyle={{ paddingBottom: spacing.xxxl }}
          ListHeaderComponent={
            results.length > 0 ? (
              <Text style={styles.resultCount}>
                {totalItems.toLocaleString()} RESULTS
              </Text>
            ) : null
          }
          ListFooterComponent={
            results.length > 0 && results.length < totalItems ? (
              <View style={styles.loadMoreWrap}>
                {loading
                  ? <LoadingSpinner message="LOADING..." />
                  : <PixelButton label="LOAD MORE ▼" variant="secondary" onPress={loadMore} />
                }
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bgDark },

  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.bgMid,
    borderBottomWidth: borderWidth.thick,
    borderBottomColor: colors.pinkHot,
  },
  headerTitle: {
    fontFamily: fonts.pixel,
    fontSize: textSizes.md,
    color: colors.pinkHot,
    textShadowColor: colors.pinkDark,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
    letterSpacing: 2,
  },

  apiWarning: {
    backgroundColor: '#332200',
    borderBottomWidth: 2,
    borderBottomColor: '#AA6600',
    padding: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  apiWarningText: {
    fontFamily: fonts.pixel,
    fontSize: textSizes.xxs - 1,
    color: '#FFCC00',
    lineHeight: (textSizes.xxs - 1) * 2,
  },

  searchBar: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.bgMid,
    borderBottomWidth: 2,
    borderBottomColor: colors.bgPanel,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.pixel,
    fontSize: textSizes.xxs,
    color: colors.textMain,
    backgroundColor: colors.bgDark,
    borderWidth: borderWidth.thick,
    borderColor: colors.pinkHot,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchBtn: {
    backgroundColor: colors.pinkHot,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBtnText: { fontSize: 18 },

  genres: { padding: spacing.lg, gap: spacing.sm },
  genresLabel: {
    fontFamily: fonts.pixel,
    fontSize: textSizes.xxs,
    color: colors.textDim,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  genreList: { paddingVertical: spacing.xs },
  genreChip: {
    backgroundColor: colors.bgCard,
    borderWidth: borderWidth.normal,
    borderColor: colors.pinkHot,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  genreText: {
    fontFamily: fonts.pixel,
    fontSize: textSizes.xxs,
    color: colors.pinkLight,
    letterSpacing: 0.5,
  },

  resultCount: {
    fontFamily: fonts.pixel,
    fontSize: textSizes.xxs,
    color: colors.textDim,
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.bgPanel,
  },

  bookRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.bgDark,
  },
  bookInfo: { flex: 1, gap: spacing.xs },
  bookTitle: {
    fontFamily: fonts.pixel,
    fontSize: textSizes.xxs,
    color: colors.textMain,
    lineHeight: textSizes.xxs * 2,
  },
  bookAuthor: {
    fontFamily: fonts.pixel,
    fontSize: textSizes.xxs - 1,
    color: colors.textDim,
  },
  bookMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  metaText: {
    fontFamily: fonts.pixel,
    fontSize: textSizes.xxs - 1,
    color: colors.textMuted,
  },
  arrow: { fontSize: 14, color: colors.pinkHot },
  separator: { height: 1, backgroundColor: colors.bgPanel },

  errorWrap: { alignItems: 'center', padding: spacing.xl, gap: spacing.lg },
  errorText: {
    fontFamily: fonts.pixel,
    fontSize: textSizes.xxs,
    color: '#FF4444',
    textAlign: 'center',
    lineHeight: textSizes.xxs * 2.2,
  },
  loadMoreWrap: { padding: spacing.xl, alignItems: 'center' },
});
