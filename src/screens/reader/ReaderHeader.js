import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { spacing, borderWidth, textSizes } from '../../theme';

/**
 * Retro OS-style reader header bar.
 * All colors driven by theme.chrome — no hardcoded values.
 */
export function ReaderHeader({
  title, theme, insetTop, height,
  isBookmarked, canBookmark,
  onBack, onSearch, onBookmark, onSettings,
}) {
  const c = theme.chrome;

  return (
    <View style={[styles.header, { paddingTop: insetTop, height, backgroundColor: c.bg, borderBottomColor: c.border }]}>
      {/* Back button */}
      <TouchableOpacity
        onPress={onBack}
        style={[styles.backBtn, { borderColor: c.border, backgroundColor: c.btnBg }]}
        accessibilityLabel="Go back"
        accessibilityRole="button"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <MaterialCommunityIcons name="arrow-left" size={18} color={c.text} />
      </TouchableOpacity>

      {/* Title */}
      <Text style={[styles.title, { color: c.text }]} numberOfLines={1}>
        {title ? `${title.slice(0, 28)}` : 'reader.exe'}
      </Text>

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={onSearch}
          style={[styles.actionBtn, { borderColor: c.border, backgroundColor: c.searchBtnBg }]}
          accessibilityLabel="Search in book"
          accessibilityRole="button"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialCommunityIcons name="magnify" size={16} color={c.searchBtnIcon} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onBookmark}
          style={[
            styles.actionBtn,
            { borderColor: c.border, backgroundColor: c.bookmarkBtnBg },
            isBookmarked && { backgroundColor: c.accent },
          ]}
          disabled={!canBookmark}
          accessibilityLabel={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
          accessibilityRole="button"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialCommunityIcons
            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={16}
            color={isBookmarked ? c.accentText : c.bookmarkBtnIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onSettings}
          style={[styles.actionBtn, { borderColor: c.border, backgroundColor: c.settingsBtnBg }]}
          accessibilityLabel="Reading settings"
          accessibilityRole="button"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialCommunityIcons name="cog" size={16} color={c.settingsBtnIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    borderBottomWidth: borderWidth.pixel,
    gap: spacing.sm,
  },
  backBtn: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  title: {
    flex: 1,
    fontFamily: 'SpaceMono-Bold',
    fontSize: textSizes.sm,
    letterSpacing: 0.3,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  actionBtn: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRightWidth: 3,
    borderBottomWidth: 3,
  },
});
