/**
 * =========================================================================
 *  PixelReads App Entry Point
 * =========================================================================
 *
 *  Main application component with providers and initialization.
 *  Uses 8-bit retro pixel art theme for book tracking.
 *
 * =========================================================================
 */

import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { StatusBar } from 'expo-status-bar';

import { RootNavigator } from './src/navigation/RootNavigator';
import { colors } from './src/theme';

// Keep splash screen visible while fonts load
SplashScreen.preventAutoHideAsync();

/**
 * Font asset configuration — Y2K / Neubrutalist OS type system
 */
const PIXEL_FONT_ASSETS = {
  PressStart2P: require('./assets/fonts/PressStart2P-Regular.ttf'),
  VT323: require('@expo-google-fonts/vt323/400Regular/VT323_400Regular.ttf'),
  SpaceMono: require('@expo-google-fonts/space-mono/400Regular/SpaceMono_400Regular.ttf'),
  'SpaceMono-Bold': require('@expo-google-fonts/space-mono/700Bold/SpaceMono_700Bold.ttf'),
} as const;

/**
 * Root Application Component
 *
 * Initializes fonts, provides gesture handling context,
 * and renders the main navigation structure.
 */
export default function PixelReadsAppRoot(): React.JSX.Element | null {
  const [areFontsLoaded, setAreFontsLoaded] = useState<boolean>(false);

  useEffect(() => {
    async function loadApplicationFonts(): Promise<void> {
      try {
        await Font.loadAsync(PIXEL_FONT_ASSETS);
      } catch (fontLoadError) {
        // Font load failed — app will fall back to system monospace
        console.warn(
          '[App] Font load failed, using fallback:',
          (fontLoadError as Error).message
        );
      } finally {
        setAreFontsLoaded(true);
        await SplashScreen.hideAsync();
      }
    }
    
    loadApplicationFonts();
  }, []);

  if (!areFontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={appRootStyles.gestureHandlerContainer}>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor={colors.bgDark} />
        <RootNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const appRootStyles = StyleSheet.create({
  gestureHandlerContainer: {
    flex: 1,
    backgroundColor: colors.bgDark,
  },
});
