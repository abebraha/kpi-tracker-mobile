import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, withAlpha } from '@/constants/Colors';
import { FontSize, Radius, Spacing } from '@/constants/Theme';
import { MetricCard } from '@/components/MetricCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SectionTitle } from '@/components/SectionTitle';
import { useAuth } from '@/context/AuthContext';
import { useApi } from '@/hooks/useApi';
import { fetchDashboardMetrics, fetchLeaderboard, MetricItem } from '@/services/api';

const MOCK_METRICS: MetricItem[] = [
  { label: 'Team calls', value: 312, target: 400, trend: 'up', trendPct: 12 },
  { label: 'Team meetings', value: 84, target: 100, trend: 'up', trendPct: 6 },
  { label: 'Active reps', value: 7 },
  { label: 'Hires this month', value: 3, target: 5 },
];

const KPI_COLORS = [Colors.primary, Colors.accent, Colors.success, Colors.warning];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: metrics,
    isLoading: metricsLoading,
    refetch: refetchMetrics,
  } = useApi(() => fetchDashboardMetrics(), []);
  const {
    data: leaderboard,
    isLoading: leaderboardLoading,
    refetch: refetchLeaderboard,
  } = useApi(() => fetchLeaderboard(), []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchMetrics(), refetchLeaderboard()]);
    setRefreshing(false);
  }, [refetchMetrics, refetchLeaderboard]);

  const today = useMemo(
    () =>
      new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }),
    []
  );

  const displayMetrics = metrics?.metrics ?? MOCK_METRICS;
  const topThree = (leaderboard ?? []).slice(0, 3);

  const confirmLogout = useCallback(() => {
    Alert.alert('Sign out?', 'You will need to sign in again to access admin tools.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => logout() },
    ]);
  }, [logout]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
      }
    >
      <ScreenHeader
        eyebrow={`${today} · Admin`}
        title={`Hi, ${user?.name?.split(' ')[0] ?? 'there'}`}
        subtitle="Team performance at a glance."
        right={
          <TouchableOpacity style={styles.logoutBtn} onPress={confirmLogout}>
            <Text style={styles.logoutText}>Sign out</Text>
          </TouchableOpacity>
        }
      />

      <SectionTitle title="Team KPIs — This Month" />
      {metricsLoading && !metrics ? (
        <LoadingSpinner message="Loading metrics…" />
      ) : (
        <View style={styles.grid}>
          {displayMetrics.map((m, i) => (
            <MetricCard
              key={`${m.label}-${i}`}
              {...m}
              accent={KPI_COLORS[i % KPI_COLORS.length]}
            />
          ))}
        </View>
      )}

      <SectionTitle
        title="Quick links"
      />
      <View style={styles.quickRow}>
        <QuickLink
          icon="📞"
          label="All calls"
          onPress={() => router.push('/(crm)/calls')}
          color={Colors.primary}
        />
        <QuickLink
          icon="🤝"
          label="Meetings"
          onPress={() => router.push('/(crm)/meetings')}
          color={Colors.accent}
        />
        <QuickLink
          icon="👥"
          label="Candidates"
          onPress={() => router.push('/(recruiting)/candidates')}
          color={Colors.success}
        />
        <QuickLink
          icon="📊"
          label="Recruiting"
          onPress={() => router.push('/(recruiting)/analytics')}
          color={Colors.warning}
        />
      </View>

      <SectionTitle
        title="Top performers"
        right={
          <TouchableOpacity onPress={() => router.push('/leaderboard')}>
            <Text style={styles.seeAll}>Full board →</Text>
          </TouchableOpacity>
        }
      />
      {leaderboardLoading && !leaderboard ? (
        <LoadingSpinner message="Loading leaderboard…" />
      ) : topThree.length === 0 ? (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>No rankings yet.</Text>
        </View>
      ) : (
        <View style={styles.leaderCard}>
          {topThree.map((entry) => (
            <View key={entry.user_id} style={styles.leaderRow}>
              <Text style={styles.leaderRank}>#{entry.rank}</Text>
              <Text style={styles.leaderName}>{entry.name}</Text>
              <Text style={styles.leaderScore}>{entry.score} pts</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function QuickLink({
  icon,
  label,
  onPress,
  color,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  color: string;
}) {
  return (
    <TouchableOpacity
      style={[styles.quickLink, { borderColor: withAlpha(color, 0.35) }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[styles.quickIcon, { backgroundColor: withAlpha(color, 0.2) }]}>
        <Text style={{ fontSize: 20 }}>{icon}</Text>
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg.base },
  content: { padding: Spacing.screen, paddingBottom: 40 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  logoutBtn: {
    backgroundColor: Colors.bg.card,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.md,
  },
  logoutText: { color: Colors.text.secondary, fontSize: FontSize.xs, fontWeight: '700' },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  quickLink: {
    flexGrow: 1,
    flexBasis: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.bg.card,
    padding: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  quickIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: { color: Colors.text.primary, fontSize: FontSize.md, fontWeight: '700' },
  seeAll: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: '700', textTransform: 'none' },
  leaderCard: {
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  leaderRank: {
    color: Colors.text.muted,
    fontSize: FontSize.sm,
    fontWeight: '700',
    width: 36,
  },
  leaderName: { flex: 1, color: Colors.text.primary, fontSize: FontSize.md, fontWeight: '600' },
  leaderScore: { color: Colors.primary, fontSize: FontSize.md, fontWeight: '800' },
  placeholder: {
    backgroundColor: Colors.bg.card,
    padding: Spacing.lg,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  placeholderText: { color: Colors.text.muted, fontSize: FontSize.sm },
});
