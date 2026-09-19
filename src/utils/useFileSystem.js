/**
 * Custom useFileSystem adapter for @epubjs-react-native/core
 *
 * SDK 57: The legacy expo-file-system native module (ExponentFileSystem) is
 * no longer available in Expo Go, so documentDirectory / cacheDirectory are
 * null. This adapter bridges the new expo-file-system API (File, Directory,
 * Paths) into the hook shape that @epubjs-react-native/core expects.
 */
import { File, Directory, Paths } from 'expo-file-system';
import { useState, useCallback } from 'react';

export function useFileSystem() {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [size, setSize] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const documentDirectory = Paths.document.uri;
  const cacheDirectory = Paths.cache.uri;

  const downloadFile = useCallback((fromUrl, toFile) => {
    setDownloading(true);
    const dest = new File(Paths.document, toFile);

    return File.downloadFileAsync(fromUrl, dest, { idempotent: true })
      .then((downloadedFile) => {
        setSuccess(true);
        setError(null);
        setFile(downloadedFile.uri);
        if (downloadedFile.size) setSize(downloadedFile.size);
        return { uri: downloadedFile.uri, mimeType: null };
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Error downloading file');
        return { uri: null, mimeType: null };
      })
      .finally(() => setDownloading(false));
  }, []);

  const getFileInfo = useCallback(async (fileUri) => {
    try {
      const f = new File(fileUri);
      const exists = f.exists;
      return { uri: fileUri, exists, isDirectory: false, size: exists ? f.size : 0 };
    } catch {
      return { uri: fileUri, exists: false, isDirectory: false, size: 0 };
    }
  }, []);

  // Legacy-compatible writeAsStringAsync — used by epub reader to write
  // jszip.min.js, epub.min.js, and index.html into documentDirectory.
  const writeAsStringAsync = useCallback(async (fileUri, contents, options) => {
    const f = new File(fileUri);
    const parentDir = f.parentDirectory;
    if (!parentDir.exists) parentDir.create();
    if (options?.encoding === 'base64') {
      f.write(contents, { encoding: 'base64' });
    } else {
      f.write(contents);
    }
  }, []);

  // Legacy-compatible readAsStringAsync
  const readAsStringAsync = useCallback(async (fileUri, options) => {
    const f = new File(fileUri);
    if (options?.encoding === 'base64') {
      return await f.base64();
    }
    return await f.text();
  }, []);

  // Legacy-compatible deleteAsync
  const deleteAsync = useCallback(async (fileUri) => {
    try {
      const f = new File(fileUri);
      if (f.exists) f.delete();
    } catch {
      // Ignore deletion errors (idempotent)
    }
  }, []);

  return {
    file,
    progress,
    downloading,
    size,
    error,
    success,
    documentDirectory,
    cacheDirectory,
    bundleDirectory: undefined,
    readAsStringAsync,
    writeAsStringAsync,
    deleteAsync,
    downloadFile,
    getFileInfo,
  };
}
