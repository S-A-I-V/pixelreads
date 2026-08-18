import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomSheet } from '../../components/ui';
import { colors, spacing, radius, textSizes, fontWeights, borderWidth } from '../../theme';
import {
  TAG_INPUT_PLACEHOLDER,
  TAG_BUTTON_CREATE,
  TAG_DEFAULT_COLORS,
  TAG_MAX_PER_BOOK,
} from '../../features/library/constants/libraryFeatureConstants';

/**
 * Modal for creating and selecting tags for a book.
 */
export function TagsModal({ visible, onClose, allTags, bookTags, onToggleTag, onCreateTag }) {
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
    <BottomSheet visible={visible} onClose={onClose} title="Manage Tags">
      {/* Create new tag */}
      <Text style={styles.sectionTitle}>Create New Tag</Text>
      <View style={styles.createRow}>
        <TextInput
          style={styles.input}
          value={newTagName}
          onChangeText={setNewTagName}
          placeholder={TAG_INPUT_PLACEHOLDER}
          placeholderTextColor={colors.textMuted}
          maxLength={30}
        />
        <TouchableOpacity
          style={[styles.createBtn, !newTagName.trim() && styles.createBtnDisabled]}
          onPress={handleCreateTag}
          disabled={!newTagName.trim()}
        >
          <Text style={styles.createBtnText}>{TAG_BUTTON_CREATE}</Text>
        </TouchableOpacity>
      </View>

      {/* Color picker */}
      <View style={styles.colorRow}>
        {TAG_DEFAULT_COLORS.map(color => (
          <TouchableOpacity
            key={color}
            style={[styles.colorDot, { backgroundColor: color },
              selectedColor === color && styles.colorDotSelected]}
            onPress={() => setSelectedColor(color)}
            accessibilityLabel={`Color ${color}`}
          />
        ))}
      </View>

      {/* Existing tags */}
      <Text style={styles.sectionTitle}>
        Select Tags {bookTags.length > 0 && `(${bookTags.length}/${TAG_MAX_PER_BOOK})`}
      </Text>
      {allTags.length === 0 ? (
        <Text style={styles.emptyText}>No tags created yet. Create one above!</Text>
      ) : (
        <View style={styles.tagsGrid}>
          {allTags.map(tag => {
            const isSelected = bookTags.includes(tag.id);
            const isDisabled = !isSelected && bookTags.length >= TAG_MAX_PER_BOOK;
            return (
              <TouchableOpacity
                key={tag.id}
                style={[styles.tagChip, { borderColor: tag.color },
                  isSelected && { backgroundColor: tag.color },
                  isDisabled && styles.tagChipDisabled]}
                onPress={() => !isDisabled && onToggleTag(tag.id)}
                disabled={isDisabled}
              >
                <Text style={[styles.tagText, isSelected && styles.tagTextSelected]}>
                  {tag.label}
                </Text>
                {isSelected && <MaterialCommunityIcons name="check" size={14} color="#fff" />}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: textSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.textMuted,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  createRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  input: {
    flex: 1,
    backgroundColor: colors.bgSecondary,
    borderWidth: borderWidth.thin,
    borderColor: colors.borderLight,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: textSizes.md,
    color: colors.textPrimary,
  },
  createBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    justifyContent: 'center',
  },
  createBtnDisabled: {
    backgroundColor: colors.borderLight,
  },
  createBtnText: {
    color: colors.textPrimary,
    fontSize: textSizes.md,
    fontWeight: fontWeights.semibold,
  },
  colorRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
    flexWrap: 'wrap',
  },
  colorDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: colors.textPrimary,
  },
  emptyText: {
    fontSize: textSizes.md,
    color: colors.textDim,
    marginBottom: spacing.lg,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: 14,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    backgroundColor: colors.bgSecondary,
  },
  tagChipDisabled: {
    opacity: 0.5,
  },
  tagText: {
    fontSize: textSizes.md,
    color: colors.textSecondary,
  },
  tagTextSelected: {
    color: colors.textPrimary,
    fontWeight: fontWeights.medium,
  },
});
