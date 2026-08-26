/**
 * Typography Design Tokens
 *
 * Y2K / Neubrutalist OS type system.
 * Headers & accents: Silkscreen / VT323 (retro pixel flavor)
 * Body & book titles: Space Mono / JetBrains Mono (clean monospace readability)
 * Pixel font preserved for badges and micro-labels.
 */

export const fonts = {
  pixel: 'PressStart2P',      // Micro-labels, badges, XP counters
  heading: 'VT323',           // Window titles, section headers, retro accents
  body: 'SpaceMono',          // Body text, book titles, readable monospace
  bodyBold: 'SpaceMono-Bold', // Bold variant — use instead of fontWeight on Android
  mono: 'SpaceMono',          // Code-style elements, metadata
  system: undefined,           // Fallback to platform default
  serif: 'SpaceMono',         // Override: monospace replaces serif for consistency
};

export const textSizes = {
  xxs: 10,
  xs: 11,
  sm: 13,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  h3: 22,
  h2: 26,
  h1: 30,
  hero: 36,
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
  loose: 1.8,
};

export const fontWeights = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

/**
 * Letter spacing tokens — wider tracking for retro/pixel fonts,
 * tighter for monospace body to keep density readable.
 */
export const letterSpacing = {
  tight: -0.3,
  normal: 0,
  wide: 0.5,
  wider: 1.0,
  retro: 1.5,   // For pixel font headers
};
