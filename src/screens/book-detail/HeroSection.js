import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { StatusBadge, StarRating } from '../../components/ui';
import { colors, spacing, radius, textSizes, fontWeights } from '../../theme';

/**
 * Book cover + title + author + stats + badges hero area.
 */
export function HeroSection({ book, shelf, hasEpub }) {
  return (
    <View style={styles.hero}>
      {book.thumbnail ? (
        <Image source={{ uri: book.thumbnail }} style={styles.cover} />
      ) : (
        <View style={[styles.cover, styles.noCover]}>
          <Text style={styles.noCoverText}>No Cover</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.title}>{book.title || 'Untitled'}</Text>
        {book.subtitle && <Text style={styles.subtitle}>{book.subtitle}</Text>}
        <Text style={book.authors?.length > 0 ? styles.author : styles.unknownText}>
          {book.authors?.length > 0 ? book.authors.join(', ') : 'Unknown author'}
        </Text>

        <View style={styles.quickStats}>
          <Text style={styles.statText}>
            {book.publishedDate ? book.publishedDate.slice(0, 4) : 'Year unknown'}
          </Text>
          <Text style={styles.statText}>
            {book.pageCount > 0 ? `${book.pageCount} pages` : 'Pages unknown'}
          </Text>
        </View>

        <View style={styles.ratingRow}>
          {book.averageRating > 0 ? (
            <>
              <StarRating value={Math.round(book.averageRating)} readonly size={18} />
              <Text style={styles.ratingText}>
                {book.averageRating.toFixed(1)} ({book.ratingsCount})
              </Text>
            </>
          ) : (
            <Text style={styles.noRatingText}>No ratings yet</Text>
          )}
        </View>

        <View style={styles.badges}>
          {hasEpub && <StatusBadge label="EREADER" color={colors.success} icon="book-open-page-variant" />}
          {book.isEbook && <StatusBadge label="EBOOK" color={colors.info} icon="book-open-variant" />}
          {book.isFree && <StatusBadge label="FREE" color={colors.purple} icon="gift" />}
          {shelf && <StatusBadge label={shelf.replace('_', ' ').toUpperCase()} color={colors.accent} />}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  cover: {
    width: 120,
    height: 180,
    borderRadius: radius.md,
    backgroundColor: colors.borderLight,
  },
  noCover: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noCoverText: {
    fontSize: textSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  info: {
    flex: 1,
    gap: spacing.sm,
  },
  title: {
    fontSize: textSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  subtitle: {
    fontSize: textSizes.md,
    color: '#aaa',
    fontStyle: 'italic',
  },
  author: {
    fontSize: textSizes.md + 1,
    color: colors.accent,
    marginTop: spacing.xxs,
  },
  unknownText: {
    fontSize: textSizes.md + 1,
    color: colors.textDim,
    marginTop: spacing.xxs,
    fontStyle: 'italic',
  },
  quickStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  statText: {
    fontSize: textSizes.sm,
    color: colors.textMuted,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  ratingText: {
    fontSize: textSizes.sm,
    color: colors.textMuted,
  },
  noRatingText: {
    fontSize: textSizes.sm,
    color: colors.textDim,
    fontStyle: 'italic',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
