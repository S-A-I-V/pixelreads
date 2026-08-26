import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { homeColors, spacing, textSizes, fontWeights, fonts } from '../../theme';
import { ActionButton } from './ActionButton';

export function SectionHeader({ title, actionText, onActionPress }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {actionText && (
        <ActionButton
          label={actionText}
          variant="ghost"
          size="sm"
          onPress={onActionPress}
          iconRight="chevron-right"
          haptic={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  title: {
    fontSize: textSizes.xl,
    fontWeight: fontWeights.bold,
    fontFamily: fonts.serif,
    color: homeColors.textDark,
  },
});

export default SectionHeader;
