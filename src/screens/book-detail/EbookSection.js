import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Section } from '../../components/ui';
import { colors, spacing, radius, textSizes, fontWeights, borderWidth } from '../../theme';

/**
 * E-Book reader section: shows file info + read/remove buttons,
 * or import button if no file uploaded.
 */
export function EbookSection({ uploadedFile, importing, onImport, onReadNow, onRemoveFile }) {
  return (
    <Section title="E-Book Reader">
      <View style={styles.card}>
        {uploadedFile ? (
          <>
            <View style={styles.fileInfo}>
              <MaterialCommunityIcons name="file-document" size={20} color={colors.accent} />
              <View style={styles.fileInfoText}>
                <Text style={styles.fileName} numberOfLines={1}>{uploadedFile.fileName}</Text>
                <Text style={styles.fileSize}>
                  {(uploadedFile.fileSize / 1024 / 1024).toFixed(2)} MB
                </Text>
              </View>
            </View>
            <View style={styles.readerButtons}>
              <TouchableOpacity style={styles.readNowBtn} onPress={onReadNow}>
                <MaterialCommunityIcons name="book-open-page-variant" size={20} color="#fff" />
                <Text style={styles.readNowBtnText}>Read Now</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.removeFileBtn} onPress={onRemoveFile}>
                <MaterialCommunityIcons name="delete-outline" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <TouchableOpacity style={styles.importBtn} onPress={onImport} disabled={importing}>
            {importing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <MaterialCommunityIcons name="file-upload" size={20} color="#fff" />
                <Text style={styles.importBtnText}>Import EPUB File</Text>
              </>
            )}
          </TouchableOpacity>
        )}
        <Text style={styles.hint}>
          Import your own EPUB file to read with bookmarks and auto-saved progress.
        </Text>
      </View>
    </Section>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgSecondary,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  fileInfoText: { flex: 1 },
  fileName: {
    fontSize: textSizes.md,
    color: colors.textPrimary,
    fontWeight: fontWeights.medium,
  },
  fileSize: {
    fontSize: textSizes.sm,
    color: colors.textMuted,
    marginTop: spacing.xxs,
  },
  readerButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  readNowBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.success,
    paddingVertical: 14,
    borderRadius: radius.md,
  },
  readNowBtnText: {
    color: colors.textPrimary,
    fontSize: textSizes.lg,
    fontWeight: fontWeights.semibold,
  },
  removeFileBtn: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: radius.md,
    borderWidth: borderWidth.thin,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  importBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent,
    paddingVertical: 14,
    borderRadius: radius.md,
  },
  importBtnText: {
    color: colors.textPrimary,
    fontSize: textSizes.lg,
    fontWeight: fontWeights.semibold,
  },
  hint: {
    fontSize: textSizes.sm,
    color: colors.textMuted,
    lineHeight: 18,
    textAlign: 'center',
  },
});
