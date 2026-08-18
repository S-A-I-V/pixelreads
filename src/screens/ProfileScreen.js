import React, { useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useUserBookLibraryStore } from '../features/library/store/userBookLibraryStore';
import { useAuthUserSessionStore } from '../features/auth/store/authUserSessionStore';
import { trackScreenView } from '../utils/analytics';
import { colors, spacing, radius, textSizes, fontWeights, borderWidth } from '../theme';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const shelves = useUserBookLibraryStore((s) => s.shelves);
  const getStats = useUserBookLibraryStore((s) => s.getLibraryStatistics);
  const userEmail = useAuthUserSessionStore((s) => s.userEmail);
  const logout = useAuthUserSessionStore((s) => s.logout);

  const stats = getStats();
  const allBooks = Object.values(shelves).flat();
  const ratedBooks = allBooks.filter((b) => b.rating > 0);
  const avgRating = ratedBooks.length ? (ratedBooks.reduce((s, b) => s + b.rating, 0) / ratedBooks.length).toFixed(1) : '-';
  const totalPages = allBooks.reduce((s, b) => s + (b.pageCount ?? 0), 0);

  useFocusEffect(
    useCallback(() => {
      trackScreenView('Profile', { totalBooks: stats.total, avgRating, totalPages, booksRated: ratedBooks.length });
    }, [stats.total, avgRating, totalPages, ratedBooks.length])
  );

  const handleLogout = () => {
    Alert.alert('Logout?', 'Your library is saved locally.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.userSection}>
          <MaterialCommunityIcons name="account-circle" size={64} color={colors.accent} />
          <Text style={styles.userName}>{userEmail?.split('@')[0] || 'Reader'}</Text>
          <Text style={styles.userEmail}>{userEmail}</Text>
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Reading Stats</Text>
          <View style={styles.statsGrid}>
            <StatCard value={stats.total} label="Total Books" />
            <StatCard value={stats.reading} label="Reading" />
            <StatCard value={stats.finished} label="Finished" />
            <StatCard value={stats.wantToRead} label="Want to Read" />
            <StatCard value={avgRating} label="Avg Rating" />
            <StatCard value={totalPages > 999 ? `${(totalPages / 1000).toFixed(1)}k` : totalPages} label="Pages Read" />
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} accessibilityLabel="Logout" accessibilityRole="button">
          <MaterialCommunityIcons name="logout" size={20} color={colors.textPrimary} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function StatCard({ value, label }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPrimary },
  header: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: borderWidth.thin, borderBottomColor: colors.border },
  headerTitle: { fontSize: textSizes.h2, fontWeight: fontWeights.bold, color: colors.textPrimary },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.xxl },
  userSection: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xxl, backgroundColor: colors.bgSecondary, borderRadius: radius.lg },
  userName: { fontSize: textSizes.h2, fontWeight: fontWeights.bold, color: colors.textPrimary, textTransform: 'capitalize' },
  userEmail: { fontSize: textSizes.md, color: colors.textMuted },
  statsSection: { gap: spacing.md },
  sectionTitle: { fontSize: textSizes.xl, fontWeight: fontWeights.semibold, color: colors.textPrimary },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  statCard: { width: '30%', flexGrow: 1, backgroundColor: colors.bgSecondary, borderRadius: radius.md, padding: spacing.lg, alignItems: 'center', gap: spacing.xs },
  statValue: { fontSize: textSizes.h2, fontWeight: fontWeights.bold, color: colors.accent },
  statLabel: { fontSize: textSizes.sm, color: colors.textMuted, textAlign: 'center' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.accent, paddingVertical: spacing.lg, borderRadius: radius.md, marginTop: spacing.lg },
  logoutText: { fontSize: textSizes.lg, fontWeight: fontWeights.semibold, color: colors.textPrimary },
});
