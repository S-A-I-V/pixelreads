import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useUserBookLibraryStore } from '../features/library/store/userBookLibraryStore';
import { trackScreenView, track, EventType, EventCategory } from '../utils/analytics';
import { BookListItem, EmptyState } from '../components/ui';
import { colors, spacing, radius, textSizes, fontWeights, borderWidth } from '../theme';
import { FilterDropdown } from './library/FilterDropdown';

const BUILT_IN_TABS = [
  { key: 'all',          label: 'All'     },
  { key: 'reading',      label: 'Reading' },
  { key: 'want_to_read', label: 'Want'    },
  { key: 'finished',     label: 'Done'    },
  { key: 'dnf',          label: 'DNF'     },
];

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
    const customTabs = customShelves.map(s => ({ key: s.id, label: s.label, color: s.color }));
    return [...BUILT_IN_TABS, ...customTabs];
  }, [customShelves]);

  const allBooks = useMemo(() => {
    const keys = ['reading', 'want_to_read', 'finished', 'dnf', ...customShelves.map(s => s.id)];
    return keys.flatMap(key => shelves[key] || []);
  }, [shelves, customShelves]);

  const counts = useMemo(() => {
    const result = { all: allBooks.length, reading: shelves.reading?.length || 0, want_to_read: shelves.want_to_read?.length || 0, finished: shelves.finished?.length || 0, dnf: shelves.dnf?.length || 0 };
    customShelves.forEach(s => { result[s.id] = shelves[s.id]?.length || 0; });
    return result;
  }, [allBooks, shelves, customShelves]);

  const displayBooks = useMemo(() => {
    let base = activeTab === 'all' ? allBooks : (shelves[activeTab] ?? []);
    if (filter) {
      const lc = filter.toLowerCase();
      base = base.filter((b) => b.title.toLowerCase().includes(lc) || b.authors?.join(' ').toLowerCase().includes(lc));
    }
    if (selectedTags.length > 0) base = base.filter(b => selectedTags.some(tagId => b.tags?.includes(tagId)));
    if (eReaderFilter !== null) base = base.filter(b => eReaderFilter ? !!uploadedFiles[b.id] : !uploadedFiles[b.id]);
    return base;
  }, [activeTab, allBooks, shelves, filter, selectedTags, eReaderFilter, uploadedFiles]);

  const activeFiltersCount = selectedTags.length + (eReaderFilter !== null ? 1 : 0);

  useFocusEffect(useCallback(() => { trackScreenView('Library', { totalBooks: allBooks.length, activeTab }); }, [allBooks.length, activeTab]));

  const handleTabChange = (tabKey) => { setActiveTab(tabKey); track(EventType.TAB_CHANGE, EventCategory.NAVIGATION, { screen: 'Library', tab: tabKey }); };
  const handleFilterChange = (text) => { setFilter(text); if (text.length === 3) track(EventType.SEARCH_FILTER, EventCategory.LIBRARY, { filterText: text, screen: 'Library' }); };
  const handleToggleTag = (tagId) => { setSelectedTags(prev => prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]); };
  const handleCreateShelf = (name) => { createCustomShelf(name); track(EventType.CUSTOM_ACTION, EventCategory.LIBRARY, { action: 'create_shelf', name }); };
  const handleDeleteShelf = (shelfId) => { deleteCustomShelf(shelfId); if (activeTab === shelfId) setActiveTab('all'); };
  const goBook = (book) => { track(EventType.SEARCH_RESULT_TAP, EventCategory.NAVIGATION, { bookId: book.id, source: 'library' }); navigation.navigate('BookDetail', { book }); };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Library</Text>
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilterModal(!showFilterModal)} accessibilityLabel="Toggle filters" accessibilityRole="button">
          <MaterialCommunityIcons name="filter-variant" size={22} color={colors.textPrimary} />
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}><Text style={styles.filterBadgeText}>{activeFiltersCount}</Text></View>
          )}
        </TouchableOpacity>
      </View>

      <FilterDropdown
        visible={showFilterModal} onClose={() => setShowFilterModal(false)} tags={tags}
        selectedTags={selectedTags} onToggleTag={handleToggleTag} eReaderFilter={eReaderFilter}
        onSetEReaderFilter={setEReaderFilter} customShelves={customShelves}
        onCreateShelf={handleCreateShelf} onDeleteShelf={handleDeleteShelf}
      />

      <View style={styles.filterWrap}>
        <MaterialCommunityIcons name="magnify" size={20} color={colors.textMuted} />
        <TextInput style={styles.filterInput} value={filter} onChangeText={handleFilterChange} placeholder="Filter library..." placeholderTextColor={colors.textMuted} autoCapitalize="none" autoCorrect={false} />
        {(filter || activeFiltersCount > 0) && (
          <TouchableOpacity onPress={() => { setFilter(''); setSelectedTags([]); setEReaderFilter(null); }}>
            <MaterialCommunityIcons name="close-circle" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {activeFiltersCount > 0 && (
        <View style={styles.activeFiltersRow}>
          {selectedTags.map(tagId => {
            const tag = tags.find(t => t.id === tagId);
            if (!tag) return null;
            return (
              <TouchableOpacity key={tagId} style={[styles.activeChip, { backgroundColor: tag.color }]} onPress={() => handleToggleTag(tagId)}>
                <Text style={styles.activeChipText}>{tag.label}</Text>
                <MaterialCommunityIcons name="close" size={14} color="#fff" />
              </TouchableOpacity>
            );
          })}
          {eReaderFilter !== null && (
            <TouchableOpacity style={[styles.activeChip, { backgroundColor: colors.info }]} onPress={() => setEReaderFilter(null)}>
              <Text style={styles.activeChipText}>{eReaderFilter ? 'Has eReader' : 'No eReader'}</Text>
              <MaterialCommunityIcons name="close" size={14} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      )}

      <FlatList
        data={allTabs} horizontal showsHorizontalScrollIndicator={false}
        style={styles.tabBar} contentContainerStyle={styles.tabBarContent} keyExtractor={(t) => t.key}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleTabChange(item.key)} style={[styles.tab, activeTab === item.key && styles.tabActive, item.color && activeTab === item.key && { backgroundColor: item.color }]}>
            <Text style={[styles.tabLabel, activeTab === item.key && styles.tabLabelActive]}>{item.label} ({counts[item.key] || 0})</Text>
          </TouchableOpacity>
        )}
      />

      {displayBooks.length === 0 ? (
        <EmptyState
          icon={filter || activeFiltersCount > 0 ? 'book-search' : 'bookshelf'}
          title={filter || activeFiltersCount > 0 ? 'No matches found' : 'Shelf is empty'}
          subtitle={filter || activeFiltersCount > 0 ? 'Try different filters' : 'Add books from Search'}
        />
      ) : (
        <FlatList
          data={displayBooks} keyExtractor={(b) => b.id}
          renderItem={({ item }) => {
            const bookTags = tags.filter(t => item.tags?.includes(t.id));
            return (
              <BookListItem
                book={item} variant="standard" shelf={item.shelf}
                hasEpub={!!uploadedFiles[item.id]} tags={bookTags}
                onPress={() => goBook(item)}
              />
            );
          }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPrimary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: borderWidth.thin, borderBottomColor: colors.border },
  headerTitle: { fontSize: textSizes.h2, fontWeight: fontWeights.bold, color: colors.textPrimary },
  filterButton: { padding: spacing.sm, position: 'relative' },
  filterBadge: { position: 'absolute', top: 2, right: 2, backgroundColor: colors.accent, borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center' },
  filterBadgeText: { color: colors.textPrimary, fontSize: textSizes.xxs, fontWeight: fontWeights.bold },
  filterWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, margin: spacing.lg, paddingHorizontal: spacing.md, backgroundColor: colors.bgSecondary, borderWidth: borderWidth.thin, borderColor: colors.borderLight, borderRadius: radius.md },
  filterInput: { flex: 1, fontSize: textSizes.lg, color: colors.textPrimary, paddingVertical: spacing.md },
  activeFiltersRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  activeChip: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.xl },
  activeChipText: { color: colors.textPrimary, fontSize: textSizes.sm, fontWeight: fontWeights.medium },
  tabBar: { flexGrow: 0, borderBottomWidth: borderWidth.thin, borderBottomColor: colors.border },
  tabBarContent: { paddingHorizontal: spacing.md, gap: spacing.sm },
  tab: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: radius.md },
  tabActive: { backgroundColor: colors.accent },
  tabLabel: { fontSize: textSizes.md, color: colors.textMuted, fontWeight: fontWeights.medium },
  tabLabelActive: { color: colors.textPrimary },
  separator: { height: 1, backgroundColor: colors.border, marginLeft: 78 },
});
