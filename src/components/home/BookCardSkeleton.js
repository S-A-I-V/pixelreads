import React from 'react';
import { View, StyleSheet } from 'react-native';
import { spacing, radius } from '../../theme';
import { SkeletonShimmer } from './SkeletonShimmer';

const COVER_WIDTH = 125;
const COVER_HEIGHT = 180;
const TITLE_HEIGHT = 12;

/**
 * Skeleton placeholder matching BookCard layout.
 * Shows a cover rectangle + title line while content loads.
 */
export function BookCardSkeleton() {
  return (
    <View style={styles.container} accessibilityLabel="Loading book">
      <SkeletonShimmer
        width={COVER_WIDTH}
        height={COVER_HEIGHT}
        borderRadius={radius.md}
      />
      <SkeletonShimmer
        width={COVER_WIDTH * 0.8}
        height={TITLE_HEIGHT}
        borderRadius={radius.xs}
        style={styles.titleLine}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: COVER_WIDTH,
    gap: spacing.xs,
  },
  titleLine: {
    marginTop: spacing.xxs,
  },
});

export default BookCardSkeleton;
