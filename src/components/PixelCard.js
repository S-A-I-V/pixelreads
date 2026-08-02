import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, borderWidth } from '../theme';

/**
 * Pixel-art card container with optional press handler.
 *
 * Props:
 *   children
 *   onPress     fn   – if provided, card becomes touchable
 *   style       ViewStyle override
 *   padding     number – inner padding (default spacing.md)
 *   accent      string – border color (default pinkHot)
 */
export default function PixelCard({
  children,
  onPress,
  style,
  padding = spacing.md,
  accent = colors.pinkHot,
}) {
  const cardStyle = [
    styles.card,
    { borderColor: accent, padding },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={cardStyle}>
        {children}
        <View style={[styles.shadow, { backgroundColor: accent + '55' }]} />
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle}>
      {children}
      <View style={[styles.shadow, { backgroundColor: accent + '55' }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderWidth: borderWidth.thick,
    borderColor: colors.pinkHot,
    position: 'relative',
  },
  shadow: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    left: 4,
    top: 4,
    zIndex: -1,
  },
});
