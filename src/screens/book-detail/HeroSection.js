import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { StatusBadge, StarRating } from '../../components/ui';
import { NeuShadow } from '../../components/ui/NeuShadow';
import { homeColors, spacing, borderWidth, textSizes, fonts } from '../../theme';

const COVER_WIDTH = 100;
const COVER_HEIGHT = 150;

export function HeroSection({ book, shelf, hasEpub }) {
  return (
    <NeuShadow offset={3}>
      <View style={styles.window}>
        {/* Title bar */}
        <View style={styles.titleBar}>
          <Text style={styles.titleBarText}>book_info.exe</Text>
          <View style={styles.titleBarBtns}>
            <View style={styles.titleBtn}><Text style={styles.titleBtnText}>_</Text></View>
            <View style={[styles.titleBtn, styles.closeBtn]}><Text style={styles.titleBtnText}>x</Text></View>
          </View>
        </View>

        {/* Content area */}
        <View style={styles.content}>
          {/* Row: cover + meta */}
          <View style={styles.row}>
            <View style={styles.coverFrame}>
              {book.thumbnail ? (
                <Image source={{ uri: book.thumbnail }} style={styles.cover} resizeMode="cover" />
              ) : (
                <View style={[styles.cover, styles.noCover]}>
                  <Text style={styles.noCoverText}>N/A</Text>
                </View>
              )}
            </View>

            <View style={styles.info}>
              <Text style={styles.bookTitle} numberOfLines={3}>{book.title || 'Untitled'}</Text>
              <Text style={styles.author} numberOfLines={2}>
                {book.authors?.length > 0 ? book.authors.join(', ') : 'Unknown'}
              </Text>

              {/* Rating */}
              <View style={styles.ratingRow}>
                {book.averageRating > 0 ? (
                  <>
                    <StarRating value={Math.round(book.averageRating)} readonly size={12} />
                    <Text style={styles.ratingText}>{book.averageRating.toFixed(1)}</Text>
                  </>
                ) : (
                  <Text style={styles.noRating}>No ratings</Text>
                )}
              </View>

              {/* Stats inline below rating */}
              <View style={styles.dashedLineWrap}>
                <Text style={styles.dashedLine}>{'≻────────────── ⋆✩⋆ ──────────────≺'}</Text>
              </View>
              <Text style={styles.statsInline}>
                {book.pageCount > 0 ? `${book.pageCount} pages` : '--'}
                {' · '}
                {book.publishedDate ? `Year: ${book.publishedDate.slice(0, 4)}` : '--'}
                {' · '}
                {book.language ? `Lang: ${book.language.toUpperCase()}` : '--'}
              </Text>
            </View>
          </View>

          {/* Badges */}
          {(hasEpub || book.isEbook || book.isFree || shelf) && (
            <>
              <View style={styles.inlineDivider} />
              <View style={styles.badges}>
                {hasEpub && <StatusBadge label="EREADER" color={homeColors.success} icon="book-open-page-variant" />}
                {book.isEbook && <StatusBadge label="EBOOK" color={homeColors.accent} icon="book-open-variant" />}
                {book.isFree && <StatusBadge label="FREE" color="#8B5CF6" icon="gift" />}
                {shelf && <StatusBadge label={shelf.replace('_', ' ').toUpperCase()} color={homeColors.accentPink} />}
              </View>
            </>
          )}
        </View>
      </View>
    </NeuShadow>
  );
}

const styles = StyleSheet.create({
  window: {
    borderWidth: borderWidth.pixel,
    borderColor: homeColors.border,
    backgroundColor: homeColors.bgCard,
  },
  titleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderBottomWidth: borderWidth.normal,
    borderBottomColor: homeColors.border,
  },
  titleBarText: {
    fontFamily: fonts.body,
    fontSize: textSizes.xxs,
    color: homeColors.textDark,
  },
  titleBarBtns: {
    flexDirection: 'row',
    gap: spacing.xxs,
  },
  titleBtn: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: homeColors.border,
    backgroundColor: '#FFFFFF',
  },
  closeBtn: {
    backgroundColor: homeColors.error,
  },
  titleBtnText: {
    fontFamily: fonts.body,
    fontSize: 8,
    color: '#000000',
    lineHeight: 10,
  },
  content: {
    padding: spacing.sm,
    backgroundColor: '#FFFFFF',
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  coverFrame: {
    width: COVER_WIDTH,
    height: COVER_HEIGHT,
    borderWidth: borderWidth.normal,
    borderColor: homeColors.border,
    backgroundColor: homeColors.bgElevated,
  },
  cover: {
    width: COVER_WIDTH - 4,
    height: COVER_HEIGHT - 4,
  },
  noCover: {
    backgroundColor: homeColors.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noCoverText: {
    fontFamily: fonts.body,
    fontSize: textSizes.xxs,
    color: homeColors.textCaption,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  bookTitle: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: textSizes.lg,
    color: '#000000',
    lineHeight: textSizes.lg * 1.3,
  },
  author: {
    fontFamily: fonts.body,
    fontSize: textSizes.md,
    color: homeColors.accent,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xxs,
  },
  ratingText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: textSizes.md,
    color: '#000000',
  },
  noRating: {
    fontFamily: fonts.body,
    fontSize: textSizes.sm,
    color: homeColors.textCaption,
  },
  statsInline: {
    fontFamily: fonts.body,
    fontSize: textSizes.xs,
    color: homeColors.textCaption,
  },
  dashedLineWrap: {
    overflow: 'hidden',
    height: 18,
    marginTop: spacing.xs,
  },
  dashedLine: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 11,
    color: '#000000',
  },
  inlineDivider: {
    height: 1,
    backgroundColor: homeColors.border,
    marginVertical: spacing.xxs,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
});
