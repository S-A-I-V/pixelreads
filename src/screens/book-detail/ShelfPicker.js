import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { homeColors, spacing, radius, elevation, textSizes, fontWeights } from '../../theme';

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
        <MaterialCommunityIcons name={shelf ? 'bookshelf' : 'plus'} size={20} color={homeColors.textOnAccent} />
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
              {shelf === key && <MaterialCommunityIcons name="check" size={18} color={homeColors.accent} />}
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
    backgroundColor: homeColors.accent,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    ...elevation.accent,
  },
  addButtonText: {
    color: homeColors.textOnAccent,
    fontSize: textSizes.lg,
    fontWeight: fontWeights.semibold,
  },
  picker: {
    backgroundColor: homeColors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: homeColors.borderSubtle,
    overflow: 'hidden',
    ...elevation.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: homeColors.border,
  },
  optionActive: {
    backgroundColor: homeColors.accentLight,
  },
  optionText: {
    fontSize: textSizes.md,
    color: homeColors.textDark,
  },
  optionTextActive: {
    color: homeColors.accent,
    fontWeight: fontWeights.semibold,
  },
});
