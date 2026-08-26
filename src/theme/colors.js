/**
 * Design System Color Tokens
 *
 * Modern palette with Electric Indigo accent.
 * homeColors is the primary token set used across Home, Library, Search, Profile, and Detail screens.
 */

// Legacy dark theme (used by pixel/retro screens, reader, etc.)
export const colors = {
  bgPrimary: '#090D16',
  bgSecondary: '#151C2C',
  bgElevated: '#1B2336',
  bgOverlay: 'rgba(9, 13, 22, 0.7)',
  border: '#232D42',
  borderLight: '#2E3A52',
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textDim: '#475569',
  accent: '#6366F1',
  accentLight: 'rgba(99, 102, 241, 0.12)',
  success: '#10B981',
  info: '#3B82F6',
  warning: '#F59E0B',
  error: '#EF4444',
  purple: '#8B5CF6',
  linkText: '#818CF8',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

// Primary design tokens — Y2K / Neubrutalist OS aesthetic
export const homeColors = {
  // Surfaces
  bgMain: '#00A896',        // Grid Teal — primary canvas
  bgCard: '#C8B6FF',        // Soft Lavender — window/card surfaces
  bgElevated: '#E8DEFF',    // Lighter lavender for elevated panels
  bgOverlay: 'rgba(0, 168, 150, 0.92)',
  bgSubtle: '#B8A4F0',      // Muted lavender for subtle backgrounds
  bgWindow: '#FFFFFF',      // White interior for window content areas

  // Accent system — Retro Amber + Neon Magenta
  accent: '#FF9F1C',        // Retro Amber — primary CTA
  accentLight: 'rgba(255, 159, 28, 0.15)',
  accentMedium: 'rgba(255, 159, 28, 0.3)',
  accentDark: '#E8880A',    // Darker amber for pressed states
  accentPurple: '#C8B6FF',  // Lavender (compat alias)
  accentPink: '#F15BB5',    // Neon Magenta — badges, favorites, active highlights

  // Text hierarchy
  textDark: '#000000',      // Pure black for max contrast
  textBody: '#1A1A1A',      // Near-black for body
  textCaption: '#4A4A4A',   // Dark gray for captions (high contrast on lavender)
  textOnAccent: '#000000',  // Black text on amber buttons
  textOnTeal: '#FFFFFF',    // White text on teal background
  textWindow: '#000000',    // Black text inside windows

  // Borders — thick, deliberate, neubrutalist
  border: '#000000',        // Pure black 3-4px borders
  borderSubtle: '#000000',  // All borders are intentional and black

  // Shadows — hard offset, no blur
  shadow: '#000000',
  shadowMedium: '#000000',
  shadowStrong: '#000000',
  shadowAccent: '#000000',

  // Navigation
  navBg: '#C8B6FF',         // Lavender taskbar
  navActive: '#F15BB5',     // Neon Magenta active tab
  navInactive: '#000000',   // Black inactive icons
  navGlow: 'rgba(241, 91, 181, 0.3)',

  // Status
  success: '#10B981',
  warning: '#FF9F1C',       // Amber doubles as warning
  error: '#EF4444',

  // Legacy compat aliases
  gradientStart: '#FF9F1C',
  gradientEnd: '#F15BB5',
  textOnGradient: '#000000',
  navCenterBtn: '#000000',
  bgMain_old: '#00A896',
};

// Retro pixel theme (for pixel-art features, reader, etc.)
export const pixelColors = {
  pinkHot: '#FF0099',
  pinkNeon: '#FF33CC',
  pinkLight: '#FF99DD',
  pinkPale: '#FFCCEE',
  pinkDark: '#CC0077',
  bgDark: '#1A0020',
  bgMid: '#2D0040',
  bgPanel: '#3D0055',
  bgCard: '#2A0038',
  textMain: '#FFFFFF',
  textDim: '#CC99BB',
  textMuted: '#8855AA',
  yellow: '#FFFF00',
  cyan: '#00FFFF',
  green: '#00AA44',
  greenDark: '#007733',
  blue: '#0055FF',
  red: '#CC0000',
  redDark: '#880000',
  shelfReading: '#6366F1',
  shelfWant: '#EC4899',
  shelfFinished: '#10B981',
  shelfDnf: '#EF4444',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};
