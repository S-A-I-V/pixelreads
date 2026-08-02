import React, { useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useUserBookLibraryStore } from '../features/library/store/userBookLibraryStore';
import { useAuthUserSessionStore } from '../features/auth/store/authUserSessionStore';
import { trackScreenView, track, EventType, EventCategory } from '../utils/analytics';

function BookCard({ book, onPress }) {
  return (
    <TouchableOpacity style={styles.bookCard} onPress={onPress}>
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
          {book.authors?.join(', ') || 'Unknown'}
        </Text>
        {book.progress > 0 && (
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${book.progress}%` }]} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const shelves = useUserBookLibraryStore((s) => s.shelves);
  const getStats = useUserBookLibraryStore((s) => s.getLibraryStatistics);
  const userEmail = useAuthUserSessionStore((s) => s.userEmail);

  const stats = getStats();
  const currentlyReading = shelves.reading || [];

  // Track screen view on focus (fires on tab switch too)
  useFocusEffect(
    useCallback(() => {
      trackScreenView('Home', { booksReading: currentlyReading.length, totalBooks: stats.total });
      console.log(`[Screen] Home viewed - ${currentlyReading.length} books reading, ${stats.total} total`);
    }, [currentlyReading.length, stats.total])
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Home</Text>
        <Text style={styles.headerEmail}>{userEmail}</Text>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.reading}</Text>
          <Text style={styles.statLabel}>Reading</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.finished}</Text>
          <Text style={styles.statLabel}>Finished</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.wantToRead}</Text>
          <Text style={styles.statLabel}>Want</Text>
        </View>
      </View>

      {/* Currently Reading */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Currently Reading</Text>
        {currentlyReading.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No books in progress</Text>
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => navigation.navigate('Search')}
            >
              <Text style={styles.linkText}>Search for books</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={currentlyReading}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <BookCard
                book={item}
                onPress={() => {
                  track(EventType.SEARCH_RESULT_TAP, EventCategory.NAVIGATION, { 
                    bookId: item.id, 
                    bookTitle: item.title,
                    source: 'home_currently_reading' 
                  });
                  console.log(`[Home] Tapped book: "${item.title}"`);
                  navigation.navigate('BookDetail', { book: item });
                }}
              />
            )}
            showsVerticalScrollIndicator={false}
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
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerEmail: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  stats: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e94560',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  section: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
  linkButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  linkText: {
    fontSize: 16,
    color: '#e94560',
  },
  bookCard: {
    flexDirection: 'row',
    backgroundColor: '#2a2a4e',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    gap: 12,
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
    fontSize: 10,
    color: '#888',
    textAlign: 'center',
  },
  bookInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  bookAuthor: {
    fontSize: 14,
    color: '#888',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#444',
    borderRadius: 2,
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#e94560',
    borderRadius: 2,
  },
});
