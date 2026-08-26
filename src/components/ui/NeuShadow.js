import React from 'react';
import { View, StyleSheet } from 'react-native';

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
