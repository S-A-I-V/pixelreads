/**
 * =========================================================================
 *  Reader Types
 * =========================================================================
 *
 *  Type definitions for the EPUB reader functionality including
 *  settings, bookmarks, annotations, and reading progress.
 *
 * =========================================================================
 */

/**
 * Reader theme keys
 */
export type EpubReaderThemeKey = 'light' | 'dark' | 'sepia';

/**
 * Reader flow/pagination mode
 */
export type EpubReaderFlowMode = 'paginated' | 'scrolled';

/**
 * Font family options for reader
 */
export type EpubReaderFontFamily = 'default' | 'serif' | 'sans-serif' | 'monospace';

/**
 * Reader theme configuration
 */
export interface EpubReaderThemeConfiguration {
  /** Theme identifier */
  readonly key: EpubReaderThemeKey;
  
  /** Display label */
  readonly label: string;
  
  /** MaterialCommunityIcons icon name */
  readonly iconName: string;
  
  /** Background color (hex) */
  readonly backgroundColor: string;
  
  /** Text color (hex) */
  readonly textColor: string;
  
  /** CSS styles for EPUB rendering */
  readonly cssStyles: EpubReaderCssThemeStyles;
}

/**
 * CSS theme styles for EPUB webview injection
 */
export interface EpubReaderCssThemeStyles {
  body: { background: string; color: string };
  p: { color: string };
  '*': { color: string; background?: string };
}

/**
 * User reader settings (persisted)
 */
export interface EpubReaderUserSettings {
  /** Active theme */
  theme: EpubReaderThemeKey;
  
  /** Font size percentage (80-150) */
  fontSize: number;
  
  /** Font family selection */
  fontFamily: EpubReaderFontFamily;
  
  /** Line height multiplier */
  lineHeight: number;
  
  /** Pagination mode */
  flow: EpubReaderFlowMode;
}

/**
 * Bookmark entry
 */
export interface EpubBookmarkEntry {
  /** Unique bookmark ID */
  readonly id: string;
  
  /** EPUB CFI location string */
  readonly location: string;
  
  /** Chapter/section label */
  readonly chapter: string;
  
  /** ISO timestamp when created */
  readonly createdAt: string;
}

/**
 * Text annotation (highlight/note)
 */
export interface EpubTextAnnotationEntry {
  /** Unique annotation ID */
  readonly id: string;
  
  /** EPUB CFI range */
  readonly cfiRange: string;
  
  /** Selected text content */
  readonly text: string;
  
  /** Highlight color (hex) */
  readonly color: string;
  
  /** Annotation type */
  readonly type: 'highlight' | 'note';
  
  /** Optional note text */
  readonly note?: string;
  
  /** ISO timestamp when created */
  readonly createdAt: string;
}

/**
 * Highlight color option
 */
export interface EpubHighlightColorOption {
  /** Color value (hex) */
  readonly color: string;
  
  /** Color display name */
  readonly label: string;
}

/**
 * Reading session data per book
 */
export interface EpubBookReadingSessionData {
  /** Last CFI location */
  location: string | null;
  
  /** Reading progress percentage */
  progress: number;
  
  /** ISO timestamp of last read */
  lastReadAt: string | null;
  
  /** Saved bookmarks */
  bookmarks: EpubBookmarkEntry[];
  
  /** Saved annotations */
  annotations: EpubTextAnnotationEntry[];
}

/**
 * Uploaded EPUB file metadata
 */
export interface EpubUploadedFileMetadata {
  /** File system URI */
  readonly uri: string;
  
  /** Original file name */
  readonly fileName: string;
  
  /** File size in bytes */
  readonly fileSize: number;
  
  /** ISO timestamp when imported */
  readonly importedAt: string;
}

/**
 * Table of contents entry from EPUB
 */
export interface EpubTableOfContentsEntry {
  /** Chapter label */
  readonly label: string;
  
  /** EPUB href for navigation */
  readonly href: string;
  
  /** Nested sub-items (optional) */
  readonly subitems?: ReadonlyArray<EpubTableOfContentsEntry>;
}

/**
 * Search result from within EPUB
 */
export interface EpubSearchResultEntry {
  /** CFI location of match */
  readonly cfi: string;
  
  /** Text excerpt containing match */
  readonly excerpt: string;
}

/**
 * Available font sizes for reader
 */
export const EPUB_READER_FONT_SIZE_OPTIONS = [80, 90, 100, 110, 120, 130, 140, 150] as const;
export type EpubReaderFontSizeValue = typeof EPUB_READER_FONT_SIZE_OPTIONS[number];

/**
 * Props for reader content component
 */
export interface EpubReaderContentComponentProps {
  /** Book ID for data lookup */
  readonly bookId: string;
  
  /** Local file URI */
  readonly fileUri: string;
  
  /** Book metadata */
  readonly bookMetadata: {
    readonly title: string;
  } | null;
}
