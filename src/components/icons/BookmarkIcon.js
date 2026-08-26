import React from 'react';
import Svg, { Path } from 'react-native-svg';

const DEFAULT_SIZE = 24;
const STROKE_WIDTH = 1.8;

/**
 * Modern bookmark icon — ribbon/flag style.
 * Clean outline, no fill, consistent with other icons.
 */
export function BookmarkIcon({ size = DEFAULT_SIZE, color = '#000000' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 4C5 3.44772 5.44772 3 6 3H18C18.5523 3 19 3.44772 19 4V21L12 17L5 21V4Z"
        stroke={color}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default BookmarkIcon;
