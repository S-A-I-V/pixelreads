import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { homeColors, spacing, radius, fontWeights, fonts } from '../../theme';

const CATEGORY_IMAGES = {
  'Personal development': require('../../../assets/images/categories/personal-development.png'),
  Romance: require('../../../assets/images/categories/romance.png'),
  Fiction: require('../../../assets/images/categories/fiction.png'),
  'Science Fiction': require('../../../assets/images/categories/science-fiction.png'),
  Mystery: require('../../../assets/images/categories/mystery.png'),
  Fantasy: require('../../../assets/images/categories/fantasy.png'),
};

const CARD_WIDTH = 220;
const CARD_HEIGHT = 140;
const CARD_COMPACT_WIDTH = 180;
const CARD_COMPACT_HEIGHT = 120;
const LABEL_FONT_SIZE = 15;

export function CategoryCard({ name, onPress, size = 'standard' }) {
  const isCompact = size === 'compact';
  const cardWidth = isCompact ? CARD_COMPACT_WIDTH : CARD_WIDTH;
  const cardHeight = isCompact ? CARD_COMPACT_HEIGHT : CARD_HEIGHT;
  const imageSource = CATEGORY_IMAGES[name];

  return (
    <TouchableOpacity
      style={[styles.container, { width: cardWidth }]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityLabel={`${name} category`}
      accessibilityRole="button"
    >
      <View style={[styles.imageWrapper, { width: cardWidth, height: cardHeight }]}>
        {imageSource ? (
          <Image
            source={imageSource}
            style={[styles.image, { width: cardWidth, height: cardHeight }]}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.placeholder, { width: cardWidth, height: cardHeight }]} />
        )}
      </View>

      <Text style={styles.categoryName} numberOfLines={1}>
        {name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  imageWrapper: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: homeColors.border,
    shadowColor: homeColors.shadowStrong,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
  image: {
    borderRadius: radius.lg,
  },
  placeholder: {
    backgroundColor: homeColors.border,
  },
  categoryName: {
    fontSize: LABEL_FONT_SIZE,
    fontWeight: fontWeights.semibold,
    fontFamily: fonts.serif,
    color: homeColors.textDark,
    textAlign: 'center',
  },
});

export default CategoryCard;
