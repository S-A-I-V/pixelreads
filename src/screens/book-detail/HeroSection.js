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
        <Text style={styles.title}>{book.title}</Text>
        {book.subtitle && <Text style={styles.subtitle}>{book.subtitle}</Text>}
        {book.authors?.length > 0 && (
          <Text style={styles.author}>{book.authors.join(', ')}</Text>
        )}

        <View style={styles.quickStats}>
          {book.publishedDate && (
            <Text style={styles.statText}>{book.publishedDate.slice(0, 4)}</Text>
          )}
          {book.pageCount > 0 && (
            <Text style={styles.statText}>{book.pageCount} pages</Text>
          )}
        </View>

        {book.averageRating > 0 && (
          <View style={styles.ratingRow}>
            <StarRating value={Math.round(book.averageRating)} readonly size={18} />
            <Text style={styles.ratingText}>
              {book.averageRating.toFixed(1)} ({book.ratingsCount})
            </Text>
          </View>
        )}

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
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
