import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { spacing, textSizes, fontWeights } from '../../theme';

/**
 * Small colored badge pill with optional icon.
 * Used for shelf status, ebook/free labels, tags, etc.
 */
export function StatusBadge({ label, color, icon, style }) {
  return (
    <View style={[styles.badge, { backgroundColor: color }, style]}>
      {icon && <MaterialCommunityIcons name={icon} size={12} color="#fff" />}
      <Text style={styles.text}>{label}</Text>
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
    borderRadius: spacing.xs,
  },
  text: {
    fontSize: textSizes.xxs,
    fontWeight: fontWeights.semibold,
    color: '#fff',
  },
});
