import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { colors, fonts, textSizes, spacing, borderWidth } from '../theme';

/**
 * Auto-dismiss pixel toast notification.
 *
 * Props:
 *   message   string
 *   visible   bool
 *   duration  number ms (default 2000)
 *   onHide    fn  called when animation finishes
 */
export default function Toast({ message, visible, duration = 2000, onHide }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.delay(duration),
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(() => onHide?.());
    }
  }, [visible, message]);

  if (!visible && !message) return null;

  return (
    <Animated.View style={[styles.toast, { opacity }]} pointerEvents="none">
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: colors.pinkHot,
    borderWidth: borderWidth.thick,
    borderColor: colors.pinkDark,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    zIndex: 9999,
    // pixel drop shadow
    shadowColor: colors.pinkDark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  text: {
    fontFamily: fonts.pixel,
    fontSize: textSizes.xxs,
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
