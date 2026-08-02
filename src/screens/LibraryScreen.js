import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  TextInput, StyleSheet, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useUserBookLibraryStore } from '../features/library';
import { trackScreenView, track, EventType, EventCategory } from '../utils/analytics';

const TABS = [
  { key: 'all',          label: 'All'     },
  { key: 'reading',      label: 'Reading' },
  { key: 'want_to_read', label: 'Want'    },
  { key: 'finished',     label: 'Done'    },
  { key: 'dnf',          label: 'DNF'     },
];

function BookListItem({ book, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.listItem} activeOpacity={0.7}>
      {book.thumbnail ? (
        <Image source={{ uri: book.thumbnail }} style={styles.bookCover} />
      ) : (
        <View style={[styles.bookCover, styles.noCover]}>
          <Text style={styles.noCoverText}>No Cover</Text>
        </View>
      )}
      <View style={styles.listInfo}>
        <Text style={styles.listTitle} numberOfLines={2}>{book.title}</Text>
        <Text style={styles.listAuthor} numberOfLines={1}>
          {book.authors?.join(', ') || 'Unknown'}
        </Text>
        <View style={styles.listMeta}>
          <Text style={styles.shelfTag}>{book.shelf}</Text>
          {book.rating > 0 && (
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((i) => (
                <MaterialCommunityIcons 
                  key={i} 
                  name={i <= book.rating ? 'star' : 'star-outline'} 
                  size={14} 
                  color="#FFD700" 
                />
              ))}
            </View>
          )}
        </View>
        {book.shelf === 'reading' && book.progress > 0 && (
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${book.progress}%` }]} />
          </View>
        )}
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color="#888" />
    </TouchableOpacity>
  );
}

export default function LibraryScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const shelves = useUserBookLibraryStore((s) => s.shelves);

  const initShelf = route.params?.shelf ?? 'all';
  const [activeTab, setActiveTab] = useState(initShelf);
  const [filter, setFilter] = useState('');

  const allBooks = useMemo(() => Object.values(shelves).flat(), [shelves]);

  const counts = {
    all:          allBooks.length,
    reading:      shelves.reading?.length || 0,
    want_to_read: shelves.want_to_read?.length || 0,
    finished:     shelves.finished?.length || 0,
    dnf:          shelves.dnf?.length || 0,
  };

  const displayBooks = useMemo(() => {
    const base = activeTab === 'all' ? allBooks : (shelves[activeTab] ?? []);
    if (!filter) return base;
    return base.filter((b) =>
      b.title.toLowerCase().includes(filter.toLowerCase()) ||
      b.authors?.join(' ').toLowerCase().includes(filter.toLowerCase())
    );
  }, [activeTab, allBooks, shelves, filter]);

  // Track screen view on focus
  useFocusEffect(
    useCallback(() => {
      trackScreenView('Library', { totalBooks: allBooks.length, activeTab });
      console.log(`[Screen] Library viewed - ${allBooks.length} books, tab: ${activeTab}`);
    }, [allBooks.length, activeTab])
  );

  // Track tab changes
  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    track(EventType.TAB_CHANGE, EventCategory.NAVIGATION, { 
      screen: 'Library', 
      tab: tabKey, 
      bookCount: counts[tabKey] 
    });
    console.log(`[Library] Tab changed to "${tabKey}" (${counts[tabKey]} books)`);
  };

  // Track filter usage
  const handleFilterChange = (text) => {
    setFilter(text);
    if (text.length === 3) { // Log when user starts meaningful filter
      track(EventType.SEARCH_FILTER, EventCategory.LIBRARY, { filterText: text, screen: 'Library' });
      console.log(`[Library] Filter started: "${text}"`);
    }
  };

  const goBook = (book) => {
    track(EventType.SEARCH_RESULT_TAP, EventCategory.NAVIGATION, { 
      bookId: book.id, 
      bookTitle: book.title,
      source: 'library',
      shelf: book.shelf 
    });
    console.log(`[Library] Tapped book: "${book.title}" (${book.shelf})`);
    navigation.navigate('BookDetail', { book });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Library</Text>
        <Text style={styles.headerCount}>{allBooks.length} books</Text>
      </View>

      {/* Filter input */}
      <View style={styles.filterWrap}>
        <MaterialCommunityIcons name="magnify" size={20} color="#888" />
        <TextInput
          style={styles.filterInput}
          value={filter}
          onChangeText={handleFilterChange}
          placeholder="Filter library..."
          placeholderTextColor="#888"
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
        contentContainerStyle={styles.tabBarContent}
        keyExtractor={(t) => t.key}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleTabChange(item.key)}
            style={[styles.tab, activeTab === item.key && styles.tabActive]}
          >
            <Text style={[styles.tabLabel, activeTab === item.key && styles.tabLabelActive]}>
              {item.label} ({counts[item.key]})
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Book list */}
      {displayBooks.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons 
            name={filter ? 'book-search' : 'bookshelf'} 
            size={48} 
            color="#888" 
          />
          <Text style={styles.emptyText}>
            {filter ? 'No matches found' : 'Shelf is empty'}
          </Text>
          <Text style={styles.emptySubtext}>
            {filter ? 'Try different keywords' : 'Add books from Search'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayBooks}
          keyExtractor={(b) => b.id}
          renderItem={({ item }) => (
            <BookListItem book={item} onPress={() => goBook(item)} />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  headerCount: {
    fontSize: 14,
    color: '#888',
  },
  filterWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    margin: 16,
    paddingHorizontal: 12,
    backgroundColor: '#2a2a4e',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
  },
  filterInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    paddingVertical: 12,
  },
  tabBar: {
    flexGrow: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tabBarContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#e94560',
  },
  tabLabel: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  tabLabelActive: {
    color: '#fff',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bookCover: {
    width: 50,
    height: 75,
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
  listInfo: {
    flex: 1,
    gap: 4,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  listAuthor: {
    fontSize: 14,
    color: '#888',
  },
  listMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  shelfTag: {
    fontSize: 12,
    color: '#e94560',
    textTransform: 'capitalize',
  },
  ratingRow: {
    flexDirection: 'row',
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
  separator: {
    height: 1,
    backgroundColor: '#333',
    marginLeft: 78,
  },
});
