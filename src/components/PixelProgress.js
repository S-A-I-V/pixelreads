import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, textSizes, spacing, borderWidth } from '../theme';

/**
 * Pixel-art progress bar.
 *
 * Props:
 *   value   number  0-100
 *   label   string  optional label above bar
 *   showPct bool    show percentage text (default true)
 *   height  number  bar height (default 12)
 *   color   string  fill color (default pinkHot)
 */
export default function PixelProgress({
  value = 0,
  label,
  showPct = true,
  height = 12,
  color = colors.pinkHot,
}) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <View style={styles.wrapper}>
      {(label || showPct) && (
        <View style={styles.headerRow}>
          {label ? <Text style={styles.label}>{label}</Text> : <View />}
          {showPct && (
            <Text style={[styles.pct, { color }]}>{clamped}%</Text>
          )}
        </View>
      )}
      <View style={[styles.track, { height, borderColor: color }]}>
        <View
          style={[
            styles.fill,
            { width: `${clamped}%`, backgroundColor: color, height },
          ]}
        />
        {/* Highlight stripe */}
        <View style={styles.highlight} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontFamily: fonts.pixel,
    fontSize: textSizes.xxs,
    color: colors.textDim,
    letterSpacing: 0.5,
  },
  pct: {
    fontFamily: fonts.pixel,
    fontSize: textSizes.xxs,
    letterSpacing: 0.5,
  },
  track: {
    width: '100%',
    backgroundColor: colors.bgMid,
    borderWidth: borderWidth.normal,
    overflow: 'hidden',
    position: 'relative',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  highlight: {
    position: 'absolute',
    top: 2,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
});
