import React, { useState } from 'react';
import { TextInput, View, Text, StyleSheet } from 'react-native';
import { colors, fonts, textSizes, spacing, borderWidth } from '../theme';

/**
 * Pixel-art text input.
 *
 * Props:
 *   value, onChangeText, placeholder
 *   label       string  – optional label above input
 *   secureText  bool
 *   keyboardType
 *   onSubmitEditing
 *   style       ViewStyle for wrapper
 *   inputStyle  TextStyle override
 *   autoCapitalize
 */
export default function PixelInput({
  value,
  onChangeText,
  placeholder,
  label,
  secureText = false,
  keyboardType = 'default',
  onSubmitEditing,
  style,
  inputStyle,
  autoCapitalize = 'none',
  autoCorrect = false,
  returnKeyType = 'done',
}) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[
          styles.input,
          focused && styles.inputFocused,
          inputStyle,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        secureTextEntry={secureText}
        keyboardType={keyboardType}
        onSubmitEditing={onSubmitEditing}
        returnKeyType={returnKeyType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  label: {
    fontFamily: fonts.pixel,
    fontSize: textSizes.xxs,
    color: colors.textDim,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  input: {
    fontFamily: fonts.pixel,
    fontSize: textSizes.xs,
    color: colors.textMain,
    backgroundColor: colors.bgMid,
    borderWidth: borderWidth.thick,
    borderColor: colors.pinkHot,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    width: '100%',
  },
  inputFocused: {
    borderColor: colors.pinkNeon,
    shadowColor: colors.pinkPale,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
});
