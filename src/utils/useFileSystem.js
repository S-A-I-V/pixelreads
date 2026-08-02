/**
 * Custom useFileSystem adapter for @epubjs-react-native/core
 *
 * The official @epubjs-react-native/expo-file-system package calls the old
 * expo-file-system API (getInfoAsync, writeAsStringAsync) which throws in
 * Expo SDK 54. This adapter imports from 'expo-file-system/legacy' so all
 * the same functions work without deprecation errors.
 */
import * as ExpoFileSystem from 'expo-file-system/legacy';
import { useState, useCallback } from 'react';

export function useFileSystem() {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [size, setSize] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const downloadFile = useCallback((fromUrl, toFile) => {
    const callback = (downloadProgress) => {
      const currentProgress = Math.round(
        (downloadProgress.totalBytesWritten /
          downloadProgress.totalBytesExpectedToWrite) *
          100
      );
      setProgress(currentProgress);
    };

    const downloadResumable = ExpoFileSystem.createDownloadResumable(
      fromUrl,
      ExpoFileSystem.documentDirectory + toFile,
      { cache: true },
      callback
    );

    setDownloading(true);
    return downloadResumable
      .downloadAsync()
      .then((value) => {
        if (!value) throw new Error('Download failed');
        if (value.headers['Content-Length']) {
          setSize(Number(value.headers['Content-Length']));
        }
        setSuccess(true);
        setError(null);
        setFile(value.uri);
        return { uri: value.uri, mimeType: value.mimeType };
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Error downloading file');
        return { uri: null, mimeType: null };
      })
      .finally(() => setDownloading(false));
  }, []);

  const getFileInfo = useCallback(async (fileUri) => {
    const { uri, exists, isDirectory, size: fileSize } =
      await ExpoFileSystem.getInfoAsync(fileUri);
    return { uri, exists, isDirectory, size: fileSize };
  }, []);

  return {
    file,
    progress,
    downloading,
    size,
    error,
    success,
    documentDirectory: ExpoFileSystem.documentDirectory,
    cacheDirectory: ExpoFileSystem.cacheDirectory,
    bundleDirectory: ExpoFileSystem.bundleDirectory || undefined,
    readAsStringAsync: ExpoFileSystem.readAsStringAsync,
    writeAsStringAsync: ExpoFileSystem.writeAsStringAsync,
    deleteAsync: ExpoFileSystem.deleteAsync,
    downloadFile,
    getFileInfo,
  };
}
