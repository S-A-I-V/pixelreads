import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { homeColors, spacing } from '../../theme';
import { HomeIcon, SearchIcon, LibraryIcon, ProfileIcon } from '../icons';

const TAB_ICONS = {
  Home: HomeIcon,
  Search: SearchIcon,
  Library: LibraryIcon,
  Profile: ProfileIcon,
};

const ICON_SIZE = 24;

export function FloatingTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
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
        const iconColor = isFocused ? homeColors.navActive : homeColors.navInactive;

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tabButton}
            onPress={onPress}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityState={{ selected: isFocused }}
            accessibilityLabel={options.tabBarAccessibilityLabel || route.name}
          >
            <IconComponent size={ICON_SIZE} color={iconColor} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: homeColors.bgMain,
    paddingTop: spacing.xs,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 40,
  },
});

export default FloatingTabBar;
