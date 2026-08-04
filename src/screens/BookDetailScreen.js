import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, Alert, Image, Linking, ActivityIndicator, Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useUserBookLibraryStore } from '../features/library/store/userBookLibraryStore';
import { useEpubReaderStore } from '../features/reader/store/epubReaderStore';
import { 
  trackScreenView, 
  trackEpubImport, 
  track, 
  EventType, 
  EventCategory 
} from '../utils/analytics';
import {
  TAG_INPUT_PLACEHOLDER,
  TAG_BUTTON_CREATE,
  TAG_DEFAULT_COLORS,
  TAG_MAX_PER_BOOK,
} from '../features/library/constants/libraryFeatureConstants';

const BUILT_IN_SHELVES = [
  { key: 'reading',      label: 'Currently Reading' },
  { key: 'want_to_read', label: 'Want to Read'      },
  { key: 'finished',     label: 'Finished'          },
  { key: 'dnf',          label: 'Did Not Finish'    },
];

function StarRating({ value, onChange, readonly = false }) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        <TouchableOpacity 
          key={i} 
          onPress={() => !readonly && onChange?.(i)} 
          style={styles.starBtn}
          disabled={readonly}
        >
          <MaterialCommunityIcons
            name={i <= value ? 'star' : 'star-outline'}
            size={readonly ? 18 : 32}
            color="#FFD700"
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

function MetaRow({ label, value, icon }) {
  if (!value) return null;
  return (
    <View style={styles.metaRow}>
      {icon && <MaterialCommunityIcons name={icon} size={16} color="#888" />}
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

function Badge({ label, color, icon }) {
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      {icon && <MaterialCommunityIcons name={icon} size={12} color="#fff" />}
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

function TagsModal({ visible, onClose, allTags, bookTags, onToggleTag, onCreateTag }) {
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(TAG_DEFAULT_COLORS[0]);

  const handleCreateTag = () => {
    if (newTagName.trim()) {
      onCreateTag(newTagName.trim(), selectedColor);
      setNewTagName('');
      setSelectedColor(TAG_DEFAULT_COLORS[(allTags.length + 1) % TAG_DEFAULT_COLORS.length]);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Manage Tags</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.modalScroll} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {/* Create new tag */}
            <Text style={styles.modalSectionTitle}>Create New Tag</Text>
            <View style={styles.createTagRow}>
              <TextInput
                style={styles.createTagInput}
                value={newTagName}
                onChangeText={setNewTagName}
                placeholder={TAG_INPUT_PLACEHOLDER}
                placeholderTextColor="#888"
                maxLength={30}
              />
              <TouchableOpacity
                style={[styles.createTagBtn, !newTagName.trim() && styles.createTagBtnDisabled]}
                onPress={handleCreateTag}
                disabled={!newTagName.trim()}
              >
                <Text style={styles.createTagBtnText}>{TAG_BUTTON_CREATE}</Text>
              </TouchableOpacity>
            </View>

            {/* Color picker */}
            <View style={styles.colorPickerRow}>
              {TAG_DEFAULT_COLORS.map(color => (
                <TouchableOpacity
                  key={color}
                  style={[styles.colorDot, { backgroundColor: color },
                    selectedColor === color && styles.colorDotSelected]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>

            {/* Existing tags */}
            <Text style={styles.modalSectionTitle}>
              Select Tags {bookTags.length > 0 && `(${bookTags.length}/${TAG_MAX_PER_BOOK})`}
            </Text>
            {allTags.length === 0 ? (
              <Text style={styles.emptyTagsText}>No tags created yet. Create one above!</Text>
            ) : (
              <View style={styles.tagsGrid}>
                {allTags.map(tag => {
                  const isSelected = bookTags.includes(tag.id);
                  const isDisabled = !isSelected && bookTags.length >= TAG_MAX_PER_BOOK;
                  return (
                    <TouchableOpacity
                      key={tag.id}
                      style={[styles.tagOption, { borderColor: tag.color },
                        isSelected && { backgroundColor: tag.color },
                        isDisabled && styles.tagOptionDisabled]}
                      onPress={() => !isDisabled && onToggleTag(tag.id)}
                      disabled={isDisabled}
                    >
                      <Text style={[styles.tagOptionText, isSelected && styles.tagOptionTextSelected]}>
                        {tag.label}
                      </Text>
                      {isSelected && (
                        <MaterialCommunityIcons name="check" size={14} color="#fff" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

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

  // Build all shelves list (built-in + custom)
  const allShelves = [...BUILT_IN_SHELVES, ...customShelves.map(s => ({ key: s.id, label: s.label }))];

  // Track screen view
  useEffect(() => {
    if (book) {
      trackScreenView('BookDetail', { 
        bookId: book.id, bookTitle: book.title, shelf, hasEpub 
      });
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

  const handleAddToShelf = (s) => {
    addToShelf(book, s);
    setShowShelfPicker(false);
    console.log(`[BookDetail] Added to shelf: ${s}`);
  };

  const handleRemove = () => {
    Alert.alert('Remove book?', 'This will remove the book from your library.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => {
          console.log(`[BookDetail] Removed from library: "${book.title}"`);
          removeFromShelf(bookId);
        }
      },
    ]);
  };

  const handleRate = (stars) => {
    rateBook(bookId, stars, stored?.review ?? '');
    console.log(`[BookDetail] Rated ${stars} stars`);
  };

  const handleToggleTag = (tagId) => {
    if (bookTags.includes(tagId)) {
      removeTagFromBook(bookId, tagId);
    } else {
      addTagToBook(bookId, tagId);
    }
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

  // Import EPUB file
  const handleImportEpub = async () => {
    try {
      setImporting(true);
      console.log(`[BookDetail] Starting EPUB import for "${book.title}"`);
      track(EventType.EPUB_IMPORT_START, EventCategory.LIBRARY, { bookId, bookTitle: book.title });
      
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/epub+zip',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) { 
        console.log('[BookDetail] EPUB import cancelled');
        setImporting(false); 
        return; 
      }

      const file = result.assets?.[0] || result;
      if (!file?.uri) { setImporting(false); return; }

      const ext = file.name?.split('.').pop()?.toLowerCase();
      if (ext !== 'epub') {
        Alert.alert('Invalid File', 'Please select an EPUB (.epub) file.');
        setImporting(false);
        return;
      }

      // Ensure books directory exists
      const booksDir = FileSystem.documentDirectory + 'books/';
      const dirInfo = await FileSystem.getInfoAsync(booksDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(booksDir, { intermediates: true });
      }

      // Copy to permanent storage
      const destPath = booksDir + bookId + '.epub';
      await FileSystem.copyAsync({ from: file.uri, to: destPath });

      // Save to both stores
      const fileInfo = { uri: destPath, fileName: file.name, fileSize: file.size || 0 };
      saveUploadedFile(bookId, fileInfo);
      saveBookUploadedFile(bookId, fileInfo);

      if (!shelf) addToShelf(book, 'reading');

      trackEpubImport(bookId, true, file.size || 0);
      console.log(`[BookDetail] EPUB imported: ${file.name}`);
      Alert.alert('Success', 'EPUB imported! Tap "Read Now" to start reading.');
    } catch (error) {
      trackEpubImport(bookId, false, 0, error);
      console.log(`[BookDetail] EPUB import failed: ${error.message}`);
      Alert.alert('Error', `Failed to import: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  // Remove imported file
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
            console.warn('[BookDetail] Delete file error:', e.message);
            removeUploadedFile(bookId);
            removeBookUploadedFile(bookId);
          }
        }
      },
    ]);
  };

  const rawDesc = book.description?.replace(/<[^>]+>/g, '') ?? '';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Details</Text>
        {shelf && (
          <TouchableOpacity onPress={handleRemove}>
            <MaterialCommunityIcons name="delete-outline" size={24} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero section */}
        <View style={styles.hero}>
          {book.thumbnail ? (
            <Image source={{ uri: book.thumbnail }} style={styles.cover} />
          ) : (
            <View style={[styles.cover, styles.noCover]}>
              <Text style={styles.noCoverText}>No Cover</Text>
            </View>
          )}
          <View style={styles.heroInfo}>
            <Text style={styles.bookTitle}>{book.title}</Text>
            {book.subtitle && <Text style={styles.bookSubtitle}>{book.subtitle}</Text>}
            {book.authors?.length > 0 && (
              <Text style={styles.bookAuthor}>{book.authors.join(', ')}</Text>
            )}
            
            <View style={styles.quickStats}>
              {book.publishedDate && (
                <Text style={styles.quickStatText}>{book.publishedDate.slice(0, 4)}</Text>
              )}
              {book.pageCount > 0 && (
                <Text style={styles.quickStatText}>{book.pageCount} pages</Text>
              )}
            </View>

            {book.averageRating > 0 && (
              <View style={styles.googleRating}>
                <StarRating value={Math.round(book.averageRating)} readonly />
                <Text style={styles.ratingText}>
                  {book.averageRating.toFixed(1)} ({book.ratingsCount})
                </Text>
              </View>
            )}

            <View style={styles.badgesRow}>
              {hasEpub && <Badge label="EREADER" color="#16a34a" icon="book-open-page-variant" />}
              {book.isEbook && <Badge label="EBOOK" color="#2563eb" icon="book-open-variant" />}
              {book.isFree && <Badge label="FREE" color="#7c3aed" icon="gift" />}
              {shelf && <Badge label={shelf.replace('_', ' ').toUpperCase()} color="#e94560" />}
            </View>
          </View>
        </View>

        {/* Add to shelf button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowShelfPicker(!showShelfPicker)}
        >
          <MaterialCommunityIcons name={shelf ? 'bookshelf' : 'plus'} size={20} color="#fff" />
          <Text style={styles.addButtonText}>
            {shelf ? 'Change Shelf' : 'Add to Library'}
          </Text>
        </TouchableOpacity>

        {/* Shelf picker */}
        {showShelfPicker && (
          <View style={styles.shelfPicker}>
            {allShelves.map(({ key, label }) => (
              <TouchableOpacity
                key={key}
                style={[styles.shelfOption, shelf === key && styles.shelfOptionActive]}
                onPress={() => handleAddToShelf(key)}
              >
                <Text style={[styles.shelfOptionText, shelf === key && styles.shelfOptionTextActive]}>
                  {label}
                </Text>
                {shelf === key && <MaterialCommunityIcons name="check" size={18} color="#e94560" />}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Tags section (only when in library) */}
        {shelf && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <TouchableOpacity onPress={() => setShowTagsModal(true)}>
                <MaterialCommunityIcons name="plus-circle" size={24} color="#e94560" />
              </TouchableOpacity>
            </View>
            {bookTags.length === 0 ? (
              <Text style={styles.noTagsText}>No tags - tap + to add</Text>
            ) : (
              <View style={styles.tagsDisplayRow}>
                {bookTags.map(tagId => {
                  const tag = allTags.find(t => t.id === tagId);
                  if (!tag) return null;
                  return (
                    <View key={tagId} style={[styles.tagDisplay, { backgroundColor: tag.color }]}>
                      <Text style={styles.tagDisplayText}>{tag.label}</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* Reading Progress - ONLY shown when has EPUB */}
        {shelf && hasEpub && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reading Progress</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${stored?.progress ?? 0}%` }]} />
            </View>
            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>{stored?.progress ?? 0}% complete</Text>
              {stored?.currentPage > 0 && stored?.totalPages > 0 && (
                <Text style={styles.pageText}>
                  Page {stored.currentPage} of {stored.totalPages}
                </Text>
              )}
            </View>
            <Text style={styles.progressHint}>
              Progress updates automatically as you read
            </Text>
          </View>
        )}

        {/* My Rating (when in library) */}
        {shelf && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Rating</Text>
            <StarRating value={stored?.rating ?? 0} onChange={handleRate} />
          </View>
        )}

        {/* Description */}
        {rawDesc.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descText}>{rawDesc}</Text>
          </View>
        )}

        {/* Categories */}
        {book.categories?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <View style={styles.categoriesRow}>
              {book.categories.map((cat, i) => (
                <View key={i} style={styles.categoryChip}>
                  <Text style={styles.categoryText}>{cat}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Publication Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Publication Details</Text>
          <View style={styles.detailsCard}>
            <MetaRow icon="domain" label="Publisher" value={book.publisher} />
            <MetaRow icon="calendar" label="Published" value={book.publishedDate} />
            <MetaRow icon="book-open-page-variant" label="Pages" value={book.pageCount > 0 ? String(book.pageCount) : null} />
            <MetaRow icon="translate" label="Language" value={book.language?.toUpperCase()} />
            <MetaRow icon="barcode" label="ISBN" value={book.isbn} />
          </View>
        </View>

        {/* Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Links</Text>
          <View style={styles.linksRow}>
            {book.previewLink && (
              <TouchableOpacity style={styles.linkBtn} onPress={() => openLink(book.previewLink)}>
                <MaterialCommunityIcons name="book-open-variant" size={18} color="#fff" />
                <Text style={styles.linkBtnText}>Preview</Text>
              </TouchableOpacity>
            )}
            {book.infoLink && (
              <TouchableOpacity style={styles.linkBtn} onPress={() => openLink(book.infoLink)}>
                <MaterialCommunityIcons name="information" size={18} color="#fff" />
                <Text style={styles.linkBtnText}>More Info</Text>
              </TouchableOpacity>
            )}
            {book.buyLink && (
              <TouchableOpacity style={[styles.linkBtn, styles.buyBtn]} onPress={() => openLink(book.buyLink)}>
                <MaterialCommunityIcons name="cart" size={18} color="#fff" />
                <Text style={styles.linkBtnText}>Buy</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* E-Book Reader Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>E-Book Reader</Text>
          <View style={styles.detailsCard}>
            {uploadedFile ? (
              <>
                <View style={styles.fileInfo}>
                  <MaterialCommunityIcons name="file-document" size={20} color="#e94560" />
                  <View style={styles.fileInfoText}>
                    <Text style={styles.fileName} numberOfLines={1}>{uploadedFile.fileName}</Text>
                    <Text style={styles.fileSize}>
                      {(uploadedFile.fileSize / 1024 / 1024).toFixed(2)} MB
                    </Text>
                  </View>
                </View>
                <View style={styles.readerButtons}>
                  <TouchableOpacity
                    style={styles.readNowBtn}
                    onPress={() => navigation.navigate('Reader', { bookId })}
                  >
                    <MaterialCommunityIcons name="book-open-page-variant" size={20} color="#fff" />
                    <Text style={styles.readNowBtnText}>Read Now</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.removeFileBtn} onPress={handleRemoveFile}>
                    <MaterialCommunityIcons name="delete-outline" size={20} color="#ff6b6b" />
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <TouchableOpacity
                style={styles.importBtn}
                onPress={handleImportEpub}
                disabled={importing}
              >
                {importing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="file-upload" size={20} color="#fff" />
                    <Text style={styles.importBtnText}>Import EPUB File</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
            <Text style={styles.readerHint}>
              Import your own EPUB file to read with bookmarks and auto-saved progress.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Tags Modal */}
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
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#333', gap: 12,
  },
  backButton: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '600', color: '#fff' },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 20 },
  errorText: { fontSize: 16, color: '#ff6b6b', marginBottom: 16 },
  backBtn: { backgroundColor: '#e94560', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  backBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  hero: { flexDirection: 'row', gap: 16 },
  cover: { width: 120, height: 180, borderRadius: 8, backgroundColor: '#444' },
  noCover: { justifyContent: 'center', alignItems: 'center' },
  noCoverText: { fontSize: 12, color: '#888', textAlign: 'center' },
  heroInfo: { flex: 1, gap: 6 },
  bookTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', lineHeight: 24 },
  bookSubtitle: { fontSize: 14, color: '#aaa', fontStyle: 'italic' },
  bookAuthor: { fontSize: 15, color: '#e94560', marginTop: 2 },
  quickStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  quickStatText: { fontSize: 12, color: '#888' },
  googleRating: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  ratingText: { fontSize: 12, color: '#888' },
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: { fontSize: 10, fontWeight: '600', color: '#fff' },

  addButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#e94560', paddingVertical: 14, borderRadius: 8,
  },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  shelfPicker: { backgroundColor: '#2a2a4e', borderRadius: 8, borderWidth: 1, borderColor: '#444', overflow: 'hidden' },
  shelfOption: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderBottomWidth: 1, borderBottomColor: '#333',
  },
  shelfOptionActive: { backgroundColor: 'rgba(233, 69, 96, 0.1)' },
  shelfOptionText: { fontSize: 16, color: '#fff' },
  shelfOptionTextActive: { color: '#e94560', fontWeight: '600' },
  section: { gap: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#fff' },
  progressBar: { height: 8, backgroundColor: '#444', borderRadius: 4 },
  progressFill: { height: '100%', backgroundColor: '#e94560', borderRadius: 4 },
  progressInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressText: { fontSize: 14, color: '#fff', fontWeight: '500' },
  pageText: { fontSize: 12, color: '#888' },
  progressHint: { fontSize: 12, color: '#666', fontStyle: 'italic' },
  starRow: { flexDirection: 'row', gap: 2 },
  starBtn: { padding: 2 },
  descText: { fontSize: 14, color: '#ccc', lineHeight: 22 },
  categoriesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: { backgroundColor: '#2a2a4e', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#444' },
  categoryText: { fontSize: 12, color: '#ccc' },

  detailsCard: { backgroundColor: '#2a2a4e', borderRadius: 8, padding: 12, gap: 10 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaLabel: { fontSize: 13, color: '#888', width: 90 },
  metaValue: { flex: 1, fontSize: 13, color: '#fff' },
  linksRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  linkBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#2a2a4e',
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#444',
  },
  buyBtn: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  linkBtnText: { fontSize: 13, color: '#fff', fontWeight: '500' },
  // Tags display
  noTagsText: { fontSize: 14, color: '#666', fontStyle: 'italic' },
  tagsDisplayRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagDisplay: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  tagDisplayText: { fontSize: 13, color: '#fff', fontWeight: '500' },
  // E-Book section
  fileInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  fileInfoText: { flex: 1 },
  fileName: { fontSize: 14, color: '#fff', fontWeight: '500' },
  fileSize: { fontSize: 12, color: '#888', marginTop: 2 },
  readerButtons: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  readNowBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#16a34a', paddingVertical: 14, borderRadius: 8,
  },
  readNowBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  removeFileBtn: {
    width: 48, height: 48, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  importBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#e94560', paddingVertical: 14, borderRadius: 8, marginBottom: 8,
  },
  importBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  readerHint: { fontSize: 12, color: '#888', lineHeight: 18, textAlign: 'center' },

  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1a1a2e', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%', minHeight: 400, padding: 20, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  modalScroll: { flexGrow: 1 },
  modalSectionTitle: { fontSize: 14, fontWeight: '600', color: '#888', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  createTagRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  createTagInput: {
    flex: 1, backgroundColor: '#2a2a4e', borderWidth: 1, borderColor: '#444',
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#fff',
  },
  createTagBtn: { backgroundColor: '#e94560', paddingHorizontal: 16, borderRadius: 8, justifyContent: 'center' },
  createTagBtnDisabled: { backgroundColor: '#444' },
  createTagBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  colorPickerRow: { flexDirection: 'row', gap: 10, marginBottom: 20, flexWrap: 'wrap' },
  colorDot: { width: 28, height: 28, borderRadius: 14 },
  colorDotSelected: { borderWidth: 3, borderColor: '#fff' },
  emptyTagsText: { fontSize: 14, color: '#666', marginBottom: 16 },
  tagsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagOption: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14,
    paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, backgroundColor: '#2a2a4e',
  },
  tagOptionDisabled: { opacity: 0.5 },
  tagOptionText: { fontSize: 14, color: '#ccc' },
  tagOptionTextSelected: { color: '#fff', fontWeight: '500' },
});
