import React, { useState, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  TextInput, StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import useBookStore from '../store/bookStore';
import {
  BookCover, ShelfBadge, PixelProgress, EmptyState,
} from '../components';
import { colors, fonts, textSizes, spacing, borderWidth } from '../theme';

const TABS = [
  { key: 'all',          label: 'All'     },
  { key: 'reading',      label: 'Reading' },
  { key: 'want_to_read', label: 'Want'    },
  { key: 'finished',     label: 'Done'    },
  { key: 'dnf',          label: 'DNF'     },
];

const SORT_OPTIONS = ['ADDED', 'TITLE', 'AUTHOR', 'RATING'];

function sortBooks(books, sort) {
  const copy = [...books];
  switch (sort) {
    case 'TITLE':  return copy.sort((a, b) => a.title.localeCompare(b.title));
    case 'AUTHOR': return copy.sort((a, b) => (a.authors?.[0]||'').localeCompare(b.authors?.[0]||''));
    case 'RATING': return copy.sort((a, b) => (b.rating||0) - (a.rating||0));
    default:       return copy.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
  }
}

// ── List item ────────────────────────────────────────────────────
function BookListItem({ book, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.listItem} activeOpacity={0.8}>
      <BookCover uri={book.thumbnail} title={book.title} width={56} />
      <View style={styles.listInfo}>
        <Text style={styles.listTitle} numberOfLines={2}>{book.title}</Text>
        <Text style={styles.listAuthor} numberOfLines={1}>
          {book.authors?.join(', ')}
        </Text>
        <View style={styles.listMeta}>
          <ShelfBadge shelf={book.shelf} />
          {book.rating > 0 && (
            <Text style={styles.rating}>{'★'.repeat(book.rating)}</Text>
          )}
        </View>
        {book.shelf === 'reading' && (
          <PixelProgress value={book.progress ?? 0} showPct={false} height={6} />
        )}
      </View>
    </TouchableOpacity>
  );
}

// ── Grid item ────────────────────────────────────────────────────
function BookGridItem({ book, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.gridItem} activeOpacity={0.85}>
      <BookCover uri={book.thumbnail} title={book.title} width="100%" />
      <Text style={styles.gridTitle} numberOfLines={2}>{book.title}</Text>
      {book.rating > 0 && (
        <Text style={styles.rating}>{'★'.repeat(book.rating)}</Text>
      )}
    </TouchableOpacity>
  );
}

// ── Screen ───────────────────────────────────────────────────────
export default function LibraryScreen() {
  const navigation = useNavigation();
  const route      = useRoute();
  const insets     = useSafeAreaInsets();
  const shelves    = useBookStore((s) => s.shelves);

  const initShelf = route.params?.shelf ?? 'all';
  const [activeTab, setActiveTab] = useState(initShelf);
  const [viewMode,  setViewMode]  = useState('list');
  const [sortBy,    setSortBy]    = useState('ADDED');
  const [filter,    setFilter]    = useState('');

  const allBooks = useMemo(() => Object.values(shelves).flat(), [shelves]);

  const counts = {
    all:          allBooks.length,
    reading:      shelves.reading.length,
    want_to_read: shelves.want_to_read.length,
    finished:     shelves.finished.length,
    dnf:          shelves.dnf.length,
  };

  const displayBooks = useMemo(() => {
    const base = activeTab === 'all' ? allBooks : (shelves[activeTab] ?? []);
    const searched = filter
      ? base.filter((b) =>
          b.title.toLowerCase().includes(filter.toLowerCase()) ||
          b.authors?.join(' ').toLowerCase().includes(filter.toLowerCase())
        )
      : base;
    return sortBooks(searched, sortBy);
  }, [activeTab, allBooks, shelves, filter, sortBy]);

  const goBook = (book) => navigation.navigate('BookDetail', { book });

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>LIBRARY</Text>
        <TouchableOpacity onPress={() => setViewMode((v) => v === 'list' ? 'grid' : 'list')}>
          <Text style={styles.viewToggle}>{viewMode === 'list' ? '▦' : '☰'}</Text>
        </TouchableOpacity>
      </View>

      {/* Filter input */}
      <View style={styles.filterWrap}>
        <TextInput
          style={styles.filterInput}
          value={filter}
          onChangeText={setFilter}
          placeholder="Filter library..."
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Tab bar */}
      <FlatList
        data={TABS}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabBar}
        keyExtractor={(t) => t.key}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setActiveTab(item.key)}
            style={[styles.tab, activeTab === item.key && styles.tabActive]}
          >
            <Text style={[styles.tabLabel, activeTab === item.key && styles.tabLabelActive]}>
              {item.label} ({counts[item.key] ?? 0})
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Sort row */}
      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>SORT:</Text>
        {SORT_OPTIONS.map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => setSortBy(s)}
            style={[styles.sortChip, sortBy === s && styles.sortChipActive]}
          >
            <Text style={[styles.sortChipText, sortBy === s && styles.sortChipTextActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
        <Text style={styles.bookCount}>{displayBooks.length}</Text>
      </View>

      {/* Book list or grid */}
      {displayBooks.length === 0 ? (
        <EmptyState
          icon={activeTab === 'all' ? '📚' : '🔖'}
          title={filter ? 'NO MATCHES' : 'SHELF EMPTY'}
          sub={filter ? 'Try different keywords' : 'Add books via Search'}
        />
      ) : viewMode === 'list' ? (
        <FlatList
          data={displayBooks}
          keyExtractor={(b) => b.id}
          renderItem={({ item }) => (
            <BookListItem book={item} onPress={() => goBook(item)} />
          )}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxxl }}
        />
      ) : (
        <FlatList
          data={displayBooks}
          keyExtractor={(b) => b.id}
          numColumns={3}
          renderItem={({ item }) => (
            <BookGridItem book={item} onPress={() => goBook(item)} />
          )}
          contentContainerStyle={styles.grid}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bgDark },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    backgroundColor: colors.bgMid,
    borderBottomWidth: borderWidth.thick, borderBottomColor: colors.pinkHot,
  },
  headerTitle: {
    fontFamily: fonts.pixel, fontSize: textSizes.md, color: colors.pinkHot,
    textShadowColor: colors.pinkDark, textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 0,
    letterSpacing: 2,
  },
  viewToggle: { fontFamily: fonts.pixel, fontSize: 20, color: colors.pinkHot },

  filterWrap: {
    padding: spacing.sm, paddingHorizontal: spacing.md,
    backgroundColor: colors.bgMid, borderBottomWidth: 1, borderBottomColor: colors.bgPanel,
  },
  filterInput: {
    fontFamily: fonts.pixel, fontSize: textSizes.xxs,
    color: colors.textMain, backgroundColor: colors.bgDark,
    borderWidth: borderWidth.normal, borderColor: colors.pinkHot,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
  },

  tabBar: {
    flexGrow: 0,
    backgroundColor: colors.bgMid,
    borderBottomWidth: borderWidth.thick, borderBottomColor: colors.pinkHot,
  },
  tab: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  tabActive: { backgroundColor: colors.pinkHot },
  tabLabel: {
    fontFamily: fonts.pixel, fontSize: textSizes.xxs - 1,
    color: colors.textDim, letterSpacing: 0.5,
  },
  tabLabelActive: { color: colors.white },

  sortRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: spacing.xs, padding: spacing.sm, paddingHorizontal: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.bgPanel,
  },
  sortLabel: {
    fontFamily: fonts.pixel, fontSize: textSizes.xxs - 1,
    color: colors.textDim,
  },
  sortChip: {
    paddingHorizontal: spacing.sm, paddingVertical: spacing.xxs,
    backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.bgPanel,
  },
  sortChipActive: { backgroundColor: colors.pinkHot, borderColor: colors.pinkDark },
  sortChipText: {
    fontFamily: fonts.pixel, fontSize: textSizes.xxs - 1, color: colors.textDim,
  },
  sortChipTextActive: { color: colors.white },
  bookCount: {
    marginLeft: 'auto', fontFamily: fonts.pixel,
    fontSize: textSizes.xxs - 1, color: colors.textDim,
  },

  listItem: {
    flexDirection: 'row', gap: spacing.md,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
  },
  listInfo: { flex: 1, gap: spacing.xs },
  listTitle: {
    fontFamily: fonts.pixel, fontSize: textSizes.xxs,
    color: colors.textMain, lineHeight: textSizes.xxs * 2,
  },
  listAuthor: {
    fontFamily: fonts.pixel, fontSize: textSizes.xxs - 1, color: colors.textDim,
  },
  listMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rating: { fontFamily: fonts.pixel, fontSize: textSizes.xxs, color: colors.yellow },
  sep:    { height: 1, backgroundColor: colors.bgPanel },

  grid:     { padding: spacing.md, gap: spacing.md },
  gridItem: { flex: 1, margin: spacing.xs, gap: spacing.xs },
  gridTitle: {
    fontFamily: fonts.pixel, fontSize: textSizes.xxs - 1,
    color: colors.textMain, lineHeight: (textSizes.xxs - 1) * 2,
  },
});
