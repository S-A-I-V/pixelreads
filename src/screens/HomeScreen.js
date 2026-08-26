import React, { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
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
} from '../components/home';
import { homeColors, spacing } from '../theme';

const HOME_CATEGORIES = [
  'Personal development',
  'Romance',
  'Fiction',
  'Science Fiction',
  'Mystery',
  'Fantasy',
];

const POPULAR_BOOKS_QUERY = 'bestseller 2024';
const RECOMMENDED_BOOKS_QUERY = 'award winning fiction';

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
    async function fetchHomeData() {
      setIsLoading(true);
      try {
        const [popular, recommended] = await Promise.all([
          searchBooks(POPULAR_BOOKS_QUERY, 0, 10, false),
          searchBooks(RECOMMENDED_BOOKS_QUERY, 0, 10, false),
        ]);
        setPopularBooks(popular.items || []);
        setRecommendedBooks(recommended.items || []);
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

  const handleHeroBannerPress = useCallback(() => {
    navigation.navigate('Search', { initialQuery: 'recommended' });
  }, [navigation]);

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

        <SectionHeader
          title="Popular books"
          actionText="See all"
          onActionPress={() => navigation.navigate('Search', { initialQuery: 'popular books' })}
        />
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={homeColors.accentPurple} />
          </View>
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

        {recommendedBooks.length > 0 && (
          <>
            <SectionHeader
              title="Recommended for you"
              actionText="See all"
              onActionPress={() =>
                navigation.navigate('Search', { initialQuery: 'award winning' })
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
    paddingBottom: spacing.lg,
  },
  bannerSection: {
    marginTop: spacing.md,
  },
  horizontalList: {
    paddingLeft: spacing.lg,
  },
  cardGap: {
    width: spacing.sm,
  },
  bookGap: {
    width: spacing.sm,
  },
  loadingContainer: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  listTrailingSpace: {
    width: spacing.lg,
  },
});
