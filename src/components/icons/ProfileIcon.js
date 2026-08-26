import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

const DEFAULT_SIZE = 24;
const STROKE_WIDTH = 1.8;

/**
 * Modern profile icon — minimal avatar with rounded shoulders.
 * Distinctive: no enclosing circle, just head + shoulders silhouette.
 */
export function ProfileIcon({ size = DEFAULT_SIZE, color = '#000000' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle
        cx={12}
        cy={8}
        r={4}
        stroke={color}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
      />
      <Path
        d="M4 21C4 17.134 7.58172 14 12 14C16.4183 14 20 17.134 20 21"
        stroke={color}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default ProfileIcon;
