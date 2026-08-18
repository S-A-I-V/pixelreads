import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme';

/**
 * Reader top header bar: back, title, search, bookmark, settings.
 */
export function ReaderHeader({ title, theme, insetTop, height, isBookmarked, canBookmark, onBack, onSearch, onBookmark, onSettings }) {
  return (
    <View style={[styles.header, { paddingTop: insetTop, height }]}>
      <TouchableOpacity onPress={onBack} style={styles.iconBtn} hitSlop={8} accessibilityLabel="Go back">
        <MaterialCommunityIcons name="arrow-left" size={22} color={theme.text} />
      </TouchableOpacity>

      <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
        {title || 'Reading'}
      </Text>

      <TouchableOpacity onPress={onSearch} style={styles.iconBtn} hitSlop={8} accessibilityLabel="Search in book">
        <MaterialCommunityIcons name="magnify" size={22} color={theme.text} />
      </TouchableOpacity>
      <TouchableOpacity onPress={onBookmark} style={styles.iconBtn} hitSlop={8} disabled={!canBookmark} accessibilityLabel="Toggle bookmark">
        <MaterialCommunityIcons
          name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
          size={22}
          color={isBookmarked ? colors.accent : theme.text}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={onSettings} style={styles.iconBtn} hitSlop={8} accessibilityLabel="Reading settings">
        <MaterialCommunityIcons name="cog" size={22} color={theme.text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.3)',
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  iconBtn: {
    padding: 10,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
