import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import useBookStore from '../store/bookStore';
import useAuthStore from '../store/authStore';
import { PixelButton, PixelDivider, PixelCard } from '../components';
import { colors, fonts, textSizes, spacing, borderWidth } from '../theme';

// ── Stat card ─────────────────────────────────────────────────────
function StatCard({ icon, value, label, color }) {
  return (
    <View style={[styles.statCard, { borderColor: color }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ── Achievement badge ─────────────────────────────────────────────
function AchievementBadge({ icon, label, earned }) {
  return (
    <View style={[styles.achievement, !earned && styles.achievementLocked]}>
      <View style={[styles.achievementIcon, earned && styles.achievementIconEarned]}>
        <Text style={{ fontSize: 22 }}>{icon}</Text>
      </View>
      <Text style={[styles.achievementLabel, !earned && { color: colors.textMuted }]}>
        {label}
      </Text>
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const navigation  = useNavigation();
  const insets      = useSafeAreaInsets();
  const shelves     = useBookStore((s) => s.shelves);
  const getStats    = useBookStore((s) => s.getStats);
  const userEmail   = useAuthStore((s) => s.userEmail);
  const logout      = useAuthStore((s) => s.logout);

  const stats      = getStats();
  const allBooks   = Object.values(shelves).flat();
  const ratedBooks = allBooks.filter((b) => b.rating > 0);
  const avgRating  = ratedBooks.length
    ? (ratedBooks.reduce((s, b) => s + b.rating, 0) / ratedBooks.length).toFixed(1)
    : '—';
  const totalPages  = allBooks.reduce((s, b) => s + (b.pageCount ?? 0), 0);
  const playerName  = userEmail?.split('@')[0]?.toUpperCase() ?? 'PLAYER';
  const level       = Math.floor(stats.total / 5) + 1;

  const achievements = [
    { icon: '📖', label: 'FIRST\nBOOK',    earned: stats.total >= 1 },
    { icon: '🔥', label: '5 BOOKS',         earned: stats.total >= 5 },
    { icon: '🏆', label: '10\nFINISHED',    earned: stats.finished >= 10 },
    { icon: '⭐', label: 'GAVE 5★',         earned: ratedBooks.some((b) => b.rating === 5) },
    { icon: '✍️', label: 'REVIEWER',        earned: allBooks.some((b) => b.review?.length > 0) },
    { icon: '📚', label: '50 BOOKS',        earned: stats.total >= 50 },
    { icon: '💔', label: 'HONEST\nDNF',     earned: stats.dnf >= 1 },
    { icon: '🎯', label: 'ALL DONE',        earned: stats.finished > 0 && stats.reading === 0 },
  ];

  const recentlyRated = [...ratedBooks]
    .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
    .slice(0, 5);

  const handleLogout = () => {
    Alert.alert('Logout?', 'Your library is saved. Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PROFILE</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxxl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroAvatar}>👾</Text>
          <Text style={styles.heroName}>{playerName}</Text>
          <Text style={styles.heroEmail}>{userEmail}</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>LVL {level} READER</Text>
          </View>
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          <StatCard icon="📚" label="TOTAL"   value={stats.total}      color={colors.pinkHot}  />
          <StatCard icon="📖" label="READING" value={stats.reading}    color={colors.blue}     />
          <StatCard icon="🏆" label="DONE"    value={stats.finished}   color={colors.green}    />
          <StatCard icon="🔖" label="WANT"    value={stats.wantToRead} color={colors.pinkNeon} />
          <StatCard icon="⭐" label="AVG ★"   value={avgRating}        color={colors.yellow}   />
          <StatCard
            icon="📄"
            label="PAGES"
            value={totalPages > 999 ? `${(totalPages / 1000).toFixed(1)}k` : totalPages}
            color={colors.cyan}
          />
        </View>

        <PixelDivider />

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 ACHIEVEMENTS</Text>
          <View style={styles.achievementsGrid}>
            {achievements.map((a) => (
              <AchievementBadge key={a.label} {...a} />
            ))}
          </View>
        </View>

        <PixelDivider />

        {/* Recent ratings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>★ RECENTLY RATED</Text>
          {recentlyRated.length === 0 ? (
            <Text style={styles.emptyText}>No ratings yet</Text>
          ) : (
            recentlyRated.map((book) => (
              <TouchableOpacity
                key={book.id}
                onPress={() => navigation.navigate('BookDetail', { book })}
                style={styles.ratedRow}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.ratedTitle} numberOfLines={1}>{book.title}</Text>
                  <Text style={styles.ratedAuthor} numberOfLines={1}>{book.authors?.join(', ')}</Text>
                </View>
                <Text style={styles.ratedStars}>{'★'.repeat(book.rating)}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        <PixelDivider />

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙ SETTINGS</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.settingsRow}>
            <Text style={styles.settingsRowText}>🚪 LOGOUT</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bgDark },

  header: {
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    backgroundColor: colors.bgMid,
    borderBottomWidth: borderWidth.thick, borderBottomColor: colors.pinkHot,
  },
  headerTitle: {
    fontFamily: fonts.pixel, fontSize: textSizes.md, color: colors.pinkHot,
    textShadowColor: colors.pinkDark, textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 0,
    letterSpacing: 2,
  },

  scroll: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.lg },

  hero: {
    alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.bgPanel,
    borderWidth: borderWidth.thick, borderColor: colors.pinkHot,
    padding: spacing.xl,
  },
  heroAvatar: { fontSize: 52 },
  heroName: {
    fontFamily: fonts.pixel, fontSize: textSizes.lg,
    color: colors.pinkHot, letterSpacing: 2,
  },
  heroEmail: {
    fontFamily: fonts.pixel, fontSize: textSizes.xxs - 1,
    color: colors.textDim,
  },
  levelBadge: {
    backgroundColor: colors.pinkHot, paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    marginTop: spacing.xs,
  },
  levelText: {
    fontFamily: fonts.pixel, fontSize: textSizes.xxs,
    color: colors.white, letterSpacing: 1,
  },

  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm,
  },
  statCard: {
    width: '30%', flex: 1,
    backgroundColor: colors.bgCard,
    borderWidth: borderWidth.thick,
    padding: spacing.sm, alignItems: 'center', gap: spacing.xs,
  },
  statIcon:  { fontSize: 20 },
  statValue: { fontFamily: fonts.pixel, fontSize: textSizes.lg },
  statLabel: {
    fontFamily: fonts.pixel, fontSize: textSizes.xxs - 1,
    color: colors.textDim, letterSpacing: 0.5,
  },

  section:      { gap: spacing.md },
  sectionTitle: {
    fontFamily: fonts.pixel, fontSize: textSizes.xs,
    color: colors.pinkHot, letterSpacing: 1,
  },

  achievementsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md,
  },
  achievement: {
    width: '22%', alignItems: 'center', gap: spacing.xs,
  },
  achievementLocked: { opacity: 0.3 },
  achievementIcon: {
    width: 48, height: 48,
    backgroundColor: colors.bgPanel,
    borderWidth: borderWidth.normal, borderColor: colors.bgPanel,
    alignItems: 'center', justifyContent: 'center',
  },
  achievementIconEarned: {
    backgroundColor: colors.pinkHot,
    borderColor: colors.pinkNeon,
    shadowColor: colors.pinkDark,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1, shadowRadius: 0,
  },
  achievementLabel: {
    fontFamily: fonts.pixel, fontSize: textSizes.xxs - 2,
    color: colors.textMain, textAlign: 'center',
    lineHeight: (textSizes.xxs - 2) * 2,
  },

  ratedRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.bgPanel,
    gap: spacing.md,
  },
  ratedTitle:  { fontFamily: fonts.pixel, fontSize: textSizes.xxs, color: colors.textMain },
  ratedAuthor: { fontFamily: fonts.pixel, fontSize: textSizes.xxs - 1, color: colors.textDim },
  ratedStars:  { fontFamily: fonts.pixel, fontSize: textSizes.sm, color: colors.yellow },

  emptyText: {
    fontFamily: fonts.pixel, fontSize: textSizes.xxs,
    color: colors.textDim,
  },

  settingsRow: {
    padding: spacing.md, backgroundColor: colors.bgCard,
    borderWidth: borderWidth.normal, borderColor: colors.bgPanel,
  },
  settingsRowText: {
    fontFamily: fonts.pixel, fontSize: textSizes.xs,
    color: colors.textMain, letterSpacing: 1,
  },
});
