/**
 * =========================================================================
 *  Tab Navigator
 * =========================================================================
 *
 *  Bottom tab navigation for main app screens.
 *
 * =========================================================================
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import LibraryScreen from '../screens/LibraryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import {
  ROUTE_NAME_HOME_TAB,
  ROUTE_NAME_SEARCH_TAB,
  ROUTE_NAME_LIBRARY_TAB,
  ROUTE_NAME_PROFILE_TAB,
  TAB_ICON_HOME,
  TAB_ICON_SEARCH,
  TAB_ICON_LIBRARY,
  TAB_ICON_PROFILE,
} from '../constants/navigationConstants';
import { TAB_BAR_HEIGHT_PX } from '../constants/uiConstants';
import type { MainTabNavigatorParamList } from '../shared/types/navigationTypes';

const MainTab = createBottomTabNavigator<MainTabNavigatorParamList>();

/**
 * Tab configuration array for cleaner rendering
 */
interface TabScreenConfiguration {
  readonly name: keyof MainTabNavigatorParamList;
  readonly component: React.ComponentType<unknown>;
  readonly iconName: string;
}

const TAB_SCREEN_CONFIGURATIONS: ReadonlyArray<TabScreenConfiguration> = [
  { name: ROUTE_NAME_HOME_TAB, component: HomeScreen, iconName: TAB_ICON_HOME },
  { name: ROUTE_NAME_SEARCH_TAB, component: SearchScreen, iconName: TAB_ICON_SEARCH },
  { name: ROUTE_NAME_LIBRARY_TAB, component: LibraryScreen, iconName: TAB_ICON_LIBRARY },
  { name: ROUTE_NAME_PROFILE_TAB, component: ProfileScreen, iconName: TAB_ICON_PROFILE },
];

/**
 * Tab bar color configuration
 */
const TAB_BAR_COLORS = {
  background: '#1a1a2e',
  borderTop: '#333',
  activeTab: '#e94560',
  inactiveTab: '#888',
} as const;

/**
 * Main Tab Navigator Component
 *
 * Bottom navigation with Home, Search, Library, and Profile tabs.
 */
export function MainTabNavigator(): React.JSX.Element {
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: mainTabNavigatorStyles.tabBarContainer,
        tabBarActiveTintColor: TAB_BAR_COLORS.activeTab,
        tabBarInactiveTintColor: TAB_BAR_COLORS.inactiveTab,
        tabBarLabelStyle: mainTabNavigatorStyles.tabBarLabel,
        tabBarIcon: ({ color }) => {
          const tabConfig = TAB_SCREEN_CONFIGURATIONS.find(
            (config) => config.name === route.name
          );
          return (
            <MaterialCommunityIcons
              name={tabConfig?.iconName as keyof typeof MaterialCommunityIcons.glyphMap}
              size={24}
              color={color}
            />
          );
        },
      })}
    >
      {TAB_SCREEN_CONFIGURATIONS.map((tabConfig) => (
        <MainTab.Screen
          key={tabConfig.name}
          name={tabConfig.name}
          component={tabConfig.component as React.ComponentType<object>}
        />
      ))}
    </MainTab.Navigator>
  );
}

const mainTabNavigatorStyles = StyleSheet.create({
  tabBarContainer: {
    backgroundColor: TAB_BAR_COLORS.background,
    borderTopWidth: 1,
    borderTopColor: TAB_BAR_COLORS.borderTop,
    height: TAB_BAR_HEIGHT_PX,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default MainTabNavigator;
