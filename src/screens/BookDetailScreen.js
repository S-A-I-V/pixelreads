import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useUserBookLibraryStore } from '../features/library/store/userBookLibraryStore';
import { useEpubReaderStore } from '../features/reader/store/epubReaderStore';
import { trackScreenView, trackEpubImport, track, EventType, EventCategory } from '../utils/analytics';
import { ScreenHeader } from '../components/ui';
import { colors, spacing } from '../theme';

// Sub-components
import { HeroSection } from './book-detail/HeroSection';
import { ShelfPicker } from './book-detail/ShelfPicker';
import { EbookSection } from './book-detail/EbookSection';
import { TagsModal } from './book-detail/TagsModal';
import {
  TagsSection,
  ReadingProgressSection,
  DescriptionSection,
  CategoriesSection,
  PublicationDetails,
  LinksSection,
  RatingSection,
} from './book-detail/BookInfoSections';

const BUILT_IN_SHELVES = [
  { key: 'reading',      label: 'Currently Reading' },
  { key: 'want_to_read', label: 'Want to Read'      },
  { key: 'finished',     label: 'Finished'          },
  { key: 'dnf',          label: 'Did Not Finish'    },
];

export default function BookDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { book } = route.params ?? {};

  const [showShelfPicker, setShowShelfPicker] = useState(false);
  const [showTagsModal, setShowTagsModal] = useState(false);
  const [importing, setImporting] = useState(false);

  // Library store
  const addToShelf = useUserBookLibraryStore((s) => s.addBookToShelf);
  const removeFromShelf = useUserBookLibraryStore((s) => s.removeBookFromLibrary);
  const getBookShelf = useUserBookLibraryStore((s) => s.getBookCurrentShelf);
  const getBook = useUserBookLibraryStore((s) => s.getBookById);
  const rateBook = useUserBookLibraryStore((s) => s.rateBookWithReview);
  const allTags = useUserBookLibraryStore((s) => s.tags);
  const customShelves = useUserBookLibraryStore((s) => s.customShelves);
  const createTag = useUserBookLibraryStore((s) => s.createTag);
  const addTagToBook = useUserBookLibraryStore((s) => s.addTagToBook);
  const removeTagFromBook = useUserBookLibraryStore((s) => s.removeTagFromBook);
  const uploadedFiles = useUserBookLibraryStore((s) => s.uploadedFiles);
  const saveBookUploadedFile = useUserBookLibraryStore((s) => s.saveBookUploadedFile);
  const removeBookUploadedFile = useUserBookLibraryStore((s) => s.removeBookUploadedFile);

  // Reader store
  const saveUploadedFile = useEpubReaderStore((s) => s.saveUploadedFile);
  const getUploadedFile = useEpubReaderStore((s) => s.getUploadedFile);
  const removeUploadedFile = useEpubReaderStore((s) => s.removeUploadedFile);

  const bookId = book?.id;
  const stored = getBook(bookId);
  const shelf = getBookShelf(bookId);
  const uploadedFile = getUploadedFile(bookId);
  const hasEpub = !!uploadedFile || !!uploadedFiles[bookId];
  const bookTags = stored?.tags || [];
  const allShelves = [...BUILT_IN_SHELVES, ...customShelves.map(s => ({ key: s.id, label: s.label }))];

  useEffect(() => {
    if (book) {
      trackScreenView('BookDetail', { bookId: book.id, bookTitle: book.title, shelf, hasEpub });
      console.log(`[Screen] BookDetail viewed: "${book.title}" (shelf: ${shelf || 'none'})`);
    }
  }, [book?.id]);

  if (!book) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Book not found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleAddToShelf = (s) => {
    addToShelf(book, s);
    setShowShelfPicker(false);
  };

  const handleRemove = () => {
    Alert.alert('Remove book?', 'This will remove the book from your library.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeFromShelf(bookId) },
    ]);
  };

  const handleRate = (stars) => {
    rateBook(bookId, stars, stored?.review ?? '');
  };

  const handleToggleTag = (tagId) => {
    bookTags.includes(tagId) ? removeTagFromBook(bookId, tagId) : addTagToBook(bookId, tagId);
  };

  const handleCreateTag = (name, color) => {
    const newTag = createTag(name, color);
    addTagToBook(bookId, newTag.id);
    track(EventType.CUSTOM_ACTION, EventCategory.LIBRARY, { action: 'create_tag', name });
  };

  const openLink = (url) => {
    if (url) {
      track(EventType.MODAL_OPEN, EventCategory.NAVIGATION, { type: 'external_link', url, bookId });
      Linking.openURL(url);
    }
  };

  const handleImportEpub = async () => {
    try {
      setImporting(true);
      track(EventType.EPUB_IMPORT_START, EventCategory.LIBRARY, { bookId, bookTitle: book.title });
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/epub+zip', copyToCacheDirectory: true, multiple: false });
      if (result.canceled) { setImporting(false); return; }

      const file = result.assets?.[0] || result;
      if (!file?.uri) { setImporting(false); return; }

      const ext = file.name?.split('.').pop()?.toLowerCase();
      if (ext !== 'epub') {
        Alert.alert('Invalid File', 'Please select an EPUB (.epub) file.');
        setImporting(false);
        return;
      }

      const booksDir = FileSystem.documentDirectory + 'books/';
      const dirInfo = await FileSystem.getInfoAsync(booksDir);
      if (!dirInfo.exists) await FileSystem.makeDirectoryAsync(booksDir, { intermediates: true });

      const destPath = booksDir + bookId + '.epub';
      await FileSystem.copyAsync({ from: file.uri, to: destPath });

      const fileInfo = { uri: destPath, fileName: file.name, fileSize: file.size || 0 };
      saveUploadedFile(bookId, fileInfo);
      saveBookUploadedFile(bookId, fileInfo);
      if (!shelf) addToShelf(book, 'reading');

      trackEpubImport(bookId, true, file.size || 0);
      Alert.alert('Success', 'EPUB imported! Tap "Read Now" to start reading.');
    } catch (error) {
      trackEpubImport(bookId, false, 0, error);
      Alert.alert('Error', `Failed to import: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  const handleRemoveFile = () => {
    Alert.alert('Remove E-Book?', 'This will delete the imported file.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
          try {
            if (uploadedFile?.uri) {
              const info = await FileSystem.getInfoAsync(uploadedFile.uri);
              if (info.exists) await FileSystem.deleteAsync(uploadedFile.uri, { idempotent: true });
            }
            removeUploadedFile(bookId);
            removeBookUploadedFile(bookId);
            track(EventType.EPUB_DELETE, EventCategory.LIBRARY, { bookId });
          } catch (e) {
            removeUploadedFile(bookId);
            removeBookUploadedFile(bookId);
          }
        }
      },
    ]);
  };

  const rawDesc = book.description?.replace(/<[^>]+>/g, '') ?? '';

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Book Details"
        onBack={() => navigation.goBack()}
        rightContent={shelf && (
          <TouchableOpacity onPress={handleRemove}>
            <MaterialCommunityIcons name="delete-outline" size={24} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <HeroSection book={book} shelf={shelf} hasEpub={hasEpub} />

        <ShelfPicker
          shelf={shelf}
          allShelves={allShelves}
          showPicker={showShelfPicker}
          onTogglePicker={() => setShowShelfPicker(!showShelfPicker)}
          onSelectShelf={handleAddToShelf}
        />

        {shelf && (
          <TagsSection bookTags={bookTags} allTags={allTags} onManageTags={() => setShowTagsModal(true)} />
        )}

        {shelf && hasEpub && (
          <ReadingProgressSection
            progress={stored?.progress ?? 0}
            currentPage={stored?.currentPage}
            totalPages={stored?.totalPages}
          />
        )}

        {shelf && <RatingSection rating={stored?.rating ?? 0} onRate={handleRate} />}

        <DescriptionSection description={rawDesc.length > 0 ? rawDesc : null} />
        <CategoriesSection categories={book.categories} />
        <PublicationDetails book={book} />
        <LinksSection book={book} onOpenLink={openLink} />

        <EbookSection
          uploadedFile={uploadedFile}
          importing={importing}
          onImport={handleImportEpub}
          onReadNow={() => navigation.navigate('Reader', { bookId })}
          onRemoveFile={handleRemoveFile}
        />
      </ScrollView>

      <TagsModal
        visible={showTagsModal}
        onClose={() => setShowTagsModal(false)}
        allTags={allTags}
        bookTags={bookTags}
        onToggleTag={handleToggleTag}
        onCreateTag={handleCreateTag}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPrimary },
  centered: { justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.xl },
  errorText: { fontSize: 16, color: colors.error, marginBottom: spacing.lg },
  backBtn: { backgroundColor: colors.accent, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  backBtnText: { color: colors.textPrimary, fontSize: 16, fontWeight: '600' },
});
