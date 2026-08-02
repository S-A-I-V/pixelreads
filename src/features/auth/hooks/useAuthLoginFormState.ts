/**
 * =========================================================================
 *  useAuthLoginFormState Hook
 * =========================================================================
 *
 *  Custom hook for managing login form state, validation, and submission.
 *
 * =========================================================================
 */

import { useState, useCallback, useEffect } from 'react';

import { useAuthUserSessionStore } from '../store/authUserSessionStore';
import {
  AUTH_ERROR_MESSAGE_INVALID_EMAIL,
  AUTH_EMAIL_VALIDATION_PATTERN,
} from '../constants/authFeatureConstants';
import type { LoginFormValues, LoginFormValidationErrors } from '../../../shared/types/authTypes';

// Analytics (will be converted to TypeScript)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const analytics = require('../../../utils/analytics');

/**
 * Return type for the login form state hook
 */
interface AuthLoginFormStateHookResult {
  /** Current email input value */
  emailInputValue: string;

  /** Update email input value */
  setEmailInputValue: (value: string) => void;

  /** Current validation/submission error message */
  formErrorMessage: string;

  /** Whether a login attempt is in progress */
  isLoginSubmitting: boolean;

  /** Handler for form submission */
  handleLoginFormSubmit: () => void;

  /** Clear current error message */
  clearFormErrorMessage: () => void;
}

/**
 * Custom hook for managing login form state and submission logic.
 *
 * @example
 * ```tsx
 * function LoginScreen() {
 *   const {
 *     emailInputValue,
 *     setEmailInputValue,
 *     formErrorMessage,
 *     handleLoginFormSubmit,
 *   } = useAuthLoginFormState();
 *
 *   return (
 *     <TextInput
 *       value={emailInputValue}
 *       onChangeText={setEmailInputValue}
 *       onSubmitEditing={handleLoginFormSubmit}
 *     />
 *   );
 * }
 * ```
 */
export function useAuthLoginFormState(): AuthLoginFormStateHookResult {
  // ─── Local State ──────────────────────────────────────────────────────
  const [emailInputValue, setEmailInputValue] = useState<string>('');
  const [formErrorMessage, setFormErrorMessage] = useState<string>('');
  const [isLoginSubmitting, setIsLoginSubmitting] = useState<boolean>(false);

  // ─── Store Actions ────────────────────────────────────────────────────
  const loginUserWithEmail = useAuthUserSessionStore((state) => state.login);

  // ─── Handlers ─────────────────────────────────────────────────────────
  /**
   * Validate email format
   */
  const validateEmailInput = useCallback((email: string): boolean => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      return false;
    }
    return AUTH_EMAIL_VALIDATION_PATTERN.test(trimmedEmail);
  }, []);

  /**
   * Handle login form submission
   */
  const handleLoginFormSubmit = useCallback((): void => {
    // Clear previous errors
    setFormErrorMessage('');

    console.log(`[LoginForm] Attempting login with: ${emailInputValue}`);

    // Validate email format
    if (!validateEmailInput(emailInputValue)) {
      setFormErrorMessage(AUTH_ERROR_MESSAGE_INVALID_EMAIL);
      analytics.trackError(
        analytics.EventType.ERROR_API,
        'Login validation failed - invalid email format',
        { email: emailInputValue }
      );
      console.log(`[LoginForm] Validation failed - invalid email: ${emailInputValue}`);
      return;
    }

    setIsLoginSubmitting(true);

    // Attempt authentication
    const loginWasSuccessful = loginUserWithEmail(emailInputValue);

    setIsLoginSubmitting(false);

    if (!loginWasSuccessful) {
      setFormErrorMessage(AUTH_ERROR_MESSAGE_INVALID_EMAIL);
      analytics.trackError(
        analytics.EventType.ERROR_API,
        'Login failed - unauthorized email',
        { email: emailInputValue }
      );
      console.log(`[LoginForm] Login failed - unauthorized: ${emailInputValue}`);
    }
    // Note: Successful login will trigger navigation via auth state change
  }, [emailInputValue, loginUserWithEmail, validateEmailInput]);

  /**
   * Clear the current error message
   */
  const clearFormErrorMessage = useCallback((): void => {
    setFormErrorMessage('');
  }, []);

  return {
    emailInputValue,
    setEmailInputValue,
    formErrorMessage,
    isLoginSubmitting,
    handleLoginFormSubmit,
    clearFormErrorMessage,
  };
}

export default useAuthLoginFormState;
