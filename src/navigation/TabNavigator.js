import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen    from '../screens/HomeScreen';
import SearchScreen  from '../screens/SearchScreen';
import LibraryScreen from '../screens/LibraryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { colors, fonts, textSizes, spacing, borderWidth } from '../theme';

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Home',    component: HomeScreen,    icon: '🏠' },
  { name: 'Search',  component: SearchScreen,  icon: '🔍' },
  { name: 'Library', component: LibraryScreen, icon: '📚' },
  { name: 'Profile', component: ProfileScreen, icon: '👾' },
];

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor:   colors.pinkHot,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused }) => {
          const tab = TABS.find((t) => t.name === route.name);
          return (
            <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>
              {tab?.icon}
            </Text>
          );
        },
      })}
    >
      {TABS.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
        />
      ))}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.bgMid,
    borderTopWidth: borderWidth.thick,
    borderTopColor: colors.pinkHot,
    height: 64,
    paddingBottom: spacing.xs,
    paddingTop: spacing.xs,
  },
  tabLabel: {
    fontFamily: fonts.pixel,
    fontSize: textSizes.xxs - 1,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tabIcon: {
    fontSize: 20,
    opacity: 0.5,
  },
  tabIconActive: {
    opacity: 1,
  },
});
