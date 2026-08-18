import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { HIGHLIGHT_COLORS } from './readerConstants';
import { colors, spacing, radius } from '../../theme';

/**
 * Floating highlight color picker shown when text is selected.
 */
export function HighlightMenu({ selectedText, onHighlight, onDismiss }) {
  if (!selectedText) return null;

  return (
    <View style={styles.menu}>
      <Text style={styles.snippet} numberOfLines={2}>
        &ldquo;{selectedText.text}&rdquo;
      </Text>
      <View style={styles.colorRow}>
        {HIGHLIGHT_COLORS.map((c) => (
          <TouchableOpacity
            key={c.color}
            style={[styles.colorDot, { backgroundColor: c.color }]}
            onPress={() => onHighlight(c.color)}
            accessibilityLabel={`Highlight ${c.label}`}
          />
        ))}
        <TouchableOpacity style={styles.colorDot} onPress={onDismiss} accessibilityLabel="Cancel highlight">
          <MaterialCommunityIcons name="close" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  menu: {
    position: 'absolute',
    bottom: 80,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.bgSecondary,
    borderRadius: radius.lg,
    padding: 14,
    gap: spacing.md,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  snippet: {
    color: colors.textSecondary,
    fontSize: 13,
    fontStyle: 'italic',
  },
  colorRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  colorDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#555',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
