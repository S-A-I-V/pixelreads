import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../../theme';

/**
 * Generic progress bar with configurable height and color.
 * Used in BookDetail (reading progress), HomeScreen (book cards), Reader footer.
 */
export function ProgressBar({ progress = 0, height = 8, trackColor, fillColor, style }) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <View style={[styles.track, { height, backgroundColor: trackColor || colors.borderLight }, style]}>
      <View
        style={[
          styles.fill,
          { width: `${clampedProgress}%`, backgroundColor: fillColor || colors.accent },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.sm,
  },
});
