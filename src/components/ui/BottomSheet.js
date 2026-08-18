import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, radius, textSizes, fontWeights } from '../../theme';

/**
 * Standard bottom sheet modal wrapper.
 * Replaces duplicated Modal + overlay + sheet pattern across screens.
 */
export function BottomSheet({ visible, onClose, title, children, maxHeight = '80%' }) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.sheet, { maxHeight }]}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel={`Close ${title}`}
              accessibilityRole="button"
            >
              <MaterialCommunityIcons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: spacing.xxxl }}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.bgOverlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.bgPrimary,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    minHeight: 300,
    padding: spacing.xl,
    paddingBottom: spacing.huge,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: textSizes.xxl,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
  },
});
