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

import { useAuthUserSessionStore } from '../features/auth/store/authUserSessionStore';
import { MainTabNavigator } from './TabNavigator';
import { AuthLoginScreen } from '../features/auth/screens/AuthLoginScreen';
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
 * React Navigation v7 requires a `fonts` property in the theme.
 */
const navigationThemeConfiguration = {
  dark: false,
  colors: {
    primary: '#FF9F1C',
    background: '#00A896',
    card: '#00A896',
    text: '#000000',
    border: 'transparent',
    notification: '#F15BB5',
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' as const },
    medium: { fontFamily: 'System', fontWeight: '500' as const },
    bold: { fontFamily: 'System', fontWeight: '700' as const },
    heavy: { fontFamily: 'System', fontWeight: '800' as const },
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
          contentStyle: { backgroundColor: '#00A896' },
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
              options={{ contentStyle: { backgroundColor: '#00A896' } }}
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
