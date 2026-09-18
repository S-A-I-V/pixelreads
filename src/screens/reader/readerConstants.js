/**
 * Reader constants: themes, highlight colors, font size steps, and retro UI config.
 *
 * READER_THEMES provide both the epub.js CSS injection AND the UI chrome colors.
 * The `chrome` property defines colors for the header/footer/modals around the reader.
 *
 * All three themes must pass 4.5:1 contrast on text and be visually complete
 * so no hardcoded #FFFFFF/#000000 is needed in components.
 */

import { homeColors } from '../../theme';

// ─── Reader Themes ────────────────────────────────────────────────────────────

export const READER_THEMES = {
  light: {
    key: 'light',
    label: 'Light',
    icon: 'white-balance-sunny',
    bg: '#ffffff',
    text: '#1a1a1a',
    css: {
      html: { background: '#ffffff' },
      body: { background: '#ffffff', color: '#1a1a1a' },
      p:    { color: '#1a1a1a' },
      span: { color: '#1a1a1a' },
      div:  { color: '#1a1a1a' },
      h1:   { color: '#1a1a1a' },
      h2:   { color: '#1a1a1a' },
      h3:   { color: '#1a1a1a' },
      a:    { color: '#3B82F6' },
    },
    chrome: {
      bg: homeColors.bgCard,           // #C8B6FF lavender
      text: '#000000',
      border: '#000000',
      accent: '#FBCA1F',
      accentText: '#000000',
      contentBg: '#FFFFFF',
      btnBg: '#FFFFFF',                // button background
      dimText: '#4A4A4A',
      shadow: '#000000',
      searchBtnBg: '#3B82F6',
      searchBtnIcon: '#FFFFFF',
      bookmarkBtnBg: '#F15BB5',
      bookmarkBtnIcon: '#FFFFFF',
      settingsBtnBg: '#FBCA1F',
      settingsBtnIcon: '#000000',
    },
  },
  dark: {
    key: 'dark',
    label: 'Dark',
    icon: 'moon-waning-crescent',
    bg: '#1a1a2e',
    text: '#e0e0e0',
    css: {
      html: { background: '#1a1a2e !important' },
      body: { background: '#1a1a2e !important', color: '#e0e0e0 !important' },
      p:    { color: '#e0e0e0 !important' },
      span: { color: '#e0e0e0 !important' },
      div:  { color: '#e0e0e0 !important' },
      h1:   { color: '#e0e0e0 !important' },
      h2:   { color: '#e0e0e0 !important' },
      h3:   { color: '#e0e0e0 !important' },
      a:    { color: '#8888CC !important' },
    },
    chrome: {
      bg: '#1E1E3A',                   // deep navy chrome
      text: '#E8E8F0',                 // bright text for contrast
      border: '#4A4A6A',               // visible but not harsh border
      accent: '#FBCA1F',
      accentText: '#000000',
      contentBg: '#2A2A4A',            // modal/dropdown content bg
      btnBg: '#2E2E50',               // button bg — lifted off the chrome bg
      dimText: '#9999BB',
      shadow: '#000000',
      searchBtnBg: '#3B82F6',
      searchBtnIcon: '#FFFFFF',
      bookmarkBtnBg: '#D946A8',        // slightly muted pink for dark
      bookmarkBtnIcon: '#FFFFFF',
      settingsBtnBg: '#FBCA1F',
      settingsBtnIcon: '#000000',
    },
  },
  sepia: {
    key: 'sepia',
    label: 'Sepia',
    icon: 'book-open-variant',
    bg: '#f4ecd8',
    text: '#5c4b37',
    css: {
      html: { background: '#f4ecd8' },
      body: { background: '#f4ecd8', color: '#5c4b37' },
      p:    { color: '#5c4b37' },
      span: { color: '#5c4b37' },
      div:  { color: '#5c4b37' },
      h1:   { color: '#5c4b37' },
      h2:   { color: '#5c4b37' },
      h3:   { color: '#5c4b37' },
      a:    { color: '#7A5C3A' },
    },
    chrome: {
      bg: '#D4C4A0',                   // warm tan chrome
      text: '#2C2010',                 // dark brown for contrast
      border: '#5C4B37',               // warm dark brown border
      accent: '#FBCA1F',
      accentText: '#000000',
      contentBg: '#F4ECD8',            // warm cream content
      btnBg: '#EDE0C8',               // warm off-white button
      dimText: '#7A6B55',
      shadow: '#3A2F20',
      searchBtnBg: '#3B82F6',
      searchBtnIcon: '#FFFFFF',
      bookmarkBtnBg: '#D946A8',
      bookmarkBtnIcon: '#FFFFFF',
      settingsBtnBg: '#FBCA1F',
      settingsBtnIcon: '#000000',
    },
  },
};

// ─── Highlight Colors ─────────────────────────────────────────────────────────

export const HIGHLIGHT_COLORS = [
  { color: '#FBCA1F', label: 'Yellow' },
  { color: '#10B981', label: 'Green'  },
  { color: '#3B82F6', label: 'Blue'   },
  { color: '#F15BB5', label: 'Pink'   },
  { color: '#FF9F1C', label: 'Orange' },
];

// ─── Font Size Steps ──────────────────────────────────────────────────────────

export const FONT_SIZE_STEPS = [80, 90, 100, 110, 120, 130, 140, 150];
