import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Section, ProgressBar, StarRating, MetaRow } from '../../components/ui';
import { colors, spacing, radius, textSizes, fontWeights, borderWidth } from '../../theme';

/**
 * Tags display section (shown when book is in library).
 */
export function TagsSection({ bookTags, allTags, onManageTags }) {
  return (
    <Section
      title="Tags"
      rightAction={
        <TouchableOpacity onPress={onManageTags} accessibilityLabel="Manage tags">
          <MaterialCommunityIcons name="plus-circle" size={24} color={colors.accent} />
        </TouchableOpacity>
      }
    >
      {bookTags.length === 0 ? (
        <Text style={styles.noTagsText}>No tags - tap + to add</Text>
      ) : (
        <View style={styles.tagsRow}>
          {bookTags.map(tagId => {
            const tag = allTags.find(t => t.id === tagId);
            if (!tag) return null;
            return (
              <View key={tagId} style={[styles.tagPill, { backgroundColor: tag.color }]}>
                <Text style={styles.tagPillText}>{tag.label}</Text>
              </View>
            );
          })}
        </View>
      )}
    </Section>
  );
}

/**
 * Reading progress section (shown when book has EPUB).
 */
export function ReadingProgressSection({ progress, currentPage, totalPages }) {
  return (
    <Section title="Reading Progress">
      <ProgressBar progress={progress} height={8} />
      <View style={styles.progressInfo}>
        <Text style={styles.progressText}>{progress}% complete</Text>
        {currentPage > 0 && totalPages > 0 && (
          <Text style={styles.pageText}>Page {currentPage} of {totalPages}</Text>
        )}
      </View>
      <Text style={styles.hint}>Progress updates automatically as you read</Text>
    </Section>
  );
}

/**
 * Description section.
 */
export function DescriptionSection({ description }) {
  if (!description) return null;
  return (
    <Section title="Description">
      <Text style={styles.descText}>{description}</Text>
    </Section>
  );
}

/**
 * Categories chip list.
 */
export function CategoriesSection({ categories }) {
  if (!categories?.length) return null;
  return (
    <Section title="Categories">
      <View style={styles.chipsRow}>
        {categories.map((cat, i) => (
          <View key={i} style={styles.chip}>
            <Text style={styles.chipText}>{cat}</Text>
          </View>
        ))}
      </View>
    </Section>
  );
}

/**
 * Publication details card with MetaRow items.
 */
export function PublicationDetails({ book }) {
  return (
    <Section title="Publication Details">
      <View style={styles.detailsCard}>
        <MetaRow icon="domain" label="Publisher" value={book.publisher} />
        <MetaRow icon="calendar" label="Published" value={book.publishedDate} />
        <MetaRow icon="book-open-page-variant" label="Pages" value={book.pageCount > 0 ? String(book.pageCount) : null} />
        <MetaRow icon="translate" label="Language" value={book.language?.toUpperCase()} />
        <MetaRow icon="barcode" label="ISBN" value={book.isbn} />
      </View>
    </Section>
  );
}

/**
 * External links (Preview, More Info, Buy).
 */
export function LinksSection({ book, onOpenLink }) {
  const hasLinks = book.previewLink || book.infoLink || book.buyLink;
  if (!hasLinks) return null;

  return (
    <Section title="Links">
      <View style={styles.linksRow}>
        {book.previewLink && (
          <TouchableOpacity style={styles.linkBtn} onPress={() => onOpenLink(book.previewLink)}>
            <MaterialCommunityIcons name="book-open-variant" size={18} color="#fff" />
            <Text style={styles.linkBtnText}>Preview</Text>
          </TouchableOpacity>
        )}
        {book.infoLink && (
          <TouchableOpacity style={styles.linkBtn} onPress={() => onOpenLink(book.infoLink)}>
            <MaterialCommunityIcons name="information" size={18} color="#fff" />
            <Text style={styles.linkBtnText}>More Info</Text>
          </TouchableOpacity>
        )}
        {book.buyLink && (
          <TouchableOpacity style={[styles.linkBtn, styles.buyBtn]} onPress={() => onOpenLink(book.buyLink)}>
            <MaterialCommunityIcons name="cart" size={18} color="#fff" />
            <Text style={styles.linkBtnText}>Buy</Text>
          </TouchableOpacity>
        )}
      </View>
    </Section>
  );
}

/**
 * My Rating section.
 */
export function RatingSection({ rating, onRate }) {
  return (
    <Section title="My Rating">
      <StarRating value={rating} onChange={onRate} />
    </Section>
  );
}

const styles = StyleSheet.create({
  // Tags
  noTagsText: {
    fontSize: textSizes.md,
    color: colors.textDim,
    fontStyle: 'italic',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tagPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.xl,
  },
  tagPillText: {
    fontSize: textSizes.sm,
    color: colors.textPrimary,
    fontWeight: fontWeights.medium,
  },

  // Progress
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: textSizes.md,
    color: colors.textPrimary,
    fontWeight: fontWeights.medium,
  },
  pageText: {
    fontSize: textSizes.sm,
    color: colors.textMuted,
  },
  hint: {
    fontSize: textSizes.sm,
    color: colors.textDim,
    fontStyle: 'italic',
  },

  // Description
  descText: {
    fontSize: textSizes.md,
    color: colors.textSecondary,
    lineHeight: 22,
  },

  // Categories
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.bgSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.xl,
    borderWidth: borderWidth.thin,
    borderColor: colors.borderLight,
  },
  chipText: {
    fontSize: textSizes.sm,
    color: colors.textSecondary,
  },

  // Details card
  detailsCard: {
    backgroundColor: colors.bgSecondary,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
  },

  // Links
  linksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.bgSecondary,
    paddingHorizontal: 14,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: borderWidth.thin,
    borderColor: colors.borderLight,
  },
  buyBtn: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  linkBtnText: {
    fontSize: textSizes.sm,
    color: colors.textPrimary,
    fontWeight: fontWeights.medium,
  },
});
