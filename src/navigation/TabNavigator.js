import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import LibraryScreen from '../screens/LibraryScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Home', component: HomeScreen, icon: 'home' },
  { name: 'Search', component: SearchScreen, icon: 'magnify' },
  { name: 'Library', component: LibraryScreen, icon: 'bookshelf' },
  { name: 'Profile', component: ProfileScreen, icon: 'account' },
];

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#e94560',
        tabBarInactiveTintColor: '#888',
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ color }) => {
          const tab = TABS.find((t) => t.name === route.name);
          return <MaterialCommunityIcons name={tab?.icon} size={24} color={color} />;
        },
      })}
    >
      {TABS.map((tab) => (
        <Tab.Screen key={tab.name} name={tab.name} component={tab.component} />
      ))}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#1a1a2e',
    borderTopWidth: 1,
    borderTopColor: '#333',
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});
