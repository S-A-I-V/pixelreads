import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { homeColors, spacing, elevation, textSizes, fontWeights } from '../../theme';
import { SearchIcon, BookmarkIcon, LibraryIcon } from '../icons';

const ICON_BUTTON_SIZE = 44;
const ICON_SIZE = 22;
const LOGO_ICON_SIZE = 18;

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
          <LibraryIcon size={LOGO_ICON_SIZE} color={homeColors.accentPurple} />
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
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  logoContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: homeColors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    ...elevation.sm,
  },
  greetingText: {
    fontSize: textSizes.lg,
    fontWeight: fontWeights.semibold,
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
