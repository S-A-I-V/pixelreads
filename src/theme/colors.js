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

// Primary design tokens — modern light surfaces with Electric Indigo
export const homeColors = {
  // Surfaces
  bgMain: '#FAFBFE',
  bgCard: '#FFFFFF',
  bgElevated: '#F1F3F9',
  bgOverlay: 'rgba(250, 251, 254, 0.95)',
  bgSubtle: '#F5F6FA',

  // Accent system — Electric Indigo
  accent: '#6366F1',
  accentLight: 'rgba(99, 102, 241, 0.08)',
  accentMedium: 'rgba(99, 102, 241, 0.15)',
  accentDark: '#4F46E5',
  accentPurple: '#6366F1',
  accentPink: '#EC4899',

  // Text hierarchy
  textDark: '#0F172A',
  textBody: '#334155',
  textCaption: '#94A3B8',
  textOnAccent: '#FFFFFF',

  // Borders — subtle, semi-transparent
  border: '#E2E8F0',
  borderSubtle: 'rgba(148, 163, 184, 0.2)',

  // Shadows
  shadow: 'rgba(15, 23, 42, 0.04)',
  shadowMedium: 'rgba(15, 23, 42, 0.08)',
  shadowStrong: 'rgba(15, 23, 42, 0.12)',
  shadowAccent: 'rgba(99, 102, 241, 0.2)',

  // Navigation
  navBg: 'rgba(255, 255, 255, 0.95)',
  navActive: '#6366F1',
  navInactive: '#94A3B8',
  navGlow: 'rgba(99, 102, 241, 0.25)',

  // Status
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',

  // Legacy compat aliases
  gradientStart: '#6366F1',
  gradientEnd: '#818CF8',
  textOnGradient: '#FFFFFF',
  navCenterBtn: '#0F172A',
  bgMain_old: '#F8F6FF',
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
