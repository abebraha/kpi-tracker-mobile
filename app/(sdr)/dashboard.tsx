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
import { CallCard } from '@/components/CallCard';
import { SectionTitle } from '@/components/SectionTitle';
import { useAuth } from '@/context/AuthContext';
import { useApi } from '@/hooks/useApi';
import {
  fetchDashboardMetrics,
  fetchCalls,
  MetricItem,
} from '@/services/api';

const MOCK_METRICS: MetricItem[] = [
  { label: 'Calls Logged', value: 28, target: 50, trend: 'up', trendPct: 8 },
  { label: 'Meetings Logged', value: 7, target: 10, trend: 'up', trendPct: 3 },
  { label: 'Calls This Week', value: 8, target: 12, trend: 'flat', trendPct: 0 },
  { label: 'My Rank', value: '#3' },
];

const KPI_COLORS = [Colors.primary, Colors.accent, Colors.success, Colors.warning];

function firstName(name?: string | null) {
  if (!name) return 'there';
  return name.split(' ')[0];
}

function initials(name?: string | null) {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((s) => s.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function SDRDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: metrics,
    isLoading: metricsLoading,
    refetch: refetchMetrics,
  } = useApi(() => fetchDashboardMetrics(), []);
  const {
    data: callsData,
    isLoading: callsLoading,
    refetch: refetchCalls,
  } = useApi(() => fetchCalls({ per_page: 5 }), []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchMetrics(), refetchCalls()]);
    setRefreshing(false);
  }, [refetchMetrics, refetchCalls]);

  const today = useMemo(
    () =>
      new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }),
    []
  );

  const displayMetrics: MetricItem[] = metrics?.metrics ?? MOCK_METRICS;
  const recentCalls = callsData?.calls ?? [];

  const confirmLogout = useCallback(() => {
    Alert.alert('Sign out?', 'You will need to sign in again to access your KPIs.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => logout() },
    ]);
  }, [logout]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.primary}
        />
      }
    >
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>Hi, {firstName(user?.name)} 👋</Text>
          <Text style={styles.date}>{today}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.trophyBtn}
            onPress={() => router.push('/leaderboard')}
            accessibilityLabel="Leaderboard"
          >
            <Text style={{ fontSize: 18 }}>🏆</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={confirmLogout}
            accessibilityLabel="Sign out"
          >
            <Text style={styles.avatarText}>{initials(user?.name)}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <SectionTitle title="My KPIs — This Month" />
      {metricsLoading && !metrics ? (
        <LoadingSpinner message="Loading metrics…" />
      ) : (
        <View style={styles.grid}>
          {displayMetrics.map((m, i) => (
            <MetricCard key={`${m.label}-${i}`} {...m} accent={KPI_COLORS[i % KPI_COLORS.length]} />
          ))}
        </View>
      )}

      <SectionTitle title="Quick actions" />
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: Colors.primary }]}
          onPress={() => router.push('/(sdr)/log-call')}
          activeOpacity={0.85}
        >
          <Text style={styles.actionEmoji}>📞</Text>
          <Text style={styles.actionText}>Log a Call</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: Colors.accent }]}
          onPress={() => router.push('/(sdr)/log-meeting')}
          activeOpacity={0.85}
        >
          <Text style={styles.actionEmoji}>🤝</Text>
          <Text style={styles.actionText}>Log a Meeting</Text>
        </TouchableOpacity>
      </View>

      <SectionTitle
        title="Recent calls"
        right={
          <TouchableOpacity onPress={() => router.push('/(crm)/calls')}>
            <Text style={styles.seeAll}>See all →</Text>
          </TouchableOpacity>
        }
      />
      {callsLoading && !callsData ? (
        <LoadingSpinner message="Loading calls…" />
      ) : recentCalls.length > 0 ? (
        recentCalls.map((call) => (
          <CallCard key={call.id} call={call} onPress={() => router.push('/(crm)/calls')} />
        ))
      ) : (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyEmoji}>📞</Text>
          <Text style={styles.emptyTitle}>No calls yet</Text>
          <Text style={styles.emptyText}>Tap "Log a Call" above to add your first one.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg.base },
  content: { padding: Spacing.screen, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  greeting: {
    color: Colors.text.primary,
    fontSize: FontSize.xxl,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  date: { color: Colors.text.muted, fontSize: FontSize.xs, marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  trophyBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: withAlpha(Colors.warning, 0.18),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: withAlpha(Colors.warning, 0.4),
  },
  avatarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: FontSize.md },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  quickActions: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  actionBtn: {
    flex: 1,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    gap: 4,
  },
  actionEmoji: { fontSize: 22 },
  actionText: { color: '#fff', fontSize: FontSize.md, fontWeight: '700' },
  seeAll: {
    color: Colors.primary,
    fontSize: FontSize.xs,
    fontWeight: '700',
    textTransform: 'none',
  },
  emptyBox: {
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.lg,
    padding: Spacing.xxl,
    alignItems: 'center',
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyEmoji: { fontSize: 32 },
  emptyTitle: {
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  emptyText: { color: Colors.text.muted, fontSize: FontSize.sm, textAlign: 'center' },
});
