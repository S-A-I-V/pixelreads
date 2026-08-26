import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { homeColors, spacing, borderWidth, textSizes, fontWeights, fonts } from '../../theme';
import { ActionButton } from './ActionButton';

/**
 * Generates an array of diagonal stripe Views that cover the chip.
 * Pure RN approach — no SVG patterns needed.
 */
function DiagonalStripes() {
  const stripes = [];
  // Generate enough stripes to cover any reasonable chip width
  for (let i = 0; i < 30; i++) {
    stripes.push(
      <View
        key={i}
        style={[
          stripeStyles.stripe,
          { left: i * 7 - 20 },
        ]}
      />
    );
  }
  return <View style={stripeStyles.container}>{stripes}</View>;
}

const stripeStyles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  stripe: {
    position: 'absolute',
    top: -10,
    width: 1.5,
    height: 60,
    backgroundColor: '#FBCA1F',
    transform: [{ rotate: '-45deg' }],
  },
});

export function SectionHeader({ title, actionText, onActionPress }) {
  return (
    <View style={styles.container}>
      <View style={styles.titleChip}>
        <DiagonalStripes />
        <View style={styles.labelRow}>
          <Text style={styles.prefix}>{'#'}</Text>
          <Text style={styles.title}>{title}</Text>
        </View>
      </View>
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  titleChip: {
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#000000',
    backgroundColor: '#FFF3C4',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  prefix: {
    fontFamily: fonts.bodyBold,
    fontSize: textSizes.lg,
    color: '#000000',
  },
  title: {
    fontFamily: fonts.bodyBold,
    fontSize: textSizes.sm,
    color: '#000000',
  },
});

export default SectionHeader;
