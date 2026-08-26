import React, { useCallback, useMemo } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useUserBookLibraryStore } from '../features/library/store/userBookLibraryStore';
import { useAuthUserSessionStore } from '../features/auth/store/authUserSessionStore';
import { trackScreenView } from '../utils/analytics';
import { ProfileIcon } from '../components/icons';
import { NeuShadow } from '../components/ui/NeuShadow';
import { homeColors, spacing, borderWidth, textSizes, fonts } from '../theme';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const shelves = useUserBookLibraryStore((s) => s.shelves);
  const getStats = useUserBookLibraryStore((s) => s.getLibraryStatistics);
  const userEmail = useAuthUserSessionStore((s) => s.userEmail);
  const logout = useAuthUserSessionStore((s) => s.logout);

  const stats = getStats();
  const allBooks = useMemo(() => Object.values(shelves).flat(), [shelves]);
  const pagesRead = useMemo(
    () => allBooks.reduce((sum, b) => sum + Math.round((b.pageCount ?? 0) * (b.progress ?? 0) / 100), 0),
    [allBooks]
  );
  const totalPages = useMemo(
    () => allBooks.reduce((sum, b) => sum + (b.pageCount ?? 0), 0),
    [allBooks]
  );

  useFocusEffect(
    useCallback(() => {
      trackScreenView('Profile', { totalBooks: stats.total, pagesRead });
    }, [stats.total, pagesRead])
  );

  const handleLogout = () => {
    Alert.alert('Logout?', 'Your library is saved locally.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const displayName = userEmail?.split('@')[0] || 'Reader';

  // Bar chart data for shelf breakdown
  const chartData = [
    { label: 'Reading', value: stats.reading, color: '#6366F1' },
    { label: 'Want', value: stats.wantToRead, color: '#F15BB5' },
    { label: 'Done', value: stats.finished, color: '#10B981' },
    { label: 'DNF', value: stats.dnf, color: '#EF4444' },
  ];
  const maxBarValue = Math.max(...chartData.map(d => d.value), 1);

  return (
    <View style={styles.screen}>
      <View style={[styles.safeArea, { height: insets.top }]} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* User card */}
        <NeuShadow offset={3}>
          <View style={styles.userWindow}>
            <View style={styles.userTitleBar}>
              <Text style={styles.userTitleBarText}>user_profile.dat</Text>
            </View>
            <View style={styles.userContent}>
              <View style={styles.avatarBox}>
                <ProfileIcon size={28} color="#000000" />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{displayName}</Text>
                {userEmail && <Text style={styles.userEmail}>{userEmail}</Text>}
              </View>
            </View>
          </View>
        </NeuShadow>

        {/* Divider */}
        <Text style={styles.divider} numberOfLines={1}>{'≻──────────── ⋆✩⋆ ────────────≺'}</Text>

        {/* Stats — image cards with count badge */}
        <View style={styles.statsGrid}>
          <View style={styles.statImageCard}>
            <NeuShadow offset={3}>
              <View style={styles.statImageFrame}>
                <Image source={require('../../assets/images/categories/total-cet.png')} style={styles.statImage} resizeMode="cover" />
                <View style={styles.statBadge}>
                  <Text style={styles.statBadgeText}>{stats.total}</Text>
                </View>
              </View>
            </NeuShadow>
            <Text style={styles.statImageLabel}>Total Books</Text>
          </View>
          <View style={styles.statImageCard}>
            <NeuShadow offset={3}>
              <View style={styles.statImageFrame}>
                <Image source={require('../../assets/images/categories/reading-cet.png')} style={styles.statImage} resizeMode="cover" />
                <View style={styles.statBadge}>
                  <Text style={styles.statBadgeText}>{stats.reading}</Text>
                </View>
              </View>
            </NeuShadow>
            <Text style={styles.statImageLabel}>Books Reading</Text>
          </View>
          <View style={styles.statImageCard}>
            <NeuShadow offset={3}>
              <View style={styles.statImageFrame}>
                <Image source={require('../../assets/images/categories/completed-cet.png')} style={styles.statImage} resizeMode="cover" />
                <View style={styles.statBadge}>
                  <Text style={styles.statBadgeText}>{stats.finished}</Text>
                </View>
              </View>
            </NeuShadow>
            <Text style={styles.statImageLabel}>Books Completed</Text>
          </View>
        </View>

        {/* Divider */}
        <Text style={styles.divider} numberOfLines={1}>{'≻──────────── ⋆✩⋆ ────────────≺'}</Text>

        {/* Retro bar chart */}
        <NeuShadow offset={3}>
          <View style={styles.chartWindow}>
            <View style={styles.chartTitleBar}>
              <Text style={styles.chartTitleBarText}>shelf_stats.exe</Text>
            </View>
            <View style={styles.chartContent}>
              {chartData.map((item) => (
                <View key={item.label} style={styles.barRow}>
                  <Text style={styles.barLabel}>{item.label}</Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${Math.max((item.value / maxBarValue) * 100, 2)}%`,
                          backgroundColor: item.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barValue}>{item.value}</Text>
                </View>
              ))}
            </View>
          </View>
        </NeuShadow>

        {/* Divider */}
        <Text style={styles.divider} numberOfLines={1}>{'≻──────────── ⋆✩⋆ ────────────≺'}</Text>

        {/* Pages read motivation */}
        <NeuShadow offset={3}>
          <View style={styles.motivationWindow}>
            <View style={styles.chartTitleBar}>
              <Text style={styles.chartTitleBarText}>motivation.log</Text>
            </View>
            <View style={styles.motivationContent}>
              <Text style={styles.motivationLabel}>Pages Read Progress</Text>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: totalPages > 0 ? `${Math.min((pagesRead / totalPages) * 100, 100)}%` : '0%' },
                  ]}
                />
              </View>
              <View style={styles.progressInfo}>
                <Text style={styles.progressText}>{pagesRead.toLocaleString()} / {totalPages.toLocaleString()}</Text>
                <Text style={styles.progressPercent}>
                  {totalPages > 0 ? `${Math.round((pagesRead / totalPages) * 100)}%` : '0%'}
                </Text>
              </View>
              <Text style={styles.motivationQuote}>
                {'> "A reader lives a thousand lives"'}
              </Text>
            </View>
          </View>
        </NeuShadow>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.85}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: homeColors.bgMain,
  },
  safeArea: {
    backgroundColor: homeColors.navBg,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: homeColors.navBg,
    borderBottomWidth: borderWidth.pixel,
    borderBottomColor: '#000000',
  },
  headerTitle: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: textSizes.lg,
    color: '#000000',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  divider: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 18,
    color: '#000000',
    textAlign: 'center',
  },

  // User card
  userWindow: {
    borderWidth: borderWidth.pixel,
    borderColor: '#000000',
    backgroundColor: homeColors.bgCard,
  },
  userTitleBar: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderBottomWidth: borderWidth.normal,
    borderBottomColor: '#000000',
  },
  userTitleBarText: {
    fontFamily: fonts.body,
    fontSize: textSizes.xxs,
    color: '#000000',
  },
  userContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: '#FFFFFF',
  },
  avatarBox: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FBCA1F',
    borderWidth: 2,
    borderColor: '#000000',
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  userName: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: textSizes.md,
    color: '#000000',
  },
  userEmail: {
    fontFamily: fonts.body,
    fontSize: textSizes.xxs,
    color: homeColors.textCaption,
  },

  // Stats image cards
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statImageCard: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xxs,
  },
  statImageFrame: {
    width: '100%',
    aspectRatio: 1,
    borderWidth: borderWidth.pixel,
    borderColor: '#000000',
    backgroundColor: homeColors.bgCard,
    overflow: 'hidden',
  },
  statImage: {
    width: '100%',
    height: '100%',
  },
  statBadge: {
    position: 'absolute',
    bottom: spacing.xs,
    right: spacing.xs,
    backgroundColor: '#FBCA1F',
    borderWidth: 2,
    borderColor: '#000000',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  statBadgeText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: textSizes.xs,
    color: '#000000',
  },
  statImageLabel: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: textSizes.xxs,
    color: '#000000',
  },

  // Chart window
  chartWindow: {
    borderWidth: borderWidth.pixel,
    borderColor: '#000000',
    backgroundColor: homeColors.bgCard,
  },
  chartTitleBar: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderBottomWidth: borderWidth.normal,
    borderBottomColor: '#000000',
  },
  chartTitleBarText: {
    fontFamily: fonts.body,
    fontSize: textSizes.xxs,
    color: '#000000',
  },
  chartContent: {
    padding: spacing.md,
    backgroundColor: '#FFFFFF',
    gap: spacing.sm,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  barLabel: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: textSizes.xxs,
    color: '#000000',
    width: 55,
  },
  barTrack: {
    flex: 1,
    height: 16,
    backgroundColor: '#E0E0E0',
    borderWidth: 1,
    borderColor: '#000000',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
  },
  barValue: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: textSizes.xxs,
    color: '#000000',
    width: 24,
    textAlign: 'right',
  },

  // Motivation
  motivationWindow: {
    borderWidth: borderWidth.pixel,
    borderColor: '#000000',
    backgroundColor: homeColors.bgCard,
  },
  motivationContent: {
    padding: spacing.md,
    backgroundColor: '#FFFFFF',
    gap: spacing.sm,
  },
  motivationLabel: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: textSizes.xs,
    color: '#000000',
  },
  progressTrack: {
    height: 20,
    backgroundColor: '#E0E0E0',
    borderWidth: 2,
    borderColor: '#000000',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontFamily: fonts.body,
    fontSize: textSizes.xxs,
    color: homeColors.textCaption,
  },
  progressPercent: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: textSizes.xxs,
    color: '#10B981',
  },
  motivationQuote: {
    fontFamily: fonts.body,
    fontSize: textSizes.xxs,
    color: homeColors.textCaption,
    marginTop: spacing.xs,
  },

  // Logout
  logoutButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    backgroundColor: homeColors.error,
    borderWidth: 2,
    borderColor: '#000000',
    borderRightWidth: 4,
    borderBottomWidth: 4,
  },
  logoutText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: textSizes.sm,
    color: '#FFFFFF',
  },
});
