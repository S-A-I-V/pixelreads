import React from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, ScrollView, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { READER_THEMES, FONT_SIZE_STEPS } from './readerConstants';
import { colors } from '../../theme';

// ─── Shared sheet wrapper ────────────────────────────────────────────────────
function SheetWrapper({ visible, onClose, title, theme, children }) {
  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: theme.bg }]}>
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: theme.text }]}>{title}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <MaterialCommunityIcons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}

// ─── TOC Modal ───────────────────────────────────────────────────────────────
export function TOCModal({ visible, onClose, theme, tocData, toc, onGoTo }) {
  const items = tocData?.length > 0 ? tocData : (toc || []);

  return (
    <SheetWrapper visible={visible} onClose={onClose} title="Table of Contents" theme={theme}>
      <ScrollView>
        {items.length === 0 ? (
          <Text style={[styles.emptyMsg, { color: theme.text }]}>No table of contents available.</Text>
        ) : (
          items.map((item, i) => (
            <TouchableOpacity key={i} style={styles.listRow} onPress={() => { onGoTo(item.href); onClose(); }}>
              <MaterialCommunityIcons name="book-open-page-variant" size={16} color={colors.accent} />
              <Text style={[styles.listLabel, { color: theme.text }]}>{item.label}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SheetWrapper>
  );
}

// ─── Settings Modal ──────────────────────────────────────────────────────────
export function SettingsModal({ visible, onClose, theme, settings, onDecreaseFontSize, onIncreaseFontSize, onChangeTheme }) {
  return (
    <SheetWrapper visible={visible} onClose={onClose} title="Reading Settings" theme={theme}>
      <Text style={[styles.settingGroup, { color: theme.text }]}>Font Size</Text>
      <View style={styles.fontRow}>
        <TouchableOpacity style={styles.fontBtn} onPress={onDecreaseFontSize}>
          <Text style={styles.fontBtnText}>A−</Text>
        </TouchableOpacity>
        <Text style={[styles.fontValue, { color: theme.text }]}>{settings.fontSize}%</Text>
        <TouchableOpacity style={styles.fontBtn} onPress={onIncreaseFontSize}>
          <Text style={styles.fontBtnText}>A+</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.settingGroup, { color: theme.text }]}>Theme</Text>
      <View style={styles.themeRow}>
        {Object.values(READER_THEMES).map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.themeChip, { backgroundColor: t.bg, borderColor: t.text }, settings.theme === t.key && styles.themeChipActive]}
            onPress={() => onChangeTheme(t)}
          >
            <MaterialCommunityIcons name={t.icon} size={18} color={t.text} />
            <Text style={[styles.themeLabel, { color: t.text }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SheetWrapper>
  );
}

// ─── Bookmarks Modal ─────────────────────────────────────────────────────────
export function BookmarksModal({ visible, onClose, theme, bookmarks, onGoTo }) {
  return (
    <SheetWrapper visible={visible} onClose={onClose} title="Bookmarks" theme={theme}>
      <ScrollView>
        {(!bookmarks || bookmarks.length === 0) ? (
          <Text style={[styles.emptyMsg, { color: theme.text }]}>
            No bookmarks yet.{'\n'}Tap the bookmark icon while reading to add one.
          </Text>
        ) : (
          bookmarks.map((bm, i) => (
            <TouchableOpacity key={i} style={styles.listRow} onPress={() => { onGoTo(bm.location?.start?.cfi ?? bm.location); onClose(); }}>
              <MaterialCommunityIcons name="bookmark" size={16} color={colors.accent} />
              <Text style={[styles.listLabel, { color: theme.text }]}>{bm.chapter || `Bookmark ${i + 1}`}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SheetWrapper>
  );
}

// ─── Search Modal ────────────────────────────────────────────────────────────
export function SearchModal({ visible, onClose, theme, searchQuery, searchResults, onQueryChange, onSearch, onGoTo, onClear }) {
  return (
    <SheetWrapper visible={visible} onClose={() => { onClose(); onClear(); }} title="Search in Book" theme={theme}>
      <View style={styles.searchBar}>
        <TextInput
          style={[styles.searchInput, { color: theme.text, borderColor: theme.text + '44' }]}
          placeholder="Search…"
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={onQueryChange}
          onSubmitEditing={onSearch}
          returnKeyType="search"
          autoFocus
        />
        <TouchableOpacity style={styles.searchGoBtn} onPress={onSearch}>
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
            <TouchableOpacity key={i} style={styles.searchResult} onPress={() => { onGoTo(r.cfi); onClose(); }}>
              <Text style={[styles.searchExcerpt, { color: theme.text }]} numberOfLines={3}>{r.excerpt}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SheetWrapper>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { maxHeight: '75%', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 32 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sheetTitle: { fontSize: 18, fontWeight: 'bold' },
  emptyMsg: { textAlign: 'center', marginTop: 32, fontSize: 14, opacity: 0.6, lineHeight: 22 },

  // List rows (TOC / Bookmarks)
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(128,128,128,0.2)' },
  listLabel: { flex: 1, fontSize: 14 },

  // Settings
  settingGroup: { fontSize: 13, fontWeight: '600', marginBottom: 12, marginTop: 4, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 0.5 },
  fontRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24, marginBottom: 24 },
  fontBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accent, justifyContent: 'center', alignItems: 'center' },
  fontBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  fontValue: { fontSize: 18, fontWeight: '600', minWidth: 56, textAlign: 'center' },
  themeRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  themeChip: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1.5, alignItems: 'center', gap: 6 },
  themeChipActive: { borderColor: colors.accent, borderWidth: 2.5 },
  themeLabel: { fontSize: 11, fontWeight: '600' },

  // Search
  searchBar: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  searchInput: { flex: 1, borderWidth: 1, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15 },
  searchGoBtn: { width: 48, height: 48, borderRadius: 8, backgroundColor: colors.accent, justifyContent: 'center', alignItems: 'center' },
  searchResult: { paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(128,128,128,0.2)' },
  searchExcerpt: { fontSize: 13, lineHeight: 20 },
});
