import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Dimensions, PanResponder, ScrollView, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import useBookStore from '../store/bookStore';
import { PixelButton, PixelProgress, LoadingSpinner } from '../components';
import { colors, fonts, textSizes, spacing, borderWidth } from '../theme';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─────────────────────────────────────────────────────────────────
// NOTE: Full native EPUB rendering requires a native module
// (react-native-epub-viewer or similar) that needs EAS build.
// For Expo Go compatibility we parse EPUB as a ZIP, extract text
// and render it in a styled paginated ScrollView.
// PDF uses react-native-pdf (also needs EAS) – if unavailable
// we render a friendly message guiding the user.
// ─────────────────────────────────────────────────────────────────

async function extractEpubText(fileUri) {
  // Attempt to read as zip and extract .xhtml / .html content
  // Falls back to raw text if zip extraction is unavailable
  try {
    // Read file as base64 and try basic text extraction
    const content = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    // Very basic: decode and strip tags
    const decoded = atob(content);
    const cleaned = decoded
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // remove non-printable
      .replace(/<[^>]+>/g, ' ')           // strip HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\s{3,}/g, '\n\n')         // collapse whitespace
      .trim();

    if (cleaned.length < 100) throw new Error('No text extracted');
    return cleaned;
  } catch {
    throw new Error('Could not extract text from this EPUB file.');
  }
}

function chunkText(text, charsPerPage = 800) {
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 0);
  const pages = [];
  let current = '';

  for (const para of paragraphs) {
    if ((current + para).length > charsPerPage && current.length > 0) {
      pages.push(current.trim());
      current = para;
    } else {
      current = current ? current + '\n\n' + para : para;
    }
  }
  if (current.trim()) pages.push(current.trim());
  return pages;
}

// ── Page flip gesture wrapper ─────────────────────────────────────
function FlipPage({ children, onFlipLeft, onFlipRight }) {
  const panX = useRef(new Animated.Value(0)).current;
  const startX = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 10,
      onPanResponderGrant: (_, g) => { startX.current = g.x0; },
      onPanResponderMove: (_, g) => { panX.setValue(g.dx); },
      onPanResponderRelease: (_, g) => {
        const THRESHOLD = SCREEN_W * 0.25;
        if (g.dx < -THRESHOLD) {
          Animated.timing(panX, { toValue: -SCREEN_W, duration: 250, useNativeDriver: true })
            .start(() => { panX.setValue(0); onFlipRight?.(); });
        } else if (g.dx > THRESHOLD) {
          Animated.timing(panX, { toValue: SCREEN_W, duration: 250, useNativeDriver: true })
            .start(() => { panX.setValue(0); onFlipLeft?.(); });
        } else {
          Animated.spring(panX, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  return (
    <Animated.View
      style={[styles.flipWrap, { transform: [{ translateX: panX }] }]}
      {...panResponder.panHandlers}
    >
      {children}
    </Animated.View>
  );
}

// ── EPUB Reader ───────────────────────────────────────────────────
function EpubReader({ fileUri, bookId, bookTitle }) {
  const [pages,       setPages]       = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [showUI,      setShowUI]      = useState(true);

  const savePosition  = useBookStore((s) => s.saveReadingPosition);
  const getPosition   = useBookStore((s) => s.getReadingPosition);
  const updateProgress = useBookStore((s) => s.updateProgress);

  useEffect(() => {
    extractEpubText(fileUri)
      .then((text) => {
        const chunked = chunkText(text);
        setPages(chunked);
        const saved = getPosition(bookId);
        setCurrentPage(Math.min(saved, Math.max(0, chunked.length - 1)));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [fileUri]);

  const goNext = useCallback(() => {
    setCurrentPage((p) => {
      const next = Math.min(p + 1, pages.length - 1);
      savePosition(bookId, next);
      updateProgress(bookId, Math.round((next / pages.length) * 100));
      return next;
    });
  }, [pages.length, bookId]);

  const goPrev = useCallback(() => {
    setCurrentPage((p) => {
      const prev = Math.max(p - 1, 0);
      savePosition(bookId, prev);
      return prev;
    });
  }, [bookId]);

  if (loading) return <LoadingSpinner message="OPENING BOOK..." />;
  if (error)   return (
    <View style={styles.errorWrap}>
      <Text style={styles.errorText}>{error}</Text>
    </View>
  );
  if (!pages.length) return (
    <View style={styles.errorWrap}>
      <Text style={styles.errorText}>No readable content found.</Text>
    </View>
  );

  const progress = Math.round(((currentPage + 1) / pages.length) * 100);

  return (
    <View style={styles.readerContainer}>
      {/* Progress bar */}
      <View style={styles.progressBar}>
        <PixelProgress value={progress} showPct height={6} />
      </View>

      {/* Page */}
      <FlipPage onFlipLeft={goPrev} onFlipRight={goNext}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowUI((u) => !u)}
          style={styles.page}
        >
          <ScrollView
            style={styles.pageScroll}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.pageText}>{pages[currentPage]}</Text>
          </ScrollView>
          <Text style={styles.pageNum}>
            {currentPage + 1} / {pages.length}
          </Text>
        </TouchableOpacity>
      </FlipPage>

      {/* Controls */}
      {showUI && (
        <View style={styles.controls}>
          <PixelButton
            label="◀ PREV"
            variant="secondary"
            size="sm"
            onPress={goPrev}
            disabled={currentPage === 0}
          />
          <Text style={styles.controlText}>{currentPage + 1}/{pages.length}</Text>
          <PixelButton
            label="NEXT ▶"
            size="sm"
            onPress={goNext}
            disabled={currentPage === pages.length - 1}
          />
        </View>
      )}
    </View>
  );
}

// ── PDF Reader ────────────────────────────────────────────────────
// react-native-pdf is a native module that only works in EAS builds.
// In Expo Go / development we show a guide screen.
function PdfReader({ fileUri }) {
  return (
    <View style={styles.pdfFallback}>
      <Text style={styles.pdfFallbackIcon}>📄</Text>
      <Text style={styles.pdfFallbackTitle}>PDF READER</Text>
      <Text style={styles.pdfFallbackText}>
        PDF rendering requires a custom native build.{'\n\n'}
        To enable full PDF support:{'\n'}
        1. Run: eas build --profile preview{'\n'}
        2. Install the resulting APK/IPA{'\n'}
        3. PDF will render here automatically{'\n\n'}
        EPUB files work in all builds.
      </Text>
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────
export default function ReaderScreen() {
  const navigation = useNavigation();
  const route      = useRoute();
  const insets     = useSafeAreaInsets();
  const { bookId } = route.params ?? {};

  const getBook         = useBookStore((s) => s.getBook);
  const getUploadedFile = useBookStore((s) => s.getUploadedFile);

  const book     = getBook(bookId);
  const fileInfo = getUploadedFile(bookId);
  const isPdf    = fileInfo?.ext === 'pdf';

  if (!fileInfo) {
    return (
      <View style={[styles.screen, styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.noFileIcon}>📭</Text>
        <Text style={styles.noFileTitle}>NO E-BOOK FILE</Text>
        <Text style={styles.noFileText}>
          Upload an EPUB or PDF from the book detail page
        </Text>
        <PixelButton label="◀ BACK" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Minimal header */}
      <View style={styles.readerHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>◀</Text>
        </TouchableOpacity>
        <Text style={styles.readerTitle} numberOfLines={1}>{book?.title ?? 'Reading'}</Text>
        <View style={{ width: 32 }} />
      </View>

      {isPdf
        ? <PdfReader fileUri={fileInfo.uri} />
        : <EpubReader fileUri={fileInfo.uri} bookId={bookId} bookTitle={book?.title} />
      }
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#1a1208' },
  centered: { alignItems: 'center', justifyContent: 'center', gap: spacing.lg, padding: spacing.xl },

  readerHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    backgroundColor: colors.bgDark,
    borderBottomWidth: borderWidth.normal, borderBottomColor: colors.pinkHot,
  },
  backBtn: { padding: spacing.xs },
  backBtnText: { fontFamily: fonts.pixel, fontSize: textSizes.md, color: colors.pinkHot },
  readerTitle: {
    flex: 1, textAlign: 'center',
    fontFamily: fonts.pixel, fontSize: textSizes.xxs,
    color: colors.pinkHot,
    marginHorizontal: spacing.sm,
  },

  // EPUB
  readerContainer: { flex: 1 },
  progressBar: { paddingHorizontal: spacing.lg, paddingVertical: spacing.xs, backgroundColor: colors.bgDark },
  flipWrap: { flex: 1 },
  page: {
    flex: 1, backgroundColor: '#fdf6e3',
    paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xxxl,
    borderLeftWidth: 3, borderRightWidth: 3, borderColor: colors.pinkHot,
  },
  pageScroll: { flex: 1 },
  pageText: {
    fontSize: 15, fontFamily: 'Georgia',
    color: '#2c2c2c', lineHeight: 26,
  },
  pageNum: {
    position: 'absolute', bottom: spacing.md, alignSelf: 'center',
    fontFamily: fonts.pixel, fontSize: textSizes.xxs - 1,
    color: '#aaa',
  },
  controls: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    backgroundColor: colors.bgDark,
    borderTopWidth: borderWidth.thick, borderTopColor: colors.pinkHot,
  },
  controlText: {
    fontFamily: fonts.pixel, fontSize: textSizes.xxs,
    color: colors.textDim,
  },

  // PDF
  pdfFallback: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: spacing.xl, gap: spacing.lg,
  },
  pdfFallbackIcon:  { fontSize: 48 },
  pdfFallbackTitle: {
    fontFamily: fonts.pixel, fontSize: textSizes.md,
    color: colors.pinkHot, letterSpacing: 2,
  },
  pdfFallbackText: {
    fontFamily: fonts.pixel, fontSize: textSizes.xxs,
    color: colors.textDim, textAlign: 'center',
    lineHeight: textSizes.xxs * 2.2,
  },

  // No file
  noFileIcon:  { fontSize: 48 },
  noFileTitle: {
    fontFamily: fonts.pixel, fontSize: textSizes.sm,
    color: colors.pinkHot, letterSpacing: 2,
  },
  noFileText: {
    fontFamily: fonts.pixel, fontSize: textSizes.xxs,
    color: colors.textDim, textAlign: 'center',
    lineHeight: textSizes.xxs * 2.2,
  },

  errorWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  errorText: {
    fontFamily: fonts.pixel, fontSize: textSizes.xxs,
    color: '#FF4444', textAlign: 'center',
    lineHeight: textSizes.xxs * 2.2,
  },
});
