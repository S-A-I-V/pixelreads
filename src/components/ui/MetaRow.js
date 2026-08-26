import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { homeColors, spacing, textSizes } from '../../theme';

/**
 * Icon + label + value row for metadata display.
 * Shows "Not available" in dimmed text when value is null/empty.
 */
export function MetaRow({ icon, label, value }) {
  return (
    <View style={styles.row}>
      {icon && <MaterialCommunityIcons name={icon} size={16} color={homeColors.textCaption} />}
      <Text style={styles.label}>{label}</Text>
      <Text style={value ? styles.value : styles.emptyValue}>
        {value || 'Not available'}
      </Text>
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
    color: homeColors.textCaption,
    width: 90,
  },
  value: {
    flex: 1,
    fontSize: textSizes.sm,
    color: homeColors.textDark,
  },
  emptyValue: {
    flex: 1,
    fontSize: textSizes.sm,
    color: homeColors.textCaption,
    fontStyle: 'italic',
  },
});
