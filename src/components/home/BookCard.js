import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { homeColors, spacing, borderWidth, textSizes, fontWeights, fonts } from '../../theme';
import { LibraryIcon } from '../icons';
import { NeuShadow } from '../ui/NeuShadow';

const COVER_WIDTH = 130;
const COVER_HEIGHT = 195;

export function BookCard({ book, onPress }) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityLabel={`${book.title} by ${book.authors?.join(', ') || 'Unknown author'}`}
      accessibilityRole="button"
    >
      <NeuShadow offset={3}>
        <View style={styles.cardFrame}>
          {/* Cover area */}
          <View style={styles.coverContainer}>
            {book.thumbnail ? (
              <Image
                source={{ uri: book.thumbnail }}
                style={styles.coverImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderCover}>
                <LibraryIcon size={28} color={homeColors.textDark} />
                <Text style={styles.placeholderText} numberOfLines={3}>
                  {book.title}
                </Text>
              </View>
            )}
          </View>

          {/* Title strip at bottom of card */}
          <View style={styles.titleStrip}>
            <Text style={styles.title} numberOfLines={2}>
              {book.title}
            </Text>
          </View>
        </View>
      </NeuShadow>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: COVER_WIDTH,
    marginBottom: spacing.xs,
    marginRight: spacing.xxs,
  },
  cardFrame: {
    borderWidth: borderWidth.pixel,
    borderColor: homeColors.border,
    backgroundColor: homeColors.bgCard,
  },
  coverContainer: {
    width: COVER_WIDTH - (borderWidth.pixel * 2),
    height: COVER_HEIGHT,
    overflow: 'hidden',
    backgroundColor: homeColors.bgElevated,
  },
  coverImage: {
    width: '100%',
    height: COVER_HEIGHT,
  },
  placeholderCover: {
    flex: 1,
    backgroundColor: homeColors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    gap: spacing.xs,
  },
  placeholderText: {
    fontFamily: fonts.body,
    fontSize: textSizes.xxs,
    color: homeColors.textDark,
    textAlign: 'center',
  },
  titleStrip: {
    borderTopWidth: borderWidth.normal,
    borderTopColor: homeColors.border,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    backgroundColor: homeColors.bgWindow,
    height: 40,
    justifyContent: 'center',
  },
  title: {
    fontFamily: fonts.bodyBold,
    fontSize: textSizes.xs,
    color: homeColors.textDark,
    lineHeight: textSizes.xs * 1.4,
  },
});

export default BookCard;
