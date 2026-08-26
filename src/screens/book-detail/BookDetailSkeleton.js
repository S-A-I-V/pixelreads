import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { homeColors, spacing, borderWidth } from '../../theme';
import { SkeletonShimmer } from '../../components/home/SkeletonShimmer';
import { NeuShadow } from '../../components/ui/NeuShadow';

const COVER_WIDTH = 120;
const COVER_HEIGHT = 180;

function DetailDivider() {
  return (
    <View style={dividerStyles.container}>
      <Text style={dividerStyles.text} numberOfLines={1}>{'≻──────────── ⋆✩⋆ ────────────≺'}</Text>
    </View>
  );
}

const dividerStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: spacing.xxs,
  },
  text: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 18,
    color: '#000000',
  },
});

export function BookDetailSkeleton() {
  return (
    <View style={styles.container}>
      {/* Hero: Cover + Info side by side */}
      <View style={styles.heroRow}>
        <NeuShadow offset={3}>
          <View style={styles.coverFrame}>
            <SkeletonShimmer width={COVER_WIDTH - 6} height={COVER_HEIGHT - 6} borderRadius={0} />
          </View>
        </NeuShadow>

        <View style={styles.infoCol}>
          <SkeletonShimmer width={'90%'} height={14} borderRadius={2} />
          <SkeletonShimmer width={'65%'} height={14} borderRadius={2} />
          <SkeletonShimmer width={'45%'} height={11} borderRadius={2} style={{ marginTop: 6 }} />
          <SkeletonShimmer width={'35%'} height={11} borderRadius={2} />
          {/* Inline stats */}
          <View style={styles.inlineStats}>
            <SkeletonShimmer width={36} height={11} borderRadius={2} />
            <SkeletonShimmer width={36} height={11} borderRadius={2} />
            <SkeletonShimmer width={36} height={11} borderRadius={2} />
          </View>
        </View>
      </View>

      <DetailDivider />

      {/* Action button placeholder */}
      <View style={styles.actionBtn}>
        <SkeletonShimmer width={'50%'} height={14} borderRadius={2} />
      </View>

      <DetailDivider />

      {/* Description window */}
      <NeuShadow offset={3}>
        <View style={styles.sectionWindow}>
          <View style={styles.windowTitleBar}>
            <SkeletonShimmer width={90} height={9} borderRadius={2} />
          </View>
          <View style={styles.windowContent}>
            <SkeletonShimmer width={'100%'} height={9} borderRadius={2} />
            <SkeletonShimmer width={'100%'} height={9} borderRadius={2} />
            <SkeletonShimmer width={'80%'} height={9} borderRadius={2} />
          </View>
        </View>
      </NeuShadow>

      <DetailDivider />

      {/* Details window */}
      <NeuShadow offset={3}>
        <View style={styles.sectionWindow}>
          <View style={styles.windowTitleBar}>
            <SkeletonShimmer width={120} height={9} borderRadius={2} />
          </View>
          <View style={styles.windowContent}>
            <SkeletonShimmer width={'100%'} height={10} borderRadius={2} />
            <SkeletonShimmer width={'100%'} height={10} borderRadius={2} />
            <SkeletonShimmer width={'70%'} height={10} borderRadius={2} />
          </View>
        </View>
      </NeuShadow>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  heroRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  coverFrame: {
    width: COVER_WIDTH,
    height: COVER_HEIGHT,
    borderWidth: borderWidth.pixel,
    borderColor: homeColors.border,
    backgroundColor: homeColors.bgCard,
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xs,
  },
  inlineStats: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderWidth: 3,
    borderColor: '#000000',
    backgroundColor: '#FBCA1F',
    borderRightWidth: 6,
    borderBottomWidth: 6,
  },
  sectionWindow: {
    borderWidth: borderWidth.pixel,
    borderColor: homeColors.border,
    backgroundColor: homeColors.bgCard,
  },
  windowTitleBar: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderBottomWidth: borderWidth.normal,
    borderBottomColor: homeColors.border,
  },
  windowContent: {
    padding: spacing.sm,
    gap: spacing.xs,
    backgroundColor: '#FFFFFF',
  },
});

export default BookDetailSkeleton;
