/**
 * =========================================================================
 *  Root Navigator
 * =========================================================================
 *
 *  Main navigation container with authentication flow.
 *  Uses the new feature module architecture.
 *
 * =========================================================================
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuthUserSessionStore } from '../features/auth';
import { MainTabNavigator } from './TabNavigator';
import { AuthLoginScreen } from '../features/auth';
import BookDetailScreen from '../screens/BookDetailScreen';
import ReaderScreen from '../screens/ReaderScreen';
import {
  ROUTE_NAME_LOGIN_SCREEN,
  ROUTE_NAME_TABS_NAVIGATOR,
  ROUTE_NAME_BOOK_DETAIL_SCREEN,
  ROUTE_NAME_READER_SCREEN,
  SCREEN_TRANSITION_DEFAULT,
  SCREEN_TRANSITION_READER,
} from '../constants/navigationConstants';
import type { RootStackNavigatorParamList } from '../shared/types/navigationTypes';

const RootStack = createNativeStackNavigator<RootStackNavigatorParamList>();

/**
 * Navigation theme configuration
 */
const navigationThemeConfiguration = {
  dark: true,
  colors: {
    primary: '#e94560',
    background: '#1a1a2e',
    card: '#2a2a4e',
    text: '#ffffff',
    border: '#333',
    notification: '#e94560',
  },
};

/**
 * Root Navigator Component
 *
 * Handles top-level navigation including authentication flow
 * and modal screens (BookDetail, Reader).
 */
export function RootNavigator(): React.JSX.Element {
  const isUserAuthenticated = useAuthUserSessionStore(
    (state) => state.isAuthenticated
  );

  return (
    <NavigationContainer theme={navigationThemeConfiguration}>
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
          animation: SCREEN_TRANSITION_DEFAULT,
        }}
      >
        {!isUserAuthenticated ? (
          <RootStack.Screen
            name={ROUTE_NAME_LOGIN_SCREEN}
            component={AuthLoginScreen}
          />
        ) : (
          <>
            <RootStack.Screen
              name={ROUTE_NAME_TABS_NAVIGATOR}
              component={MainTabNavigator}
            />
            <RootStack.Screen
              name={ROUTE_NAME_BOOK_DETAIL_SCREEN}
              component={BookDetailScreen}
            />
            <RootStack.Screen
              name={ROUTE_NAME_READER_SCREEN}
              component={ReaderScreen}
              options={{ animation: SCREEN_TRANSITION_READER }}
            />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

export default RootNavigator;
