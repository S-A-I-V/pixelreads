import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { spacing, borderWidth, textSizes } from '../../theme';

/**
 * Interpolate between yellow (#FBCA1F) and green (#10B981) based on progress.
 */
function getProgressColor(pct) {
  const t = Math.min(100, Math.max(0, pct)) / 100;
  const r = Math.round(251 + (16 - 251) * t);
  const g = Math.round(202 + (185 - 202) * t);
  const b = Math.round(31 + (129 - 31) * t);
  return `rgb(${r},${g},${b})`;
}

/**
 * Compact retro OS-style reader footer bar.
 * All colors driven by theme.chrome — no hardcoded values.
 *
 * Uses the same wrapper + inset-padding pattern as FloatingTabBar
 * so the area below the bar is filled with the theme background
 * instead of showing a white strip on Android.
 */
export function ReaderFooter({
  theme, insetBottom, height,
  chapterLabel, progress, currentPage, totalPages,
  onTOC, onBookmarks,
}) {
  const c = theme.chrome;
  const pct = Math.min(100, Math.max(0, Math.round(progress)));
  const fillColor = getProgressColor(pct);

  return (
    <View style={[styles.wrapper, { paddingBottom: insetBottom, backgroundColor: c.bg }]}>
      <View style={[styles.footer, { backgroundColor: c.bg, borderTopColor: c.border }]}>
        {/* TOC button */}
        <TouchableOpacity
          onPress={onTOC}
          style={[styles.tocBtn, { borderColor: c.border, backgroundColor: c.btnBg }]}
          accessibilityLabel="Table of contents"
          accessibilityRole="button"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialCommunityIcons name="format-list-bulleted" size={14} color={c.text} />
          <Text style={[styles.tocLabel, { color: c.text }]} numberOfLines={1}>
            {chapterLabel || 'Contents'}
          </Text>
        </TouchableOpacity>

        <View style={styles.spacer} />

        {/* Compact gradient progress bar */}
        <View style={[styles.miniBar, { borderColor: c.border, backgroundColor: c.contentBg }]}>
          <View style={[styles.miniFill, { width: `${pct}%`, backgroundColor: fillColor }]} />
        </View>

        {/* Percentage + page count */}
        <Text style={[styles.progressText, { color: c.text }]}>
          {pct}%{currentPage > 0 && totalPages > 0 ? ` · ${currentPage}/${totalPages}` : ''}
        </Text>

        {/* Bookmarks button */}
        <TouchableOpacity
          onPress={onBookmarks}
          style={[styles.iconBtn, { borderColor: c.border, backgroundColor: c.btnBg }]}
          accessibilityLabel="Bookmarks list"
          accessibilityRole="button"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialCommunityIcons name="bookmark-multiple-outline" size={14} color={c.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    // Fills the bottom safe area with the theme background color,
    // same pattern as FloatingTabBar
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    borderTopWidth: borderWidth.pixel,
    gap: spacing.sm,
  },
  tocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    height: 30,
    paddingHorizontal: spacing.sm,
    borderWidth: 2,
    borderRightWidth: 3,
    borderBottomWidth: 3,
  },
  tocLabel: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: textSizes.xxs,
    maxWidth: 100,
  },
  spacer: {
    flex: 1,
  },
  miniBar: {
    width: 60,
    height: 30,
    borderWidth: 2,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  miniFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  progressText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: textSizes.xxs,
    minWidth: 28,
  },
  iconBtn: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRightWidth: 3,
    borderBottomWidth: 3,
  },
});
