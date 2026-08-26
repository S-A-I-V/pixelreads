import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SearchIcon } from '../../components/icons';
import { homeColors, spacing, radius, elevation, textSizes, fontWeights } from '../../theme';

const SEARCH_FILTERS = [
  { key: 'all', label: 'All', prefix: '' },
  { key: 'title', label: 'Title', prefix: 'intitle:' },
  { key: 'author', label: 'Author', prefix: 'inauthor:' },
  { key: 'publisher', label: 'Publisher', prefix: 'inpublisher:' },
  { key: 'subject', label: 'Subject', prefix: 'subject:' },
  { key: 'isbn', label: 'ISBN', prefix: 'isbn:' },
];

export { SEARCH_FILTERS };

/**
 * Fixed search header: title + reset, search bar, filter chips.
 */
export function SearchHeader({ query, filter, hasActiveSearch, onQueryChange, onSearch, onFilterChange, onReset }) {
  return (
    <View style={styles.fixedHeader}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Search</Text>
        {hasActiveSearch && (
          <TouchableOpacity onPress={onReset} style={styles.resetBtn} accessibilityLabel="Reset search">
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.searchBar}>
        <View style={styles.inputContainer}>
          <SearchIcon size={18} color={homeColors.textCaption} />
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
              <MaterialCommunityIcons name="close-circle" size={18} color={homeColors.textCaption} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={onSearch} style={styles.searchBtn} accessibilityLabel="Search">
          <SearchIcon size={22} color={homeColors.textOnAccent} />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar} contentContainerStyle={styles.filterBarContent}>
        {SEARCH_FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.chip, filter === f.key && styles.chipActive]}
            onPress={() => onFilterChange(f.key)}
          >
            <Text style={[styles.chipText, filter === f.key && styles.chipTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fixedHeader: {
    backgroundColor: homeColors.bgMain,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    fontSize: textSizes.h1,
    fontWeight: fontWeights.bold,
    color: homeColors.textDark,
  },
  resetBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: homeColors.accentLight,
    borderRadius: radius.pill,
  },
  resetText: {
    fontSize: textSizes.sm,
    color: homeColors.accent,
    fontWeight: fontWeights.semibold,
  },
  searchBar: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: homeColors.bgCard,
    borderWidth: 1,
    borderColor: homeColors.borderSubtle,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    ...elevation.sm,
  },
  input: {
    flex: 1,
    fontSize: textSizes.md,
    color: homeColors.textDark,
    paddingVertical: spacing.md,
  },
  clearBtn: { padding: spacing.xs },
  searchBtn: {
    backgroundColor: homeColors.accent,
    width: 48,
    height: 48,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...elevation.accent,
  },
  filterBar: { flexGrow: 0 },
  filterBarContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: homeColors.bgCard,
    borderWidth: 1,
    borderColor: homeColors.border,
    marginRight: spacing.sm,
  },
  chipActive: {
    backgroundColor: homeColors.accent,
    borderColor: homeColors.accent,
    ...elevation.accent,
  },
  chipText: {
    fontSize: textSizes.sm,
    color: homeColors.textBody,
    fontWeight: fontWeights.medium,
  },
  chipTextActive: {
    color: homeColors.textOnAccent,
    fontWeight: fontWeights.semibold,
  },
});
