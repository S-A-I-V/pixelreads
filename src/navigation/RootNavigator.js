import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import useAuthStore from '../store/authStore';
import TabNavigator from './TabNavigator';
import LoginScreen from '../screens/LoginScreen';
import BookDetailScreen from '../screens/BookDetailScreen';
import ReaderScreen from '../screens/ReaderScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: '#e94560',
          background: '#1a1a2e',
          card: '#2a2a4e',
          text: '#ffffff',
          border: '#333',
          notification: '#e94560',
        },
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Tabs" component={TabNavigator} />
            <Stack.Screen name="BookDetail" component={BookDetailScreen} />
            <Stack.Screen
              name="Reader"
              component={ReaderScreen}
              options={{ animation: 'fade' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
