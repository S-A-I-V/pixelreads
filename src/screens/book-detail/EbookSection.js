import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Section } from '../../components/ui';
import { homeColors, spacing, radius, elevation, textSizes, fontWeights } from '../../theme';

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
              <MaterialCommunityIcons name="file-document" size={20} color={homeColors.accent} />
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
                <MaterialCommunityIcons name="delete-outline" size={20} color={homeColors.error} />
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
    backgroundColor: homeColors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: homeColors.borderSubtle,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  fileInfoText: { flex: 1 },
  fileName: {
    fontSize: textSizes.md,
    color: homeColors.textDark,
    fontWeight: fontWeights.medium,
  },
  fileSize: {
    fontSize: textSizes.sm,
    color: homeColors.textCaption,
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
    backgroundColor: homeColors.success,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
  },
  readNowBtnText: {
    color: '#FFFFFF',
    fontSize: textSizes.lg,
    fontWeight: fontWeights.semibold,
  },
  removeFileBtn: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  importBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: homeColors.accent,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    ...elevation.accent,
  },
  importBtnText: {
    color: '#FFFFFF',
    fontSize: textSizes.lg,
    fontWeight: fontWeights.semibold,
  },
  hint: {
    fontSize: textSizes.sm,
    color: homeColors.textCaption,
    lineHeight: textSizes.sm * 1.5,
    textAlign: 'center',
  },
});
