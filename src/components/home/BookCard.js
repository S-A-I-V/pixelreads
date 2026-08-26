import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { homeColors, spacing, radius, elevation, textSizes, fontWeights } from '../../theme';
import { LibraryIcon } from '../icons';

const COVER_WIDTH = 130;
const COVER_HEIGHT = 195;

/**
 * Horizontal scroll book card for the Home screen.
 * Modern elevated card with 2:3 cover aspect ratio.
 */
export function BookCard({ book, onPress }) {
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
            <Text style={styles.placeholderText} numberOfLines={3}>
              {book.title}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {book.title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: COVER_WIDTH,
    gap: spacing.xs,
  },
  coverContainer: {
    width: COVER_WIDTH,
    height: COVER_HEIGHT,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: homeColors.bgElevated,
    ...elevation.md,
  },
  coverImage: {
    width: COVER_WIDTH,
    height: COVER_HEIGHT,
  },
  placeholderCover: {
    width: COVER_WIDTH,
    height: COVER_HEIGHT,
    backgroundColor: homeColors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    gap: spacing.xs,
  },
  placeholderText: {
    fontSize: textSizes.xs,
    color: homeColors.textCaption,
    textAlign: 'center',
  },
  infoContainer: {
    paddingHorizontal: spacing.xxs,
    height: 36,
  },
  title: {
    fontSize: textSizes.sm,
    fontWeight: fontWeights.semibold,
    color: homeColors.textDark,
    lineHeight: textSizes.sm * 1.4,
  },
});

export default BookCard;
