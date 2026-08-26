import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { homeColors, spacing, textSizes, fontWeights } from '../../theme';

/**
 * Reusable empty state with icon, title, and optional subtitle/action.
 * Used across Library (empty shelf), Search (no results), Home (no books).
 */
export function EmptyState({ icon, title, subtitle, children, style }) {
  return (
    <View style={[styles.container, style]}>
      {icon && (
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name={icon} size={40} color={homeColors.accent} />
        </View>
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
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: homeColors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: textSizes.xl,
    fontWeight: fontWeights.bold,
    color: homeColors.textDark,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: textSizes.md,
    color: homeColors.textCaption,
    textAlign: 'center',
    lineHeight: textSizes.md * 1.4,
  },
});
