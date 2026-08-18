import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, textSizes } from '../../theme';

/**
 * Icon + label + value row for metadata display.
 * Used in BookDetail publication details card.
 */
export function MetaRow({ icon, label, value }) {
  if (!value) return null;

  return (
    <View style={styles.row}>
      {icon && <MaterialCommunityIcons name={icon} size={16} color={colors.textMuted} />}
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    fontSize: textSizes.sm,
    color: colors.textMuted,
    width: 90,
  },
  value: {
    flex: 1,
    fontSize: textSizes.sm,
    color: colors.textPrimary,
  },
});
