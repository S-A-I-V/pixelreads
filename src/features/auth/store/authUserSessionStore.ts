/**
 * =========================================================================
 *  Auth User Session Store
 * =========================================================================
 *
 *  Zustand store for managing user authentication state.
 *  Uses persist middleware to maintain session across app restarts.
 *
 * =========================================================================
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEY_AUTH_STATE } from '../../../constants/storageConstants';
import { AUTH_ALLOWED_USER_EMAILS } from '../constants/authFeatureConstants';
import type { AuthenticationState, AuthenticationStoreActions } from '../../../shared/types/authTypes';

// Import analytics functions (will be converted to TypeScript later)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const analytics = require('../../../utils/analytics');

/**
 * Combined store type
 */
type AuthUserSessionStoreType = AuthenticationState & AuthenticationStoreActions;

/**
 * Authentication store for user session management
 *
 * @example
 * ```tsx
 * // Check auth status
 * const isAuthenticated = useAuthUserSessionStore((state) => state.isAuthenticated);
 *
 * // Login action
 * const loginUserWithEmail = useAuthUserSessionStore((state) => state.login);
 * const wasSuccessful = loginUserWithEmail('user@example.com');
 *
 * // Logout action
 * const logoutCurrentUser = useAuthUserSessionStore((state) => state.logout);
 * logoutCurrentUser();
 * ```
 */
export const useAuthUserSessionStore = create<AuthUserSessionStoreType>()(
  persist(
    (set): AuthUserSessionStoreType => ({
      // ─── State ────────────────────────────────────────────────────────
      isAuthenticated: false,
      userEmail: null,

      // ─── Actions ──────────────────────────────────────────────────────
      /**
       * Attempt to authenticate user with email.
       * Currently uses a whitelist approach for demo purposes.
       *
       * @param emailInput - User-provided email address
       * @returns true if authentication succeeded, false otherwise
       */
      login(emailInput: string): boolean {
        const normalizedEmail = emailInput.trim().toLowerCase();

        if (AUTH_ALLOWED_USER_EMAILS.includes(normalizedEmail)) {
          set({
            isAuthenticated: true,
            userEmail: normalizedEmail,
          });

          analytics.trackLogin('email');
          console.log(`[AuthStore] Login successful: ${normalizedEmail}`);
          return true;
        }

        console.log(`[AuthStore] Login failed: ${normalizedEmail} (not in allowlist)`);
        return false;
      },

      /**
       * End the current user session.
       */
      logout(): void {
        set({
          isAuthenticated: false,
          userEmail: null,
        });

        analytics.trackLogout();
        console.log('[AuthStore] User logged out');
      },
    }),
    {
      name: STORAGE_KEY_AUTH_STATE,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

/**
 * Selector: Get current user's display name (username from email)
 */
export function selectAuthUserDisplayName(state: AuthUserSessionStoreType): string {
  if (!state.userEmail) return 'Reader';
  return state.userEmail.split('@')[0] || 'Reader';
}

/**
 * Selector: Check if user is authenticated
 */
export function selectIsUserAuthenticated(state: AuthUserSessionStoreType): boolean {
  return state.isAuthenticated;
}

/**
 * Selector: Get user email
 */
export function selectAuthUserEmail(state: AuthUserSessionStoreType): string | null {
  return state.userEmail;
}

// Re-export as default for backward compatibility
export default useAuthUserSessionStore;
