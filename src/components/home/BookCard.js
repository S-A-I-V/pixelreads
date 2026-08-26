import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { homeColors, spacing, radius, textSizes, fontWeights, fonts } from '../../theme';

const COVER_WIDTH = 120;
const COVER_HEIGHT = 180;

export function BookCard({ book, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.container, { width: COVER_WIDTH }]}
      onPress={onPress}
      activeOpacity={0.8}
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
            <MaterialCommunityIcons name="book-outline" size={32} color={homeColors.textCaption} />
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
    gap: spacing.sm,
  },
  coverContainer: {
    width: COVER_WIDTH,
    height: COVER_HEIGHT,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: homeColors.border,
    shadowColor: homeColors.shadowStrong,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  coverImage: {
    width: COVER_WIDTH,
    height: COVER_HEIGHT,
    borderRadius: radius.md,
  },
  placeholderCover: {
    width: COVER_WIDTH,
    height: COVER_HEIGHT,
    backgroundColor: homeColors.border,
    borderRadius: radius.md,
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
    fontFamily: fonts.serif,
    color: homeColors.textDark,
    lineHeight: textSizes.sm * 1.3,
  },
});

export default BookCard;
