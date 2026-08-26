import React from 'react';
import { View, StyleSheet } from 'react-native';
import { homeColors, spacing, borderWidth } from '../../theme';
import { NeuShadow } from '../ui/NeuShadow';
import { SkeletonShimmer } from './SkeletonShimmer';

const COVER_WIDTH = 130;
const COVER_HEIGHT = 195;
const TITLE_STRIP_HEIGHT = 40;

export function BookCardSkeleton() {
  return (
    <View style={styles.container} accessibilityLabel="Loading book">
      <NeuShadow offset={3}>
        <View style={styles.cardFrame}>
          <SkeletonShimmer
            width={COVER_WIDTH - (borderWidth.pixel * 2)}
            height={COVER_HEIGHT}
            borderRadius={0}
          />
          <View style={styles.titleStrip}>
            <SkeletonShimmer
              width={'100%'}
              height={10}
              borderRadius={2}
            />
          </View>
        </View>
      </NeuShadow>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: COVER_WIDTH,
    marginBottom: spacing.xs,
    marginRight: spacing.xxs,
  },
  cardFrame: {
    width: COVER_WIDTH,
    borderWidth: borderWidth.pixel,
    borderColor: homeColors.border,
    backgroundColor: homeColors.bgCard,
  },
  titleStrip: {
    borderTopWidth: borderWidth.normal,
    borderTopColor: homeColors.border,
    height: TITLE_STRIP_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
    backgroundColor: homeColors.bgWindow,
  },
});

export default BookCardSkeleton;
