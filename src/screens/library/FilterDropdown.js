import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Pressable, ScrollView, Alert, Animated, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, radius, textSizes, fontWeights, borderWidth } from '../../theme';
import {
  LIBRARY_EREADER_FILTER_LABELS,
  CUSTOM_SHELF_INPUT_PLACEHOLDER,
  CUSTOM_SHELF_BUTTON_CREATE,
  CUSTOM_SHELF_DELETE_DIALOG_TITLE,
  CUSTOM_SHELF_DELETE_DIALOG_MESSAGE,
} from '../../features/library/constants/libraryFeatureConstants';

const EREADER_FILTER_OPTIONS = [
  { key: 'all', label: LIBRARY_EREADER_FILTER_LABELS.ALL, value: null },
  { key: 'has', label: LIBRARY_EREADER_FILTER_LABELS.HAS_EPUB, value: true },
  { key: 'no', label: LIBRARY_EREADER_FILTER_LABELS.NO_EPUB, value: false },
];

/**
 * Inline dropdown popup for library filters: eReader status, tags, custom shelves.
 */
export function FilterDropdown({ visible, onClose, tags, selectedTags, onToggleTag,
  eReaderFilter, onSetEReaderFilter, customShelves, onCreateShelf, onDeleteShelf }) {
  const [newShelfName, setNewShelfName] = useState('');
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-8)).current;

  React.useEffect(() => {
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

  const handleCreateShelf = () => {
    if (newShelfName.trim()) {
      onCreateShelf(newShelfName.trim());
      setNewShelfName('');
    }
  };

  const confirmDeleteShelf = (shelf) => {
    Alert.alert(CUSTOM_SHELF_DELETE_DIALOG_TITLE, CUSTOM_SHELF_DELETE_DIALOG_MESSAGE, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDeleteShelf(shelf.id) },
    ]);
  };

  if (!visible) return null;

  return (
    <>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <Animated.View style={[styles.container, { opacity, transform: [{ translateY }] }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Filters</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialCommunityIcons name="close" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} nestedScrollEnabled>
          {/* eReader Filter */}
          <Text style={styles.sectionTitle}>eReader Status</Text>
          <View style={styles.chipsRow}>
            {EREADER_FILTER_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.chip, eReaderFilter === opt.value && styles.chipActive]}
                onPress={() => onSetEReaderFilter(opt.value)}
              >
                <Text style={[styles.chipText, eReaderFilter === opt.value && styles.chipTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tags Filter */}
          <Text style={styles.sectionTitle}>Tags</Text>
          {tags.length === 0 ? (
            <Text style={styles.emptyText}>No tags created yet</Text>
          ) : (
            <View style={styles.chipsRow}>
              {tags.map(tag => (
                <TouchableOpacity
                  key={tag.id}
                  style={[styles.chip, { borderColor: tag.color }, selectedTags.includes(tag.id) && { backgroundColor: tag.color }]}
                  onPress={() => onToggleTag(tag.id)}
                >
                  <Text style={[styles.chipText, selectedTags.includes(tag.id) && styles.chipTextActive]}>{tag.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Custom Shelves */}
          <Text style={styles.sectionTitle}>Custom Shelves</Text>
          <View style={styles.createRow}>
            <TextInput
              style={styles.createInput}
              value={newShelfName}
              onChangeText={setNewShelfName}
              placeholder={CUSTOM_SHELF_INPUT_PLACEHOLDER}
              placeholderTextColor={colors.textMuted}
              maxLength={25}
            />
            <TouchableOpacity
              style={[styles.createBtn, !newShelfName.trim() && styles.createBtnDisabled]}
              onPress={handleCreateShelf}
              disabled={!newShelfName.trim()}
            >
              <Text style={styles.createBtnText}>{CUSTOM_SHELF_BUTTON_CREATE}</Text>
            </TouchableOpacity>
          </View>

          {customShelves.length === 0 ? (
            <Text style={styles.emptyText}>No custom shelves yet</Text>
          ) : (
            <View style={styles.shelfList}>
              {customShelves.map(shelf => (
                <View key={shelf.id} style={styles.shelfItem}>
                  <View style={[styles.shelfDot, { backgroundColor: shelf.color }]} />
                  <Text style={styles.shelfLabel}>{shelf.label}</Text>
                  <TouchableOpacity onPress={() => confirmDeleteShelf(shelf)}>
                    <MaterialCommunityIcons name="delete-outline" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, zIndex: 99 },
  container: {
    position: 'absolute', top: 56, right: spacing.md, left: spacing.md, zIndex: 100,
    backgroundColor: colors.bgElevated, borderRadius: radius.lg, borderWidth: borderWidth.thin,
    borderColor: colors.borderLight, padding: spacing.lg, maxHeight: 380,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 10,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  title: { fontSize: textSizes.lg, fontWeight: fontWeights.bold, color: colors.textPrimary },
  scroll: { flexGrow: 0 },
  sectionTitle: { fontSize: textSizes.md, fontWeight: fontWeights.semibold, color: colors.textMuted, marginBottom: spacing.md, marginTop: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  chip: { paddingHorizontal: 14, paddingVertical: spacing.sm, borderRadius: radius.pill, borderWidth: borderWidth.thin, borderColor: colors.borderLight, backgroundColor: colors.bgSecondary },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { fontSize: textSizes.md, color: colors.textSecondary },
  chipTextActive: { color: colors.textPrimary, fontWeight: fontWeights.medium },
  emptyText: { color: colors.textDim, fontSize: textSizes.md, marginBottom: spacing.lg },
  createRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  createInput: { flex: 1, backgroundColor: colors.bgSecondary, borderWidth: borderWidth.thin, borderColor: colors.borderLight, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md, fontSize: textSizes.md, color: colors.textPrimary },
  createBtn: { backgroundColor: colors.accent, paddingHorizontal: spacing.lg, borderRadius: radius.md, justifyContent: 'center' },
  createBtnDisabled: { backgroundColor: colors.borderLight },
  createBtnText: { color: colors.textPrimary, fontSize: textSizes.md, fontWeight: fontWeights.semibold },
  shelfList: { gap: spacing.sm, marginBottom: spacing.xl },
  shelfItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.bgSecondary, padding: spacing.md, borderRadius: radius.md },
  shelfDot: { width: 12, height: 12, borderRadius: 6 },
  shelfLabel: { flex: 1, fontSize: textSizes.md + 1, color: colors.textPrimary },
});
