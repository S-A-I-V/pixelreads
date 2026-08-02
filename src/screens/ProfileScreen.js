import React, { useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import useBookStore from '../store/bookStore';
import useAuthStore from '../store/authStore';
import { trackScreenView, track, EventCategory } from '../utils/analytics';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const shelves = useBookStore((s) => s.shelves);
  const getStats = useBookStore((s) => s.getStats);
  const userEmail = useAuthStore((s) => s.userEmail);
  const logout = useAuthStore((s) => s.logout);

  const stats = getStats();
  const allBooks = Object.values(shelves).flat();
  const ratedBooks = allBooks.filter((b) => b.rating > 0);
  const avgRating = ratedBooks.length
    ? (ratedBooks.reduce((s, b) => s + b.rating, 0) / ratedBooks.length).toFixed(1)
    : '-';
  const totalPages = allBooks.reduce((s, b) => s + (b.pageCount ?? 0), 0);

  // Track screen view on focus
  useFocusEffect(
    useCallback(() => {
      trackScreenView('Profile', { 
        totalBooks: stats.total, 
        avgRating, 
        totalPages,
        booksRated: ratedBooks.length 
      });
      console.log(`[Screen] Profile viewed - ${stats.total} books, ${avgRating} avg rating, ${totalPages} pages`);
    }, [stats.total, avgRating, totalPages, ratedBooks.length])
  );

  const handleLogout = () => {
    Alert.alert('Logout?', 'Your library is saved locally.', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Logout', 
        style: 'destructive', 
        onPress: () => {
          console.log('[Profile] User confirmed logout');
          logout();
        }
      },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* User info */}
        <View style={styles.userSection}>
          <MaterialCommunityIcons name="account-circle" size={64} color="#e94560" />
          <Text style={styles.userName}>{userEmail?.split('@')[0] || 'Reader'}</Text>
          <Text style={styles.userEmail}>{userEmail}</Text>
        </View>

        {/* Stats grid */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Reading Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total Books</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.reading}</Text>
              <Text style={styles.statLabel}>Reading</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.finished}</Text>
              <Text style={styles.statLabel}>Finished</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.wantToRead}</Text>
              <Text style={styles.statLabel}>Want to Read</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{avgRating}</Text>
              <Text style={styles.statLabel}>Avg Rating</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {totalPages > 999 ? `${(totalPages / 1000).toFixed(1)}k` : totalPages}
              </Text>
              <Text style={styles.statLabel}>Pages Read</Text>
            </View>
          </View>
        </View>

        {/* Logout button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={20} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 24,
  },
  userSection: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 24,
    backgroundColor: '#2a2a4e',
    borderRadius: 12,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'capitalize',
  },
  userEmail: {
    fontSize: 14,
    color: '#888',
  },
  statsSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '30%',
    flexGrow: 1,
    backgroundColor: '#2a2a4e',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e94560',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#e94560',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
