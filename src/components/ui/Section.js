import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, textSizes, fontWeights } from '../../theme';

/**
 * Reusable content section with a title and optional right-side action.
 * Used across BookDetail, Home, Profile, etc.
 */
export function Section({ title, children, rightAction, style }) {
  return (
    <View style={[styles.container, style]}>
      {title && (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {rightAction}
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: textSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
  },
});
