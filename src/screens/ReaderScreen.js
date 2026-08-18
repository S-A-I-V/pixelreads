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
  trackHighlight, trackThemeChange, track, EventType, EventCategory,
} from '../utils/analytics';
import { colors } from '../theme';

import { READER_THEMES, FONT_SIZE_STEPS } from './reader/readerConstants';
import { ReaderHeader } from './reader/ReaderHeader';
import { ReaderFooter } from './reader/ReaderFooter';
import { HighlightMenu } from './reader/HighlightMenu';
import { TOCModal, SettingsModal, BookmarksModal, SearchModal } from './reader/ReaderModals';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

function ReaderContent({ bookId, fileUri, book }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const {
    changeFontSize, changeTheme, goToLocation, currentLocation,
    progress, isLoading, section, addAnnotation, annotations,
    addBookmark, removeBookmark, bookmarks, isBookmarked, search, clearSearchResults, toc,
  } = useReader();

  const settings = useEpubReaderStore((s) => s.settings);
  const updateSettings = useEpubReaderStore((s) => s.updateSettings);
  const saveLocation = useEpubReaderStore((s) => s.saveLocation);
  const getReadingData = useEpubReaderStore((s) => s.getReadingData);
  const storeAddBookmark = useEpubReaderStore((s) => s.addBookmark);
  const storeRemoveBookmark = useEpubReaderStore((s) => s.removeBookmark);
  const storeAddAnnotation = useEpubReaderStore((s) => s.addAnnotation);
  const updateBookPageInfo = useUserBookLibraryStore((s) => s.updateBookPageInfo);
  const saveBookReadingPosition = useUserBookLibraryStore((s) => s.saveBookReadingPosition);

  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const lastSavedProgress = useRef(0);

  const [showUI, setShowUI] = useState(true);
  const [showTOC, setShowTOC] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedText, setSelectedText] = useState(null);
  const [localLoading, setLocalLoading] = useState(true);
  const [tocData, setTocData] = useState([]);
  const readerOpenTime = useRef(Date.now());

  const theme = READER_THEMES[settings.theme] || READER_THEMES.light;

  useEffect(() => {
    readerOpenTime.current = Date.now();
    trackReaderOpen(bookId, book?.title);
    return () => {
      const duration = Date.now() - readerOpenTime.current;
      trackReaderClose(bookId, duration, Math.round(progress));
    };
  }, [bookId]);

  useEffect(() => { if (!isLoading) setLocalLoading(false); }, [isLoading]);
  useEffect(() => { const t = setTimeout(() => setLocalLoading(false), 4000); return () => clearTimeout(t); }, []);

  useEffect(() => {
    const data = getReadingData(bookId);
    if (data?.location) { const t = setTimeout(() => goToLocation(data.location), 1500); return () => clearTimeout(t); }
  }, [bookId]);

  const handleLocationChange = useCallback((total, loc) => {
    if (!loc?.start?.cfi) return;
    const pct = Math.round(progress);
    saveLocation(bookId, loc.start.cfi, pct);

    const estimatedCurrentPage = total?.start?.displayed?.page || Math.ceil((pct / 100) * (totalPages || 100));
    const estimatedTotalPages = total?.start?.displayed?.total || totalPages || 100;
    if (estimatedTotalPages !== totalPages) setTotalPages(estimatedTotalPages);
    setCurrentPage(estimatedCurrentPage);

    if (Math.abs(pct - lastSavedProgress.current) >= 1) {
      updateBookPageInfo(bookId, estimatedCurrentPage, estimatedTotalPages);
      saveBookReadingPosition(bookId, estimatedCurrentPage);
      lastSavedProgress.current = pct;
    }
    trackPageTurn(bookId, pct, 'forward');
  }, [bookId, progress, totalPages]);

  const handleHighlight = useCallback((color) => {
    if (!selectedText) return;
    addAnnotation('highlight', selectedText.cfiRange, { color }, { color });
    storeAddAnnotation(bookId, { ...selectedText, color, type: 'highlight' });
    trackHighlight(bookId, color, selectedText.text?.length || 0);
    setSelectedText(null);
  }, [selectedText, bookId]);

  const handleToggleBookmark = useCallback(() => {
    if (!currentLocation?.start?.cfi) return;
    if (isBookmarked) {
      const bm = bookmarks?.find((b) => b.location?.start?.cfi === currentLocation.start.cfi);
      if (bm) { removeBookmark(bm); storeRemoveBookmark(bookId, bm.id); trackBookmark(bookId, 'remove', currentLocation.start.cfi); }
    } else {
      addBookmark(currentLocation);
      storeAddBookmark(bookId, { location: currentLocation.start.cfi, chapter: section?.label || '' });
      trackBookmark(bookId, 'add', currentLocation.start.cfi);
    }
  }, [currentLocation, isBookmarked, bookmarks, section, bookId]);

  const handleDecreaseFontSize = useCallback(() => {
    const idx = FONT_SIZE_STEPS.indexOf(settings.fontSize);
    if (idx > 0) { const s = FONT_SIZE_STEPS[idx - 1]; updateSettings({ fontSize: s }); changeFontSize(`${s}%`); track(EventType.READER_FONT_SIZE_CHANGE, EventCategory.READER, { bookId, fontSize: s }); }
  }, [settings.fontSize, bookId]);

  const handleIncreaseFontSize = useCallback(() => {
    const idx = FONT_SIZE_STEPS.indexOf(settings.fontSize);
    if (idx < FONT_SIZE_STEPS.length - 1) { const s = FONT_SIZE_STEPS[idx + 1]; updateSettings({ fontSize: s }); changeFontSize(`${s}%`); track(EventType.READER_FONT_SIZE_CHANGE, EventCategory.READER, { bookId, fontSize: s }); }
  }, [settings.fontSize, bookId]);

  const handleChangeTheme = useCallback((t) => {
    const prevTheme = settings.theme;
    updateSettings({ theme: t.key });
    changeTheme(t.css);
    trackThemeChange(bookId, t.key, prevTheme);
  }, [settings.theme, bookId]);

  const handleSearch = useCallback(() => { if (searchQuery.trim()) search(searchQuery); }, [searchQuery]);

  const headerH = insets.top + 52;
  const footerH = insets.bottom + 52;
  const readerH = SCREEN_HEIGHT - headerH - footerH;

  return (
    <View style={[styles.screen, { backgroundColor: theme.bg }]}>
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

      <View style={{ width: SCREEN_WIDTH, height: readerH }}>
        <Reader
          src={fileUri}
          fileSystem={useFileSystem}
          width={SCREEN_WIDTH}
          height={readerH}
          enableSwipe
          enableSelection
          allowScriptedContent
          defaultTheme={theme.css}
          flow={settings.flow || 'paginated'}
          initialAnnotations={annotations}
          onLocationChange={handleLocationChange}
          onSelected={(cfiRange, text) => text && setSelectedText({ cfiRange, text })}
          onPress={() => setShowUI((v) => !v)}
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
        progress={progress}
        currentPage={currentPage}
        totalPages={totalPages}
        onTOC={() => setShowTOC(true)}
        onBookmarks={() => setShowBookmarks(true)}
      />

      {localLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Opening book…</Text>
        </View>
      )}

      <HighlightMenu selectedText={selectedText} onHighlight={handleHighlight} onDismiss={() => setSelectedText(null)} />

      <TOCModal visible={showTOC} onClose={() => setShowTOC(false)} theme={theme} tocData={tocData} toc={toc} onGoTo={goToLocation} />
      <SettingsModal visible={showSettings} onClose={() => setShowSettings(false)} theme={theme} settings={settings} onDecreaseFontSize={handleDecreaseFontSize} onIncreaseFontSize={handleIncreaseFontSize} onChangeTheme={handleChangeTheme} />
      <BookmarksModal visible={showBookmarks} onClose={() => setShowBookmarks(false)} theme={theme} bookmarks={bookmarks} onGoTo={goToLocation} />
      <SearchModal visible={showSearch} onClose={() => setShowSearch(false)} theme={theme} searchQuery={searchQuery} searchResults={searchResults} onQueryChange={setSearchQuery} onSearch={handleSearch} onGoTo={goToLocation} onClear={() => { clearSearchResults(); setSearchResults([]); }} />
    </View>
  );
}

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
      <View style={[styles.screen, styles.centered, { paddingTop: insets.top, backgroundColor: colors.bgPrimary }]}>
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

const styles = StyleSheet.create({
  screen: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 16 },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', gap: 14 },
  loadingText: { color: '#fff', fontSize: 16 },
  noFileTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  noFileMsg: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 22 },
  goBackBtn: { backgroundColor: colors.accent, paddingHorizontal: 28, paddingVertical: 13, borderRadius: 8, marginTop: 8 },
  goBackText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
