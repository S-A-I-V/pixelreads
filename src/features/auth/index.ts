/**
 * =========================================================================
 *  Auth Feature Module
 * =========================================================================
 *
 *  Central export for all authentication-related components, hooks,
 *  stores, and utilities.
 *
 *  Usage:
 *  ```ts
 *  import {
 *    AuthLoginScreen,
 *    useAuthUserSessionStore,
 *    useAuthLoginFormState,
 *  } from '@features/auth';
 *  ```
 *
 * =========================================================================
 */

// ─── Screens ────────────────────────────────────────────────────────────────
export { AuthLoginScreen } from './screens/AuthLoginScreen';

// ─── Hooks ──────────────────────────────────────────────────────────────────
export { useAuthLoginFormState } from './hooks/useAuthLoginFormState';

// ─── Store ──────────────────────────────────────────────────────────────────
export {
  useAuthUserSessionStore,
  selectAuthUserDisplayName,
  selectIsUserAuthenticated,
  selectAuthUserEmail,
} from './store/authUserSessionStore';

// ─── Constants ──────────────────────────────────────────────────────────────
export * from './constants/authFeatureConstants';
