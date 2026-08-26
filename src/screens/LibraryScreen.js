import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useUserBookLibraryStore } from '../features/library/store/userBookLibraryStore';
import { trackScreenView, track, EventType, EventCategory } from '../utils/analytics';
import { SearchIcon } from '../components/icons';
import { LibraryBookCard } from '../components/library/LibraryBookCard';
import { EmptyState } from '../components/ui';
import { FilterDropdown } from './library/FilterDropdown';
import { homeColors, spacing, radius, elevation, borderWidth, textSizes, fontWeights, fonts } from '../theme';

const BUILT_IN_TABS = [
  { key: 'all', label: 'All' },
  { key: 'reading', label: 'Reading' },
  { key: 'want_to_read', label: 'Want to Read' },
  { key: 'finished', label: 'Finished' },
  { key: 'dnf', label: 'DNF' },
];

const GRID_COLUMNS = 2;

export default function LibraryScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  const shelves = useUserBookLibraryStore((s) => s.shelves);
  const tags = useUserBookLibraryStore((s) => s.tags);
  const customShelves = useUserBookLibraryStore((s) => s.customShelves);
  const uploadedFiles = useUserBookLibraryStore((s) => s.uploadedFiles);
  const createCustomShelf = useUserBookLibraryStore((s) => s.createCustomShelf);
  const deleteCustomShelf = useUserBookLibraryStore((s) => s.deleteCustomShelf);

  const initShelf = route.params?.shelf ?? 'all';
  const [activeTab, setActiveTab] = useState(initShelf);
  const [filter, setFilter] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [eReaderFilter, setEReaderFilter] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const allTabs = useMemo(() => {
    const customTabs = customShelves.map((s) => ({ key: s.id, label: s.label, color: s.color }));
    return [...BUILT_IN_TABS, ...customTabs];
  }, [customShelves]);

  const allBooks = useMemo(() => {
    const keys = ['reading', 'want_to_read', 'finished', 'dnf', ...customShelves.map((s) => s.id)];
    return keys.flatMap((key) => shelves[key] || []);
  }, [shelves, customShelves]);

  const counts = useMemo(() => {
    const result = {
      all: allBooks.length,
      reading: shelves.reading?.length || 0,
      want_to_read: shelves.want_to_read?.length || 0,
      finished: shelves.finished?.length || 0,
      dnf: shelves.dnf?.length || 0,
    };
    customShelves.forEach((s) => {
      result[s.id] = shelves[s.id]?.length || 0;
    });
    return result;
  }, [allBooks, shelves, customShelves]);

  const displayBooks = useMemo(() => {
    let base = activeTab === 'all' ? allBooks : (shelves[activeTab] ?? []);
    if (filter) {
      const lc = filter.toLowerCase();
      base = base.filter(
        (b) =>
          b.title.toLowerCase().includes(lc) ||
          b.authors?.join(' ').toLowerCase().includes(lc)
      );
    }
    if (selectedTags.length > 0) {
      base = base.filter((b) => selectedTags.some((tagId) => b.tags?.includes(tagId)));
    }
    if (eReaderFilter !== null) {
      base = base.filter((b) => (eReaderFilter ? !!uploadedFiles[b.id] : !uploadedFiles[b.id]));
    }
    return base;
  }, [activeTab, allBooks, shelves, filter, selectedTags, eReaderFilter, uploadedFiles]);

  const activeFiltersCount = selectedTags.length + (eReaderFilter !== null ? 1 : 0);

  useFocusEffect(
    useCallback(() => {
      trackScreenView('Library', { totalBooks: allBooks.length, activeTab });
    }, [allBooks.length, activeTab])
  );

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    track(EventType.TAB_CHANGE, EventCategory.NAVIGATION, { screen: 'Library', tab: tabKey });
  };

  const handleFilterChange = (text) => {
    setFilter(text);
    if (text.length === 3) {
      track(EventType.SEARCH_FILTER, EventCategory.LIBRARY, { filterText: text, screen: 'Library' });
    }
  };

  const handleToggleTag = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const handleCreateShelf = (name) => {
    createCustomShelf(name);
    track(EventType.CUSTOM_ACTION, EventCategory.LIBRARY, { action: 'create_shelf', name });
  };

  const handleDeleteShelf = (shelfId) => {
    deleteCustomShelf(shelfId);
    if (activeTab === shelfId) setActiveTab('all');
  };

  const handleBookPress = (book) => {
    track(EventType.SEARCH_RESULT_TAP, EventCategory.NAVIGATION, {
      bookId: book.id,
      source: 'library',
    });
    navigation.navigate('BookDetail', { book });
  };

  const clearFilters = () => {
    setFilter('');
    setSelectedTags([]);
    setEReaderFilter(null);
  };

  const renderHeader = () => (
    <View>
      {activeFiltersCount > 0 && (
        <View style={styles.filtersBox}>
          <View style={styles.filtersStripes}>
            {Array.from({ length: 80 }, (_, i) => (
              <View key={i} style={[styles.filterStripe, { left: i * 7 - 60 }]} />
            ))}
          </View>
          <Text style={styles.filtersBoxLabel}>{'# Active Filters'}</Text>
          <View style={styles.activeFiltersRow}>
            {selectedTags.map((tagId) => {
              const tag = tags.find((t) => t.id === tagId);
              if (!tag) return null;
              return (
                <TouchableOpacity
                  key={tagId}
                  style={[styles.activeChip, { backgroundColor: tag.color }]}
                  onPress={() => handleToggleTag(tagId)}
                  accessibilityLabel={`Remove ${tag.label} filter`}
                  accessibilityRole="button"
                >
                  <Text style={styles.activeChipText}>{tag.label}</Text>
                  <Text style={styles.activeChipClose}>x</Text>
                </TouchableOpacity>
              );
            })}
            {eReaderFilter !== null && (
              <TouchableOpacity
                style={[styles.activeChip, { backgroundColor: homeColors.accentPurple }]}
                onPress={() => setEReaderFilter(null)}
                accessibilityLabel="Remove eReader filter"
                accessibilityRole="button"
              >
                <Text style={styles.activeChipText}>
                  {eReaderFilter ? 'Has eBook' : 'No eBook'}
                </Text>
                <Text style={styles.activeChipClose}>x</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.screen}>
      <View style={[styles.safeArea, { height: insets.top }]} />
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Library</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(!showFilterModal)}
          accessibilityLabel="Toggle filters"
          accessibilityRole="button"
        >
          <Text style={styles.filterButtonText}>Filters</Text>
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search input */}
      <View style={styles.searchContainer}>
        <SearchIcon size={18} color={homeColors.textCaption} />
        <TextInput
          style={styles.searchInput}
          value={filter}
          onChangeText={handleFilterChange}
          placeholder="Search your library..."
          placeholderTextColor={homeColors.textCaption}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {(filter || activeFiltersCount > 0) && (
          <TouchableOpacity
            onPress={clearFilters}
            accessibilityLabel="Clear filters"
            accessibilityRole="button"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Shelf tabs */}
      <FlatList
        data={allTabs}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabBar}
        contentContainerStyle={styles.tabBarContent}
        keyExtractor={(t) => t.key}
        renderItem={({ item }) => {
          const isActive = activeTab === item.key;
          return (
            <TouchableOpacity
              onPress={() => handleTabChange(item.key)}
              style={[
                styles.tab,
                isActive && styles.tabActive,
                item.color && isActive && { backgroundColor: item.color },
              ]}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {item.label}
              </Text>
              <Text style={[styles.tabCount, isActive && styles.tabCountActive]}>
                {counts[item.key] || 0}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Filter modal */}
      <FilterDropdown
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

      {/* Book grid */}
      {displayBooks.length === 0 ? (
        <EmptyState
          icon={filter || activeFiltersCount > 0 ? 'book-search' : 'bookshelf'}
          title={filter || activeFiltersCount > 0 ? 'No matches found' : 'Shelf is empty'}
          subtitle={
            filter || activeFiltersCount > 0
              ? 'Try different filters'
              : 'Add books from Search'
          }
        />
      ) : (
        <FlatList
          data={displayBooks}
          keyExtractor={(b) => b.id}
          numColumns={GRID_COLUMNS}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderHeader}
          renderItem={({ item }) => (
            <LibraryBookCard
              book={item}
              shelf={item.shelf || activeTab}
              onPress={() => handleBookPress(item)}
            />
          )}
        />
      )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: homeColors.navBg,
    borderBottomWidth: borderWidth.pixel,
    borderBottomColor: homeColors.border,
  },
  headerTitle: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: textSizes.lg,
    color: '#000000',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: '#FBCA1F',
    borderWidth: 2,
    borderColor: '#000000',
    borderRightWidth: 3,
    borderBottomWidth: 3,
  },
  filterButtonText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: textSizes.xs,
    color: '#000000',
  },
  filterBadge: {
    backgroundColor: homeColors.accentPink,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000000',
  },
  filterBadgeText: {
    fontFamily: 'SpaceMono-Bold',
    color: '#FFFFFF',
    fontSize: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: '#FFFFFF',
    borderWidth: borderWidth.pixel,
    borderColor: homeColors.border,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: textSizes.sm,
    color: '#000000',
    paddingVertical: spacing.xxs,
  },
  clearText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: textSizes.xxs,
    color: homeColors.accent,
  },
  tabBar: {
    flexGrow: 0,
    flexShrink: 0,
    marginBottom: spacing.xs,
    height: 44,
  },
  tabBarContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    borderRightWidth: 3,
    borderBottomWidth: 3,
    height: 30,
  },
  tabActive: {
    backgroundColor: '#FBCA1F',
  },
  tabLabel: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: textSizes.xxs,
    color: '#000000',
  },
  tabLabelActive: {
    color: '#000000',
  },
  tabCount: {
    fontFamily: fonts.body,
    fontSize: 9,
    color: homeColors.textCaption,
  },
  tabCountActive: {
    color: '#000000',
  },
  activeFiltersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  filtersBox: {
    marginHorizontal: 0,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: '#000000',
    padding: spacing.sm,
    backgroundColor: '#80D4C8',
    overflow: 'hidden',
    position: 'relative',
  },
  filtersStripes: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  filterStripe: {
    position: 'absolute',
    top: -40,
    width: 1.5,
    height: 200,
    backgroundColor: '#006D5B',
    transform: [{ rotate: '-45deg' }],
  },
  filtersBoxLabel: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 10,
    color: '#000000',
    marginBottom: spacing.xs,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#000000',
  },
  activeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderWidth: 2,
    borderColor: '#000000',
  },
  activeChipText: {
    fontFamily: 'SpaceMono-Bold',
    color: '#FFFFFF',
    fontSize: textSizes.xxs,
  },
  activeChipClose: {
    fontFamily: 'SpaceMono-Bold',
    color: '#FFFFFF',
    fontSize: textSizes.xxs,
    marginLeft: spacing.xxs,
  },
  gridContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.huge,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
});
