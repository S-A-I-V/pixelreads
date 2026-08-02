import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, fonts, textSizes, spacing } from '../theme';

/**
 * Pixel-art style button with retro pink drop-shadow.
 *
 * Props:
 *   label       string   – button text
 *   onPress     fn
 *   variant     'primary' | 'secondary' | 'danger' | 'ghost'
 *   size        'sm' | 'md' | 'lg'
 *   disabled    bool
 *   style       ViewStyle override
 *   textStyle   TextStyle override
 *   icon        ReactNode  – optional left icon
 */
export default function PixelButton({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  style,
  textStyle,
  icon,
}) {
  const handlePress = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  const containerStyle = [
    styles.base,
    styles[`size_${size}`],
    styles[`variant_${variant}`],
    disabled && styles.disabled,
    style,
  ];

  const labelStyle = [
    styles.label,
    styles[`labelSize_${size}`],
    styles[`labelVariant_${variant}`],
    textStyle,
  ];

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      disabled={disabled}
      style={containerStyle}
    >
      <View style={styles.inner}>
        {icon && <View style={styles.iconWrap}>{icon}</View>}
        <Text style={labelStyle}>{label}</Text>
      </View>
      {/* Pixel drop shadow */}
      <View style={[styles.shadow, styles[`shadow_${variant}`]]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    position: 'relative',
    alignSelf: 'flex-start',
    marginBottom: 4, // room for shadow
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    marginRight: spacing.xs,
  },

  // Sizes
  size_sm: { paddingHorizontal: spacing.sm,  paddingVertical: spacing.xs  },
  size_md: { paddingHorizontal: spacing.md,  paddingVertical: spacing.sm  },
  size_lg: { paddingHorizontal: spacing.xl,  paddingVertical: spacing.md  },

  // Variants
  variant_primary:   { backgroundColor: colors.pinkHot,   borderWidth: 0 },
  variant_secondary: { backgroundColor: colors.bgPanel,   borderWidth: 3, borderColor: colors.pinkHot },
  variant_danger:    { backgroundColor: colors.red,        borderWidth: 0 },
  variant_ghost:     { backgroundColor: colors.transparent, borderWidth: 2, borderColor: colors.pinkDark },

  // Drop shadows (pixel offset)
  shadow: {
    position: 'absolute',
    bottom: -4,
    left: 4,
    right: -4,
    height: 4,
    zIndex: -1,
  },
  shadow_primary:   { backgroundColor: colors.pinkDark },
  shadow_secondary: { backgroundColor: colors.pinkDark },
  shadow_danger:    { backgroundColor: colors.redDark },
  shadow_ghost:     { backgroundColor: colors.transparent },

  // Labels
  label: {
    fontFamily: fonts.pixel,
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  labelSize_sm: { fontSize: textSizes.xxs },
  labelSize_md: { fontSize: textSizes.xs  },
  labelSize_lg: { fontSize: textSizes.sm  },

  labelVariant_primary:   { color: colors.white },
  labelVariant_secondary: { color: colors.white },
  labelVariant_danger:    { color: colors.white },
  labelVariant_ghost:     { color: colors.pinkLight },

  disabled: { opacity: 0.45 },
});
