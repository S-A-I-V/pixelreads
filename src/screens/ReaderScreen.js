import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  ScrollView, TextInput, Dimensions, ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Reader, ReaderProvider, useReader } from '@epubjs-react-native/core';
import { useFileSystem } from '../utils/useFileSystem';
import { useEpubReaderStore } from '../features/reader';
import { useUserBookLibraryStore } from '../features/library';
import {
  trackReaderOpen,
  trackReaderClose,
  trackPageTurn,
  trackBookmark,
  trackHighlight,
  trackThemeChange,
  track,
  EventType,
  EventCategory,
} from '../utils/analytics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// CSS-compatible theme objects (what changeTheme() expects)
const THEMES = {
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

const HIGHLIGHT_COLORS = [
  { color: '#ffeb3b', label: 'Yellow' },
  { color: '#4caf50', label: 'Green' },
  { color: '#2196f3', label: 'Blue' },
  { color: '#e91e63', label: 'Pink' },
  { color: '#ff9800', label: 'Orange' },
];

const FONT_SIZES = [80, 90, 100, 110, 120, 130, 140, 150];

// ─── ReaderContent ────────────────────────────────────────────────────────────
function ReaderContent({ bookId, fileUri, book }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const {
    changeFontSize,
    changeTheme,
    goToLocation,
    getCurrentLocation,
    currentLocation,
    progress,
    isLoading,
    section,
    addAnnotation,
    annotations,
    addBookmark,
    removeBookmark,
    bookmarks,
    isBookmarked,
    search,
    clearSearchResults,
    toc,
  } = useReader();

  // Store
  const settings    = useEpubReaderStore((s) => s.settings);
  const updateSettings = useEpubReaderStore((s) => s.updateSettings);
  const saveLocation   = useEpubReaderStore((s) => s.saveLocation);
  const getReadingData = useEpubReaderStore((s) => s.getReadingData);
  const storeAddBookmark    = useEpubReaderStore((s) => s.addBookmark);
  const storeRemoveBookmark = useEpubReaderStore((s) => s.removeBookmark);
  const storeAddAnnotation  = useEpubReaderStore((s) => s.addAnnotation);
  const updateProgress = useUserBookLibraryStore((s) => s.updateBookReadingProgress);

  // UI state
  const [showUI,        setShowUI]        = useState(true);
  const [showTOC,       setShowTOC]       = useState(false);
  const [showSettings,  setShowSettings]  = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showSearch,    setShowSearch]    = useState(false);
  const [searchQuery,   setSearchQuery]   = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedText,  setSelectedText]  = useState(null);
  const [localLoading,  setLocalLoading]  = useState(true);
  const [tocData,       setTocData]       = useState([]);
  const readerOpenTime = useRef(Date.now());

  const theme = THEMES[settings.theme] || THEMES.light;

  // Track reader open
  useEffect(() => {
    readerOpenTime.current = Date.now();
    trackReaderOpen(bookId, book?.title);
    console.log(`[Reader] Opened: "${book?.title}"`);
    
    // Cleanup: track reader close
    return () => {
      const duration = Date.now() - readerOpenTime.current;
      trackReaderClose(bookId, duration, Math.round(progress));
      console.log(`[Reader] Closed: "${book?.title}" after ${Math.round(duration/1000)}s at ${Math.round(progress)}%`);
    };
  }, [bookId]);

  // Dismiss loading when ready
  useEffect(() => { if (!isLoading) setLocalLoading(false); }, [isLoading]);
  useEffect(() => {
    const t = setTimeout(() => setLocalLoading(false), 4000);
    return () => clearTimeout(t);
  }, []);

  // Restore last location
  useEffect(() => {
    const data = getReadingData(bookId);
    if (data?.location) {
      const t = setTimeout(() => goToLocation(data.location), 1500);
      return () => clearTimeout(t);
    }
  }, [bookId]);

  // Persist location + progress on every page turn
  const handleLocationChange = useCallback((total, loc) => {
    if (loc?.start?.cfi) {
      const pct = Math.round(progress);
      saveLocation(bookId, loc.start.cfi, pct);
      updateProgress(bookId, pct);
      // Track page turn (debounced by progress change)
      trackPageTurn(bookId, pct, 'forward');
    }
  }, [bookId, progress]);

  // Text selection → highlight menu
  const handleSelected = useCallback((cfiRange, text) => {
    if (text) setSelectedText({ cfiRange, text });
  }, []);

  // Add highlight
  const handleHighlight = useCallback((color) => {
    if (!selectedText) return;
    const annotation = { cfiRange: selectedText.cfiRange, data: { color }, styles: { color } };
    addAnnotation('highlight', selectedText.cfiRange, { color }, { color });
    storeAddAnnotation(bookId, { ...selectedText, color, type: 'highlight' });
    trackHighlight(bookId, color, selectedText.text?.length || 0);
    console.log(`[Reader] Highlight added (${color}): "${selectedText.text?.slice(0, 30)}..."`);
    setSelectedText(null);
  }, [selectedText, bookId]);

  // Toggle bookmark on current page
  const handleToggleBookmark = useCallback(() => {
    console.log('[Bookmark] currentLocation:', JSON.stringify(currentLocation));
    // The library's addBookmark needs the full currentLocation object
    // (it reads location.start.cfi and location.end.cfi inside a WebView injection)
    if (!currentLocation?.start?.cfi) {
      console.log('[Bookmark] No CFI available yet');
      return;
    }

    if (isBookmarked) {
      const bm = bookmarks?.find((b) =>
        b.location?.start?.cfi === currentLocation.start.cfi
      );
      if (bm) {
        removeBookmark(bm);
        storeRemoveBookmark(bookId, bm.id);
        trackBookmark(bookId, 'remove', currentLocation.start.cfi);
        console.log(`[Reader] Bookmark removed at ${Math.round(progress)}%`);
      }
    } else {
      // Pass the full location object — library needs start.cfi + end.cfi
      addBookmark(currentLocation);
      storeAddBookmark(bookId, {
        location: currentLocation.start.cfi,
        chapter: section?.label || '',
      });
      trackBookmark(bookId, 'add', currentLocation.start.cfi);
      console.log(`[Reader] Bookmark added at ${Math.round(progress)}%`);
    }
  }, [currentLocation, isBookmarked, bookmarks, section, bookId, progress]);

  // Search
  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) search(searchQuery);
  }, [searchQuery]);

  // ── LAYOUT: header + reader + footer stacked, NOT overlapping ──────────────
  const headerH  = insets.top + 52;
  const footerH  = insets.bottom + 52;
  const readerH  = SCREEN_HEIGHT - headerH - footerH;

  return (
    <View style={[styles.screen, { backgroundColor: theme.bg }]}>

      {/* ── HEADER ── */}
      <View style={[styles.header, { paddingTop: insets.top, height: headerH }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn} hitSlop={8}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={theme.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>
          {book?.title || 'Reading'}
        </Text>

        <TouchableOpacity onPress={() => setShowSearch(true)}  style={styles.iconBtn} hitSlop={8}>
          <MaterialCommunityIcons name="magnify" size={22} color={theme.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleToggleBookmark} style={styles.iconBtn} hitSlop={8}
          disabled={!currentLocation?.start?.cfi}
        >
          <MaterialCommunityIcons
            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={22}
            color={isBookmarked ? '#e94560' : theme.text}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowSettings(true)} style={styles.iconBtn} hitSlop={8}>
          <MaterialCommunityIcons name="cog" size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* ── READER ── */}
      <View style={{ width: SCREEN_WIDTH, height: readerH }}>
        <Reader
          src={fileUri}
          fileSystem={useFileSystem}
          width={SCREEN_WIDTH}
          height={readerH}
          enableSwipe={true}
          enableSelection={true}
          allowScriptedContent={true}
          defaultTheme={theme.css}
          flow={settings.flow || 'paginated'}
          initialAnnotations={annotations}
          onLocationChange={handleLocationChange}
          onSelected={(cfiRange, text) => handleSelected(cfiRange, text)}
          onPress={() => setShowUI((v) => !v)}
          onReady={() => setLocalLoading(false)}
          onDisplayError={(e) => { console.error('[Reader]', e); setLocalLoading(false); }}
          onRendered={() => setLocalLoading(false)}
          onNavigationLoaded={(nav) => {
            // nav.toc is the table of contents array
            if (Array.isArray(nav?.toc)) setTocData(nav.toc);
          }}
          onSearch={(results) => {
            // results is array of { cfi, excerpt }
            setSearchResults(Array.isArray(results) ? results : []);
          }}
        />
      </View>

      {/* ── FOOTER ── */}
      <View style={[styles.footer, { paddingBottom: insets.bottom, height: footerH }]}>
        <TouchableOpacity onPress={() => setShowTOC(true)} style={styles.tocBtn} hitSlop={8}>
          <MaterialCommunityIcons name="format-list-bulleted" size={18} color={theme.text} />
          <Text style={[styles.chapterLabel, { color: theme.text }]} numberOfLines={1}>
            {section?.label || 'Contents'}
          </Text>
        </TouchableOpacity>

        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.round(progress)}%` }]} />
          </View>
          <Text style={[styles.progressPct, { color: theme.text }]}>
            {Math.round(progress)}%
          </Text>
        </View>

        <TouchableOpacity onPress={() => setShowBookmarks(true)} style={styles.iconBtn} hitSlop={8}>
          <MaterialCommunityIcons name="bookmark-multiple-outline" size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* ── LOADING OVERLAY ── */}
      {localLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#e94560" />
          <Text style={styles.loadingText}>Opening book…</Text>
        </View>
      )}

      {/* ── HIGHLIGHT MENU (selection) ── */}
      {selectedText && (
        <View style={styles.highlightMenu}>
          <Text style={styles.highlightSnippet} numberOfLines={2}>
            "{selectedText.text}"
          </Text>
          <View style={styles.colorRow}>
            {HIGHLIGHT_COLORS.map((c) => (
              <TouchableOpacity
                key={c.color}
                style={[styles.colorDot, { backgroundColor: c.color }]}
                onPress={() => handleHighlight(c.color)}
              />
            ))}
            <TouchableOpacity style={styles.colorDot} onPress={() => setSelectedText(null)}>
              <MaterialCommunityIcons name="close" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── TOC MODAL ── */}
      <Modal visible={showTOC} animationType="slide" transparent statusBarTranslucent onRequestClose={() => setShowTOC(false)}>
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: theme.bg }]}>
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: theme.text }]}>Table of Contents</Text>
              <TouchableOpacity onPress={() => setShowTOC(false)}>
                <MaterialCommunityIcons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {(tocData.length > 0 ? tocData : (toc || [])).length === 0 ? (
                <Text style={[styles.emptyMsg, { color: theme.text }]}>No table of contents available.</Text>
              ) : (
                (tocData.length > 0 ? tocData : (toc || [])).map((item, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.tocRow}
                    onPress={() => { goToLocation(item.href); setShowTOC(false); }}
                  >
                    <MaterialCommunityIcons name="book-open-page-variant" size={16} color="#e94560" />
                    <Text style={[styles.tocLabel, { color: theme.text }]}>{item.label}</Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── SETTINGS MODAL ── */}
      <Modal visible={showSettings} animationType="slide" transparent statusBarTranslucent onRequestClose={() => setShowSettings(false)}>
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: theme.bg }]}>
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: theme.text }]}>Reading Settings</Text>
              <TouchableOpacity onPress={() => setShowSettings(false)}>
                <MaterialCommunityIcons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            {/* Font size */}
            <Text style={[styles.settingGroup, { color: theme.text }]}>Font Size</Text>
            <View style={styles.fontRow}>
              <TouchableOpacity
                style={styles.fontBtn}
                onPress={() => {
                  const idx = FONT_SIZES.indexOf(settings.fontSize);
                  if (idx > 0) {
                    const s = FONT_SIZES[idx - 1];
                    updateSettings({ fontSize: s });
                    changeFontSize(`${s}%`);
                    track(EventType.READER_FONT_SIZE_CHANGE, EventCategory.READER, { bookId, fontSize: s, direction: 'decrease' });
                    console.log(`[Reader] Font size decreased to ${s}%`);
                  }
                }}
              >
                <Text style={styles.fontBtnText}>A−</Text>
              </TouchableOpacity>
              <Text style={[styles.fontValue, { color: theme.text }]}>{settings.fontSize}%</Text>
              <TouchableOpacity
                style={styles.fontBtn}
                onPress={() => {
                  const idx = FONT_SIZES.indexOf(settings.fontSize);
                  if (idx < FONT_SIZES.length - 1) {
                    const s = FONT_SIZES[idx + 1];
                    updateSettings({ fontSize: s });
                    changeFontSize(`${s}%`);
                    track(EventType.READER_FONT_SIZE_CHANGE, EventCategory.READER, { bookId, fontSize: s, direction: 'increase' });
                    console.log(`[Reader] Font size increased to ${s}%`);
                  }
                }}
              >
                <Text style={styles.fontBtnText}>A+</Text>
              </TouchableOpacity>
            </View>

            {/* Theme */}
            <Text style={[styles.settingGroup, { color: theme.text }]}>Theme</Text>
            <View style={styles.themeRow}>
              {Object.values(THEMES).map((t) => (
                <TouchableOpacity
                  key={t.key}
                  style={[
                    styles.themeChip,
                    { backgroundColor: t.bg, borderColor: t.text },
                    settings.theme === t.key && styles.themeChipActive,
                  ]}
                  onPress={() => {
                    const prevTheme = settings.theme;
                    updateSettings({ theme: t.key });
                    changeTheme(t.css);
                    trackThemeChange(bookId, t.key, prevTheme);
                    console.log(`[Reader] Theme changed: ${prevTheme} → ${t.key}`);
                  }}
                >
                  <MaterialCommunityIcons name={t.icon} size={18} color={t.text} />
                  <Text style={[styles.themeLabel, { color: t.text }]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* ── BOOKMARKS MODAL ── */}
      <Modal visible={showBookmarks} animationType="slide" transparent statusBarTranslucent onRequestClose={() => setShowBookmarks(false)}>
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: theme.bg }]}>
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: theme.text }]}>Bookmarks</Text>
              <TouchableOpacity onPress={() => setShowBookmarks(false)}>
                <MaterialCommunityIcons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {(!bookmarks || bookmarks.length === 0) ? (
                <Text style={[styles.emptyMsg, { color: theme.text }]}>
                  No bookmarks yet.{'\n'}Tap the bookmark icon while reading to add one.
                </Text>
              ) : (
                bookmarks.map((bm, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.tocRow}
                    onPress={() => {
                      const cfi = bm.location?.start?.cfi ?? bm.location;
                      goToLocation(cfi);
                      setShowBookmarks(false);
                    }}
                  >
                    <MaterialCommunityIcons name="bookmark" size={16} color="#e94560" />
                    <Text style={[styles.tocLabel, { color: theme.text }]}>
                      {bm.chapter || `Bookmark ${i + 1}`}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── SEARCH MODAL ── */}
      <Modal visible={showSearch} animationType="slide" transparent statusBarTranslucent onRequestClose={() => setShowSearch(false)}>
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: theme.bg }]}>
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: theme.text }]}>Search in Book</Text>
              <TouchableOpacity onPress={() => { setShowSearch(false); clearSearchResults(); setSearchResults([]); }}>
                <MaterialCommunityIcons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchBar}>
              <TextInput
                style={[styles.searchInput, { color: theme.text, borderColor: theme.text + '44' }]}
                placeholder="Search…"
                placeholderTextColor="#888"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
                autoFocus
              />
              <TouchableOpacity style={styles.searchGoBtn} onPress={handleSearch}>
                <MaterialCommunityIcons name="magnify" size={22} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled">
              {searchResults.length === 0 ? (
                <Text style={[styles.emptyMsg, { color: theme.text }]}>
                  {searchQuery ? 'No results found.' : 'Type something to search.'}
                </Text>
              ) : (
                searchResults.map((r, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.searchResult}
                    onPress={() => { goToLocation(r.cfi); setShowSearch(false); }}
                  >
                    <Text style={[styles.searchExcerpt, { color: theme.text }]} numberOfLines={3}>
                      {r.excerpt}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

    </View>  // end screen
  );
}

// ─── ReaderScreen (shell) ─────────────────────────────────────────────────────
export default function ReaderScreen() {
  const route      = useRoute();
  const navigation = useNavigation();
  const insets     = useSafeAreaInsets();
  const { bookId } = route.params ?? {};

  const getBook        = useUserBookLibraryStore((s) => s.getBookById);
  const getUploadedFile = useEpubReaderStore((s) => s.getUploadedFile);

  const book     = getBook(bookId);
  const fileInfo = getUploadedFile(bookId);

  if (!fileInfo?.uri) {
    return (
      <View style={[styles.screen, styles.centered, { paddingTop: insets.top, backgroundColor: '#1a1a2e' }]}>
        <MaterialCommunityIcons name="book-off-outline" size={64} color="#555" />
        <Text style={styles.noFileTitle}>No E-Book File</Text>
        <Text style={styles.noFileMsg}>Import an EPUB from the book detail page first.</Text>
        <TouchableOpacity style={styles.goBackBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.goBackText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ReaderProvider>
      <ReaderContent bookId={bookId} fileUri={fileInfo.uri} book={book} />
    </ReaderProvider>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen:  { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 16 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.3)',
  },
  headerTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  iconBtn: { padding: 10, minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128,128,128,0.3)',
  },
  tocBtn:       { flexDirection: 'row', alignItems: 'center', gap: 4, maxWidth: '35%' },
  chapterLabel: { fontSize: 11 },
  progressRow:  { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  progressTrack:{ flex: 1, height: 3, backgroundColor: 'rgba(128,128,128,0.3)', borderRadius: 2 },
  progressFill: { height: '100%', backgroundColor: '#e94560', borderRadius: 2 },
  progressPct:  { fontSize: 11, minWidth: 32, textAlign: 'right' },

  // Loading
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
  },
  loadingText: { color: '#fff', fontSize: 16 },

  // Highlight menu
  highlightMenu: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    backgroundColor: '#2a2a4e',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  highlightSnippet: { color: '#ccc', fontSize: 13, fontStyle: 'italic' },
  colorRow:  { flexDirection: 'row', gap: 10, alignItems: 'center' },
  colorDot:  {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#555',
    justifyContent: 'center', alignItems: 'center',
  },

  // Bottom sheet (TOC / Settings / Bookmarks / Search)
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: {
    maxHeight: '75%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 32,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetTitle: { fontSize: 18, fontWeight: 'bold' },
  emptyMsg: { textAlign: 'center', marginTop: 32, fontSize: 14, opacity: 0.6, lineHeight: 22 },

  // TOC / Bookmarks rows
  tocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.2)',
  },
  tocLabel: { flex: 1, fontSize: 14 },

  // Settings
  settingGroup: { fontSize: 13, fontWeight: '600', marginBottom: 12, marginTop: 4, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 0.5 },
  fontRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24, marginBottom: 24 },
  fontBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#e94560',
    justifyContent: 'center', alignItems: 'center',
  },
  fontBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  fontValue: { fontSize: 18, fontWeight: '600', minWidth: 56, textAlign: 'center' },
  themeRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  themeChip: {
    flex: 1, paddingVertical: 12, borderRadius: 10,
    borderWidth: 1.5, alignItems: 'center', gap: 6,
  },
  themeChipActive: { borderColor: '#e94560', borderWidth: 2.5 },
  themeLabel: { fontSize: 11, fontWeight: '600' },

  // Search
  searchBar: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  searchInput: {
    flex: 1, borderWidth: 1, borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 15,
  },
  searchGoBtn: {
    width: 48, height: 48, borderRadius: 8,
    backgroundColor: '#e94560',
    justifyContent: 'center', alignItems: 'center',
  },
  searchResult: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.2)',
  },
  searchExcerpt: { fontSize: 13, lineHeight: 20 },

  // No-file screen
  noFileTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  noFileMsg:   { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 22 },
  goBackBtn: {
    backgroundColor: '#e94560',
    paddingHorizontal: 28, paddingVertical: 13,
    borderRadius: 8, marginTop: 8,
  },
  goBackText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
