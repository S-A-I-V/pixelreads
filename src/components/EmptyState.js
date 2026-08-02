import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, textSizes, spacing } from '../theme';

/**
 * Empty state placeholder.
 *
 * Props:
 *   icon     string  emoji icon
 *   title    string  main message
 *   sub      string  secondary message
 *   action   ReactNode  optional action button
 */
export default function EmptyState({ icon = '📚', title, sub, action }) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {sub   ? <Text style={styles.sub}>{sub}</Text>     : null}
      {action ? <View style={styles.actionWrap}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
    gap: spacing.lg,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontFamily: fonts.pixel,
    fontSize: textSizes.sm,
    color: colors.pinkHot,
    textAlign: 'center',
    lineHeight: textSizes.sm * 2,
  },
  sub: {
    fontFamily: fonts.pixel,
    fontSize: textSizes.xxs,
    color: colors.textDim,
    textAlign: 'center',
    lineHeight: textSizes.xxs * 2.2,
  },
  actionWrap: {
    marginTop: spacing.sm,
  },
});
