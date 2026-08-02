/**
 * =========================================================================
 *  Navigation Types
 * =========================================================================
 *
 *  TypeScript types for React Navigation type-safe navigation.
 *
 * =========================================================================
 */

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { GoogleBooksNormalizedBookData, UserLibraryBookEntry, BookShelfKey } from './bookTypes';

/**
 * Root stack navigator param list
 */
export type RootStackNavigatorParamList = {
  /** Login screen - no params */
  Login: undefined;
  
  /** Main tabs navigator */
  Tabs: NavigatorScreenParams<MainTabNavigatorParamList>;
  
  /** Book detail screen */
  BookDetail: {
    /** Book data to display */
    book: GoogleBooksNormalizedBookData | UserLibraryBookEntry;
  };
  
  /** EPUB reader screen */
  Reader: {
    /** Book ID for retrieving stored file */
    bookId: string;
  };
};

/**
 * Main tab navigator param list
 */
export type MainTabNavigatorParamList = {
  /** Home tab - no params */
  Home: undefined;
  
  /** Search tab - optional initial query */
  Search: {
    /** Pre-filled search query */
    initialQuery?: string;
  } | undefined;
  
  /** Library tab - optional initial shelf filter */
  Library: {
    /** Initial shelf to display */
    shelf?: BookShelfKey;
  } | undefined;
  
  /** Profile tab - no params */
  Profile: undefined;
};

/**
 * Screen props for root stack screens
 */
export type RootStackScreenProps<T extends keyof RootStackNavigatorParamList> = 
  NativeStackScreenProps<RootStackNavigatorParamList, T>;

/**
 * Screen props for tab screens with access to parent stack
 */
export type MainTabScreenProps<T extends keyof MainTabNavigatorParamList> = 
  CompositeScreenProps<
    BottomTabScreenProps<MainTabNavigatorParamList, T>,
    NativeStackScreenProps<RootStackNavigatorParamList>
  >;

/**
 * Navigation prop type for hooks
 */
export type AppNavigationProp = RootStackScreenProps<keyof RootStackNavigatorParamList>['navigation'];

/**
 * Tab configuration for navigator setup
 */
export interface TabNavigatorScreenConfiguration {
  /** Route name */
  readonly name: keyof MainTabNavigatorParamList;
  
  /** Screen component */
  readonly component: React.ComponentType<unknown>;
  
  /** MaterialCommunityIcons icon name */
  readonly iconName: string;
}
