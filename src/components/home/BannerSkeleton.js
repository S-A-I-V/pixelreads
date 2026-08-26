import React from 'react';
import { View, StyleSheet } from 'react-native';
import { spacing, radius } from '../../theme';
import { SkeletonShimmer } from './SkeletonShimmer';

const BANNER_HEIGHT = 160;

/**
 * Skeleton placeholder matching HeroBanner layout.
 * Shows a wide rounded rectangle while the banner image loads.
 */
export function BannerSkeleton() {
  return (
    <View style={styles.container} accessibilityLabel="Loading banner">
      <SkeletonShimmer
        width="100%"
        height={BANNER_HEIGHT}
        borderRadius={radius.xl}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
  },
});

export default BannerSkeleton;
