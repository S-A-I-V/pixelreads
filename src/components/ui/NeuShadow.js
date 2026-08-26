import React from 'react';
import { View, StyleSheet } from 'react-native';

/**
 * Neubrutalist hard offset shadow wrapper — works on both iOS and Android.
 *
 * Renders a black rectangle offset behind the children.
 * This is the only reliable way to get crisp hard shadows on Android
 * (since Android elevation produces blurred Material shadows only).
 *
 * Usage:
 *   <NeuShadow offset={3}>
 *     <View style={styles.card}>...</View>
 *   </NeuShadow>
 */
export function NeuShadow({ children, offset = 3, color = '#000000', style }) {
  return (
    <View style={[styles.wrapper, style]}>
      <View
        style={[
          styles.shadowLayer,
          {
            backgroundColor: color,
            top: offset,
            left: offset,
            right: -offset,
            bottom: -offset,
          },
        ]}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  shadowLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
});

export default NeuShadow;
