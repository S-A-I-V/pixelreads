import React from 'react';
import Svg, { Path } from 'react-native-svg';

const DEFAULT_SIZE = 24;
const STROKE_WIDTH = 1.8;

/**
 * Modern library icon — open book with pages.
 * Distinctive: spread pages with center spine.
 */
export function LibraryIcon({ size = DEFAULT_SIZE, color = '#000000' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 6.5C12 6.5 9.5 4 5.5 4C4.5 4 3 4.5 3 4.5V18.5C3 18.5 4.5 18 5.5 18C9.5 18 12 20 12 20"
        stroke={color}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 6.5C12 6.5 14.5 4 18.5 4C19.5 4 21 4.5 21 4.5V18.5C21 18.5 19.5 18 18.5 18C14.5 18 12 20 12 20"
        stroke={color}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 6.5V20"
        stroke={color}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default LibraryIcon;
