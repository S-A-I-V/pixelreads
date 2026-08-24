import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Pressable, ScrollView, Animated, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, radius, textSizes, fontWeights, borderWidth } from '../../theme';
import {
  TAG_INPUT_PLACEHOLDER,
  TAG_BUTTON_CREATE,
  TAG_DEFAULT_COLORS,
  TAG_MAX_PER_BOOK,
} from '../../features/library/constants/libraryFeatureConstants';

export function TagsModal({ visible, onClose, allTags, bookTags, onToggleTag, onCreateTag }) {
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(TAG_DEFAULT_COLORS[0]);
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

  const handleCreateTag = () => {
    if (newTagName.trim()) {
      onCreateTag(newTagName.trim(), selectedColor);
      setNewTagName('');
      setSelectedColor(TAG_DEFAULT_COLORS[(allTags.length + 1) % TAG_DEFAULT_COLORS.length]);
    }
  };

  if (!visible) return null;

  return (
    <>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <Animated.View style={[styles.container, { opacity, transform: [{ translateY }] }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Manage Tags</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialCommunityIcons name="close" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} nestedScrollEnabled>
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
                    style={[styles.chip, { borderColor: tag.color },
                      isSelected && { backgroundColor: tag.color },
                      isDisabled && styles.chipDisabled]}
                    onPress={() => !isDisabled && onToggleTag(tag.id)}
                    disabled={isDisabled}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                      {tag.label}
                    </Text>
                    {isSelected && <MaterialCommunityIcons name="check" size={14} color="#fff" />}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, zIndex: 99, backgroundColor: 'rgba(0,0,0,0.4)' },
  container: {
    position: 'absolute', top: '15%', left: spacing.lg, right: spacing.lg, zIndex: 100,
    backgroundColor: colors.bgElevated, borderRadius: radius.lg, borderWidth: borderWidth.thin,
    borderColor: colors.borderLight, padding: spacing.xl, maxHeight: '70%',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 12,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  title: { fontSize: textSizes.xxl, fontWeight: fontWeights.bold, color: colors.textPrimary },
  scroll: { flexGrow: 0 },
  sectionTitle: { fontSize: textSizes.sm, fontWeight: fontWeights.semibold, color: colors.textMuted, marginBottom: spacing.md, marginTop: spacing.md, textTransform: 'uppercase', letterSpacing: 0.5 },
  createRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  input: { flex: 1, backgroundColor: colors.bgSecondary, borderWidth: borderWidth.thin, borderColor: colors.borderLight, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md, fontSize: textSizes.md, color: colors.textPrimary },
  createBtn: { backgroundColor: colors.accent, paddingHorizontal: spacing.lg, borderRadius: radius.md, justifyContent: 'center' },
  createBtnDisabled: { backgroundColor: colors.borderLight },
  createBtnText: { color: colors.textPrimary, fontSize: textSizes.md, fontWeight: fontWeights.semibold },
  colorRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl, flexWrap: 'wrap' },
  colorDot: { width: 28, height: 28, borderRadius: 14 },
  colorDotSelected: { borderWidth: 3, borderColor: colors.textPrimary },
  emptyText: { fontSize: textSizes.md, color: colors.textDim, marginBottom: spacing.lg, fontStyle: 'italic' },
  tagsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: 14, paddingVertical: spacing.sm, borderRadius: radius.pill, borderWidth: 1.5, backgroundColor: colors.bgSecondary },
  chipDisabled: { opacity: 0.5 },
  chipText: { fontSize: textSizes.md, color: colors.textSecondary },
  chipTextActive: { color: colors.textPrimary, fontWeight: fontWeights.medium },
});
