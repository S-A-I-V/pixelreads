import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { spacing, borderWidth, textSizes } from '../../theme';

export function StatusBadge({ label, color, icon, style }) {
  return (
    <View style={[styles.badge, { borderColor: color }, style]}>
      {icon ? (
        <MaterialCommunityIcons name={icon} size={12} color={color} />
      ) : (
        <View style={[styles.dot, { backgroundColor: color }]} />
      )}
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 2,
    borderRightWidth: 3,
    borderBottomWidth: 3,
    backgroundColor: '#FFFFFF',
  },
  dot: {
    width: 7,
    height: 7,
  },
  text: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: textSizes.xxs,
  },
});
