/**
 * Typography Design Tokens
 *
 * Clean modern type scale with strict hierarchy.
 * Uses system font stack for crisp rendering; serif for display headings.
 */

export const fonts = {
  pixel: 'PressStart2P',
  system: undefined, // uses platform default (SF Pro / Roboto)
  serif: 'serif',
  mono: 'monospace',
};

export const textSizes = {
  xxs: 10,
  xs: 11,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  h3: 22,
  h2: 24,
  h1: 28,
  hero: 32,
};

export const pixelTextSizes = {
  xxs: 7,
  xs: 8,
  sm: 9,
  md: 10,
  lg: 12,
  xl: 14,
  xxl: 18,
  hero: 24,
};

export const lineHeights = {
  tight: 1.2,
  snug: 1.35,
  normal: 1.5,
  relaxed: 1.6,
  loose: 2.0,
};

export const fontWeights = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

/**
 * Letter spacing tokens for micro-labels and uppercase text.
 */
export const letterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1.0,
};
