import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { homeColors, spacing, borderWidth, textSizes, fonts } from '../../theme';

export function ShelfPicker({ shelf, allShelves, showPicker, onTogglePicker, onSelectShelf }) {
  return (
    <>
      <TouchableOpacity
        style={styles.addButton}
        onPress={onTogglePicker}
        activeOpacity={0.8}
        accessibilityLabel={shelf ? 'Change shelf' : 'Add to library'}
        accessibilityRole="button"
      >
        <MaterialCommunityIcons name={shelf ? 'bookshelf' : 'plus'} size={18} color="#000000" />
        <Text style={styles.addButtonText}>
          {shelf ? 'Change Shelf' : 'Add to Library'}
        </Text>
      </TouchableOpacity>

      {showPicker && (
        <View style={styles.picker}>
          {allShelves.map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              style={[styles.option, shelf === key && styles.optionActive]}
              onPress={() => onSelectShelf(key)}
            >
              <Text style={[styles.optionText, shelf === key && styles.optionTextActive]}>
                {label}
              </Text>
              {shelf === key && <MaterialCommunityIcons name="check" size={16} color={homeColors.accent} />}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#FBCA1F',
    paddingVertical: spacing.sm,
    borderWidth: 3,
    borderColor: '#000000',
    borderRightWidth: 6,
    borderBottomWidth: 6,
  },
  addButtonText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: textSizes.md,
    color: '#000000',
  },
  picker: {
    borderWidth: borderWidth.pixel,
    borderColor: homeColors.border,
    backgroundColor: homeColors.bgWindow || '#FFFFFF',
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: homeColors.border,
  },
  optionActive: {
    backgroundColor: homeColors.bgCard,
  },
  optionText: {
    fontFamily: fonts.body,
    fontSize: textSizes.sm,
    color: homeColors.textDark,
  },
  optionTextActive: {
    fontFamily: 'SpaceMono-Bold',
    color: homeColors.accent,
  },
});
