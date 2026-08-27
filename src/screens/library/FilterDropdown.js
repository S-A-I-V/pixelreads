import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Pressable, ScrollView, Alert, Animated, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { homeColors, spacing, borderWidth, textSizes, fonts } from '../../theme';
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
        <View style={styles.titleBar}>
          <Text style={styles.titleBarText}>filters.cfg</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.closeBtnText}>x</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} nestedScrollEnabled keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <Text style={styles.sectionTitle}># eReader Status</Text>
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

            <Text style={styles.sectionTitle}># Tags</Text>
            {tags.length === 0 ? (
              <Text style={styles.emptyText}>No tags created yet</Text>
            ) : (
              <View style={styles.chipsRow}>
                {tags.map(tag => (
                  <TouchableOpacity
                    key={tag.id}
                    style={[styles.chip, selectedTags.includes(tag.id) && { backgroundColor: tag.color, borderColor: tag.color }]}
                    onPress={() => onToggleTag(tag.id)}
                  >
                    <Text style={[styles.chipText, selectedTags.includes(tag.id) && styles.chipTextActive]}>{tag.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    position: 'absolute',
    top: '15%',
    left: spacing.xl,
    right: spacing.xl,
    zIndex: 100,
    maxHeight: '55%',
    borderWidth: borderWidth.pixel,
    borderColor: '#000000',
    backgroundColor: homeColors.bgCard,
  },
  titleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderBottomWidth: borderWidth.normal,
    borderBottomColor: '#000000',
  },
  titleBarText: {
    fontFamily: fonts.body,
    fontSize: textSizes.xxs,
    color: '#000000',
  },
  closeBtn: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000000',
    backgroundColor: homeColors.error,
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
  content: {
    padding: spacing.md,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: textSizes.xs,
    color: '#000000',
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 2,
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
    borderRightWidth: 3,
    borderBottomWidth: 3,
  },
  chipActive: {
    backgroundColor: '#FBCA1F',
    borderColor: '#000000',
  },
  chipText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: textSizes.xxs,
    color: '#000000',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: textSizes.xs,
    color: homeColors.textCaption,
    marginBottom: spacing.md,
  },
  createRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  createInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: textSizes.sm,
    color: '#000000',
    borderWidth: 2,
    borderColor: '#000000',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: '#FFFFFF',
  },
  createBtn: {
    backgroundColor: '#FBCA1F',
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000000',
    borderRightWidth: 4,
    borderBottomWidth: 4,
  },
  createBtnDisabled: {
    backgroundColor: '#CCCCCC',
  },
  createBtnText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: textSizes.xs,
    color: '#000000',
  },
  shelfList: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  shelfItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
  },
  shelfDot: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: '#000000',
  },
  shelfLabel: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: textSizes.xs,
    color: '#000000',
  },
});
