import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { homeColors, spacing, borderWidth, textSizes, fonts } from '../../theme';
import { NeuShadow } from './NeuShadow';

export function EmptyState({ icon, title, subtitle, children, style }) {
  return (
    <View style={[styles.container, style]}>
      <NeuShadow offset={3}>
        <View style={styles.window}>
          <View style={styles.titleBar}>
            <Text style={styles.titleBarText}>empty_state.exe</Text>
          </View>
          <View style={styles.content}>
            {icon && (
              <View style={styles.iconBox}>
                <MaterialCommunityIcons name={icon} size={32} color="#000000" />
              </View>
            )}
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            {children}
          </View>
        </View>
      </NeuShadow>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  window: {
    borderWidth: borderWidth.pixel,
    borderColor: '#000000',
    backgroundColor: homeColors.bgCard,
    minWidth: 220,
  },
  titleBar: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderBottomWidth: borderWidth.normal,
    borderBottomColor: '#000000',
  },
  titleBarText: {
    fontFamily: fonts.body,
    fontSize: textSizes.xxs,
    color: '#000000',
  },
  content: {
    padding: spacing.lg,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBox: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000000',
    backgroundColor: '#FBCA1F',
    marginBottom: spacing.xs,
  },
  title: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: textSizes.md,
    color: '#000000',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: textSizes.xs,
    color: homeColors.textCaption,
    textAlign: 'center',
    lineHeight: textSizes.xs * 1.5,
  },
});
