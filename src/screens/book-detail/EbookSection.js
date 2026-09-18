import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { NeuShadow } from '../../components/ui/NeuShadow';
import { RetroProgressBar } from '../../components/ui/RetroProgressBar';
import { ConfettiBanner } from '../../components/ui/ConfettiBanner';
import { SkeletonShimmer } from '../../components/home/SkeletonShimmer';
import { homeColors, spacing, borderWidth, textSizes, fonts } from '../../theme';

const BTN_HEIGHT = 40;

function getButtonLabel(progress) {
  if (progress >= 100) return 'Read Again';
  if (progress > 0) return 'Continue';
  return 'Read Now';
}

function getButtonIcon(progress) {
  if (progress >= 100) return 'book-refresh';
  if (progress > 0) return 'book-open-page-variant';
  return 'book-open-page-variant';
}

export function EbookSection({
  uploadedFile,
  importing,
  onImport,
  onReadNow,
  onRemoveFile,
  loading,
  progress = 0,
  currentPage,
  totalPages,
}) {
  const handleImport = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onImport?.();
  };

  const handleReadNow = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onReadNow?.();
  };

  const handleRemove = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onRemoveFile?.();
  };

  if (loading) {
    return <EbookSectionSkeleton />;
  }

  const isComplete = progress >= 100;

  return (
    <NeuShadow offset={3}>
      <View style={styles.frame}>
        <View style={styles.titleBar}>
          <Text style={styles.titleText}>ereader.exe</Text>
          <View style={styles.titleDots}>
            <View style={[styles.dot, { backgroundColor: homeColors.error }]} />
            <View style={[styles.dot, { backgroundColor: homeColors.warning }]} />
            <View style={[styles.dot, { backgroundColor: homeColors.success }]} />
          </View>
        </View>

        <View style={styles.content}>
          {uploadedFile ? (
            <>
              <View style={styles.fileRow}>
                <View style={styles.fileIcon}>
                  <MaterialCommunityIcons name="file-document" size={16} color="#000000" />
                </View>
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName} numberOfLines={1}>
                    {uploadedFile.fileName}
                  </Text>
                  <Text style={styles.fileSize}>
                    {(uploadedFile.fileSize / 1024 / 1024).toFixed(2)} MB
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              {isComplete ? (
                <ConfettiBanner />
              ) : (
                <View style={styles.progressSection}>
                  <RetroProgressBar progress={progress} />
                  {currentPage > 0 && totalPages > 0 && (
                    <Text style={styles.pageText}>p.{currentPage}/{totalPages}</Text>
                  )}
                </View>
              )}

              <View style={styles.divider} />

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[styles.readNowBtn, isComplete && styles.readNowBtnComplete]}
                  onPress={handleReadNow}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={getButtonLabel(progress)}
                >
                  <MaterialCommunityIcons
                    name={getButtonIcon(progress)}
                    size={16}
                    color="#000000"
                  />
                  <Text style={styles.readNowText}>{getButtonLabel(progress)}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={handleRemove}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Remove imported e-book file"
                >
                  <MaterialCommunityIcons name="delete-outline" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <TouchableOpacity
              style={styles.importBtn}
              onPress={handleImport}
              disabled={importing}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Import an EPUB file"
            >
              {importing ? (
                <ActivityIndicator size="small" color="#000000" />
              ) : (
                <>
                  <MaterialCommunityIcons name="file-upload" size={16} color="#000000" />
                  <Text style={styles.importBtnText}>Import EPUB File</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          <Text style={styles.hint}>
            Import your own EPUB to read with bookmarks and auto-saved progress.
          </Text>
        </View>
      </View>
    </NeuShadow>
  );
}

export function EbookSectionSkeleton() {
  return (
    <NeuShadow offset={3}>
      <View style={styles.frame}>
        <View style={styles.titleBar}>
          <SkeletonShimmer width={80} height={9} borderRadius={2} />
          <View style={styles.titleDots}>
            <View style={[styles.dot, { backgroundColor: homeColors.border, opacity: 0.3 }]} />
            <View style={[styles.dot, { backgroundColor: homeColors.border, opacity: 0.3 }]} />
            <View style={[styles.dot, { backgroundColor: homeColors.border, opacity: 0.3 }]} />
          </View>
        </View>
        <View style={skelStyles.content}>
          <View style={styles.fileRow}>
            <SkeletonShimmer width={36} height={36} borderRadius={0} />
            <View style={styles.fileInfo}>
              <SkeletonShimmer width={'70%'} height={11} borderRadius={2} />
              <SkeletonShimmer width={'30%'} height={9} borderRadius={2} style={{ marginTop: 4 }} />
            </View>
          </View>
          <View style={styles.actionsRow}>
            <SkeletonShimmer width={'100%'} height={BTN_HEIGHT} borderRadius={0} style={{ flex: 1 }} />
            <SkeletonShimmer width={BTN_HEIGHT} height={BTN_HEIGHT} borderRadius={0} />
          </View>
        </View>
      </View>
    </NeuShadow>
  );
}

const skelStyles = StyleSheet.create({
  content: {
    padding: spacing.md,
    backgroundColor: '#FFFFFF',
    gap: spacing.md,
  },
});

const styles = StyleSheet.create({
  frame: {
    borderWidth: borderWidth.pixel,
    borderColor: homeColors.border,
    backgroundColor: homeColors.bgCard,
  },
  titleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderBottomWidth: borderWidth.normal,
    borderBottomColor: homeColors.border,
  },
  titleText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: textSizes.xxs,
    color: homeColors.textDark,
  },
  titleDots: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderWidth: 1,
    borderColor: '#000000',
  },
  content: {
    padding: spacing.md,
    backgroundColor: '#FFFFFF',
    gap: spacing.md,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  fileIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: homeColors.bgCard,
    borderWidth: 2,
    borderColor: '#000000',
    borderRightWidth: 3,
    borderBottomWidth: 3,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: textSizes.sm,
    color: homeColors.textDark,
  },
  fileSize: {
    fontFamily: fonts.body,
    fontSize: textSizes.xs,
    color: homeColors.textCaption,
    marginTop: spacing.xxs,
  },
  divider: {
    height: 1,
    backgroundColor: homeColors.border,
    opacity: 0.15,
  },
  progressSection: {
    gap: spacing.xs,
  },
  pageText: {
    fontFamily: fonts.body,
    fontSize: textSizes.xxs,
    color: homeColors.textCaption,
    textAlign: 'right',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    height: BTN_HEIGHT,
  },
  readNowBtn: {
    flex: 1,
    height: BTN_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#FBCA1F',
    borderWidth: 3,
    borderColor: '#000000',
    borderRightWidth: 5,
    borderBottomWidth: 5,
  },
  readNowBtnComplete: {
    backgroundColor: homeColors.success,
  },
  readNowText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: textSizes.sm,
    color: '#000000',
  },
  removeBtn: {
    width: BTN_HEIGHT,
    height: BTN_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: homeColors.error,
    borderWidth: 3,
    borderColor: '#000000',
    borderRightWidth: 5,
    borderBottomWidth: 5,
  },
  importBtn: {
    height: BTN_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#FBCA1F',
    borderWidth: 3,
    borderColor: '#000000',
    borderRightWidth: 5,
    borderBottomWidth: 5,
  },
  importBtnText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: textSizes.sm,
    color: '#000000',
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: textSizes.xxs,
    color: homeColors.textCaption,
    lineHeight: textSizes.xxs * 1.6,
    marginTop: spacing.xxs,
  },
});
