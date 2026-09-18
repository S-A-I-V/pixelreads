import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { HIGHLIGHT_COLORS } from './readerConstants';
import { spacing, borderWidth, textSizes } from '../../theme';

/**
 * Retro floating highlight color picker — shown when text is selected.
 * All colors driven by theme.chrome — no hardcoded values.
 */
export function HighlightMenu({ selectedText, theme, onHighlight, onDismiss }) {
  if (!selectedText) return null;

  const c = theme?.chrome || {
    bg: '#C8B6FF', text: '#000000', border: '#000000',
    contentBg: '#FFFFFF', dimText: '#4A4A4A', shadow: '#000000',
  };

  const handlePick = (color) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onHighlight(color);
  };

  return (
    <View style={styles.wrapper}>
      <View style={[styles.shadow, { backgroundColor: c.shadow }]} />
      <View style={[styles.frame, { backgroundColor: c.bg, borderColor: c.border }]}>
        {/* Title bar */}
        <View style={[styles.titleBar, { borderBottomColor: c.border }]}>
          <Text style={[styles.titleBarText, { color: c.text }]}>highlight.exe</Text>
          <TouchableOpacity
            onPress={onDismiss}
            style={[styles.closeBtn, { borderColor: c.border }]}
            accessibilityLabel="Cancel highlight"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.closeBtnText}>x</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={[styles.content, { backgroundColor: c.contentBg }]}>
          <Text style={[styles.snippet, { color: c.dimText }]} numberOfLines={2}>
            &ldquo;{selectedText.text}&rdquo;
          </Text>

          <View style={[styles.divider, { backgroundColor: c.border, opacity: 0.15 }]} />

          <View style={styles.colorRow}>
            {HIGHLIGHT_COLORS.map((col) => (
              <TouchableOpacity
                key={col.color}
                style={[styles.colorBtn, { backgroundColor: col.color, borderColor: c.border }]}
                onPress={() => handlePick(col.color)}
                accessibilityLabel={`Highlight ${col.label}`}
                accessibilityRole="button"
              >
                <Text style={[styles.colorBtnText, { color: c.text }]}>{col.label[0]}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 80,
    left: spacing.lg,
    right: spacing.lg,
  },
  shadow: {
    position: 'absolute',
    top: 3,
    left: 3,
    right: -3,
    bottom: -3,
  },
  frame: {
    position: 'relative',
    zIndex: 1,
    borderWidth: borderWidth.pixel,
  },
  titleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderBottomWidth: borderWidth.normal,
  },
  titleBarText: {
    fontFamily: 'SpaceMono',
    fontSize: textSizes.xxs,
  },
  closeBtn: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    backgroundColor: '#EF4444',
  },
  closeBtnText: {
    fontFamily: 'SpaceMono',
    fontSize: 8,
    color: '#FFFFFF',
    lineHeight: 10,
  },
  content: {
    padding: spacing.sm,
    gap: spacing.sm,
  },
  snippet: {
    fontFamily: 'SpaceMono',
    fontSize: textSizes.xs,
    fontStyle: 'italic',
    lineHeight: textSizes.xs * 1.5,
  },
  divider: {
    height: 1,
  },
  colorRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  colorBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRightWidth: 3,
    borderBottomWidth: 3,
  },
  colorBtnText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: textSizes.sm,
  },
});
