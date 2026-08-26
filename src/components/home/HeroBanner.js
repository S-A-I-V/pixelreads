import React from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { homeColors, spacing, borderWidth, fonts, textSizes } from '../../theme';
import { NeuShadow } from '../ui/NeuShadow';

const BG_IMAGE = require('../../../assets/images/categories/bg.png');

export function HeroBanner({ onPress }) {
  const content = (
    <View style={styles.windowContent}>
      <Image source={BG_IMAGE} style={styles.image} resizeMode="cover" />
    </View>
  );

  const windowChrome = (
    <>
      <View style={styles.windowTitleBar}>
        <Text style={styles.windowTitle}>featured_picks.bmp</Text>
        <View style={styles.windowButtons}>
          <View style={styles.windowBtn}>
            <Text style={styles.windowBtnText}>_</Text>
          </View>
          <View style={styles.windowBtn}>
            <Text style={styles.windowBtnText}>x</Text>
          </View>
        </View>
      </View>
      {content}
    </>
  );

  if (onPress) {
    return (
      <NeuShadow offset={4} style={styles.outerWrap}>
        <TouchableOpacity
          style={styles.container}
          onPress={onPress}
          activeOpacity={0.9}
          accessibilityLabel="Featured banner"
          accessibilityRole="button"
        >
          {windowChrome}
        </TouchableOpacity>
      </NeuShadow>
    );
  }

  return (
    <NeuShadow offset={4} style={styles.outerWrap}>
      <View style={styles.container}>
        {windowChrome}
      </View>
    </NeuShadow>
  );
}

const styles = StyleSheet.create({
  outerWrap: {
    marginHorizontal: spacing.lg,
  },
  container: {
    borderWidth: borderWidth.pixel,
    borderColor: homeColors.border,
    backgroundColor: homeColors.bgCard,
  },
  windowTitleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: homeColors.bgCard,
    borderBottomWidth: borderWidth.normal,
    borderBottomColor: homeColors.border,
  },
  windowTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: textSizes.xs,
    color: homeColors.textDark,
  },
  windowButtons: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  windowBtn: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: borderWidth.normal,
    borderColor: homeColors.border,
    backgroundColor: homeColors.error,
  },
  windowBtnText: {
    fontFamily: fonts.body,
    fontSize: textSizes.xs,
    color: '#FFFFFF',
    lineHeight: 14,
    fontWeight: '700',
  },
  windowContent: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 160,
  },
});

export default HeroBanner;
