import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, radius, textSizes, fontWeights, borderWidth } from '../../theme';

/**
 * Add-to-shelf button + expandable shelf option list.
 */
export function ShelfPicker({ shelf, allShelves, showPicker, onTogglePicker, onSelectShelf }) {
  return (
    <>
      <TouchableOpacity
        style={styles.addButton}
        onPress={onTogglePicker}
        accessibilityLabel={shelf ? 'Change shelf' : 'Add to library'}
        accessibilityRole="button"
      >
        <MaterialCommunityIcons name={shelf ? 'bookshelf' : 'plus'} size={20} color={colors.textPrimary} />
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
              {shelf === key && <MaterialCommunityIcons name="check" size={18} color={colors.accent} />}
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
    backgroundColor: colors.accent,
    paddingVertical: 14,
    borderRadius: radius.md,
  },
  addButtonText: {
    color: colors.textPrimary,
    fontSize: textSizes.lg,
    fontWeight: fontWeights.semibold,
  },
  picker: {
    backgroundColor: colors.bgSecondary,
    borderRadius: radius.md,
    borderWidth: borderWidth.thin,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: borderWidth.thin,
    borderBottomColor: colors.border,
  },
  optionActive: {
    backgroundColor: colors.accentLight,
  },
  optionText: {
    fontSize: textSizes.lg,
    color: colors.textPrimary,
  },
  optionTextActive: {
    color: colors.accent,
    fontWeight: fontWeights.semibold,
  },
});
