import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Pressable, ScrollView, Alert, Animated, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { homeColors, spacing, radius, elevation, textSizes, fontWeights, letterSpacing } from '../../theme';
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
            <MaterialCommunityIcons name="close" size={20} color={homeColors.textDark} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} nestedScrollEnabled>
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

          <Text style={styles.sectionTitle}>Custom Shelves</Text>
          <View style={styles.createRow}>
            <TextInput
              style={styles.createInput}
              value={newShelfName}
              onChangeText={setNewShelfName}
              placeholder={CUSTOM_SHELF_INPUT_PLACEHOLDER}
              placeholderTextColor={homeColors.textCaption}
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
                    <MaterialCommunityIcons name="delete-outline" size={20} color={homeColors.error} />
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
  backdrop: { ...StyleSheet.absoluteFillObject, zIndex: 99, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'center', alignItems: 'center' },
  container: {
    position: 'absolute', top: '20%', left: spacing.lg, right: spacing.lg, zIndex: 100,
    backgroundColor: homeColors.bgCard, borderRadius: radius.xxl, borderWidth: 1,
    borderColor: homeColors.borderSubtle, padding: spacing.xl, maxHeight: '60%',
    ...elevation.xl,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  title: { fontSize: textSizes.xxl, fontWeight: fontWeights.bold, color: homeColors.textDark },
  scroll: { flexGrow: 0 },
  sectionTitle: { fontSize: textSizes.xs, fontWeight: fontWeights.semibold, color: homeColors.textCaption, marginBottom: spacing.md, marginTop: spacing.md, textTransform: 'uppercase', letterSpacing: letterSpacing.wider },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  chip: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: 14, paddingVertical: spacing.sm, borderRadius: radius.pill, borderWidth: 1.5, borderColor: homeColors.border, backgroundColor: homeColors.bgCard },
  chipActive: { backgroundColor: homeColors.accent, borderColor: homeColors.accent },
  chipText: { fontSize: textSizes.md, color: homeColors.textBody },
  chipTextActive: { color: homeColors.textOnAccent, fontWeight: fontWeights.medium },
  emptyText: { color: homeColors.textCaption, fontSize: textSizes.md, marginBottom: spacing.lg, fontStyle: 'italic' },
  createRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  createInput: { flex: 1, backgroundColor: homeColors.bgSubtle, borderWidth: 1, borderColor: homeColors.border, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.md, fontSize: textSizes.md, color: homeColors.textDark },
  createBtn: { backgroundColor: homeColors.accent, paddingHorizontal: spacing.lg, borderRadius: radius.lg, justifyContent: 'center' },
  createBtnDisabled: { backgroundColor: homeColors.border },
  createBtnText: { color: homeColors.textOnAccent, fontSize: textSizes.md, fontWeight: fontWeights.semibold },
  shelfList: { gap: spacing.sm, marginBottom: spacing.xl },
  shelfItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: homeColors.bgSubtle, padding: spacing.md, borderRadius: radius.lg },
  shelfDot: { width: 12, height: 12, borderRadius: 6 },
  shelfLabel: { flex: 1, fontSize: textSizes.md + 1, color: homeColors.textDark },
});
