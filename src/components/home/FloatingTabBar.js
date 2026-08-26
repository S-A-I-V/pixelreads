import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { homeColors, spacing, borderWidth, fonts, textSizes } from '../../theme';
import { HomeIcon, SearchIcon, LibraryIcon, ProfileIcon } from '../icons';

const TAB_ICONS = {
  Home: HomeIcon,
  Search: SearchIcon,
  Library: LibraryIcon,
  Profile: ProfileIcon,
};

const ICON_SIZE = 22;
const TAB_BUTTON_SIZE = 52;

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
          const iconColor = isFocused ? homeColors.textOnTeal : homeColors.navInactive;

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
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
                {route.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: homeColors.navBg,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: spacing.xs,
    backgroundColor: homeColors.navBg,
    borderTopWidth: borderWidth.pixel,
    borderTopColor: homeColors.border,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 44,
    borderWidth: borderWidth.normal,
    borderColor: 'transparent',
    gap: 1,
  },
  tabButtonActive: {
    backgroundColor: homeColors.accentPink,
    borderColor: homeColors.border,
    borderRightWidth: 3,
    borderBottomWidth: 3,
    borderRightColor: '#000000',
    borderBottomColor: '#000000',
  },
  tabLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: textSizes.xxs,
    color: homeColors.navInactive,
  },
  tabLabelActive: {
    color: homeColors.textOnTeal,
  },
});

export default FloatingTabBar;
