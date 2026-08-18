import React, { useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useUserBookLibraryStore } from '../features/library/store/userBookLibraryStore';
import { useAuthUserSessionStore } from '../features/auth/store/authUserSessionStore';
import { trackScreenView, track, EventType, EventCategory } from '../utils/analytics';
import { BookListItem, EmptyState } from '../components/ui';
import { colors, spacing, textSizes, fontWeights, borderWidth } from '../theme';

export default function HomeScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const shelves = useUserBookLibraryStore((s) => s.shelves);
  const getStats = useUserBookLibraryStore((s) => s.getLibraryStatistics);
  const userEmail = useAuthUserSessionStore((s) => s.userEmail);

  const stats = getStats();
  const currentlyReading = shelves.reading || [];

  useFocusEffect(
    useCallback(() => {
      trackScreenView('Home', { booksReading: currentlyReading.length, totalBooks: stats.total });
    }, [currentlyReading.length, stats.total])
  );

  const goBook = (book) => {
    track(EventType.SEARCH_RESULT_TAP, EventCategory.NAVIGATION, { bookId: book.id, source: 'home_currently_reading' });
    navigation.navigate('BookDetail', { book });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Home</Text>
        <Text style={styles.headerEmail}>{userEmail}</Text>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <StatItem value={stats.total} label="Total" />
        <StatItem value={stats.reading} label="Reading" />
        <StatItem value={stats.finished} label="Finished" />
        <StatItem value={stats.wantToRead} label="Want" />
      </View>

      {/* Currently Reading */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Currently Reading</Text>
        {currentlyReading.length === 0 ? (
          <EmptyState icon="bookshelf" title="No books in progress">
            <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('Search')}>
              <Text style={styles.linkText}>Search for books</Text>
            </TouchableOpacity>
          </EmptyState>
        ) : (
          <FlatList
            data={currentlyReading}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <BookListItem book={item} variant="compact" onPress={() => goBook(item)} showChevron={false} />
            )}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}

function StatItem({ value, label }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPrimary },
  header: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: borderWidth.thin, borderBottomColor: colors.border },
  headerTitle: { fontSize: textSizes.h2, fontWeight: fontWeights.bold, color: colors.textPrimary },
  headerEmail: { fontSize: textSizes.md, color: colors.textMuted, marginTop: spacing.xxs },
  stats: { flexDirection: 'row', paddingVertical: spacing.lg, paddingHorizontal: spacing.lg, borderBottomWidth: borderWidth.thin, borderBottomColor: colors.border },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: textSizes.h2, fontWeight: fontWeights.bold, color: colors.accent },
  statLabel: { fontSize: textSizes.sm, color: colors.textMuted, marginTop: spacing.xs },
  section: { flex: 1, padding: spacing.lg },
  sectionTitle: { fontSize: textSizes.xl, fontWeight: fontWeights.semibold, color: colors.textPrimary, marginBottom: spacing.md },
  linkButton: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg },
  linkText: { fontSize: textSizes.lg, color: colors.accent },
});
