import { useState } from 'react';
import { useAuthUserSessionStore } from '../store/authUserSessionStore';
import { AUTH_EMAIL_VALIDATION_PATTERN } from '../constants/authFeatureConstants';

export function useAuthLoginFormState() {
  const [emailInputValue, setEmailInputValue] = useState('');
  const [passwordInputValue, setPasswordInputValue] = useState('');
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  const login = useAuthUserSessionStore((s) => s.login);
  const signUp = useAuthUserSessionStore((s) => s.signUp);
  const isLoading = useAuthUserSessionStore((s) => s.isLoading);
  const storeError = useAuthUserSessionStore((s) => s.error);
  const clearError = useAuthUserSessionStore((s) => s.clearError);

  const handleLoginFormSubmit = async () => {
    setFormErrorMessage(null);
    clearError();

    const email = emailInputValue.trim();
    if (!AUTH_EMAIL_VALIDATION_PATTERN.test(email)) {
      setFormErrorMessage('Please enter a valid email');
      return;
    }

    if (passwordInputValue.length < 6) {
      setFormErrorMessage('Password must be at least 6 characters');
      return;
    }

    if (isSignUpMode) {
      const result = await signUp(email, passwordInputValue);
      if (!result.success) {
        setFormErrorMessage(result.message);
      }
    } else {
      const success = await login(email, passwordInputValue);
      if (!success) {
        // Read error from store after the async call completes
        const currentError = useAuthUserSessionStore.getState().error;
        setFormErrorMessage(currentError || 'Invalid email or password');
      }
    }
  };

  const toggleMode = () => {
    setIsSignUpMode(!isSignUpMode);
    setFormErrorMessage(null);
    clearError();
  };

  return {
    emailInputValue,
    setEmailInputValue,
    passwordInputValue,
    setPasswordInputValue,
    formErrorMessage,
    isSignUpMode,
    isLoading,
    handleLoginFormSubmit,
    toggleMode,
  };
}
