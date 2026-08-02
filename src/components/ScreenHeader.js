import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, textSizes, spacing, borderWidth } from '../theme';

/**
 * Retro pixel screen header bar.
 *
 * Props:
 *   title     string
 *   left      ReactNode  – left slot (back button etc)
 *   right     ReactNode  – right slot
 *   style     ViewStyle
 */
export default function ScreenHeader({ title, left, right, style }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + spacing.sm }, style]}>
      <View style={styles.left}>{left || <View />}</View>
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      <View style={styles.right}>{right || <View />}</View>
    </View>
  );
}

export function BackButton({ onPress, label = '◀' }) {
  return (
    <TouchableOpacity onPress={onPress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
      <Text style={styles.backLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgMid,
    borderBottomWidth: borderWidth.thick,
    borderBottomColor: colors.pinkHot,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  title: {
    fontFamily: fonts.pixel,
    fontSize: textSizes.sm,
    color: colors.pinkHot,
    textShadowColor: colors.pinkDark,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
    letterSpacing: 2,
    flex: 1,
    textAlign: 'center',
  },
  left:  { minWidth: 40, alignItems: 'flex-start' },
  right: { minWidth: 40, alignItems: 'flex-end'   },
  backLabel: {
    fontFamily: fonts.pixel,
    fontSize: textSizes.md,
    color: colors.pinkHot,
  },
});
