import React, { useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';

import { useAuthLoginFormState } from '../hooks/useAuthLoginFormState';
import {
  AUTH_SCREEN_TITLE_APP_NAME,
  AUTH_SCREEN_TAGLINE,
} from '../constants/authFeatureConstants';

const analytics = require('../../../utils/analytics');

const BG_IMAGE = require('../../../../assets/images/categories/app-bg.png');

export function AuthLoginScreen(): React.JSX.Element {
  const {
    emailInputValue,
    setEmailInputValue,
    passwordInputValue,
    setPasswordInputValue,
    formErrorMessage,
    isSignUpMode,
    isLoading,
    handleLoginFormSubmit,
    toggleMode,
  } = useAuthLoginFormState();

  useEffect(() => {
    analytics.trackScreenView('Login');
  }, []);

  return (
    <ImageBackground source={BG_IMAGE} style={styles.bgImage} resizeMode="cover">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.screen}
      >
        <View style={styles.contentWrapper}>
          {/* Logo window */}
          <View style={styles.logoWindow}>
            <View style={styles.logoTitleBar}>
              <Text style={styles.logoTitleBarText}>pixelreads.exe</Text>
              <View style={styles.titleBarBtns}>
                <View style={styles.titleBtn}><Text style={styles.titleBtnText}>_</Text></View>
                <View style={[styles.titleBtn, styles.closeBtn]}><Text style={styles.titleBtnText}>x</Text></View>
              </View>
            </View>
            <View style={styles.logoContent}>
              <Text style={styles.appName}>{AUTH_SCREEN_TITLE_APP_NAME}</Text>
              <Text style={styles.tagline}>{AUTH_SCREEN_TAGLINE}</Text>
            </View>
          </View>

          {/* Login form window */}
          <View style={styles.formWindow}>
            <View style={styles.formTitleBar}>
              <Text style={styles.formTitleBarText}>{isSignUpMode ? 'signup.exe' : 'login.exe'}</Text>
            </View>
            <View style={styles.formContent}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.emailInput}
                value={emailInputValue}
                onChangeText={setEmailInputValue}
                placeholder="you@example.com"
                placeholderTextColor="#999999"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                accessibilityLabel="Email"
              />

              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.emailInput}
                value={passwordInputValue}
                onChangeText={setPasswordInputValue}
                placeholder="min 6 characters"
                placeholderTextColor="#999999"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="go"
                onSubmitEditing={handleLoginFormSubmit}
                accessibilityLabel="Password"
              />

              {formErrorMessage ? (
                <Text style={styles.errorText}>{formErrorMessage}</Text>
              ) : null}

              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleLoginFormSubmit}
                activeOpacity={0.8}
                disabled={isLoading}
                accessibilityRole="button"
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#000000" />
                ) : (
                  <Text style={styles.loginButtonText}>
                    {isSignUpMode ? 'Sign Up' : 'Login'}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={toggleMode} style={styles.toggleBtn}>
                <Text style={styles.toggleText}>
                  {isSignUpMode ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  bgImage: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  logoWindow: {
    borderWidth: 3,
    borderColor: '#000000',
    backgroundColor: 'transparent',
    borderRightWidth: 6,
    borderBottomWidth: 6,
  },
  logoTitleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
    backgroundColor: 'rgba(200, 182, 255, 0.4)',
  },
  logoTitleBarText: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: '#000000',
  },
  titleBarBtns: {
    flexDirection: 'row',
    gap: 3,
  },
  titleBtn: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
  },
  closeBtn: {
    backgroundColor: '#EF4444',
  },
  titleBtnText: {
    fontFamily: 'SpaceMono',
    fontSize: 8,
    color: '#000000',
    lineHeight: 10,
  },
  logoContent: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    gap: 6,
  },
  appName: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 22,
    color: '#000000',
  },
  tagline: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: '#4A4A4A',
  },
  formWindow: {
    borderWidth: 3,
    borderColor: '#000000',
    backgroundColor: 'transparent',
    borderRightWidth: 6,
    borderBottomWidth: 6,
  },
  formTitleBar: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
    backgroundColor: 'rgba(200, 182, 255, 0.4)',
  },
  formTitleBarText: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: '#000000',
  },
  formContent: {
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    gap: 10,
  },
  inputLabel: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 11,
    color: '#000000',
  },
  emailInput: {
    fontFamily: 'SpaceMono',
    fontSize: 13,
    color: '#000000',
    borderWidth: 2,
    borderColor: '#000000',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    minHeight: 40,
  },
  errorText: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: '#EF4444',
  },
  loginButton: {
    backgroundColor: '#FBCA1F',
    borderWidth: 3,
    borderColor: '#000000',
    borderRightWidth: 6,
    borderBottomWidth: 6,
    paddingVertical: 12,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
    marginTop: 4,
  },
  loginButtonText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 16,
    color: '#000000',
  },
  toggleBtn: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 2,
    borderColor: '#000000',
    alignSelf: 'center',
    marginTop: 4,
  },
  toggleText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 11,
    color: '#000000',
  },
  footer: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: '#4A4A4A',
    textAlign: 'center',
    marginTop: 4,
  },
});

export default AuthLoginScreen;
