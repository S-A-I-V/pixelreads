/**
 * Reader constants: themes, highlight colors, and font size steps.
 */

/** CSS-compatible theme objects for epub.js changeTheme() */
export const READER_THEMES = {
  light: {
    key: 'light',
    label: 'Light',
    icon: 'white-balance-sunny',
    bg: '#ffffff',
    text: '#1a1a1a',
    css: {
      body: { background: '#ffffff', color: '#1a1a1a' },
      p:    { color: '#1a1a1a' },
      '*':  { color: '#1a1a1a' },
    },
  },
  dark: {
    key: 'dark',
    label: 'Dark',
    icon: 'moon-waning-crescent',
    bg: '#1a1a2e',
    text: '#e0e0e0',
    css: {
      body: { background: '#1a1a2e !important', color: '#e0e0e0 !important' },
      p:    { color: '#e0e0e0 !important' },
      '*':  { color: '#e0e0e0 !important', background: 'transparent !important' },
    },
  },
  sepia: {
    key: 'sepia',
    label: 'Sepia',
    icon: 'book-open-variant',
    bg: '#f4ecd8',
    text: '#5c4b37',
    css: {
      body: { background: '#f4ecd8', color: '#5c4b37' },
      p:    { color: '#5c4b37' },
      '*':  { color: '#5c4b37' },
    },
  },
};

export const HIGHLIGHT_COLORS = [
  { color: '#ffeb3b', label: 'Yellow' },
  { color: '#4caf50', label: 'Green' },
  { color: '#2196f3', label: 'Blue' },
  { color: '#e91e63', label: 'Pink' },
  { color: '#ff9800', label: 'Orange' },
];

/** Font size percentage steps */
export const FONT_SIZE_STEPS = [80, 90, 100, 110, 120, 130, 140, 150];
