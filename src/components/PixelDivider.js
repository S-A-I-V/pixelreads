import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

/**
 * Dashed pixel-art horizontal rule.
 * Props:
 *   style  ViewStyle
 *   color  string
 */
export default function PixelDivider({ style, color = colors.pinkHot }) {
  return (
    <View style={[styles.divider, { borderColor: color }, style]} />
  );
}

const styles = StyleSheet.create({
  divider: {
    height: 0,
    borderTopWidth: 2,
    borderStyle: 'dashed',
    marginVertical: spacing.md,
    opacity: 0.5,
  },
});
