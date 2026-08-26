/**
 * Layout Spacing, Radius, Border, and Elevation Tokens.
 */

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

export const radius = {
  none: 0,
  xs: 0,
  sm: 2,
  md: 4,
  lg: 4,
  xl: 6,
  xxl: 8,
  pill: 4,    // Neubrutalist: no pills, keep slightly rounded at most
  full: 9999, // Preserved for circular avatars only
};

export const borderWidth = {
  thin: 1,
  normal: 2,
  thick: 3,
  pixel: 3,   // Standard neubrutalist border
  chunky: 4,  // Extra emphasis borders
};

/**
 * Elevation presets — iOS shadow properties only.
 * On Android, use <NeuShadow> wrapper for hard offset shadows.
 * Use these as spread styles on iOS: { ...elevation.sm }
 */
export const elevation = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  accent: {
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
};
