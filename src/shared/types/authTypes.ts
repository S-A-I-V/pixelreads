/**
 * =========================================================================
 *  Authentication Types
 * =========================================================================
 *
 *  Type definitions for authentication state and operations.
 *
 * =========================================================================
 */

/**
 * Authentication state
 */
export interface AuthenticationState {
  /** Whether user is currently authenticated */
  readonly isAuthenticated: boolean;
  
  /** Authenticated user's email (null if not authenticated) */
  readonly userEmail: string | null;
}

/**
 * Authentication store actions
 */
export interface AuthenticationStoreActions {
  /**
   * Attempt to login with email
   * @param email - User email address
   * @returns true if login successful, false otherwise
   */
  login: (email: string) => boolean;
  
  /**
   * Log out current user
   */
  logout: () => void;
}

/**
 * Combined auth store type
 */
export type AuthenticationStore = AuthenticationState & AuthenticationStoreActions;

/**
 * Login form values
 */
export interface LoginFormValues {
  /** Email input value */
  email: string;
}

/**
 * Login form validation errors
 */
export interface LoginFormValidationErrors {
  /** Email field error message */
  email?: string;
}

/**
 * Login result
 */
export interface LoginOperationResult {
  /** Whether login was successful */
  readonly success: boolean;
  
  /** Error message if login failed */
  readonly errorMessage?: string;
}
