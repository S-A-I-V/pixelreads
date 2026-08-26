import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { spacing, radius, textSizes, fontWeights, letterSpacing } from '../../theme';

/**
 * Modern status badge — soft tinted pill with a color-coded ambient dot.
 * Used for shelf status, ebook/free labels, availability, etc.
 */
export function StatusBadge({ label, color, icon, style }) {
  return (
    <View style={[styles.badge, { backgroundColor: color + '1A' }, style]}>
      {icon ? (
        <MaterialCommunityIcons name={icon} size={12} color={color} />
      ) : (
        <View style={[styles.dot, { backgroundColor: color }]} />
      )}
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: textSizes.xxs,
    fontWeight: fontWeights.semibold,
    letterSpacing: letterSpacing.wide,
  },
});
