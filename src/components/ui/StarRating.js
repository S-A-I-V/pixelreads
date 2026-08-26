import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { homeColors, spacing } from '../../theme';

/**
 * Star rating display/input using MaterialCommunityIcons.
 * Supports readonly mode (display) and interactive mode (tap to rate).
 */
export function StarRating({ value = 0, onChange, readonly = false, size = 32 }) {
  return (
    <View style={styles.row} accessibilityRole="adjustable" accessibilityLabel={`Rating: ${value} of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <TouchableOpacity
          key={i}
          onPress={() => !readonly && onChange?.(i)}
          style={styles.button}
          disabled={readonly}
          accessibilityLabel={`${i} star${i > 1 ? 's' : ''}`}
          hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
        >
          <MaterialCommunityIcons
            name={i <= value ? 'star' : 'star-outline'}
            size={size}
            color={homeColors.warning}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.xxs,
  },
  button: {
    padding: spacing.xxs,
  },
});
