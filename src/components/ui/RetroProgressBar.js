import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { homeColors, spacing, textSizes, fonts } from '../../theme';

export function RetroProgressBar({
  progress = 0,
  height = 20,
  showLabel = true,
  labelSuffix = '%',
  fillColor = '#FBCA1F',
  trackColor = homeColors.bgElevated,
  style,
}) {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <View style={[styles.track, { height, backgroundColor: trackColor }, style]}>
      <View style={[styles.fill, { width: `${clamped}%`, backgroundColor: fillColor }]} />
      {showLabel && (
        <Text style={styles.label}>{clamped}{labelSuffix}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000',
    borderRightWidth: 3,
    borderBottomWidth: 3,
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  label: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: textSizes.xxs,
    color: '#000000',
    zIndex: 1,
  },
});
