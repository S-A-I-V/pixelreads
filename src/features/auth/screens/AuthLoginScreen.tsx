/**
 * =========================================================================
 *  Auth Login Screen
 * =========================================================================
 *
 *  Login screen for user authentication with email input.
 *  Features 8-bit retro pixel art styling consistent with app theme.
 *
 * =========================================================================
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuthLoginFormState } from '../hooks/useAuthLoginFormState';
import {
  AUTH_SCREEN_TITLE_APP_NAME,
  AUTH_SCREEN_TAGLINE,
  AUTH_INPUT_LABEL_EMAIL,
  AUTH_INPUT_PLACEHOLDER_EMAIL,
  AUTH_BUTTON_LABEL_LOGIN,
} from '../constants/authFeatureConstants';
import { colors } from '../../../theme';
import {
  TOUCH_TARGET_MIN_SIZE_IOS_PT,
  BODY_TEXT_MIN_SIZE_PX,
} from '../../../constants/uiConstants';

// Analytics (will be converted to TypeScript)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const analytics = require('../../../utils/analytics');

/**
 * Auth Login Screen Component
 *
 * Displays the login form with email input and submit button.
 * Uses pixel art styling consistent with the PixelReads 8-bit theme.
 */
export function AuthLoginScreen(): React.JSX.Element {
  const safeAreaInsets = useSafeAreaInsets();

  // ─── Form State Hook ──────────────────────────────────────────────────
  const {
    emailInputValue,
    setEmailInputValue,
    formErrorMessage,
    handleLoginFormSubmit,
  } = useAuthLoginFormState();

  // ─── Track Screen View ────────────────────────────────────────────────
  useEffect(() => {
    analytics.trackScreenView('Login');
    console.log('[AuthLoginScreen] Screen viewed');
  }, []);

  // ─── Render ───────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[
        authLoginScreenStyles.screenContainer,
        {
          paddingTop: safeAreaInsets.top,
          paddingBottom: safeAreaInsets.bottom,
        },
      ]}
    >
      <View style={authLoginScreenStyles.contentWrapper}>
        {/* App Logo & Tagline */}
        <Text style={authLoginScreenStyles.appLogoText}>
          {AUTH_SCREEN_TITLE_APP_NAME}
        </Text>
        <Text style={authLoginScreenStyles.appTaglineText}>
          {AUTH_SCREEN_TAGLINE}
        </Text>

        {/* Login Form */}
        <View style={authLoginScreenStyles.formContainer}>
          <Text style={authLoginScreenStyles.inputLabelText}>
            {AUTH_INPUT_LABEL_EMAIL}
          </Text>

          <TextInput
            style={authLoginScreenStyles.emailTextInput}
            value={emailInputValue}
            onChangeText={setEmailInputValue}
            placeholder={AUTH_INPUT_PLACEHOLDER_EMAIL}
            placeholderTextColor={authLoginScreenColors.placeholderText}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="go"
            onSubmitEditing={handleLoginFormSubmit}
            accessibilityLabel={AUTH_INPUT_LABEL_EMAIL}
            accessibilityHint="Enter your email address to login"
          />

          {/* Error Message */}
          {formErrorMessage ? (
            <Text style={authLoginScreenStyles.errorMessageText}>
              {formErrorMessage}
            </Text>
          ) : null}

          {/* Submit Button */}
          <TouchableOpacity
            style={authLoginScreenStyles.loginSubmitButton}
            onPress={handleLoginFormSubmit}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={AUTH_BUTTON_LABEL_LOGIN}
          >
            <Text style={authLoginScreenStyles.loginSubmitButtonText}>
              {AUTH_BUTTON_LABEL_LOGIN}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Color Constants (extracted for readability) ────────────────────────────
const authLoginScreenColors = {
  background: '#1a1a2e',
  cardBackground: '#2a2a4e',
  inputBorder: '#444',
  primaryAccent: '#e94560',
  textPrimary: '#fff',
  textSecondary: '#888',
  textMuted: '#ccc',
  placeholderText: '#888',
  errorText: '#ff6b6b',
} as const;

// ─── Styles ─────────────────────────────────────────────────────────────────
const authLoginScreenStyles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: authLoginScreenColors.background,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  appLogoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: authLoginScreenColors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  appTaglineText: {
    fontSize: BODY_TEXT_MIN_SIZE_PX,
    color: authLoginScreenColors.textSecondary,
    textAlign: 'center',
    marginBottom: 48,
  },
  formContainer: {
    gap: 16,
  },
  inputLabelText: {
    fontSize: 14,
    color: authLoginScreenColors.textMuted,
    marginBottom: 4,
  },
  emailTextInput: {
    backgroundColor: authLoginScreenColors.cardBackground,
    borderWidth: 1,
    borderColor: authLoginScreenColors.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: BODY_TEXT_MIN_SIZE_PX,
    color: authLoginScreenColors.textPrimary,
    minHeight: TOUCH_TARGET_MIN_SIZE_IOS_PT,
  },
  errorMessageText: {
    color: authLoginScreenColors.errorText,
    fontSize: 14,
  },
  loginSubmitButton: {
    backgroundColor: authLoginScreenColors.primaryAccent,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    minHeight: TOUCH_TARGET_MIN_SIZE_IOS_PT,
  },
  loginSubmitButtonText: {
    color: authLoginScreenColors.textPrimary,
    fontSize: BODY_TEXT_MIN_SIZE_PX,
    fontWeight: '600',
  },
});

export default AuthLoginScreen;
