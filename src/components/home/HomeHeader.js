import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { homeColors, spacing, borderWidth, textSizes, fontWeights, fonts } from '../../theme';
import { SearchIcon, BookmarkIcon } from '../icons';
import { NeuShadow } from '../ui/NeuShadow';

const ICON_BUTTON_SIZE = 44;
const ICON_SIZE = 20;

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function HomeHeader({ userName, onSearchPress, onBookmarkPress }) {
  const greeting = getGreeting();
  const displayGreeting = userName ? `${greeting}, ${userName}` : greeting;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <NeuShadow offset={3} style={styles.outerWrap}>
      <View style={styles.container}>
      {/* OS Window Title Bar */}
      <View style={styles.titleBar}>
        {/* Window dots (decorative OS controls) */}
        <View style={styles.windowControls}>
          <View style={[styles.windowDot, styles.dotClose]} />
          <View style={[styles.windowDot, styles.dotMinimize]} />
          <View style={[styles.windowDot, styles.dotMaximize]} />
        </View>

        <Text style={styles.appTitle}>PixelReads.exe</Text>

        <View style={styles.rightSection}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onSearchPress}
            activeOpacity={0.7}
            accessibilityLabel="Search books"
            accessibilityRole="button"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <SearchIcon size={ICON_SIZE} color={homeColors.textDark} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={onBookmarkPress}
            activeOpacity={0.7}
            accessibilityLabel="Bookmarks"
            accessibilityRole="button"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <BookmarkIcon size={ICON_SIZE} color={homeColors.textDark} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Greeting bar below title bar */}
      <View style={styles.greetingBar}>
        <Text style={styles.greetingText}>{displayGreeting}</Text>
        <View style={styles.onlineChip}>
          <Animated.View style={[styles.onlineDot, { opacity: pulseAnim }]} />
          <Text style={styles.onlineText}>online</Text>
        </View>
      </View>
    </View>
    </NeuShadow>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: borderWidth.pixel,
    borderColor: homeColors.border,
    backgroundColor: homeColors.bgCard,
  },
  outerWrap: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  titleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: homeColors.bgCard,
    borderBottomWidth: borderWidth.normal,
    borderBottomColor: homeColors.border,
  },
  windowControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  windowDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: borderWidth.normal,
    borderColor: homeColors.border,
  },
  dotClose: {
    backgroundColor: homeColors.error,
  },
  dotMinimize: {
    backgroundColor: homeColors.accent,
  },
  dotMaximize: {
    backgroundColor: homeColors.success,
  },
  appTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: textSizes.lg,
    color: homeColors.textDark,
    letterSpacing: 0.5,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: borderWidth.normal,
    borderColor: homeColors.border,
    backgroundColor: homeColors.bgWindow,
  },
  greetingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: homeColors.bgWindow,
  },
  greetingText: {
    fontFamily: fonts.bodyBold,
    fontSize: textSizes.sm,
    color: homeColors.textDark,
  },
  onlineChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: homeColors.success,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: homeColors.success,
  },
  onlineText: {
    fontFamily: fonts.bodyBold,
    fontSize: textSizes.xxs,
    color: homeColors.success,
  },
});

export default HomeHeader;
