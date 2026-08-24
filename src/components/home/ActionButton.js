import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { homeColors, spacing, radius, textSizes, fontWeights, fonts } from '../../theme';

export function ActionButton({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  loading = false,
  disabled = false,
  haptic = true,
  style,
}) {
  const isDisabled = disabled || loading;

  const handlePress = () => {
    if (isDisabled) return;
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  };

  const containerStyles = [
    styles.base,
    styles[`${variant}Container`],
    styles[`${size}Size`],
    isDisabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.label,
    styles[`${variant}Label`],
    styles[`${size}Label`],
  ];

  const iconColor = variant === 'primary'
    ? homeColors.textOnGradient
    : homeColors.accentPurple;

  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 20 : 16;

  return (
    <TouchableOpacity
      style={containerStyles}
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? homeColors.textOnGradient : homeColors.accentPurple}
        />
      ) : (
        <>
          {iconLeft && (
            <MaterialCommunityIcons name={iconLeft} size={iconSize} color={iconColor} />
          )}
          <Text style={textStyles}>{label}</Text>
          {iconRight && (
            <MaterialCommunityIcons name={iconRight} size={iconSize} color={iconColor} />
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 44,
  },
  primaryContainer: {
    backgroundColor: homeColors.accentPurple,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xl,
  },
  secondaryContainer: {
    backgroundColor: 'transparent',
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: homeColors.accentPurple,
    paddingHorizontal: spacing.xl,
  },
  ghostContainer: {
    backgroundColor: 'transparent',
    paddingHorizontal: spacing.sm,
  },
  primaryLabel: {
    color: homeColors.textOnGradient,
  },
  secondaryLabel: {
    color: homeColors.accentPurple,
  },
  ghostLabel: {
    color: homeColors.accentPurple,
  },
  smSize: {
    minHeight: 36,
    paddingVertical: spacing.xs,
  },
  mdSize: {
    minHeight: 44,
    paddingVertical: spacing.sm,
  },
  lgSize: {
    minHeight: 52,
    paddingVertical: spacing.md,
  },
  smLabel: {
    fontSize: textSizes.sm,
  },
  mdLabel: {
    fontSize: textSizes.md,
  },
  lgLabel: {
    fontSize: textSizes.lg,
  },
  label: {
    fontFamily: fonts.serif,
    fontWeight: fontWeights.semibold,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default ActionButton;
