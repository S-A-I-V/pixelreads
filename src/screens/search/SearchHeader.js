import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, radius, textSizes, fontWeights, borderWidth } from '../../theme';

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
      {/* Title row */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>Search</Text>
        {hasActiveSearch && (
          <TouchableOpacity onPress={onReset} style={styles.resetBtn} accessibilityLabel="Reset search">
            <MaterialCommunityIcons name="refresh" size={18} color={colors.accent} />
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search bar */}
      <View style={styles.searchBar}>
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="magnify" size={20} color={colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={onQueryChange}
            placeholder="Search books..."
            placeholderTextColor={colors.textDim}
            onSubmitEditing={onSearch}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => onQueryChange('')} style={styles.clearBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <MaterialCommunityIcons name="close-circle" size={18} color={colors.textDim} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={onSearch} style={styles.searchBtn} accessibilityLabel="Search">
          <MaterialCommunityIcons name="magnify" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
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
    backgroundColor: colors.bgPrimary,
    borderBottomWidth: borderWidth.thin,
    borderBottomColor: colors.border,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    fontSize: textSizes.h2,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.accentLight,
    borderRadius: radius.xl,
  },
  resetText: {
    fontSize: textSizes.sm,
    color: colors.accent,
    fontWeight: fontWeights.medium,
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
    backgroundColor: colors.bgSecondary,
    borderWidth: borderWidth.thin,
    borderColor: colors.borderLight,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  inputIcon: { marginRight: spacing.sm },
  input: {
    flex: 1,
    fontSize: textSizes.lg,
    color: colors.textPrimary,
    paddingVertical: spacing.md,
  },
  clearBtn: { padding: spacing.xs },
  searchBtn: {
    backgroundColor: colors.accent,
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: colors.bgSecondary,
    borderWidth: borderWidth.thin,
    borderColor: colors.borderLight,
    marginRight: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipText: {
    fontSize: textSizes.md,
    color: colors.textPrimary,
    fontWeight: fontWeights.medium,
  },
  chipTextActive: {
    color: colors.textPrimary,
    fontWeight: fontWeights.semibold,
  },
});
