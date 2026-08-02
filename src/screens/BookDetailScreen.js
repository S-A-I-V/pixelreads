import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, Alert, Image, Linking, ActivityIndicator,
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

const SHELVES = [
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

export default function BookDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  const { book } = route.params ?? {};

  const [progressText, setProgressText] = useState('');
  const [showShelfPicker, setShowShelfPicker] = useState(false);
  const [importing, setImporting] = useState(false);

  const addToShelf = useUserBookLibraryStore((s) => s.addBookToShelf);
  const removeFromShelf = useUserBookLibraryStore((s) => s.removeBookFromLibrary);
  const getBookShelf = useUserBookLibraryStore((s) => s.getBookCurrentShelf);
  const getBook = useUserBookLibraryStore((s) => s.getBookById);
  const rateBook = useUserBookLibraryStore((s) => s.rateBookWithReview);
  const updateProgress = useUserBookLibraryStore((s) => s.updateBookReadingProgress);

  // Reader store
  const saveUploadedFile = useEpubReaderStore((s) => s.saveUploadedFile);
  const getUploadedFile = useEpubReaderStore((s) => s.getUploadedFile);
  const removeUploadedFile = useEpubReaderStore((s) => s.removeUploadedFile);

  const bookId = book?.id;
  const stored = getBook(bookId);
  const shelf = getBookShelf(bookId);
  const uploadedFile = getUploadedFile(bookId);

  useEffect(() => {
    if (stored?.progress) setProgressText(String(stored.progress));
  }, [stored?.progress]);

  // Track screen view
  useEffect(() => {
    if (book) {
      trackScreenView('BookDetail', { 
        bookId: book.id, 
        bookTitle: book.title,
        shelf,
        hasEpub: !!uploadedFile 
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
      { 
        text: 'Remove', 
        style: 'destructive', 
        onPress: () => {
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

  const handleSaveProgress = () => {
    const val = Math.min(100, Math.max(0, parseInt(progressText, 10) || 0));
    updateProgress(bookId, val);
    setProgressText(String(val));
    console.log(`[BookDetail] Progress saved: ${val}%`);
  };

  const openLink = (url) => {
    if (url) {
      track(EventType.MODAL_OPEN, EventCategory.NAVIGATION, { 
        type: 'external_link', 
        url,
        bookId 
      });
      console.log(`[BookDetail] Opening external link`);
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

      saveUploadedFile(bookId, {
        uri: destPath,
        fileName: file.name,
        fileSize: file.size || 0,
      });

      if (!shelf) addToShelf(book, 'reading');

      trackEpubImport(bookId, true, file.size || 0);
      console.log(`[BookDetail] EPUB imported successfully: ${file.name} (${(file.size/1024/1024).toFixed(2)}MB)`);
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
    Alert.alert(
      'Remove E-Book?',
      'This will delete the imported file. You can import it again later.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              if (uploadedFile?.uri) {
                const info = await FileSystem.getInfoAsync(uploadedFile.uri);
                if (info.exists) {
                  await FileSystem.deleteAsync(uploadedFile.uri, { idempotent: true });
                }
              }
              removeUploadedFile(bookId);
              track(EventType.EPUB_DELETE, EventCategory.LIBRARY, { bookId, bookTitle: book.title });
              console.log(`[BookDetail] EPUB file deleted: "${book.title}"`);
            } catch (e) {
              // Even if file delete fails, clear the store reference
              console.warn('[BookDetail] Delete file error (clearing store anyway):', e.message);
              removeUploadedFile(bookId);
            }
          },
        },
      ]
    );
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
            {book.subtitle && (
              <Text style={styles.bookSubtitle}>{book.subtitle}</Text>
            )}
            {book.authors?.length > 0 && (
              <Text style={styles.bookAuthor}>{book.authors.join(', ')}</Text>
            )}
            
            {/* Quick stats row */}
            <View style={styles.quickStats}>
              {book.publishedDate && (
                <Text style={styles.quickStatText}>{book.publishedDate.slice(0, 4)}</Text>
              )}
              {book.pageCount > 0 && (
                <Text style={styles.quickStatText}>{book.pageCount} pages</Text>
              )}
              {book.language && (
                <Text style={styles.quickStatText}>{book.language.toUpperCase()}</Text>
              )}
            </View>

            {/* Google rating */}
            {book.averageRating > 0 && (
              <View style={styles.googleRating}>
                <StarRating value={Math.round(book.averageRating)} readonly />
                <Text style={styles.ratingText}>
                  {book.averageRating.toFixed(1)} ({book.ratingsCount} reviews)
                </Text>
              </View>
            )}

            {/* Badges */}
            <View style={styles.badgesRow}>
              {book.isEbook && <Badge label="EBOOK" color="#2563eb" icon="book-open-variant" />}
              {book.isFree && <Badge label="FREE" color="#16a34a" icon="gift" />}
              {book.publicDomain && <Badge label="PUBLIC DOMAIN" color="#7c3aed" />}
              {shelf && <Badge label={shelf.replace('_', ' ').toUpperCase()} color="#e94560" />}
            </View>
          </View>
        </View>

        {/* Add to shelf button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowShelfPicker(!showShelfPicker)}
        >
          <MaterialCommunityIcons
            name={shelf ? 'bookshelf' : 'plus'}
            size={20}
            color="#fff"
          />
          <Text style={styles.addButtonText}>
            {shelf ? 'Change Shelf' : 'Add to Library'}
          </Text>
        </TouchableOpacity>

        {/* Shelf picker */}
        {showShelfPicker && (
          <View style={styles.shelfPicker}>
            {SHELVES.map(({ key, label }) => (
              <TouchableOpacity
                key={key}
                style={[styles.shelfOption, shelf === key && styles.shelfOptionActive]}
                onPress={() => handleAddToShelf(key)}
              >
                <Text style={[styles.shelfOptionText, shelf === key && styles.shelfOptionTextActive]}>
                  {label}
                </Text>
                {shelf === key && (
                  <MaterialCommunityIcons name="check" size={18} color="#e94560" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Progress (reading shelf only) */}
        {shelf === 'reading' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reading Progress</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${stored?.progress ?? 0}%` }]} />
            </View>
            <View style={styles.progressRow}>
              <TextInput
                style={styles.progressInput}
                value={progressText}
                onChangeText={setProgressText}
                keyboardType="number-pad"
                maxLength={3}
                placeholder="0"
                placeholderTextColor="#888"
              />
              <Text style={styles.pctSign}>%</Text>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProgress}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
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
            <MetaRow icon="shield-check" label="Maturity" value={book.maturityRating} />
          </View>
        </View>

        {/* Availability */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Availability</Text>
          <View style={styles.detailsCard}>
            <MetaRow icon="cart" label="Saleability" value={book.saleability} />
            <MetaRow icon="currency-usd" label="Price" value={book.price} />
            <MetaRow icon="eye" label="Viewability" value={book.viewability} />
            <MetaRow icon="file-pdf-box" label="PDF Available" value={book.pdfAvailable ? 'Yes' : 'No'} />
            <MetaRow icon="file-document" label="EPUB Available" value={book.epubAvailable ? 'Yes' : 'No'} />
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
            {book.webReaderLink && (
              <TouchableOpacity style={styles.linkBtn} onPress={() => openLink(book.webReaderLink)}>
                <MaterialCommunityIcons name="web" size={18} color="#fff" />
                <Text style={styles.linkBtnText}>Read Online</Text>
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
              Import your own EPUB file to read within the app with bookmarks, highlights, and reading progress.
            </Text>
          </View>
        </View>

        {/* Book ID (for debugging) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Identifiers</Text>
          <View style={styles.detailsCard}>
            <MetaRow icon="identifier" label="Google Books ID" value={book.id} />
            {book.isbn && <MetaRow icon="barcode" label="ISBN" value={book.isbn} />}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff6b6b',
    marginBottom: 16,
  },
  backBtn: {
    backgroundColor: '#e94560',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  hero: {
    flexDirection: 'row',
    gap: 16,
  },
  cover: {
    width: 120,
    height: 180,
    borderRadius: 8,
    backgroundColor: '#444',
  },
  noCover: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noCoverText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  heroInfo: {
    flex: 1,
    gap: 6,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    lineHeight: 24,
  },
  bookSubtitle: {
    fontSize: 14,
    color: '#aaa',
    fontStyle: 'italic',
  },
  bookAuthor: {
    fontSize: 15,
    color: '#e94560',
    marginTop: 2,
  },
  quickStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  quickStatText: {
    fontSize: 12,
    color: '#888',
  },
  googleRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#888',
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#e94560',
    paddingVertical: 14,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  shelfPicker: {
    backgroundColor: '#2a2a4e',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
    overflow: 'hidden',
  },
  shelfOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  shelfOptionActive: {
    backgroundColor: 'rgba(233, 69, 96, 0.1)',
  },
  shelfOptionText: {
    fontSize: 16,
    color: '#fff',
  },
  shelfOptionTextActive: {
    color: '#e94560',
    fontWeight: '600',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#444',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#e94560',
    borderRadius: 4,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressInput: {
    width: 60,
    fontSize: 16,
    color: '#fff',
    backgroundColor: '#2a2a4e',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    padding: 10,
    textAlign: 'center',
  },
  pctSign: {
    fontSize: 16,
    color: '#888',
  },
  saveBtn: {
    backgroundColor: '#2a2a4e',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  starRow: {
    flexDirection: 'row',
    gap: 2,
  },
  starBtn: {
    padding: 2,
  },
  descText: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 22,
  },
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    backgroundColor: '#2a2a4e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#444',
  },
  categoryText: {
    fontSize: 12,
    color: '#ccc',
  },
  detailsCard: {
    backgroundColor: '#2a2a4e',
    borderRadius: 8,
    padding: 12,
    gap: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaLabel: {
    fontSize: 13,
    color: '#888',
    width: 90,
  },
  metaValue: {
    flex: 1,
    fontSize: 13,
    color: '#fff',
  },
  linksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2a2a4e',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  buyBtn: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  linkBtnText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '500',
  },
  // E-Book Reader section
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  fileInfoText: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  fileSize: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  readerButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  readNowBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    borderRadius: 8,
  },
  readNowBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  removeFileBtn: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  importBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#e94560',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 8,
  },

  importBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  readerHint: {
    fontSize: 12,
    color: '#888',
    lineHeight: 18,
    textAlign: 'center',
  },
});
