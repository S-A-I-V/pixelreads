import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Pressable, ScrollView, Animated, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { homeColors, spacing, borderWidth, textSizes, fonts } from '../../theme';
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
        {/* Window title bar */}
        <View style={styles.titleBar}>
          <Text style={styles.titleBarText}>tags_manager.exe</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.closeBtnText}>x</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} nestedScrollEnabled keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <Text style={styles.sectionTitle}># Create New Tag</Text>
            <View style={styles.createRow}>
              <TextInput
                style={styles.input}
                value={newTagName}
                onChangeText={setNewTagName}
                placeholder={TAG_INPUT_PLACEHOLDER}
                placeholderTextColor={homeColors.textCaption}
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
                  style={[
                    styles.colorDot,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorDotSelected,
                  ]}
                  onPress={() => setSelectedColor(color)}
                  accessibilityLabel={`Color ${color}`}
                />
              ))}
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>
              # Select Tags {bookTags.length > 0 && `(${bookTags.length}/${TAG_MAX_PER_BOOK})`}
            </Text>
            {allTags.length === 0 ? (
              <Text style={styles.emptyText}>No tags yet. Create one above!</Text>
            ) : (
              <View style={styles.tagsGrid}>
                {allTags.map(tag => {
                  const isSelected = bookTags.includes(tag.id);
                  const isDisabled = !isSelected && bookTags.length >= TAG_MAX_PER_BOOK;
                  return (
                    <TouchableOpacity
                      key={tag.id}
                      style={[
                        styles.chip,
                        isSelected && { backgroundColor: tag.color },
                        isDisabled && styles.chipDisabled,
                      ]}
                      onPress={() => !isDisabled && onToggleTag(tag.id)}
                      disabled={isDisabled}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                        {tag.label}
                      </Text>
                      {isSelected && (
                        <View style={styles.checkMark}>
                          <MaterialCommunityIcons name="check-bold" size={10} color="#000" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
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
    top: '12%',
    left: spacing.md,
    right: spacing.md,
    zIndex: 100,
    maxHeight: '75%',
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
    backgroundColor: homeColors.bgCard,
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
  createRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  input: {
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
  colorRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    flexWrap: 'wrap',
  },
  colorDot: {
    width: 26,
    height: 26,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorDotSelected: {
    borderColor: '#000000',
    borderWidth: 3,
  },
  divider: {
    height: 2,
    backgroundColor: '#000000',
    marginVertical: spacing.sm,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: textSizes.xs,
    color: homeColors.textCaption,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 2,
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
    borderRightWidth: 3,
    borderBottomWidth: 3,
  },
  chipDisabled: {
    opacity: 0.4,
  },
  chipText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: textSizes.xxs,
    color: '#000000',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  checkMark: {
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: homeColors.success,
    borderWidth: 1,
    borderColor: '#000000',
  },
});
