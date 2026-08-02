import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, textSizes, spacing, borderWidth } from '../theme';

const SHELF_CONFIG = {
  reading:      { label: 'Reading', bg: colors.blue,      border: '#0033CC' },
  want_to_read: { label: 'Want',    bg: colors.pinkHot,   border: colors.pinkDark },
  finished:     { label: 'Done',    bg: colors.green,     border: colors.greenDark },
  dnf:          { label: 'DNF',     bg: '#AA2200',        border: '#771500' },
};

/**
 * Shelf status badge.
 * Props:
 *   shelf  'reading' | 'want_to_read' | 'finished' | 'dnf'
 *   style  ViewStyle override
 */
export default function ShelfBadge({ shelf, style }) {
  const config = SHELF_CONFIG[shelf];
  if (!config) return null;

  return (
    <View style={[styles.badge, { backgroundColor: config.bg, borderColor: config.border }, style]}>
      <Text style={styles.label}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderWidth: borderWidth.normal,
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: fonts.pixel,
    fontSize: textSizes.xxs - 1,
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
