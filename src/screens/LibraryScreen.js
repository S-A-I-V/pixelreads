import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  TextInput, StyleSheet, Image, Modal, ScrollView, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useUserBookLibraryStore } from '../features/library/store/userBookLibraryStore';
import { trackScreenView, track, EventType, EventCategory } from '../utils/analytics';
import {
  LIBRARY_EREADER_FILTER_LABELS,
  CUSTOM_SHELF_INPUT_PLACEHOLDER,
  CUSTOM_SHELF_BUTTON_CREATE,
  CUSTOM_SHELF_DELETE_DIALOG_TITLE,
  CUSTOM_SHELF_DELETE_DIALOG_MESSAGE,
} from '../features/library/constants/libraryFeatureConstants';

const BUILT_IN_TABS = [
  { key: 'all',          label: 'All'     },
  { key: 'reading',      label: 'Reading' },
  { key: 'want_to_read', label: 'Want'    },
  { key: 'finished',     label: 'Done'    },
  { key: 'dnf',          label: 'DNF'     },
];

const EREADER_FILTER_OPTIONS = [
  { key: 'all', label: LIBRARY_EREADER_FILTER_LABELS.ALL, value: null },
  { key: 'has', label: LIBRARY_EREADER_FILTER_LABELS.HAS_EPUB, value: true },
  { key: 'no', label: LIBRARY_EREADER_FILTER_LABELS.NO_EPUB, value: false },
];

function BookListItem({ book, onPress, tags, uploadedFiles }) {
  const hasEpub = !!uploadedFiles[book.id];
  const bookTags = tags.filter(t => book.tags?.includes(t.id));
  
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
          <Text style={styles.shelfTag}>{book.shelf?.replace('_', ' ')}</Text>
          {hasEpub && (
            <View style={styles.epubBadge}>
              <MaterialCommunityIcons name="book-open-page-variant" size={10} color="#fff" />
            </View>
          )}
          {book.rating > 0 && (
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((i) => (
                <MaterialCommunityIcons 
                  key={i} 
                  name={i <= book.rating ? 'star' : 'star-outline'} 
                  size={12} 
                  color="#FFD700" 
                />
              ))}
            </View>
          )}
        </View>
        {bookTags.length > 0 && (
          <View style={styles.tagRow}>
            {bookTags.slice(0, 3).map(tag => (
              <View key={tag.id} style={[styles.tagChip, { backgroundColor: tag.color + '33' }]}>
                <Text style={[styles.tagChipText, { color: tag.color }]}>{tag.label}</Text>
              </View>
            ))}
            {bookTags.length > 3 && (
              <Text style={styles.moreTagsText}>+{bookTags.length - 3}</Text>
            )}
          </View>
        )}
        {book.shelf === 'reading' && book.progress > 0 && hasEpub && (
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${book.progress}%` }]} />
          </View>
        )}
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color="#888" />
    </TouchableOpacity>
  );
}

function FilterModal({ visible, onClose, tags, selectedTags, onToggleTag, 
  eReaderFilter, onSetEReaderFilter, customShelves, onCreateShelf, onDeleteShelf }) {
  const [newShelfName, setNewShelfName] = useState('');

  const handleCreateShelf = () => {
    if (newShelfName.trim()) {
      onCreateShelf(newShelfName.trim());
      setNewShelfName('');
    }
  };

  const confirmDeleteShelf = (shelf) => {
    Alert.alert(
      CUSTOM_SHELF_DELETE_DIALOG_TITLE,
      CUSTOM_SHELF_DELETE_DIALOG_MESSAGE,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDeleteShelf(shelf.id) },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            {/* eReader Filter */}
            <Text style={styles.filterSectionTitle}>eReader Status</Text>
            <View style={styles.filterChipsRow}>
              {EREADER_FILTER_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.filterChip, eReaderFilter === opt.value && styles.filterChipActive]}
                  onPress={() => onSetEReaderFilter(opt.value)}
                >
                  <Text style={[styles.filterChipText, 
                    eReaderFilter === opt.value && styles.filterChipTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Tags Filter */}
            <Text style={styles.filterSectionTitle}>Tags</Text>
            {tags.length === 0 ? (
              <Text style={styles.emptyFilterText}>No tags created yet</Text>
            ) : (
              <View style={styles.filterChipsRow}>
                {tags.map(tag => (
                  <TouchableOpacity
                    key={tag.id}
                    style={[styles.filterChip, { borderColor: tag.color },
                      selectedTags.includes(tag.id) && { backgroundColor: tag.color }]}
                    onPress={() => onToggleTag(tag.id)}
                  >
                    <Text style={[styles.filterChipText,
                      selectedTags.includes(tag.id) && styles.filterChipTextActive]}>
                      {tag.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Custom Shelves */}
            <Text style={styles.filterSectionTitle}>Custom Shelves</Text>
            <View style={styles.createShelfRow}>
              <TextInput
                style={styles.createShelfInput}
                value={newShelfName}
                onChangeText={setNewShelfName}
                placeholder={CUSTOM_SHELF_INPUT_PLACEHOLDER}
                placeholderTextColor="#888"
                maxLength={25}
              />
              <TouchableOpacity 
                style={[styles.createShelfBtn, !newShelfName.trim() && styles.createShelfBtnDisabled]}
                onPress={handleCreateShelf}
                disabled={!newShelfName.trim()}
              >
                <Text style={styles.createShelfBtnText}>{CUSTOM_SHELF_BUTTON_CREATE}</Text>
              </TouchableOpacity>
            </View>

            {customShelves.length === 0 ? (
              <Text style={styles.emptyFilterText}>No custom shelves yet</Text>
            ) : (
              <View style={styles.customShelfList}>
                {customShelves.map(shelf => (
                  <View key={shelf.id} style={styles.customShelfItem}>
                    <View style={[styles.shelfColorDot, { backgroundColor: shelf.color }]} />
                    <Text style={styles.customShelfLabel}>{shelf.label}</Text>
                    <TouchableOpacity onPress={() => confirmDeleteShelf(shelf)}>
                      <MaterialCommunityIcons name="delete-outline" size={20} color="#ff6b6b" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default function LibraryScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  
  // Store state
  const shelves = useUserBookLibraryStore((s) => s.shelves);
  const tags = useUserBookLibraryStore((s) => s.tags);
  const customShelves = useUserBookLibraryStore((s) => s.customShelves);
  const uploadedFiles = useUserBookLibraryStore((s) => s.uploadedFiles);
  const createCustomShelf = useUserBookLibraryStore((s) => s.createCustomShelf);
  const deleteCustomShelf = useUserBookLibraryStore((s) => s.deleteCustomShelf);

  // Filter state
  const initShelf = route.params?.shelf ?? 'all';
  const [activeTab, setActiveTab] = useState(initShelf);
  const [filter, setFilter] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [eReaderFilter, setEReaderFilter] = useState(null); // null = all, true = has, false = no
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Build tabs list (built-in + custom)
  const allTabs = useMemo(() => {
    const customTabs = customShelves.map(s => ({ key: s.id, label: s.label, color: s.color }));
    return [...BUILT_IN_TABS, ...customTabs];
  }, [customShelves]);

  const allBooks = useMemo(() => {
    const builtInKeys = ['reading', 'want_to_read', 'finished', 'dnf'];
    const customKeys = customShelves.map(s => s.id);
    return [...builtInKeys, ...customKeys].flatMap(key => shelves[key] || []);
  }, [shelves, customShelves]);

  const counts = useMemo(() => {
    const result = {
      all: allBooks.length,
      reading: shelves.reading?.length || 0,
      want_to_read: shelves.want_to_read?.length || 0,
      finished: shelves.finished?.length || 0,
      dnf: shelves.dnf?.length || 0,
    };
    customShelves.forEach(s => {
      result[s.id] = shelves[s.id]?.length || 0;
    });
    return result;
  }, [allBooks, shelves, customShelves]);

  const displayBooks = useMemo(() => {
    let base = activeTab === 'all' ? allBooks : (shelves[activeTab] ?? []);
    
    // Text filter
    if (filter) {
      base = base.filter((b) =>
        b.title.toLowerCase().includes(filter.toLowerCase()) ||
        b.authors?.join(' ').toLowerCase().includes(filter.toLowerCase())
      );
    }
    
    // Tag filter
    if (selectedTags.length > 0) {
      base = base.filter(b => selectedTags.some(tagId => b.tags?.includes(tagId)));
    }
    
    // eReader filter
    if (eReaderFilter !== null) {
      base = base.filter(b => {
        const hasEpub = !!uploadedFiles[b.id];
        return eReaderFilter ? hasEpub : !hasEpub;
      });
    }
    
    return base;
  }, [activeTab, allBooks, shelves, filter, selectedTags, eReaderFilter, uploadedFiles]);

  const activeFiltersCount = selectedTags.length + (eReaderFilter !== null ? 1 : 0);

  // Track screen view on focus
  useFocusEffect(
    useCallback(() => {
      trackScreenView('Library', { totalBooks: allBooks.length, activeTab });
      console.log(`[Screen] Library viewed - ${allBooks.length} books, tab: ${activeTab}`);
    }, [allBooks.length, activeTab])
  );

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    track(EventType.TAB_CHANGE, EventCategory.NAVIGATION, { 
      screen: 'Library', tab: tabKey, bookCount: counts[tabKey] 
    });
  };

  const handleFilterChange = (text) => {
    setFilter(text);
    if (text.length === 3) {
      track(EventType.SEARCH_FILTER, EventCategory.LIBRARY, { filterText: text, screen: 'Library' });
    }
  };

  const handleToggleTag = (tagId) => {
    setSelectedTags(prev => 
      prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
    );
  };

  const handleCreateShelf = (name) => {
    createCustomShelf(name);
    track(EventType.CUSTOM_ACTION, EventCategory.LIBRARY, { action: 'create_shelf', name });
  };

  const handleDeleteShelf = (shelfId) => {
    deleteCustomShelf(shelfId);
    if (activeTab === shelfId) setActiveTab('all');
    track(EventType.CUSTOM_ACTION, EventCategory.LIBRARY, { action: 'delete_shelf', shelfId });
  };

  const goBook = (book) => {
    track(EventType.SEARCH_RESULT_TAP, EventCategory.NAVIGATION, { 
      bookId: book.id, bookTitle: book.title, source: 'library', shelf: book.shelf 
    });
    navigation.navigate('BookDetail', { book });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Library</Text>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <MaterialCommunityIcons name="filter-variant" size={22} color="#fff" />
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
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
        {(filter || activeFiltersCount > 0) && (
          <TouchableOpacity onPress={() => { setFilter(''); setSelectedTags([]); setEReaderFilter(null); }}>
            <MaterialCommunityIcons name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      {/* Active filter chips */}
      {activeFiltersCount > 0 && (
        <View style={styles.activeFiltersRow}>
          {selectedTags.map(tagId => {
            const tag = tags.find(t => t.id === tagId);
            if (!tag) return null;
            return (
              <TouchableOpacity 
                key={tagId} 
                style={[styles.activeFilterChip, { backgroundColor: tag.color }]}
                onPress={() => handleToggleTag(tagId)}
              >
                <Text style={styles.activeFilterChipText}>{tag.label}</Text>
                <MaterialCommunityIcons name="close" size={14} color="#fff" />
              </TouchableOpacity>
            );
          })}
          {eReaderFilter !== null && (
            <TouchableOpacity 
              style={[styles.activeFilterChip, { backgroundColor: '#2563eb' }]}
              onPress={() => setEReaderFilter(null)}
            >
              <Text style={styles.activeFilterChipText}>
                {eReaderFilter ? 'Has eReader' : 'No eReader'}
              </Text>
              <MaterialCommunityIcons name="close" size={14} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Tab bar */}
      <FlatList
        data={allTabs}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabBar}
        contentContainerStyle={styles.tabBarContent}
        keyExtractor={(t) => t.key}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleTabChange(item.key)}
            style={[styles.tab, activeTab === item.key && styles.tabActive,
              item.color && activeTab === item.key && { backgroundColor: item.color }]}
          >
            <Text style={[styles.tabLabel, activeTab === item.key && styles.tabLabelActive]}>
              {item.label} ({counts[item.key] || 0})
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Book list */}
      {displayBooks.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons 
            name={filter || activeFiltersCount > 0 ? 'book-search' : 'bookshelf'} 
            size={48} 
            color="#888" 
          />
          <Text style={styles.emptyText}>
            {filter || activeFiltersCount > 0 ? 'No matches found' : 'Shelf is empty'}
          </Text>
          <Text style={styles.emptySubtext}>
            {filter || activeFiltersCount > 0 ? 'Try different filters' : 'Add books from Search'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayBooks}
          keyExtractor={(b) => b.id}
          renderItem={({ item }) => (
            <BookListItem 
              book={item} 
              onPress={() => goBook(item)} 
              tags={tags}
              uploadedFiles={uploadedFiles}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        tags={tags}
        selectedTags={selectedTags}
        onToggleTag={handleToggleTag}
        eReaderFilter={eReaderFilter}
        onSetEReaderFilter={setEReaderFilter}
        customShelves={customShelves}
        onCreateShelf={handleCreateShelf}
        onDeleteShelf={handleDeleteShelf}
      />
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
  filterButton: {
    padding: 8,
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#e94560',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
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

  activeFiltersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  activeFilterChipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
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
    gap: 8,
    marginTop: 4,
  },
  shelfTag: {
    fontSize: 11,
    color: '#e94560',
    textTransform: 'capitalize',
  },
  epubBadge: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingRow: {
    flexDirection: 'row',
  },

  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  tagChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagChipText: {
    fontSize: 10,
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 10,
    color: '#888',
    alignSelf: 'center',
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

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '75%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalScroll: {
    flex: 1,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    marginBottom: 12,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#444',
    backgroundColor: '#2a2a4e',
  },
  filterChipActive: {
    backgroundColor: '#e94560',
    borderColor: '#e94560',
  },
  filterChipText: {
    fontSize: 14,
    color: '#ccc',
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
  emptyFilterText: {
    color: '#666',
    fontSize: 14,
    marginBottom: 16,
  },

  createShelfRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  createShelfInput: {
    flex: 1,
    backgroundColor: '#2a2a4e',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#fff',
  },
  createShelfBtn: {
    backgroundColor: '#e94560',
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
  },
  createShelfBtnDisabled: {
    backgroundColor: '#444',
  },
  createShelfBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  customShelfList: {
    gap: 8,
    marginBottom: 20,
  },
  customShelfItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#2a2a4e',
    padding: 12,
    borderRadius: 8,
  },
  shelfColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  customShelfLabel: {
    flex: 1,
    fontSize: 15,
    color: '#fff',
  },
});
