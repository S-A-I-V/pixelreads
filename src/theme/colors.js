/**
 * App color tokens.
 * 
 * Two palettes:
 * - `colors` (default): modern dark theme used by screens
 * - `pixelColors`: neon/retro palette for pixel-themed components
 */

// ─── Modern Dark Palette (used by all screens) ───────────────────────────────
export const colors = {
  // Backgrounds
  bgPrimary:   '#1a1a2e',
  bgSecondary: '#2a2a4e',
  bgElevated:  '#222244',
  bgOverlay:   'rgba(0,0,0,0.6)',

  // Borders
  border:      '#333',
  borderLight: '#444',

  // Text
  textPrimary:   '#fff',
  textSecondary: '#ccc',
  textMuted:     '#888',
  textDim:       '#666',

  // Brand / Accent
  accent:       '#e94560',
  accentLight:  'rgba(233, 69, 96, 0.1)',

  // Semantic
  success:      '#16a34a',
  info:         '#2563eb',
  warning:      '#FFD700',
  error:        '#ff6b6b',
  purple:       '#7c3aed',

  // Interactive
  linkText:     '#e94560',

  // Misc
  white:        '#fff',
  black:        '#000',
  transparent:  'transparent',
};

// ─── Retro/Pixel Palette (for pixel-themed components) ───────────────────────
export const pixelColors = {
  pinkHot:   '#FF0099',
  pinkNeon:  '#FF33CC',
  pinkLight: '#FF99DD',
  pinkPale:  '#FFCCEE',
  pinkDark:  '#CC0077',

  bgDark:    '#1A0020',
  bgMid:     '#2D0040',
  bgPanel:   '#3D0055',
  bgCard:    '#2A0038',

  textMain:  '#FFFFFF',
  textDim:   '#CC99BB',
  textMuted: '#8855AA',

  yellow:    '#FFFF00',
  cyan:      '#00FFFF',
  green:     '#00AA44',
  greenDark: '#007733',
  blue:      '#0055FF',
  red:       '#CC0000',
  redDark:   '#880000',

  shelfReading:  '#0055FF',
  shelfWant:     '#FF0099',
  shelfFinished: '#00AA44',
  shelfDnf:      '#AA2200',

  white:       '#FFFFFF',
  black:       '#000000',
  transparent: 'transparent',
};
