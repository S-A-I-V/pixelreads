import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Reader, ReaderProvider, useReader } from '@epubjs-react-native/core';
import { useFileSystem } from '../utils/useFileSystem';
import { useEpubReaderStore } from '../features/reader/store/epubReaderStore';
import { useUserBookLibraryStore } from '../features/library/store/userBookLibraryStore';
import {
  trackReaderOpen, trackReaderClose, trackPageTurn, trackBookmark,
  trackThemeChange, track, EventType, EventCategory,
} from '../utils/analytics';
import { homeColors, spacing, borderWidth, textSizes } from '../theme';

import { READER_THEMES, FONT_SIZE_STEPS } from './reader/readerConstants';
import { ReaderHeader } from './reader/ReaderHeader';
import { ReaderFooter } from './reader/ReaderFooter';
import { TOCModal, SettingsModal, BookmarksModal, SearchModal } from './reader/ReaderModals';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── Reader Content (inner, uses useReader hook) ─────────────────────────────

function ReaderContent({ bookId, fileUri, book }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // epub.js hook
  const {
    changeFontSize, changeTheme, goToLocation, currentLocation,
    isLoading, section, annotations,
    addBookmark, removeBookmark, bookmarks, isBookmarked,
    search, clearSearchResults, toc, injectJavascript,
    goNext, goPrevious,
  } = useReader();

  // Reader store
  const settings = useEpubReaderStore((s) => s.settings);
  const updateSettings = useEpubReaderStore((s) => s.updateSettings);
  const saveLocation = useEpubReaderStore((s) => s.saveLocation);
  const getReadingData = useEpubReaderStore((s) => s.getReadingData);
  const addReadingTime = useEpubReaderStore((s) => s.addReadingTime);
  const updatePageInfo = useEpubReaderStore((s) => s.updatePageInfo);
  const storeAddBookmark = useEpubReaderStore((s) => s.addBookmark);
  const storeRemoveBookmark = useEpubReaderStore((s) => s.removeBookmark);

  // Library store
  const updateBookPageInfo = useUserBookLibraryStore((s) => s.updateBookPageInfo);
  const saveBookReadingPosition = useUserBookLibraryStore((s) => s.saveBookReadingPosition);

  // Initialize from saved data
  const savedData = getReadingData(bookId);
  const [totalPages, setTotalPages] = useState(savedData.totalPages || 0);
  const [currentPage, setCurrentPage] = useState(savedData.currentPage || 0);
  const [displayProgress, setDisplayProgress] = useState(savedData.progress || 0);
  const lastSavedProgress = useRef(savedData.progress || 0);

  const [showUI, setShowUI] = useState(true);
  const [showTOC, setShowTOC] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [localLoading, setLocalLoading] = useState(true);
  const [tocData, setTocData] = useState([]);

  const readerOpenTime = useRef(Date.now());
  const mountTime = useRef(Date.now());

  // Active theme
  const theme = READER_THEMES[settings.theme] || READER_THEMES.light;

  // Show loading overlay during initial load
  const showLoadingOverlay = localLoading;

  // ─── Effects ────────────────────────────────────────────────────────

  useEffect(() => {
    readerOpenTime.current = Date.now();
    trackReaderOpen(bookId, book?.title);
    return () => {
      const durationMs = Date.now() - readerOpenTime.current;
      const durationSecs = Math.round(durationMs / 1000);
      trackReaderClose(bookId, durationMs, displayProgress);
      if (durationSecs > 0) addReadingTime(bookId, durationSecs);
    };
  }, [bookId]);

  useEffect(() => {
    if (!isLoading) setLocalLoading(false);
  }, [isLoading]);

  useEffect(() => {
    const t = setTimeout(() => setLocalLoading(false), 4000);
    return () => clearTimeout(t);
  }, []);

  // ─── Handlers ───────────────────────────────────────────────────────

  const handleLocationChange = useCallback((total, loc) => {
    if (!loc?.start?.cfi) return;

    const spineIndex = (typeof loc.start.index === 'number') ? loc.start.index : 0;
    const bookPageCount = book?.pageCount || 0;
    const knownTotal = bookPageCount || totalPages || 0;
    const pct = knownTotal > 0 ? Math.min(100, Math.round((spineIndex / knownTotal) * 100)) : 0;

    // Guard: skip 0-progress during initial load if user had real saved progress
    if (spineIndex === 0 && (Date.now() - mountTime.current < 3000) && savedData.progress > 0) return;

    saveLocation(bookId, loc.start.cfi, pct);
    setDisplayProgress(pct);
    setCurrentPage(spineIndex);
    if (knownTotal > 0 && knownTotal !== totalPages) setTotalPages(knownTotal);
    updatePageInfo(bookId, spineIndex, knownTotal);

    if (Math.abs(pct - lastSavedProgress.current) >= 1) {
      updateBookPageInfo(bookId, spineIndex, knownTotal);
      saveBookReadingPosition(bookId, spineIndex);
      lastSavedProgress.current = pct;
    }

    trackPageTurn(bookId, pct, 'forward');
  }, [bookId, totalPages, book?.pageCount]);

  const handleToggleBookmark = useCallback(() => {
    if (!currentLocation?.start?.cfi) return;

    const cfi = currentLocation.start.cfi;
    const storeBookmarks = useEpubReaderStore.getState().getBookmarks(bookId);
    const existingBm = storeBookmarks.find((b) => b.location === cfi);

    if (existingBm) {
      // Remove from library's WebView state
      try { removeBookmark({ id: existingBm.id, location: currentLocation }); } catch {}
      // Remove from our store (also deletes from Supabase)
      storeRemoveBookmark(bookId, existingBm.id);
      trackBookmark(bookId, 'remove', cfi);
    } else {
      // Add to our store (saves locally + syncs to Supabase)
      const chapterLabel = section?.label || '';
      const bmId = storeAddBookmark(bookId, { location: cfi, chapter: chapterLabel });

      // Notify the library's WebView so the isBookmarked icon updates,
      // bypassing the broken addBookmark that crashes on getRange/getElementById.
      injectJavascript(`
        (function() {
          var rn = window.ReactNativeWebView || window;
          rn.postMessage(JSON.stringify({
            type: "onAddBookmark",
            bookmark: {
              id: ${JSON.stringify(bmId || Date.now())},
              chapter: ${JSON.stringify(chapterLabel)},
              location: ${JSON.stringify(currentLocation)},
              text: "",
              data: null
            }
          }));
        })();
        true;
      `);

      trackBookmark(bookId, 'add', cfi);
    }
  }, [currentLocation, bookId, section, injectJavascript]);

  const handleDecreaseFontSize = useCallback(() => {
    const idx = FONT_SIZE_STEPS.indexOf(settings.fontSize);
    if (idx > 0) {
      const s = FONT_SIZE_STEPS[idx - 1];
      updateSettings({ fontSize: s });
      changeFontSize(`${s}%`);
      track(EventType.READER_FONT_SIZE_CHANGE, EventCategory.READER, { bookId, fontSize: s });
    }
  }, [settings.fontSize, bookId]);

  const handleIncreaseFontSize = useCallback(() => {
    const idx = FONT_SIZE_STEPS.indexOf(settings.fontSize);
    if (idx < FONT_SIZE_STEPS.length - 1) {
      const s = FONT_SIZE_STEPS[idx + 1];
      updateSettings({ fontSize: s });
      changeFontSize(`${s}%`);
      track(EventType.READER_FONT_SIZE_CHANGE, EventCategory.READER, { bookId, fontSize: s });
    }
  }, [settings.fontSize, bookId]);

  const handleChangeTheme = useCallback((t) => {
    const prevTheme = settings.theme;
    const savedCfi = currentLocation?.start?.cfi;

    // Close settings modal before switching
    setShowSettings(false);

    updateSettings({ theme: t.key });
    changeTheme(t.css);

    // Restore position after epub.js re-renders
    if (savedCfi) {
      setTimeout(() => goToLocation(savedCfi), 500);
    }

    trackThemeChange(bookId, t.key, prevTheme);
  }, [settings.theme, bookId, currentLocation]);

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) search(searchQuery);
  }, [searchQuery]);

  // Safe chapter/location navigation — uses goToLocation for CFI strings
  // and falls back to direct rendition.display() for TOC hrefs.
  const handleGoToLocation = useCallback((target) => {
    if (!target) return;
    // CFI strings start with "epubcfi(" — use the library's goToLocation
    if (target.startsWith('epubcfi(')) {
      goToLocation(target);
    } else {
      // TOC hrefs — use rendition.display() directly with proper escaping
      const escaped = target.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      injectJavascript(`
        rendition.display('${escaped}').then(function() {
          // Force a relocation event after navigation
          rendition.reportLocation();
        }).catch(function(e) { console.log('nav error:', e); });
        true;
      `);
    }
  }, [goToLocation, injectJavascript]);

  // ─── Layout ─────────────────────────────────────────────────────────

  const headerH = insets.top + 48;
  const footerH = insets.bottom + 48;
  const readerH = SCREEN_HEIGHT - headerH - footerH;

  // ─── Render ─────────────────────────────────────────────────────────

  return (
    <View style={[styles.screen, { backgroundColor: theme.chrome.bg }]}>
      <ReaderHeader
        title={book?.title}
        theme={theme}
        insetTop={insets.top}
        height={headerH}
        isBookmarked={isBookmarked}
        canBookmark={!!currentLocation?.start?.cfi}
        onBack={() => navigation.goBack()}
        onSearch={() => setShowSearch(true)}
        onBookmark={handleToggleBookmark}
        onSettings={() => setShowSettings(true)}
      />

      <View style={{ flex: 1, backgroundColor: theme.bg }}>
        <Reader
          src={fileUri}
          fileSystem={useFileSystem}
          width={SCREEN_WIDTH}
          height={readerH}
          enableSwipe
          enableSelection={false}
          allowScriptedContent
          defaultTheme={theme.css}
          flow={settings.flow || 'paginated'}
          initialLocation={savedData.location || undefined}
          initialAnnotations={annotations}
          renderOpeningBookComponent={() => (
            <View style={{ flex: 1, backgroundColor: theme.bg, justifyContent: 'center', alignItems: 'center', gap: 12 }}>
              <ActivityIndicator size="large" color={theme.chrome.accent} />
              <Text style={{ fontFamily: 'SpaceMono-Bold', fontSize: 14, color: theme.chrome.text }}>Opening book...</Text>
            </View>
          )}
          onLocationChange={handleLocationChange}
          onSingleTap={() => {
            goNext();
          }}
          onReady={() => setLocalLoading(false)}
          onDisplayError={() => setLocalLoading(false)}
          onRendered={() => setLocalLoading(false)}
          onNavigationLoaded={(nav) => { if (Array.isArray(nav?.toc)) setTocData(nav.toc); }}
          onSearch={(results) => setSearchResults(Array.isArray(results) ? results : [])}
        />
      </View>

      <ReaderFooter
        theme={theme}
        insetBottom={insets.bottom}
        height={footerH}
        chapterLabel={section?.label}
        progress={displayProgress}
        currentPage={currentPage}
        totalPages={totalPages}
        onTOC={() => setShowTOC(true)}
        onBookmarks={() => setShowBookmarks(true)}
      />

      {/* Loading overlay — covers white flash during initial load AND theme switch */}
      {showLoadingOverlay && (
        <View style={[styles.loadingOverlay, { backgroundColor: theme.bg }]}>
          <View style={[styles.loadingWindow, { backgroundColor: theme.chrome.bg, borderColor: theme.chrome.border }]}>
            <View style={[styles.loadingTitleBar, { borderBottomColor: theme.chrome.border }]}>
              <Text style={[styles.loadingTitleText, { color: theme.chrome.text }]}>loading.exe</Text>
            </View>
            <View style={[styles.loadingContent, { backgroundColor: theme.chrome.contentBg }]}>
              <ActivityIndicator size="large" color={theme.chrome.accent} />
              <Text style={[styles.loadingText, { color: theme.chrome.text }]}>Opening book...</Text>
            </View>
          </View>
        </View>
      )}

      <TOCModal
        visible={showTOC}
        onClose={() => setShowTOC(false)}
        theme={theme}
        tocData={tocData}
        toc={toc}
        onGoTo={handleGoToLocation}
      />
      <SettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        theme={theme}
        settings={settings}
        onDecreaseFontSize={handleDecreaseFontSize}
        onIncreaseFontSize={handleIncreaseFontSize}
        onChangeTheme={handleChangeTheme}
      />
      <BookmarksModal
        visible={showBookmarks}
        onClose={() => setShowBookmarks(false)}
        theme={theme}
        bookmarks={bookmarks}
        onGoTo={handleGoToLocation}
      />
      <SearchModal
        visible={showSearch}
        onClose={() => setShowSearch(false)}
        theme={theme}
        searchQuery={searchQuery}
        searchResults={searchResults}
        onQueryChange={setSearchQuery}
        onSearch={handleSearch}
        onGoTo={handleGoToLocation}
        onClear={() => { clearSearchResults(); setSearchResults([]); }}
      />
    </View>
  );
}

// ─── Reader Screen (outer) ───────────────────────────────────────────────────

export default function ReaderScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { bookId } = route.params ?? {};

  const getBook = useUserBookLibraryStore((s) => s.getBookById);
  const getUploadedFile = useEpubReaderStore((s) => s.getUploadedFile);

  const book = getBook(bookId);
  const fileInfo = getUploadedFile(bookId);

  if (!fileInfo?.uri) {
    return (
      <View style={[styles.screen, styles.emptyScreen, { paddingTop: insets.top }]}>
        <View style={styles.emptyWindowShadow} />
        <View style={styles.emptyWindow}>
          <View style={styles.emptyTitleBar}>
            <Text style={styles.emptyTitleText}>error.exe</Text>
            <TouchableOpacity
              style={styles.emptyCloseBtn}
              onPress={() => navigation.goBack()}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <Text style={styles.emptyCloseBtnText}>x</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.emptyContent}>
            <View style={styles.emptyIconBox}>
              <MaterialCommunityIcons name="book-off-outline" size={28} color="#000000" />
            </View>
            <Text style={styles.emptyTitle}>No E-Book File</Text>
            <Text style={styles.emptyMsg}>Import an EPUB from the book detail page first.</Text>
            <TouchableOpacity
              style={styles.emptyBackBtn}
              onPress={() => navigation.goBack()}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <MaterialCommunityIcons name="arrow-left" size={14} color="#000000" />
              <Text style={styles.emptyBackText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <ReaderProvider>
      <ReaderContent bookId={bookId} fileUri={fileInfo.uri} book={book} />
    </ReaderProvider>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1 },

  // Loading overlay — fully opaque, theme.bg covers everything
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    zIndex: 10,
  },
  loadingWindow: {
    borderWidth: borderWidth.pixel,
    minWidth: 220,
  },
  loadingTitleBar: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderBottomWidth: borderWidth.normal,
  },
  loadingTitleText: {
    fontFamily: 'SpaceMono',
    fontSize: textSizes.xxs,
  },
  loadingContent: {
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: textSizes.sm,
  },

  // Empty state
  emptyScreen: {
    backgroundColor: homeColors.bgMain,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyWindowShadow: {
    position: 'absolute',
    width: 260,
    height: 260,
    backgroundColor: '#000000',
    top: '50%',
    left: '50%',
    marginTop: -127,
    marginLeft: -127,
  },
  emptyWindow: {
    borderWidth: borderWidth.pixel,
    borderColor: '#000000',
    backgroundColor: homeColors.bgCard,
    width: 260,
    zIndex: 1,
  },
  emptyTitleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderBottomWidth: borderWidth.normal,
    borderBottomColor: '#000000',
  },
  emptyTitleText: {
    fontFamily: 'SpaceMono',
    fontSize: textSizes.xxs,
    color: '#000000',
  },
  emptyCloseBtn: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#000000',
    backgroundColor: '#EF4444',
  },
  emptyCloseBtnText: {
    fontFamily: 'SpaceMono',
    fontSize: 8,
    color: '#000000',
    lineHeight: 10,
  },
  emptyContent: {
    padding: spacing.lg,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyIconBox: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000000',
    backgroundColor: '#FBCA1F',
    marginBottom: spacing.xs,
  },
  emptyTitle: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: textSizes.md,
    color: '#000000',
    textAlign: 'center',
  },
  emptyMsg: {
    fontFamily: 'SpaceMono',
    fontSize: textSizes.xs,
    color: homeColors.textCaption,
    textAlign: 'center',
    lineHeight: textSizes.xs * 1.6,
  },
  emptyBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: '#FBCA1F',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderWidth: 2,
    borderColor: '#000000',
    borderRightWidth: 4,
    borderBottomWidth: 4,
    marginTop: spacing.sm,
  },
  emptyBackText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: textSizes.xs,
    color: '#000000',
  },
});
