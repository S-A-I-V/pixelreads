import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { fetchBookById } from '../api/googleBooks';
import useBookStore from '../store/bookStore';
import {
  BookCover, ShelfBadge, PixelButton, PixelProgress,
  StarRating, PixelDivider, PixelModal, LoadingSpinner,
  ScreenHeader, BackButton, Toast,
} from '../components';
import useToast from '../hooks/useToast';
import { colors, fonts, textSizes, spacing, borderWidth } from '../theme';

const SHELVES = [
  { key: 'reading',      label: '▶ Currently Reading', icon: '📖' },
  { key: 'want_to_read', label: '⭐ Want to Read',      icon: '🔖' },
  { key: 'finished',     label: '✓  Finished',          icon: '🏆' },
  { key: 'dnf',          label: '✕  Did Not Finish',    icon: '💔' },
];

// ── Metadata row ─────────────────────────────────────────────────
function MetaItem({ label, value }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value || '—'}</Text>
    </View>
  );
}

// ── Screen ───────────────────────────────────────────────────────
export default function BookDetailScreen() {
  const navigation = useNavigation();
  const route      = useRoute();
  const insets     = useSafeAreaInsets();

  const { book: passedBook } = route.params ?? {};

  const [book,          setBook]          = useState(passedBook ?? null);
  const [loading,       setLoading]       = useState(!passedBook);
  const [shelfModal,    setShelfModal]    = useState(false);
  const [reviewMode,    setReviewMode]    = useState(false);
  const [reviewText,    setReviewText]    = useState('');
  const [progressText,  setProgressText]  = useState('');
  const [descExpanded,  setDescExpanded]  = useState(false);

  const { toastMsg, toastVisible, showToast, hideToast } = useToast();

  const addToShelf       = useBookStore((s) => s.addToShelf);
  const removeFromShelf  = useBookStore((s) => s.removeFromShelf);
  const getBookShelf     = useBookStore((s) => s.getBookShelf);
  const getBook          = useBookStore((s) => s.getBook);
  const rateBook         = useBookStore((s) => s.rateBook);
  const updateProgress   = useBookStore((s) => s.updateProgress);
  const saveUploadedFile = useBookStore((s) => s.saveUploadedFile);
  const getUploadedFile  = useBookStore((s) => s.getUploadedFile);
  const removeUploadedFile = useBookStore((s) => s.removeUploadedFile);

  const bookId  = book?.id;
  const stored  = getBook(bookId);
  const shelf   = getBookShelf(bookId);
  const hasFile = !!getUploadedFile(bookId);

  // Fetch full book if we only have partial data
  useEffect(() => {
    if (!passedBook && bookId) {
      fetchBookById(bookId)
        .then(setBook)
        .catch(() => showToast('Failed to load book'))
        .finally(() => setLoading(false));
    }
  }, [bookId]);

  useEffect(() => {
    if (stored?.review)   setReviewText(String(stored.review));
    if (stored?.progress) setProgressText(String(stored.progress));
  }, [stored?.review, stored?.progress]);

  const handleAddToShelf = (s) => {
    if (!book) return;
    addToShelf(book, s);
    setShelfModal(false);
    showToast(`Added to ${s.replace('_', ' ').toUpperCase()} ♥`);
  };

  const handleRemove = () => {
    Alert.alert('Remove book?', 'This will remove the book from your library.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => {
        removeFromShelf(bookId);
        showToast('Removed from library');
      }},
    ]);
  };

  const handleRate = (stars) => {
    rateBook(bookId, stars, reviewText);
    showToast(`Rated ${stars} ★`);
  };

  const handleSaveReview = () => {
    rateBook(bookId, stored?.rating ?? 0, reviewText);
    setReviewMode(false);
    showToast('Review saved ♥');
  };

  const handleSaveProgress = () => {
    const val = Math.min(100, Math.max(0, parseInt(progressText, 10) || 0));
    updateProgress(bookId, val);
    setProgressText(String(val));
    showToast(`Progress: ${val}%`);
  };

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/epub+zip', 'application/pdf', '*/*'],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      const ext   = asset.name.split('.').pop().toLowerCase();
      if (!['epub', 'pdf'].includes(ext)) {
        showToast('Only EPUB or PDF allowed');
        return;
      }
      // Copy to permanent app directory
      const destDir  = FileSystem.documentDirectory + 'books/';
      await FileSystem.makeDirectoryAsync(destDir, { intermediates: true });
      const destPath = destDir + bookId + '.' + ext;
      await FileSystem.copyAsync({ from: asset.uri, to: destPath });

      saveUploadedFile(bookId, {
        uri:  destPath,
        name: asset.name,
        ext,
        type: asset.mimeType ?? (ext === 'epub' ? 'application/epub+zip' : 'application/pdf'),
      });
      showToast('E-book uploaded ♥');
    } catch {
      showToast('Upload failed ✕');
    }
  };

  if (loading) return <LoadingSpinner message="LOADING BOOK..." />;
  if (!book)   return (
    <View style={styles.screen}>
      <Text style={styles.errText}>Book not found</Text>
      <PixelButton label="◀ BACK" onPress={() => navigation.goBack()} />
    </View>
  );

  const rawDesc    = book.description?.replace(/<[^>]+>/g, '') ?? '';
  const shortDesc  = rawDesc.slice(0, 220);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Toast message={toastMsg} visible={toastVisible} onHide={hideToast} />

      <ScreenHeader
        title="BOOK INFO"
        left={<BackButton onPress={() => navigation.goBack()} />}
        right={
          shelf ? (
            <TouchableOpacity onPress={handleRemove}>
              <Text style={{ fontSize: 18 }}>🗑</Text>
            </TouchableOpacity>
          ) : null
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxxl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <BookCover uri={book.thumbnail} title={book.title} width={100} />
          <View style={styles.heroInfo}>
            <Text style={styles.bookTitle}>{book.title}</Text>
            {book.authors?.length > 0 && (
              <Text style={styles.bookAuthor}>{book.authors.join(', ')}</Text>
            )}
            <Text style={styles.bookMeta}>
              {[book.publishedDate?.slice(0,4), book.publisher].filter(Boolean).join(' · ')}
            </Text>
            {book.pageCount > 0 && (
              <Text style={styles.bookMeta}>{book.pageCount} pages</Text>
            )}
            {shelf && <ShelfBadge shelf={shelf} style={{ marginTop: spacing.xs }} />}
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <PixelButton
            label={shelf ? '✏ EDIT SHELF' : '+ ADD TO SHELF'}
            onPress={() => setShelfModal(true)}
            style={styles.btnFull}
          />
          {hasFile ? (
            <PixelButton
              label="📖 READ NOW"
              variant="secondary"
              onPress={() => navigation.navigate('Reader', { bookId })}
              style={styles.btnFull}
            />
          ) : (
            <PixelButton
              label="📤 UPLOAD EPUB/PDF"
              variant="secondary"
              onPress={handleUpload}
              style={styles.btnFull}
            />
          )}
        </View>

        {/* Uploaded file status */}
        {hasFile && (
          <View style={styles.fileStatus}>
            <Text style={styles.fileStatusText}>✓ E-BOOK ATTACHED</Text>
            <TouchableOpacity onPress={handleUpload}>
              <Text style={styles.replaceBtn}>REPLACE</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Progress (reading shelf only) */}
        {shelf === 'reading' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PROGRESS</Text>
            <PixelProgress value={stored?.progress ?? 0} />
            <View style={styles.progressRow}>
              <TextInput
                style={styles.progressInput}
                value={progressText}
                onChangeText={setProgressText}
                keyboardType="number-pad"
                maxLength={3}
                placeholder="0"
                placeholderTextColor={colors.textMuted}
              />
              <Text style={styles.pctSign}>%</Text>
              <PixelButton label="SAVE" size="sm" onPress={handleSaveProgress} />
            </View>
          </View>
        )}

        {/* Rating */}
        {shelf && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>RATING</Text>
            <StarRating value={stored?.rating ?? 0} onChange={handleRate} />
          </View>
        )}

        <PixelDivider />

        {/* Description */}
        {rawDesc.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>DESCRIPTION</Text>
            <Text style={styles.descText}>
              {descExpanded ? rawDesc : shortDesc}
            </Text>
            {rawDesc.length > 220 && (
              <TouchableOpacity onPress={() => setDescExpanded(!descExpanded)}>
                <Text style={styles.moreBtn}>{descExpanded ? '...LESS' : '...MORE'}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Review */}
        {shelf && (
          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>MY REVIEW</Text>
              <TouchableOpacity onPress={() => setReviewMode(!reviewMode)}>
                <Text style={styles.editBtn}>{reviewMode ? 'CANCEL' : 'EDIT'}</Text>
              </TouchableOpacity>
            </View>
            {reviewMode ? (
              <View style={{ gap: spacing.sm }}>
                <TextInput
                  style={styles.reviewInput}
                  value={reviewText}
                  onChangeText={setReviewText}
                  placeholder="Write your thoughts..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                  textAlignVertical="top"
                />
                <PixelButton label="SAVE REVIEW" size="sm" onPress={handleSaveReview} />
              </View>
            ) : stored?.review ? (
              <Text style={styles.reviewText}>"{stored.review}"</Text>
            ) : (
              <Text style={styles.noReview}>No review yet. Tap EDIT to add one.</Text>
            )}
          </View>
        )}

        <PixelDivider />

        {/* Metadata grid */}
        <View style={styles.metaGrid}>
          <MetaItem label="ISBN"     value={book.isbn} />
          <MetaItem label="LANGUAGE" value={book.language?.toUpperCase()} />
          <MetaItem label="PAGES"    value={book.pageCount ? String(book.pageCount) : null} />
          <MetaItem label="YEAR"     value={book.publishedDate?.slice(0, 4)} />
        </View>
      </ScrollView>

      {/* Shelf picker modal */}
      <PixelModal
        visible={shelfModal}
        onClose={() => setShelfModal(false)}
        title="ADD TO SHELF"
      >
        <View style={{ gap: spacing.sm }}>
          {SHELVES.map(({ key, label, icon }) => (
            <TouchableOpacity
              key={key}
              onPress={() => handleAddToShelf(key)}
              style={[styles.shelfOption, shelf === key && styles.shelfOptionActive]}
            >
              <Text style={styles.shelfOptionIcon}>{icon}</Text>
              <Text style={styles.shelfOptionLabel}>{label}</Text>
              {shelf === key && <Text style={styles.shelfCheck}>✓</Text>}
            </TouchableOpacity>
          ))}
          {shelf && (
            <TouchableOpacity
              onPress={() => { handleRemove(); setShelfModal(false); }}
              style={styles.removeOption}
            >
              <Text style={styles.removeOptionText}>✕ REMOVE FROM LIBRARY</Text>
            </TouchableOpacity>
          )}
        </View>
      </PixelModal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bgDark },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.lg },
  errText: { fontFamily: fonts.pixel, fontSize: textSizes.xs, color: '#FF4444', padding: spacing.xl },

  hero: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: borderWidth.normal,
    borderBottomColor: colors.pinkHot,
  },
  heroInfo: { flex: 1, gap: spacing.xs },
  bookTitle: {
    fontFamily: fonts.pixel, fontSize: textSizes.xs,
    color: colors.textMain, lineHeight: textSizes.xs * 2,
  },
  bookAuthor: {
    fontFamily: fonts.pixel, fontSize: textSizes.xxs,
    color: colors.pinkLight,
  },
  bookMeta: {
    fontFamily: fonts.pixel, fontSize: textSizes.xxs - 1,
    color: colors.textDim,
  },

  actions: { gap: spacing.sm },
  btnFull: { alignSelf: 'stretch' },

  fileStatus: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: spacing.sm, borderWidth: borderWidth.normal,
    borderColor: colors.green, backgroundColor: 'rgba(0,170,68,0.1)',
  },
  fileStatusText: { fontFamily: fonts.pixel, fontSize: textSizes.xxs, color: colors.green },
  replaceBtn:     { fontFamily: fonts.pixel, fontSize: textSizes.xxs, color: colors.textDim },

  section:     { gap: spacing.sm },
  sectionTitle: {
    fontFamily: fonts.pixel, fontSize: textSizes.xxs,
    color: colors.pinkHot, letterSpacing: 1,
  },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  editBtn:    { fontFamily: fonts.pixel, fontSize: textSizes.xxs - 1, color: colors.textDim },
  moreBtn:    { fontFamily: fonts.pixel, fontSize: textSizes.xxs - 1, color: colors.pinkHot, marginTop: spacing.xs },

  progressRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  progressInput: {
    width: 56, fontFamily: fonts.pixel, fontSize: textSizes.xs,
    color: colors.textMain, backgroundColor: colors.bgMid,
    borderWidth: borderWidth.thick, borderColor: colors.pinkHot,
    padding: spacing.xs, textAlign: 'center',
  },
  pctSign: { fontFamily: fonts.pixel, fontSize: textSizes.xs, color: colors.textDim },

  descText: {
    fontFamily: fonts.pixel, fontSize: textSizes.xxs,
    color: colors.textDim, lineHeight: textSizes.xxs * 2.2,
  },

  reviewInput: {
    fontFamily: fonts.pixel, fontSize: textSizes.xxs,
    color: colors.textMain, backgroundColor: colors.bgMid,
    borderWidth: borderWidth.thick, borderColor: colors.pinkHot,
    padding: spacing.md, minHeight: 100,
    lineHeight: textSizes.xxs * 2,
  },
  reviewText: {
    fontFamily: fonts.pixel, fontSize: textSizes.xxs,
    color: colors.textDim, fontStyle: 'italic',
    lineHeight: textSizes.xxs * 2.2,
  },
  noReview: {
    fontFamily: fonts.pixel, fontSize: textSizes.xxs - 1,
    color: colors.textMuted,
  },

  metaGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm,
  },
  metaItem: {
    width: '47%', backgroundColor: colors.bgCard,
    borderWidth: 1, borderColor: colors.bgPanel,
    padding: spacing.sm, gap: spacing.xs,
  },
  metaLabel: {
    fontFamily: fonts.pixel, fontSize: textSizes.xxs - 1,
    color: colors.textDim, letterSpacing: 0.5,
  },
  metaValue: {
    fontFamily: fonts.pixel, fontSize: textSizes.xxs,
    color: colors.textMain,
  },

  shelfOption: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.md, backgroundColor: colors.bgCard,
    borderWidth: borderWidth.normal, borderColor: colors.bgPanel,
  },
  shelfOptionActive: {
    borderColor: colors.pinkHot,
    backgroundColor: 'rgba(255,0,153,0.12)',
  },
  shelfOptionIcon:  { fontSize: 20 },
  shelfOptionLabel: {
    flex: 1, fontFamily: fonts.pixel, fontSize: textSizes.xxs,
    color: colors.textMain, letterSpacing: 0.5,
  },
  shelfCheck: { fontFamily: fonts.pixel, fontSize: textSizes.xs, color: colors.pinkHot },

  removeOption: {
    padding: spacing.md, marginTop: spacing.sm,
    borderWidth: 1, borderStyle: 'dashed', borderColor: '#AA2200',
    alignItems: 'center',
  },
  removeOptionText: {
    fontFamily: fonts.pixel, fontSize: textSizes.xxs,
    color: '#FF4444', letterSpacing: 0.5,
  },
});
