import React, { useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useUserBookLibraryStore } from '../features/library/store/userBookLibraryStore';
import { useAuthUserSessionStore } from '../features/auth/store/authUserSessionStore';
import { trackScreenView } from '../utils/analytics';
import { ProfileIcon } from '../components/icons';
import { homeColors, spacing, radius, elevation, textSizes, fontWeights } from '../theme';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const shelves = useUserBookLibraryStore((s) => s.shelves);
  const getStats = useUserBookLibraryStore((s) => s.getLibraryStatistics);
  const userEmail = useAuthUserSessionStore((s) => s.userEmail);
  const logout = useAuthUserSessionStore((s) => s.logout);

  const stats = getStats();
  const allBooks = Object.values(shelves).flat();
  const ratedBooks = allBooks.filter((b) => b.rating > 0);
  const avgRating = ratedBooks.length
    ? (ratedBooks.reduce((s, b) => s + b.rating, 0) / ratedBooks.length).toFixed(1)
    : '-';
  const totalPages = allBooks.reduce((s, b) => s + (b.pageCount ?? 0), 0);

  useFocusEffect(
    useCallback(() => {
      trackScreenView('Profile', {
        totalBooks: stats.total,
        avgRating,
        totalPages,
        booksRated: ratedBooks.length,
      });
    }, [stats.total, avgRating, totalPages, ratedBooks.length])
  );

  const handleLogout = () => {
    Alert.alert('Logout?', 'Your library is saved locally.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const displayName = userEmail?.split('@')[0] || 'Reader';

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* User avatar section */}
        <View style={styles.userSection}>
          <View style={styles.avatarContainer}>
            <ProfileIcon size={36} color={homeColors.accent} />
          </View>
          <Text style={styles.userName}>{displayName}</Text>
          {userEmail && <Text style={styles.userEmail}>{userEmail}</Text>}
        </View>

        {/* Stats grid */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Reading Stats</Text>
          <View style={styles.statsGrid}>
            <StatCard value={stats.total} label="Total Books" />
            <StatCard value={stats.reading} label="Reading" />
            <StatCard value={stats.finished} label="Finished" />
            <StatCard value={stats.wantToRead} label="Want to Read" />
            <StatCard value={avgRating} label="Avg Rating" />
            <StatCard
              value={totalPages > 999 ? `${(totalPages / 1000).toFixed(1)}k` : totalPages}
              label="Pages Read"
            />
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.85}
          accessibilityLabel="Logout"
          accessibilityRole="button"
        >
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
  screen: {
    flex: 1,
    backgroundColor: homeColors.bgMain,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: textSizes.h1,
    fontWeight: fontWeights.bold,
    color: homeColors.textDark,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.xxl,
  },
  userSection: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxxl,
    backgroundColor: homeColors.bgCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: homeColors.borderSubtle,
    ...elevation.sm,
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: homeColors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    ...elevation.accent,
  },
  userName: {
    fontSize: textSizes.h2,
    fontWeight: fontWeights.bold,
    color: homeColors.textDark,
    textTransform: 'capitalize',
  },
  userEmail: {
    fontSize: textSizes.md,
    color: homeColors.textCaption,
  },
  statsSection: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: textSizes.xl,
    fontWeight: fontWeights.semibold,
    color: homeColors.textDark,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCard: {
    width: '30%',
    flexGrow: 1,
    backgroundColor: homeColors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: homeColors.borderSubtle,
    ...elevation.sm,
  },
  statValue: {
    fontSize: textSizes.h2,
    fontWeight: fontWeights.bold,
    color: homeColors.accent,
  },
  statLabel: {
    fontSize: textSizes.xs,
    fontWeight: fontWeights.medium,
    color: homeColors.textCaption,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  logoutButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    backgroundColor: homeColors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: homeColors.border,
    marginTop: spacing.md,
  },
  logoutText: {
    fontSize: textSizes.lg,
    fontWeight: fontWeights.semibold,
    color: homeColors.error,
  },
});
