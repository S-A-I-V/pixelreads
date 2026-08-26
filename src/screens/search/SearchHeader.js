import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SearchIcon } from '../../components/icons';
import { homeColors, spacing, borderWidth, textSizes, fonts } from '../../theme';

const SEARCH_FILTERS = [
  { key: 'all', label: 'All', prefix: '' },
  { key: 'title', label: 'Title', prefix: 'intitle:' },
  { key: 'author', label: 'Author', prefix: 'inauthor:' },
  { key: 'publisher', label: 'Publisher', prefix: 'inpublisher:' },
  { key: 'subject', label: 'Subject', prefix: 'subject:' },
  { key: 'isbn', label: 'ISBN', prefix: 'isbn:' },
];

export { SEARCH_FILTERS };

export function SearchHeader({ query, filter, hasActiveSearch, onQueryChange, onSearch, onFilterChange, onReset }) {
  return (
    <View style={styles.fixedHeader}>
      {/* Title bar */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>Search</Text>
        {hasActiveSearch && (
          <TouchableOpacity onPress={onReset} style={styles.resetBtn}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search bar */}
      <View style={styles.searchBar}>
        <View style={styles.inputContainer}>
          <SearchIcon size={16} color={homeColors.textCaption} />
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={onQueryChange}
            placeholder="Search books..."
            placeholderTextColor={homeColors.textCaption}
            onSubmitEditing={onSearch}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => onQueryChange('')} style={styles.clearBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.clearBtnText}>x</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={onSearch} style={styles.searchBtn} accessibilityLabel="Search">
          <SearchIcon size={18} color="#000000" />
        </TouchableOpacity>
      </View>

      {/* Filter chips — same width as search bar */}
      <View style={styles.filterBarRow}>
        {SEARCH_FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.chip, filter === f.key && styles.chipActive]}
            onPress={() => onFilterChange(f.key)}
          >
            <Text style={[styles.chipText, filter === f.key && styles.chipTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fixedHeader: {
    backgroundColor: homeColors.navBg,
    borderBottomWidth: borderWidth.pixel,
    borderBottomColor: '#000000',
    paddingBottom: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  title: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: textSizes.lg,
    color: '#000000',
  },
  resetBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: '#FBCA1F',
    borderWidth: 2,
    borderColor: '#000000',
    borderRightWidth: 3,
    borderBottomWidth: 3,
  },
  resetText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: textSizes.xxs,
    color: '#000000',
  },
  searchBar: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#FFFFFF',
    borderWidth: borderWidth.pixel,
    borderColor: '#000000',
    paddingHorizontal: spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: textSizes.sm,
    color: '#000000',
    paddingVertical: spacing.xs,
  },
  searchBtn: {
    backgroundColor: '#FBCA1F',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000000',
    borderRightWidth: 4,
    borderBottomWidth: 4,
  },
  clearBtn: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: homeColors.error,
    borderWidth: 2,
    borderColor: '#000000',
  },
  clearBtnText: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: '#000000',
    lineHeight: 12,
  },
  filterBarRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  chip: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    borderRightWidth: 3,
    borderBottomWidth: 3,
    height: 28,
  },
  chipActive: {
    backgroundColor: '#FBCA1F',
  },
  chipText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: textSizes.xxs,
    color: '#000000',
  },
  chipTextActive: {
    color: '#000000',
  },
});
