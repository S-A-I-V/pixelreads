import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { homeColors, spacing, radius } from '../../theme';

const TAB_ICONS = {
  Home: { active: 'home', inactive: 'home-outline' },
  Search: { active: 'compass', inactive: 'compass-outline' },
  Library: { active: 'heart', inactive: 'heart-outline' },
  Profile: { active: 'account', inactive: 'account-outline' },
};

const CENTER_BTN_SIZE = 44;
const ICON_SIZE = 26;

export function FloatingTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, spacing.md);

  return (
    <View style={[styles.wrapper, { paddingBottom: bottomPadding }]}>
      <View style={styles.container}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const middleIndex = Math.floor(state.routes.length / 2);
          const isBeforeCenter = index === middleIndex;

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

          const iconConfig = TAB_ICONS[route.name] || TAB_ICONS.Home;
          const iconName = isFocused ? iconConfig.active : iconConfig.inactive;

          return (
            <React.Fragment key={route.key}>
              {isBeforeCenter && (
                <View style={styles.centerButtonWrapper}>
                  <TouchableOpacity
                    style={styles.centerButton}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      navigation.navigate('Search');
                    }}
                    activeOpacity={0.8}
                    accessibilityLabel="Add or discover books"
                    accessibilityRole="button"
                  >
                    <MaterialCommunityIcons name="plus" size={28} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                style={styles.tabButton}
                onPress={onPress}
                activeOpacity={0.7}
                accessibilityRole="tab"
                accessibilityState={{ selected: isFocused }}
                accessibilityLabel={options.tabBarAccessibilityLabel || route.name}
              >
                <MaterialCommunityIcons
                  name={iconName}
                  size={ICON_SIZE}
                  color={isFocused ? homeColors.navActive : homeColors.navInactive}
                />
              </TouchableOpacity>
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    backgroundColor: homeColors.navBg,
    borderRadius: radius.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    width: '100%',
    maxWidth: 320,
    shadowColor: homeColors.shadowStrong,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: homeColors.border,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  centerButtonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.xxs,
  },
  centerButton: {
    width: CENTER_BTN_SIZE,
    height: CENTER_BTN_SIZE,
    borderRadius: CENTER_BTN_SIZE / 2,
    backgroundColor: homeColors.navCenterBtn,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: homeColors.navCenterBtn,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'rgba(108, 43, 217, 0.25)',
  },
});

export default FloatingTabBar;
