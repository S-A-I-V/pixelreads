import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, textSizes, spacing, borderWidth } from '../theme';

/**
 * Bottom-sheet style pixel modal.
 *
 * Props:
 *   visible   bool
 *   onClose   fn
 *   title     string
 *   children  ReactNode
 */
export default function PixelModal({ visible, onClose, title, children }) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity
          activeOpacity={1}
          style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: spacing.lg }}
          >
            {children}
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 0, 32, 0.85)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.bgPanel,
    borderTopWidth: borderWidth.pixel,
    borderLeftWidth: borderWidth.pixel,
    borderRightWidth: borderWidth.pixel,
    borderColor: colors.pinkHot,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: borderWidth.normal,
    borderBottomColor: colors.pinkHot,
  },
  title: {
    fontFamily: fonts.pixel,
    fontSize: textSizes.sm,
    color: colors.pinkHot,
    letterSpacing: 1,
  },
  close: {
    fontFamily: fonts.pixel,
    fontSize: textSizes.md,
    color: colors.textDim,
  },
});
