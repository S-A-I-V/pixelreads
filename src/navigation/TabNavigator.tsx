import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import LibraryScreen from '../screens/LibraryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { FloatingTabBar } from '../components/home';
import {
  ROUTE_NAME_HOME_TAB,
  ROUTE_NAME_SEARCH_TAB,
  ROUTE_NAME_LIBRARY_TAB,
  ROUTE_NAME_PROFILE_TAB,
} from '../constants/navigationConstants';
import type { MainTabNavigatorParamList } from '../shared/types/navigationTypes';

const MainTab = createBottomTabNavigator<MainTabNavigatorParamList>();

interface TabScreenConfiguration {
  readonly name: keyof MainTabNavigatorParamList;
  readonly component: React.ComponentType<unknown>;
}

const TAB_SCREEN_CONFIGURATIONS: ReadonlyArray<TabScreenConfiguration> = [
  { name: ROUTE_NAME_HOME_TAB, component: HomeScreen },
  { name: ROUTE_NAME_SEARCH_TAB, component: SearchScreen },
  { name: ROUTE_NAME_LIBRARY_TAB, component: LibraryScreen },
  { name: ROUTE_NAME_PROFILE_TAB, component: ProfileScreen },
];

export function MainTabNavigator(): React.JSX.Element {
  return (
    <MainTab.Navigator
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false }}
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

export default MainTabNavigator;
