import React from 'react';
import { View, StyleSheet } from 'react-native';
import { radius } from '../../theme';
import { SkeletonShimmer } from './SkeletonShimmer';

const CARD_WIDTH = 220;
const CARD_HEIGHT = 140;

/**
 * Skeleton placeholder matching CategoryCard layout.
 * Shows a wide rounded rectangle while categories load.
 */
export function CategoryCardSkeleton() {
  return (
    <View style={styles.container} accessibilityLabel="Loading category">
      <SkeletonShimmer
        width={CARD_WIDTH}
        height={CARD_HEIGHT}
        borderRadius={radius.lg}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
  },
});

export default CategoryCardSkeleton;
