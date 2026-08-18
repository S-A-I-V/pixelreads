import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme';

/**
 * Reader bottom footer bar: TOC button, progress track, bookmarks button.
 */
export function ReaderFooter({ theme, insetBottom, height, chapterLabel, progress, currentPage, totalPages, onTOC, onBookmarks }) {
  return (
    <View style={[styles.footer, { paddingBottom: insetBottom, height }]}>
      <TouchableOpacity onPress={onTOC} style={styles.tocBtn} hitSlop={8} accessibilityLabel="Table of contents">
        <MaterialCommunityIcons name="format-list-bulleted" size={18} color={theme.text} />
        <Text style={[styles.chapterLabel, { color: theme.text }]} numberOfLines={1}>
          {chapterLabel || 'Contents'}
        </Text>
      </TouchableOpacity>

      <View style={styles.progressRow}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.round(progress)}%` }]} />
        </View>
        <View style={styles.progressInfo}>
          {currentPage > 0 && totalPages > 0 ? (
            <Text style={[styles.progressPct, { color: theme.text }]}>
              {currentPage}/{totalPages}
            </Text>
          ) : (
            <Text style={[styles.progressPct, { color: theme.text }]}>
              {Math.round(progress)}%
            </Text>
          )}
        </View>
      </View>

      <TouchableOpacity onPress={onBookmarks} style={styles.iconBtn} hitSlop={8} accessibilityLabel="Bookmarks list">
        <MaterialCommunityIcons name="bookmark-multiple-outline" size={20} color={theme.text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128,128,128,0.3)',
  },
  tocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: '35%',
  },
  chapterLabel: { fontSize: 11 },
  progressRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  progressTrack: { flex: 1, height: 3, backgroundColor: 'rgba(128,128,128,0.3)', borderRadius: 2 },
  progressFill: { height: '100%', backgroundColor: colors.accent, borderRadius: 2 },
  progressInfo: { alignItems: 'flex-end' },
  progressPct: { fontSize: 11, minWidth: 40, textAlign: 'right' },
  iconBtn: { padding: 10, minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
});
