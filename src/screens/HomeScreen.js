import React, { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, FlatList, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useUserBookLibraryStore } from '../features/library/store/userBookLibraryStore';
import { useAuthUserSessionStore } from '../features/auth/store/authUserSessionStore';
import { searchBooks } from '../api/googleBooks';
import { trackScreenView, track, EventType, EventCategory } from '../utils/analytics';
import {
  HomeHeader,
  HeroBanner,
  CategoryCard,
  BookCard,
  SectionHeader,
  BookCardSkeleton,
} from '../components/home';
import { homeColors, spacing } from '../theme';

/**
 * Decorative section divider — text-based ornamental line.
 * ≻────────────── ⋆✩⋆ ──────────────≺
 */
function SectionDivider() {
  return (
    <View style={dividerStyles.container}>
      <Text style={dividerStyles.text} numberOfLines={1}>{'≻ ⋆✩⋆ ──────────── ⋆✩⋆ ──────────── ⋆✩⋆ ≺'}</Text>
    </View>
  );
}

const dividerStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xxs,
  },
  text: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 15,
    fontWeight: '900',
    color: '#000000',
  },
});

const HOME_CATEGORIES = [
  'Personal development',
  'Romance',
  'Fiction',
  'Science Fiction',
  'Mystery',
  'Fantasy',
];

const POPULAR_BOOKS_QUERY = 'new york times best sellers 2024';
const RECOMMENDED_MYSTERY_QUERY = 'subject:mystery';
const RECOMMENDED_FICTION_QUERY = 'subject:fiction';
const SKELETON_CARD_COUNT = 4;
const SKELETON_PLACEHOLDERS = Array.from({ length: SKELETON_CARD_COUNT }, (_, i) => i);

// set to true to always show skeleton placeholders (no API calls)
const DEV_SHOW_SKELETONS_ONLY = false;

export default function HomeScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const shelves = useUserBookLibraryStore((s) => s.shelves);
  const getStats = useUserBookLibraryStore((s) => s.getLibraryStatistics);
  const userEmail = useAuthUserSessionStore((s) => s.userEmail);

  const [popularBooks, setPopularBooks] = useState([]);
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const stats = getStats();
  const currentlyReading = shelves.reading || [];

  const userName = userEmail ? userEmail.split('@')[0].split('.')[0] : '';
  const displayName = userName.charAt(0).toUpperCase() + userName.slice(1);

  useEffect(() => {
    if (DEV_SHOW_SKELETONS_ONLY) {
      setIsLoading(true);
      return;
    }
    async function fetchHomeData() {
      setIsLoading(true);
      try {
        const [popular, mysteryRecs, fictionRecs] = await Promise.all([
          searchBooks(POPULAR_BOOKS_QUERY, 0, 20, false),
          searchBooks(RECOMMENDED_MYSTERY_QUERY, 0, 10, false),
          searchBooks(RECOMMENDED_FICTION_QUERY, 0, 10, false),
        ]);

        // Sort popular books by average rating (highest first), unrated at end
        const popularItems = (popular.items || [])
          .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
          .slice(0, 10);

        setPopularBooks(popularItems);

        // Merge mystery + fiction bestsellers, dedupe, take top 10
        const allRecs = [...(mysteryRecs.items || []), ...(fictionRecs.items || [])];
        const seen = new Set();
        const dedupedRecs = allRecs.filter((book) => {
          if (seen.has(book.id)) return false;
          seen.add(book.id);
          return true;
        }).slice(0, 10);

        setRecommendedBooks(dedupedRecs);
      } catch (error) {
        console.warn('[HomeScreen] Failed to fetch books:', error.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchHomeData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      trackScreenView('Home', {
        booksReading: currentlyReading.length,
        totalBooks: stats.total,
      });
    }, [currentlyReading.length, stats.total])
  );

  const handleSearchPress = useCallback(() => {
    track(EventType.SEARCH_RESULT_TAP, EventCategory.NAVIGATION, { source: 'home_header' });
    navigation.navigate('Search');
  }, [navigation]);

  const handleBookmarkPress = useCallback(() => {
    navigation.navigate('Library');
  }, [navigation]);

  const handleCategoryPress = useCallback(
    (category) => {
      track(EventType.SEARCH_RESULT_TAP, EventCategory.NAVIGATION, {
        source: 'home_category',
        category,
      });
      navigation.navigate('Search', { initialQuery: category });
    },
    [navigation]
  );

  const handleBookPress = useCallback(
    (book) => {
      track(EventType.SEARCH_RESULT_TAP, EventCategory.NAVIGATION, {
        bookId: book.id,
        source: 'home_popular',
      });
      navigation.navigate('BookDetail', { book });
    },
    [navigation]
  );

  const handleHeroBannerPress = null; // Static image, no navigation

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <HomeHeader
          userName={displayName}
          onSearchPress={handleSearchPress}
          onBookmarkPress={handleBookmarkPress}
        />

        <View style={styles.bannerSection}>
          <HeroBanner onPress={handleHeroBannerPress} />
        </View>

        <SectionDivider />

        {currentlyReading.length > 0 && (
          <>
            <SectionHeader
              title="Continue reading"
              actionText="Library"
              onActionPress={() => navigation.navigate('Library')}
            />
            <FlatList
              data={currentlyReading.slice(0, 5)}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <BookCard book={item} onPress={() => handleBookPress(item)} />
              )}
              ItemSeparatorComponent={() => <View style={styles.bookGap} />}
              ListFooterComponent={<View style={styles.listTrailingSpace} />}
            />
            <SectionDivider />
          </>
        )}

        <SectionHeader title="Popular categories" />
        <FlatList
          data={HOME_CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <CategoryCard name={item} onPress={() => handleCategoryPress(item)} />
          )}
          ItemSeparatorComponent={() => <View style={styles.cardGap} />}
          ListFooterComponent={<View style={styles.listTrailingSpace} />}
        />

        <SectionDivider />

        <SectionHeader
          title="Popular books"
          actionText="See all"
          onActionPress={() => navigation.navigate('Search', { initialQuery: 'new york times best sellers' })}
        />
        {isLoading ? (
          <FlatList
            data={SKELETON_PLACEHOLDERS}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            keyExtractor={(item) => `skeleton-popular-${item}`}
            renderItem={() => <BookCardSkeleton />}
            ItemSeparatorComponent={() => <View style={styles.bookGap} />}
            ListFooterComponent={<View style={styles.listTrailingSpace} />}
          />
        ) : (
          <FlatList
            data={popularBooks}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <BookCard book={item} onPress={() => handleBookPress(item)} />
            )}
            ItemSeparatorComponent={() => <View style={styles.bookGap} />}
            ListFooterComponent={<View style={styles.listTrailingSpace} />}
          />
        )}

        {isLoading ? (
          <>
            <SectionDivider />
            <SectionHeader title="Recommended for you" />
            <FlatList
              data={SKELETON_PLACEHOLDERS}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              keyExtractor={(item) => `skeleton-rec-${item}`}
              renderItem={() => <BookCardSkeleton />}
              ItemSeparatorComponent={() => <View style={styles.bookGap} />}
              ListFooterComponent={<View style={styles.listTrailingSpace} />}
            />
          </>
        ) : recommendedBooks.length > 0 && (
          <>
            <SectionDivider />
            <SectionHeader
              title="Recommended for you"
              actionText="See all"
              onActionPress={() =>
                navigation.navigate('Search', { initialQuery: 'mystery fiction bestseller' })
              }
            />
            <FlatList
              data={recommendedBooks}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <BookCard book={item} onPress={() => handleBookPress(item)} />
              )}
              ItemSeparatorComponent={() => <View style={styles.bookGap} />}
              ListFooterComponent={<View style={styles.listTrailingSpace} />}
            />
          </>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: homeColors.bgMain,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  bannerSection: {
    marginTop: spacing.md,
  },
  horizontalList: {
    paddingLeft: spacing.lg,
  },
  cardGap: {
    width: spacing.md,
  },
  bookGap: {
    width: spacing.md,
  },
  listTrailingSpace: {
    width: spacing.lg,
  },
});
