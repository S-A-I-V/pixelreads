import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { StatusBadge, StarRating } from '../../components/ui';
import { homeColors, spacing, radius, elevation, textSizes, fontWeights } from '../../theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const COVER_WIDTH = 140;
const COVER_HEIGHT = 210;
const HERO_BG_HEIGHT = 180;

/**
 * Modern hero section with blurred cover background,
 * elevated cover card, and clean metadata layout.
 */
export function HeroSection({ book, shelf, hasEpub }) {
  return (
    <View style={styles.heroWrapper}>
      {/* Blurred background using cover image */}
      <View style={styles.bgContainer}>
        {book.thumbnail ? (
          <Image
            source={{ uri: book.thumbnail }}
            style={styles.bgImage}
            blurRadius={25}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.bgFallback} />
        )}
        <View style={styles.bgOverlay} />
      </View>

      {/* Cover card + info */}
      <View style={styles.contentRow}>
        <View style={styles.coverCard}>
          {book.thumbnail ? (
            <Image source={{ uri: book.thumbnail }} style={styles.cover} resizeMode="cover" />
          ) : (
            <View style={[styles.cover, styles.noCover]}>
              <Text style={styles.noCoverText}>No Cover</Text>
            </View>
          )}
        </View>

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={3}>{book.title || 'Untitled'}</Text>
          {book.subtitle && (
            <Text style={styles.subtitle} numberOfLines={2}>{book.subtitle}</Text>
          )}
          <Text
            style={book.authors?.length > 0 ? styles.author : styles.unknownText}
            numberOfLines={2}
          >
            {book.authors?.length > 0 ? book.authors.join(', ') : 'Unknown author'}
          </Text>

          <View style={styles.ratingRow}>
            {book.averageRating > 0 ? (
              <>
                <StarRating value={Math.round(book.averageRating)} readonly size={16} />
                <Text style={styles.ratingText}>
                  {book.averageRating.toFixed(1)}
                </Text>
              </>
            ) : (
              <Text style={styles.noRatingText}>No ratings</Text>
            )}
          </View>
        </View>
      </View>

      {/* Quick stats bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {book.pageCount > 0 ? book.pageCount : '--'}
          </Text>
          <Text style={styles.statLabel}>Pages</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {book.publishedDate ? book.publishedDate.slice(0, 4) : '--'}
          </Text>
          <Text style={styles.statLabel}>Year</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {book.language ? book.language.toUpperCase() : '--'}
          </Text>
          <Text style={styles.statLabel}>Language</Text>
        </View>
      </View>

      {/* Status badges */}
      {(hasEpub || book.isEbook || book.isFree || shelf) && (
        <View style={styles.badges}>
          {hasEpub && <StatusBadge label="EREADER" color={homeColors.success} icon="book-open-page-variant" />}
          {book.isEbook && <StatusBadge label="EBOOK" color={homeColors.accent} icon="book-open-variant" />}
          {book.isFree && <StatusBadge label="FREE" color="#8B5CF6" icon="gift" />}
          {shelf && <StatusBadge label={shelf.replace('_', ' ').toUpperCase()} color={homeColors.accent} />}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  heroWrapper: {
    marginHorizontal: -spacing.lg,
    marginTop: -spacing.lg,
    paddingBottom: spacing.md,
  },
  bgContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HERO_BG_HEIGHT,
    overflow: 'hidden',
  },
  bgImage: {
    width: '100%',
    height: '100%',
  },
  bgFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: homeColors.bgElevated,
  },
  bgOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(250, 251, 254, 0.75)',
  },
  contentRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
  },
  coverCard: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...elevation.xl,
  },
  cover: {
    width: COVER_WIDTH,
    height: COVER_HEIGHT,
    borderRadius: radius.lg,
  },
  noCover: {
    backgroundColor: homeColors.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noCoverText: {
    fontSize: textSizes.sm,
    color: homeColors.textCaption,
    textAlign: 'center',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xs,
    paddingTop: spacing.lg,
  },
  title: {
    fontSize: textSizes.xxl,
    fontWeight: fontWeights.bold,
    color: homeColors.textDark,
    lineHeight: textSizes.xxl * 1.3,
  },
  subtitle: {
    fontSize: textSizes.md,
    color: homeColors.textBody,
    fontStyle: 'italic',
  },
  author: {
    fontSize: textSizes.md,
    fontWeight: fontWeights.medium,
    color: homeColors.accent,
    marginTop: spacing.xxs,
  },
  unknownText: {
    fontSize: textSizes.md,
    color: homeColors.textCaption,
    fontStyle: 'italic',
    marginTop: spacing.xxs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  ratingText: {
    fontSize: textSizes.sm,
    fontWeight: fontWeights.medium,
    color: homeColors.textBody,
  },
  noRatingText: {
    fontSize: textSizes.sm,
    color: homeColors.textCaption,
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: homeColors.bgCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: homeColors.borderSubtle,
    ...elevation.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xxs,
  },
  statValue: {
    fontSize: textSizes.lg,
    fontWeight: fontWeights.bold,
    color: homeColors.textDark,
  },
  statLabel: {
    fontSize: textSizes.xs,
    fontWeight: fontWeights.medium,
    color: homeColors.textCaption,
    textTransform: 'uppercase',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: homeColors.border,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
});
