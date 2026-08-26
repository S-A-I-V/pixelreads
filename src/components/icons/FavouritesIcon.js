import React from 'react';
import Svg, { Path } from 'react-native-svg';

const DEFAULT_SIZE = 24;
const STROKE_WIDTH = 1.8;

/**
 * Modern favourites/heart icon — smooth bezier heart.
 * Consistent stroke style with rounded joins.
 */
export function FavouritesIcon({ size = DEFAULT_SIZE, color = '#000000' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 20.5L10.55 19.19C5.4 14.52 2 11.44 2 7.69C2 4.61 4.42 2.19 7.5 2.19C9.24 2.19 10.91 3.01 12 4.28C13.09 3.01 14.76 2.19 16.5 2.19C19.58 2.19 22 4.61 22 7.69C22 11.44 18.6 14.52 13.45 19.19L12 20.5Z"
        stroke={color}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default FavouritesIcon;
