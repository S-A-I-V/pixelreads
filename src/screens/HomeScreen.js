import React from 'react';
import {
  View, Text, ScrollView, FlatList,
  TouchableOpacity, StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import useBookStore from '../store/bookStore';
import useAuthStore from '../store/authStore';
import {
  BookCover, PixelProgress, ShelfBadge, EmptyState, PixelButton,
} from '../components';
import { colors, fonts, textSizes, spacing, borderWidth } from '../theme';

// ── Stat Badge ──────────────────────────────────────────────────
function StatBadge({ label, value, color }) {
  return (
    <View style={[styles.statBadge, { borderColor: color }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ── Currently Reading Card ───────────────────────────────────────
function ReadingCard({ book, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.readingCard} activeOpacity={0.85}>
      <BookCover uri={book.thumbnail} title={book.title} width={52} />
      <View style={styles.readingInfo}>
        <Text style={styles.readingTitle} numberOfLines={2}>{book.title}</Text>
        <Text style={styles.readingAuthor} numberOfLines={1}>
          {book.authors?.join(', ')}
        </Text>
        <PixelProgress value={book.progress ?? 0} showPct />
      </View>
    </TouchableOpacity>
  );
}

// ── Shelf Row ────────────────────────────────────────────────────
function ShelfRow({ label, icon, color, books, onBook, onSeeAll }) {
  if (!books.length) return null;
  return (
    <View style={styles.shelfSection}>
      <View style={styles.shelfHeader}>
        <View style={styles.shelfLabelRow}>
          <Text style={styles.shelfIcon}>{icon}</Text>
          <Text style={[styles.shelfLabel, { color }]}>{label}</Text>
        </View>
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={styles.seeAll}>SEE ALL ▶</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={books}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(b) => b.id}
        contentContainerStyle={styles.shelfList}
        ItemSeparatorComponent={() => <View style={{ width: spacing.sm }} />}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => onBook(item)} activeOpacity={0.85}>
            <BookCover uri={item.thumbnail} title={item.title} width={80} />
            {item.rating > 0 && (
              <Text style={styles.miniRating}>{'★'.repeat(item.rating)}</Text>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

// ── Screen ───────────────────────────────────────────────────────
export default function HomeScreen() {
  const navigation  = useNavigation();
  const insets      = useSafeAreaInsets();
  const shelves     = useBookStore((s) => s.shelves);
  const getStats    = useBookStore((s) => s.getStats);
  const userEmail   = useAuthStore((s) => s.userEmail);

  const stats     = getStats();
  const playerName = userEmail?.split('@')[0]?.toUpperCase() ?? 'PLAYER';

  const goBook = (book) => navigation.navigate('BookDetail', { book });

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PIXELREADS</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.profileIcon}>👾</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome banner */}
        <View style={styles.banner}>
          <View>
            <Text style={styles.bannerSub}>WELCOME BACK</Text>
            <Text style={styles.bannerName}>{playerName} ♥</Text>
          </View>
          <PixelButton
            label="+ ADD"
            size="sm"
            onPress={() => navigation.navigate('Search')}
          />
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatBadge label="TOTAL"   value={stats.total}      color={colors.pinkHot}  />
          <StatBadge label="READING" value={stats.reading}    color={colors.blue}     />
          <StatBadge label="DONE"    value={stats.finished}   color={colors.green}    />
          <StatBadge label="WANT"    value={stats.wantToRead} color={colors.pinkNeon} />
        </View>

        {/* Currently reading progress cards */}
        {shelves.reading.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>▶ IN PROGRESS</Text>
            {shelves.reading.slice(0, 3).map((book) => (
              <ReadingCard key={book.id} book={book} onPress={() => goBook(book)} />
            ))}
          </View>
        )}

        {/* Shelf rows */}
        <ShelfRow
          label="Want to Read" icon="🔖" color={colors.pinkHot}
          books={shelves.want_to_read}
          onBook={goBook}
          onSeeAll={() => navigation.navigate('Library', { shelf: 'want_to_read' })}
        />
        <ShelfRow
          label="Finished" icon="🏆" color={colors.green}
          books={shelves.finished}
          onBook={goBook}
          onSeeAll={() => navigation.navigate('Library', { shelf: 'finished' })}
        />
        <ShelfRow
          label="DNF" icon="💔" color="#AA2200"
          books={shelves.dnf}
          onBook={goBook}
          onSeeAll={() => navigation.navigate('Library', { shelf: 'dnf' })}
        />

        {/* Empty state */}
        {stats.total === 0 && (
          <EmptyState
            icon="📚"
            title="YOUR LIBRARY IS EMPTY"
            sub="Search for books to start your collection"
            action={
              <PixelButton
                label="🔍 FIND BOOKS"
                size="lg"
                onPress={() => navigation.navigate('Search')}
              />
            }
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bgDark },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    letterSpacing: 3,
  },
  profileIcon: { fontSize: 22 },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: spacing.xxxl },

  // Banner
  banner: {
    margin: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.bgPanel,
    borderWidth: borderWidth.thick,
    borderColor: colors.pinkHot,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerSub: {
    fontFamily: fonts.pixel,
    fontSize: textSizes.xxs,
    color: colors.textDim,
    marginBottom: spacing.xs,
    letterSpacing: 1,
  },
  bannerName: {
    fontFamily: fonts.pixel,
    fontSize: textSizes.md,
    color: colors.pinkHot,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  statBadge: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderWidth: borderWidth.thick,
    padding: spacing.sm,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statValue: {
    fontFamily: fonts.pixel,
    fontSize: textSizes.lg,
  },
  statLabel: {
    fontFamily: fonts.pixel,
    fontSize: textSizes.xxs - 1,
    color: colors.textDim,
    letterSpacing: 0.5,
  },

  // Section
  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.xl },
  sectionTitle: {
    fontFamily: fonts.pixel,
    fontSize: textSizes.xs,
    color: colors.pinkHot,
    letterSpacing: 1,
    marginBottom: spacing.md,
  },

  // Reading card
  readingCard: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.bgCard,
    borderWidth: borderWidth.normal,
    borderColor: colors.pinkHot,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  readingInfo: { flex: 1, gap: spacing.xs },
  readingTitle: {
    fontFamily: fonts.pixel,
    fontSize: textSizes.xxs,
    color: colors.textMain,
    lineHeight: textSizes.xxs * 2,
  },
  readingAuthor: {
    fontFamily: fonts.pixel,
    fontSize: textSizes.xxs,
    color: colors.textDim,
  },

  // Shelf row
  shelfSection: { marginBottom: spacing.xl },
  shelfHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  shelfLabelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  shelfIcon:  { fontSize: 16 },
  shelfLabel: {
    fontFamily: fonts.pixel,
    fontSize: textSizes.xxs,
    letterSpacing: 1,
  },
  seeAll: {
    fontFamily: fonts.pixel,
    fontSize: textSizes.xxs - 1,
    color: colors.textDim,
  },
  shelfList: { paddingHorizontal: spacing.lg },
  miniRating: {
    fontFamily: fonts.pixel,
    fontSize: textSizes.xxs,
    color: colors.yellow,
    marginTop: spacing.xs,
  },
});
