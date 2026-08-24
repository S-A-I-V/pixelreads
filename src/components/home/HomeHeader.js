import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { homeColors, spacing, textSizes, fontWeights, fonts } from '../../theme';

const ICON_BUTTON_SIZE = 44;
const ICON_SIZE = 22;

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function HomeHeader({ userName, onSearchPress, onBookmarkPress }) {
  const greeting = getGreeting();
  const displayGreeting = userName ? `${greeting}, ${userName}!` : `${greeting}!`;

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <View style={styles.logoContainer} accessibilityLabel="PixelReads logo">
          <MaterialCommunityIcons name="book-open-variant" size={20} color={homeColors.accentPurple} />
        </View>
        <Text style={styles.greetingText} numberOfLines={1}>
          {displayGreeting}
        </Text>
      </View>

      <View style={styles.rightSection}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onSearchPress}
          activeOpacity={0.7}
          accessibilityLabel="Search books"
          accessibilityRole="button"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialCommunityIcons name="magnify" size={ICON_SIZE} color={homeColors.textDark} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={onBookmarkPress}
          activeOpacity={0.7}
          accessibilityLabel="Bookmarks"
          accessibilityRole="button"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialCommunityIcons name="bookmark-outline" size={ICON_SIZE} color={homeColors.textDark} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  logoContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: homeColors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: homeColors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  greetingText: {
    fontSize: textSizes.lg,
    fontWeight: fontWeights.semibold,
    fontFamily: fonts.serif,
    color: homeColors.textDark,
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconButton: {
    width: ICON_BUTTON_SIZE,
    height: ICON_BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: ICON_BUTTON_SIZE / 2,
  },
});

export default HomeHeader;
