import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

const DEFAULT_SIZE = 24;
const STROKE_WIDTH = 1.8;

/**
 * Modern search icon — clean circle with angled handle.
 * Distinctive: slightly larger lens, slim handle.
 */
export function SearchIcon({ size = DEFAULT_SIZE, color = '#000000' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle
        cx={11}
        cy={11}
        r={7}
        stroke={color}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
      />
      <Path
        d="M16.5 16.5L20.5 20.5"
        stroke={color}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default SearchIcon;
