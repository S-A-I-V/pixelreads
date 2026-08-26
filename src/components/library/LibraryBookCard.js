import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { homeColors, spacing, borderWidth, textSizes, fonts } from '../../theme';
import { LibraryIcon } from '../icons';
import { NeuShadow } from '../ui/NeuShadow';
import { ProgressBar } from '../ui/ProgressBar';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_GAP = spacing.md;
const GRID_PADDING = spacing.md;
const CARD_WIDTH = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP) / 2;
const COVER_HEIGHT = CARD_WIDTH * 1.2;

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
      <NeuShadow offset={3}>
        <View style={styles.cardFrame}>
          <View style={styles.coverContainer}>
            {book.thumbnail ? (
              <Image source={{ uri: book.thumbnail }} style={styles.coverImage} resizeMode="cover" />
            ) : (
              <View style={styles.placeholderCover}>
                <LibraryIcon size={24} color={homeColors.textDark} />
              </View>
            )}
            {showProgress && (
              <View style={styles.progressOverlay}>
                <ProgressBar progress={book.progress} height={4} trackColor="rgba(0,0,0,0.3)" fillColor="#FBCA1F" />
              </View>
            )}
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.title} numberOfLines={2}>{book.title}</Text>
            <Text style={styles.author} numberOfLines={1}>{book.authors?.join(', ') || 'Unknown'}</Text>
          </View>
        </View>
      </NeuShadow>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginBottom: spacing.md,
  },
  cardFrame: {
    borderWidth: borderWidth.pixel,
    borderColor: homeColors.border,
    backgroundColor: homeColors.bgCard,
  },
  coverContainer: {
    width: '100%',
    height: COVER_HEIGHT,
    overflow: 'hidden',
    backgroundColor: homeColors.bgElevated,
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
    padding: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  infoContainer: {
    borderTopWidth: borderWidth.normal,
    borderTopColor: homeColors.border,
    padding: spacing.xs,
    backgroundColor: '#FFFFFF',
    height: 46,
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: textSizes.xxs,
    color: '#000000',
    lineHeight: textSizes.xxs * 1.4,
  },
  author: {
    fontFamily: fonts.body,
    fontSize: 9,
    color: homeColors.textCaption,
    marginTop: 1,
  },
});

export default LibraryBookCard;
