import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Pressable, ScrollView, Animated, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { READER_THEMES, FONT_SIZE_STEPS } from './readerConstants';
import { spacing, borderWidth, textSizes, fonts } from '../../theme';

// ─── Shared inline overlay wrapper ──────────────────────────────────────────

function RetroOverlay({ visible, onClose, windowTitle, chrome, children, maxHeight = '60%' }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-8)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      opacity.setValue(0);
      translateY.setValue(-8);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <Animated.View style={[styles.container, { opacity, transform: [{ translateY }], maxHeight }]}>
        {/* Shadow layer */}
        <View style={[styles.shadowLayer, { backgroundColor: chrome.shadow }]} />
        {/* Window frame */}
        <View style={[styles.windowFrame, { backgroundColor: chrome.bg, borderColor: chrome.border }]}>
          {/* Title bar */}
          <View style={[styles.titleBar, { borderBottomColor: chrome.border }]}>
            <Text style={[styles.titleBarText, { color: chrome.text }]}>{windowTitle}</Text>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { borderColor: chrome.border }]}
              accessibilityLabel={`Close ${windowTitle}`}
              accessibilityRole="button"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.closeBtnText}>x</Text>
            </TouchableOpacity>
          </View>

          {/* Content area */}
          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[styles.contentArea, { backgroundColor: chrome.contentBg }]}
          >
            {children}
          </ScrollView>
        </View>
      </Animated.View>
    </>
  );
}

// ─── TOC Modal ───────────────────────────────────────────────────────────────

export function TOCModal({ visible, onClose, theme, tocData, toc, onGoTo }) {
  const items = tocData?.length > 0 ? tocData : (toc || []);
  const c = theme.chrome;

  return (
    <RetroOverlay visible={visible} onClose={onClose} windowTitle="contents.exe" chrome={c}>
      {items.length === 0 ? (
        <Text style={[styles.emptyMsg, { color: c.dimText }]}>
          No table of contents available.
        </Text>
      ) : (
        items.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.listRow, { borderBottomColor: c.border + '22' }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (item.href) {
                onGoTo(item.href);
              }
              setTimeout(() => onClose(), 100);
            }}
            accessibilityRole="button"
          >
            <View style={[styles.listIcon, { backgroundColor: c.accent, borderColor: c.border }]}>
              <MaterialCommunityIcons name="book-open-page-variant" size={12} color={c.accentText} />
            </View>
            <Text style={[styles.listLabel, { color: c.text }]} numberOfLines={2}>
              {item.label}
            </Text>
            <MaterialCommunityIcons name="chevron-right" size={14} color={c.dimText} />
          </TouchableOpacity>
        ))
      )}
    </RetroOverlay>
  );
}

// ─── Settings Modal ──────────────────────────────────────────────────────────

export function SettingsModal({
  visible, onClose, theme, settings,
  onDecreaseFontSize, onIncreaseFontSize, onChangeTheme,
}) {
  const c = theme.chrome;

  return (
    <RetroOverlay visible={visible} onClose={onClose} windowTitle="settings.ini" chrome={c} maxHeight="50%">
      {/* Font Size */}
      <Text style={[styles.settingLabel, { color: c.dimText }]}>FONT SIZE</Text>
      <View style={styles.fontRow}>
        <TouchableOpacity
          style={[styles.fontBtn, { borderColor: c.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onDecreaseFontSize();
          }}
          accessibilityLabel="Decrease font size"
          accessibilityRole="button"
        >
          <Text style={styles.fontBtnText}>A-</Text>
        </TouchableOpacity>

        <View style={[styles.fontValueBox, { borderColor: c.border, backgroundColor: c.btnBg }]}>
          <Text style={[styles.fontValue, { color: c.text }]}>{settings.fontSize}%</Text>
        </View>

        <TouchableOpacity
          style={[styles.fontBtn, { borderColor: c.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onIncreaseFontSize();
          }}
          accessibilityLabel="Increase font size"
          accessibilityRole="button"
        >
          <Text style={styles.fontBtnText}>A+</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.settingDivider, { backgroundColor: c.border + '22' }]} />

      {/* Theme */}
      <Text style={[styles.settingLabel, { color: c.dimText }]}>THEME</Text>
      <View style={styles.themeRow}>
        {Object.values(READER_THEMES).map((t) => {
          const isActive = settings.theme === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              style={[
                styles.themeChip,
                { backgroundColor: t.bg, borderColor: c.border },
                isActive && { borderColor: c.accent, borderWidth: 3 },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onChangeTheme(t);
              }}
              accessibilityLabel={`${t.label} theme`}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
            >
              <MaterialCommunityIcons name={t.icon} size={16} color={t.text} />
              <Text style={[styles.themeChipLabel, { color: t.text }]}>{t.label}</Text>
              {isActive && (
                <View style={[styles.activeIndicator, { backgroundColor: c.accent }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </RetroOverlay>
  );
}

// ─── Bookmarks Modal ─────────────────────────────────────────────────────────

export function BookmarksModal({ visible, onClose, theme, bookmarks, onGoTo }) {
  const c = theme.chrome;

  return (
    <RetroOverlay visible={visible} onClose={onClose} windowTitle="bookmarks.dat" chrome={c}>
      {(!bookmarks || bookmarks.length === 0) ? (
        <Text style={[styles.emptyMsg, { color: c.dimText }]}>
          No bookmarks yet.{'\n'}Tap the bookmark icon while reading to add one.
        </Text>
      ) : (
        bookmarks.map((bm, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.listRow, { borderBottomColor: c.border + '22' }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onGoTo(bm.location?.start?.cfi ?? bm.location);
              onClose();
            }}
            accessibilityRole="button"
          >
            <View style={[styles.listIcon, { backgroundColor: c.bookmarkBtnBg || '#F15BB5', borderColor: c.border }]}>
              <MaterialCommunityIcons name="bookmark" size={12} color={c.bookmarkBtnIcon || '#FFFFFF'} />
            </View>
            <Text style={[styles.listLabel, { color: c.text }]} numberOfLines={2}>
              {bm.chapter || `Bookmark ${i + 1}`}
            </Text>
            <MaterialCommunityIcons name="chevron-right" size={14} color={c.dimText} />
          </TouchableOpacity>
        ))
      )}
    </RetroOverlay>
  );
}

// ─── Search Modal ────────────────────────────────────────────────────────────

export function SearchModal({
  visible, onClose, theme,
  searchQuery, searchResults,
  onQueryChange, onSearch, onGoTo, onClear,
}) {
  const c = theme.chrome;

  return (
    <RetroOverlay
      visible={visible}
      onClose={() => { onClose(); onClear(); }}
      windowTitle="search.exe"
      chrome={c}
      maxHeight="65%"
    >
      <View style={styles.searchBar}>
        <View style={[styles.searchInputWrap, { borderColor: c.border, backgroundColor: c.btnBg }]}>
          <TextInput
            style={[styles.searchInput, { color: c.text }]}
            placeholder="Search..."
            placeholderTextColor={c.dimText}
            value={searchQuery}
            onChangeText={onQueryChange}
            onSubmitEditing={onSearch}
            returnKeyType="search"
            autoFocus
          />
        </View>
        <TouchableOpacity
          style={[styles.searchGoBtn, { borderColor: c.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSearch();
          }}
          accessibilityLabel="Search"
          accessibilityRole="button"
        >
          <MaterialCommunityIcons name="magnify" size={18} color={c.accentText} />
        </TouchableOpacity>
      </View>

      {searchResults.length === 0 ? (
        <Text style={[styles.emptyMsg, { color: c.dimText }]}>
          {searchQuery ? 'No results found.' : 'Type something to search.'}
        </Text>
      ) : (
        <>
          <Text style={[styles.resultCount, { color: c.dimText }]}>
            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
          </Text>
          {searchResults.map((r, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.searchResult, { borderBottomColor: c.border + '22' }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onGoTo(r.cfi);
                onClose();
              }}
              accessibilityRole="button"
            >
              <Text style={[styles.searchExcerpt, { color: c.text }]} numberOfLines={3}>
                {r.excerpt}
              </Text>
            </TouchableOpacity>
          ))}
        </>
      )}
    </RetroOverlay>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    position: 'absolute',
    top: '12%',
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 100,
  },
  shadowLayer: {
    position: 'absolute',
    top: 3,
    left: 3,
    right: -3,
    bottom: -3,
    zIndex: 0,
  },
  windowFrame: {
    borderWidth: borderWidth.pixel,
    position: 'relative',
    zIndex: 1,
  },
  titleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderBottomWidth: borderWidth.normal,
  },
  titleBarText: {
    fontFamily: fonts.body,
    fontSize: textSizes.xxs,
  },
  closeBtn: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    backgroundColor: '#EF4444',
  },
  closeBtnText: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: '#FFFFFF',
    lineHeight: 12,
  },
  scroll: {
    flexGrow: 0,
  },
  contentArea: {
    padding: spacing.md,
  },
  emptyMsg: {
    textAlign: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
    fontFamily: 'SpaceMono',
    fontSize: textSizes.xs,
    lineHeight: textSizes.xs * 1.6,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  listIcon: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  listLabel: {
    flex: 1,
    fontFamily: 'SpaceMono',
    fontSize: textSizes.sm,
  },
  settingLabel: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: textSizes.xxs,
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  fontRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  fontBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FBCA1F',
    borderWidth: 2,
    borderRightWidth: 4,
    borderBottomWidth: 4,
  },
  fontBtnText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: textSizes.sm,
    color: '#000000',
  },
  fontValueBox: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderWidth: 2,
    minWidth: 70,
    alignItems: 'center',
  },
  fontValue: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: textSizes.md,
  },
  settingDivider: {
    height: 1,
    marginVertical: spacing.md,
  },
  themeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  themeChip: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderWidth: 2,
    borderRightWidth: 3,
    borderBottomWidth: 3,
    alignItems: 'center',
    gap: spacing.xxs,
  },
  themeChipLabel: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: textSizes.xxs,
  },
  activeIndicator: {
    width: 8,
    height: 8,
    marginTop: spacing.xxs,
  },
  searchBar: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  searchInputWrap: {
    flex: 1,
    borderWidth: 2,
    paddingHorizontal: spacing.sm,
  },
  searchInput: {
    fontFamily: 'SpaceMono',
    fontSize: textSizes.sm,
    paddingVertical: spacing.xs,
  },
  searchGoBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FBCA1F',
    borderWidth: 2,
    borderRightWidth: 4,
    borderBottomWidth: 4,
  },
  resultCount: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: textSizes.xxs,
    marginBottom: spacing.sm,
  },
  searchResult: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  searchExcerpt: {
    fontFamily: 'SpaceMono',
    fontSize: textSizes.xs,
    lineHeight: textSizes.xs * 1.6,
  },
});
