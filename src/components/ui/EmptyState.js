import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, textSizes, fontWeights } from '../../theme';

/**
 * Reusable empty state with icon, title, and optional subtitle/action.
 * Used across Library (empty shelf), Search (no results), Home (no books).
 */
export function EmptyState({ icon, title, subtitle, children, style }) {
  return (
    <View style={[styles.container, style]}>
      {icon && (
        <MaterialCommunityIcons name={icon} size={48} color={colors.textMuted} />
      )}
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.xxl,
  },
  title: {
    fontSize: textSizes.xl,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: textSizes.md,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
