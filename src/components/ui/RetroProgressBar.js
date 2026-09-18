import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { homeColors, textSizes } from '../../theme';

/**
 * Interpolate between yellow (#FBCA1F) and green (#10B981) based on progress.
 */
function getGradientColor(pct) {
  const t = Math.min(100, Math.max(0, pct)) / 100;
  const r = Math.round(251 + (16 - 251) * t);
  const g = Math.round(202 + (185 - 202) * t);
  const b = Math.round(31 + (129 - 31) * t);
  return `rgb(${r},${g},${b})`;
}

export function RetroProgressBar({
  progress = 0,
  height = 20,
  showLabel = true,
  labelSuffix = '%',
  fillColor,
  gradient = false,
  trackColor = homeColors.bgElevated,
  style,
}) {
  const clamped = Math.min(100, Math.max(0, progress));
  const resolvedFill = gradient ? getGradientColor(clamped) : (fillColor || '#FBCA1F');

  return (
    <View style={[styles.track, { height, backgroundColor: trackColor }, style]}>
      <View style={[styles.fill, { width: `${clamped}%`, backgroundColor: resolvedFill }]} />
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
