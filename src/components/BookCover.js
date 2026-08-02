import React, { useState } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { colors, fonts, textSizes, spacing, borderWidth } from '../theme';

/**
 * Book cover image with pixel border and fallback.
 *
 * Props:
 *   uri       string   image URL
 *   title     string   used for fallback text
 *   width     number   (default 80)
 *   style     ViewStyle override
 */
export default function BookCover({ uri, title, width = 80, style }) {
  const [hasError, setHasError] = useState(false);
  const height = Math.round(width * 1.5);

  if (!uri || hasError) {
    return (
      <View style={[styles.placeholder, { width, height }, style]}>
        <Text style={styles.placeholderIcon}>📚</Text>
        <Text style={styles.placeholderText} numberOfLines={3}>
          {title?.slice(0, 24) || 'No Cover'}
        </Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={[styles.image, { width, height }, style]}
      onError={() => setHasError(true)}
      resizeMode="cover"
    />
  );
}

const styles = StyleSheet.create({
  image: {
    borderWidth: borderWidth.normal,
    borderColor: colors.pinkHot,
  },
  placeholder: {
    backgroundColor: colors.bgPanel,
    borderWidth: borderWidth.normal,
    borderColor: colors.pinkHot,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.xs,
  },
  placeholderIcon: {
    fontSize: 24,
  },
  placeholderText: {
    fontFamily: fonts.pixel,
    fontSize: textSizes.xxs,
    color: colors.textDim,
    textAlign: 'center',
  },
});
