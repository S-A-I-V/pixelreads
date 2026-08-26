import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { homeColors, spacing, borderWidth } from '../../theme';
import { NeuShadow } from '../ui/NeuShadow';

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

export function CategoryCard({ name, onPress, size = 'standard' }) {
  const isCompact = size === 'compact';
  const cardWidth = isCompact ? CARD_COMPACT_WIDTH : CARD_WIDTH;
  const cardHeight = isCompact ? CARD_COMPACT_HEIGHT : CARD_HEIGHT;
  const imageSource = CATEGORY_IMAGES[name];

  return (
    <TouchableOpacity
      style={{ width: cardWidth + 3, height: cardHeight + 3 }}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityLabel={`${name} category`}
      accessibilityRole="button"
    >
      <NeuShadow offset={3}>
        <View style={[styles.container, { width: cardWidth, height: cardHeight }]}>
          <View style={[styles.imageWrapper, { width: cardWidth - (borderWidth.pixel * 2), height: cardHeight - (borderWidth.pixel * 2) }]}>
            {imageSource ? (
              <Image
                source={imageSource}
                style={[styles.image, { width: cardWidth - (borderWidth.pixel * 2), height: cardHeight - (borderWidth.pixel * 2) }]}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.placeholder, { width: cardWidth - (borderWidth.pixel * 2), height: cardHeight - (borderWidth.pixel * 2) }]} />
            )}
          </View>
        </View>
      </NeuShadow>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: borderWidth.pixel,
    borderColor: homeColors.border,
    backgroundColor: homeColors.bgCard,
  },
  imageWrapper: {
    overflow: 'hidden',
    backgroundColor: homeColors.bgElevated,
  },
  image: {},
  placeholder: {
    backgroundColor: homeColors.bgElevated,
  },
});

export default CategoryCard;
