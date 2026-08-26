import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { homeColors, spacing, radius, elevation, textSizes, fontWeights } from '../../theme';
import { LibraryIcon } from '../icons';
import { ProgressBar } from '../ui/ProgressBar';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_GAP = spacing.md;
const GRID_PADDING = spacing.lg;
const CARD_WIDTH = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP) / 2;
const COVER_ASPECT_RATIO = 1.5;
const COVER_HEIGHT = CARD_WIDTH * COVER_ASPECT_RATIO;
const PROGRESS_BAR_HEIGHT = 3;

/**
 * Grid-optimized book card for the Library screen.
 * Modern elevated card with 2:3 aspect cover, subtle shadow, and progress overlay.
 */
export function LibraryBookCard({ book, onPress, shelf }) {
  const showProgress = shelf === 'reading' && book.progress > 0;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityLabel={`${book.title} by ${book.authors?.join(', ') || 'Unknown author'}`}
      accessibilityRole="button"
    >
      <View style={styles.coverContainer}>
        {book.thumbnail ? (
          <Image
            source={{ uri: book.thumbnail }}
            style={styles.coverImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderCover}>
            <LibraryIcon size={28} color={homeColors.textCaption} />
          </View>
        )}
        {showProgress && (
          <View style={styles.progressOverlay}>
            <ProgressBar
              progress={book.progress}
              height={PROGRESS_BAR_HEIGHT}
              trackColor="rgba(255,255,255,0.3)"
              fillColor={homeColors.accent}
            />
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={styles.author} numberOfLines={1}>
          {book.authors?.join(', ') || 'Unknown'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    gap: spacing.sm,
  },
  coverContainer: {
    width: CARD_WIDTH,
    height: COVER_HEIGHT,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: homeColors.bgElevated,
    ...elevation.md,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  placeholderCover: {
    width: '100%',
    height: '100%',
    backgroundColor: homeColors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  infoContainer: {
    paddingHorizontal: spacing.xxs,
    gap: spacing.xxs,
  },
  title: {
    fontSize: textSizes.md,
    fontWeight: fontWeights.semibold,
    color: homeColors.textDark,
    lineHeight: textSizes.md * 1.4,
  },
  author: {
    fontSize: textSizes.sm,
    fontWeight: fontWeights.normal,
    color: homeColors.textCaption,
    lineHeight: textSizes.sm * 1.3,
  },
});

export default LibraryBookCard;
