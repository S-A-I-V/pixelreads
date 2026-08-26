import React, { useRef } from 'react';
import { Text, TouchableOpacity, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { homeColors, spacing, borderWidth, radius, textSizes, fontWeights, fonts } from '../../theme';

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
  const pressAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.timing(pressAnim, {
      toValue: 1,
      duration: 80,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(pressAnim, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (isDisabled) return;
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  };

  // Translate: resting = (-1, -1), pressed = (1, 1) — simulates shadow push
  const translateX = pressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-1, 1],
  });
  const translateY = pressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-1, 1],
  });

  const containerStyles = [
    styles.base,
    styles[`${variant}Container`],
    styles[`${size}Size`],
    isDisabled && styles.disabled,
    { transform: [{ translateX }, { translateY }] },
    style,
  ];

  const textStyles = [
    styles.label,
    styles[`${variant}Label`],
    styles[`${size}Label`],
  ];

  const iconColor = '#000000';

  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 20 : 16;

  return (
    <Animated.View style={containerStyles}>
      <TouchableOpacity
        style={styles.touchable}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: isDisabled }}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'ghost' ? homeColors.accent : homeColors.textOnAccent}
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
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    minHeight: 44,
  },
  touchable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  // Primary: #fbca1f yellow, 3px black border, hard shadow
  primaryContainer: {
    backgroundColor: '#FBCA1F',
    borderWidth: 3,
    borderColor: '#000000',
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    borderRightWidth: 6,
    borderBottomWidth: 6,
  },
  // Secondary: lavender fill, same border treatment
  secondaryContainer: {
    backgroundColor: homeColors.bgCard,
    borderWidth: 3,
    borderColor: '#000000',
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    borderRightWidth: 5,
    borderBottomWidth: 5,
  },
  // Ghost: same style as primary but smaller padding — used for inline "See all" / "View all"
  ghostContainer: {
    backgroundColor: '#FBCA1F',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    borderRightWidth: 4,
    borderBottomWidth: 4,
  },
  primaryLabel: {
    color: '#000000',
  },
  secondaryLabel: {
    color: '#000000',
  },
  ghostLabel: {
    color: '#000000',
  },
  smSize: {
    minHeight: 30,
    paddingVertical: 3,
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
    fontFamily: fonts.bodyBold,
    fontSize: 16,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default ActionButton;
