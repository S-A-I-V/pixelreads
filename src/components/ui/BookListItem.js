import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { homeColors, spacing, radius, textSizes, fontWeights } from '../../theme';
import { StatusBadge } from './StatusBadge';
import { ProgressBar } from './ProgressBar';

/**
 * Unified book list item used across Library, Search, and Home screens.
 * 
 * Variants:
 * - 'compact': cover + title + author + progress (Home)
 * - 'standard': cover + title + author + meta + shelf badge + chevron (Library)
 * - 'detailed': cover + title + author + meta + publisher + rating + badges (Search)
 */
export function BookListItem({ book, onPress, variant = 'standard', shelf, tags, hasEpub, showChevron = true }) {
  const year = book.publishedDate?.slice(0, 4);

  if (variant === 'compact') {
    return (
      <TouchableOpacity style={styles.compactCard} onPress={onPress} activeOpacity={0.7}>
        <BookCoverImage uri={book.thumbnail} size="small" />
        <View style={styles.compactInfo}>
          <Text style={styles.title} numberOfLines={2}>{book.title}</Text>
          <Text style={styles.author} numberOfLines={1}>
            {book.authors?.join(', ') || 'Unknown'}
          </Text>
          {book.progress > 0 && <ProgressBar progress={book.progress} height={4} />}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} style={styles.listItem} activeOpacity={0.7}>
      <BookCoverImage uri={book.thumbnail} size="medium" />
      <View style={styles.listInfo}>
        <Text style={styles.title} numberOfLines={2}>{book.title}</Text>
        <Text style={styles.author} numberOfLines={1}>
          {book.authors?.join(', ') || 'Unknown'}
        </Text>

        {/* Meta row - always show all fields for consistent layout */}
        {variant === 'detailed' && (
          <View style={styles.metaRow}>
            <Text style={year ? styles.metaText : styles.metaTextDim}>
              {year || '----'}
            </Text>
            <Text style={book.pageCount > 0 ? styles.metaText : styles.metaTextDim}>
              {book.pageCount > 0 ? `${book.pageCount}p` : '--p'}
            </Text>
            <Text style={book.language ? styles.metaText : styles.metaTextDim}>
              {book.language ? book.language.toUpperCase() : '--'}
            </Text>
          </View>
        )}

        {variant === 'detailed' && (
          <Text style={book.publisher ? styles.publisher : styles.publisherDim} numberOfLines={1}>
            {book.publisher || 'Publisher unknown'}
          </Text>
        )}

        {/* Rating + badges row - always show rating slot */}
        <View style={styles.badgeRow}>
          <View style={styles.ratingBadge}>
            <MaterialCommunityIcons name="star" size={12} color={book.averageRating > 0 ? homeColors.warning : homeColors.textCaption} />
            <Text style={book.averageRating > 0 ? styles.ratingText : styles.ratingTextDim}>
              {book.averageRating > 0 ? book.averageRating.toFixed(1) : '--'}
            </Text>
          </View>
          {shelf && (
            <StatusBadge label={shelf.replace('_', ' ').toUpperCase()} color={homeColors.accent} />
          )}
          {hasEpub && (
            <StatusBadge label="EREADER" color={homeColors.success} icon="book-open-page-variant" />
          )}
          {book.isEbook && <StatusBadge label="EBOOK" color={homeColors.accent} />}
          {book.isFree && <StatusBadge label="FREE" color="#8B5CF6" />}
        </View>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <View style={styles.tagRow}>
            {tags.slice(0, 3).map(tag => (
              <View key={tag.id} style={[styles.tagChip, { backgroundColor: tag.color + '33' }]}>
                <Text style={[styles.tagChipText, { color: tag.color }]}>{tag.label}</Text>
              </View>
            ))}
            {tags.length > 3 && (
              <Text style={styles.moreTagsText}>+{tags.length - 3}</Text>
            )}
          </View>
        )}

        {/* Reading progress for library items */}
        {variant === 'standard' && book.shelf === 'reading' && book.progress > 0 && hasEpub && (
          <ProgressBar progress={book.progress} height={4} style={{ marginTop: spacing.sm }} />
        )}
      </View>

      {showChevron && (
        <MaterialCommunityIcons name="chevron-right" size={24} color={homeColors.textCaption} />
      )}
    </TouchableOpacity>
  );
}

function BookCoverImage({ uri, size = 'medium' }) {
  const dimensions = size === 'small' 
    ? { width: 60, height: 90 } 
    : { width: 70, height: 105 };

  if (uri) {
    return <Image source={{ uri }} style={[styles.cover, dimensions]} />;
  }

  return (
    <View style={[styles.cover, styles.noCover, dimensions]}>
      <Text style={styles.noCoverText}>No Cover</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Standard/Detailed variant
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  listInfo: {
    flex: 1,
    gap: spacing.xs,
  },

  // Compact variant (Home cards)
  compactCard: {
    flexDirection: 'row',
    backgroundColor: homeColors.bgCard,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  compactInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xs,
  },

  // Shared
  cover: {
    borderRadius: radius.md,
    backgroundColor: homeColors.bgElevated,
  },
  noCover: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noCoverText: {
    fontSize: textSizes.xxs,
    color: homeColors.textCaption,
    textAlign: 'center',
  },
  title: {
    fontSize: textSizes.lg,
    fontWeight: fontWeights.semibold,
    color: homeColors.textDark,
  },
  author: {
    fontSize: textSizes.md,
    color: homeColors.textCaption,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  metaText: {
    fontSize: textSizes.sm,
    color: homeColors.textBody,
  },
  metaTextDim: {
    fontSize: textSizes.sm,
    color: homeColors.textCaption,
    fontStyle: 'italic',
  },
  publisher: {
    fontSize: textSizes.sm,
    color: homeColors.textCaption,
  },
  publisherDim: {
    fontSize: textSizes.sm,
    color: homeColors.textCaption,
    fontStyle: 'italic',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ratingText: {
    fontSize: textSizes.sm,
    color: homeColors.textBody,
  },
  ratingTextDim: {
    fontSize: textSizes.sm,
    color: homeColors.textCaption,
    fontStyle: 'italic',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  tagChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.sm,
  },
  tagChipText: {
    fontSize: textSizes.xxs,
    fontWeight: fontWeights.medium,
  },
  moreTagsText: {
    fontSize: textSizes.xxs,
    color: homeColors.textCaption,
    alignSelf: 'center',
  },
});
