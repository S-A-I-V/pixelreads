import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing } from '../theme';

/**
 * 5-star pixel rating component.
 *
 * Props:
 *   value     number   current rating 0-5
 *   onChange  fn(n)    called with new star value
 *   readonly  bool     no interaction
 *   size      number   star font size (default 24)
 */
export default function StarRating({
  value = 0,
  onChange,
  readonly = false,
  size = 24,
}) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  const handlePress = (star) => {
    if (readonly) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onChange?.(star);
  };

  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => handlePress(star)}
          disabled={readonly}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.star,
              { fontSize: size },
              display >= star ? styles.filled : styles.empty,
            ]}
          >
            ★
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  star: {
    lineHeight: undefined,
  },
  filled: { color: colors.yellow },
  empty:  { color: colors.textMuted },
});
