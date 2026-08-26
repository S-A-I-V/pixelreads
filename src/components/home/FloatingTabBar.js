import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { homeColors, spacing, radius, elevation } from '../../theme';
import { HomeIcon, SearchIcon, LibraryIcon, ProfileIcon } from '../icons';

const TAB_ICONS = {
  Home: HomeIcon,
  Search: SearchIcon,
  Library: LibraryIcon,
  Profile: ProfileIcon,
};

const ICON_SIZE = 24;
const TAB_BUTTON_SIZE = 48;

/**
 * Modern floating tab bar with ambient glow on active tab.
 * Minimal, elevated, with haptic feedback.
 */
export function FloatingTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom }]}>
      <View style={styles.container}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate(route.name);
            }
          };

          const IconComponent = TAB_ICONS[route.name] || HomeIcon;
          const iconColor = isFocused ? homeColors.accent : homeColors.navInactive;

          return (
            <TouchableOpacity
              key={route.key}
              style={[styles.tabButton, isFocused && styles.tabButtonActive]}
              onPress={onPress}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={options.tabBarAccessibilityLabel || route.name}
            >
              <IconComponent size={ICON_SIZE} color={iconColor} />
              {isFocused && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: homeColors.bgMain,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xs,
    paddingVertical: spacing.sm,
    backgroundColor: homeColors.bgCard,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: homeColors.borderSubtle,
    ...elevation.lg,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: TAB_BUTTON_SIZE,
    height: TAB_BUTTON_SIZE,
    borderRadius: TAB_BUTTON_SIZE / 2,
  },
  tabButtonActive: {
    backgroundColor: homeColors.accentLight,
    shadowColor: homeColors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 0,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: homeColors.accent,
  },
});

export default FloatingTabBar;
