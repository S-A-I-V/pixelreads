import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { homeColors, spacing, radius, elevation } from '../../theme';

const BG_IMAGE = require('../../../assets/images/categories/bg.png');

export function HeroBanner({ onPress }) {
  const content = (
    <Image source={BG_IMAGE} style={styles.image} resizeMode="cover" />
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={styles.container}
        onPress={onPress}
        activeOpacity={0.9}
        accessibilityLabel="Featured banner"
        accessibilityRole="button"
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.container}>{content}</View>;
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...elevation.lg,
  },
  image: {
    width: '100%',
    height: 160,
    borderRadius: radius.xl,
  },
});

export default HeroBanner;
