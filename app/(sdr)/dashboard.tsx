import React, { useCallback, useState } from 'react';
import { View, ScrollView, Text, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { MetricCard } from '@/components/MetricCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';
import { useApi } from '@/hooks/useApi';
import { fetchDashboardMetrics, fetchCalls } from '@/services/api';
import { CallCard } from '@/components/CallCard';

const MOCK_METRICS = [
  { label: 'Calls Logged', value: 28, target: 50, trend: 'up' as const, trendPct: 8 },
  { label: 'Meetings Logged', value: 7, target: 10, trend: 'up' as const, trendPct: 3 },
  { label: 'Calls This Week', value: 8, target: 12 },
  { label: 'My Rank', value: '#3', unit: '' },
];

const KPI_COLORS = [Colors.primary, Colors.accent, Colors.success, Colors.warning];

export default function SDRDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useApi(() => fetchDashboardMetrics(), []);
  const { data: callsData, isLoading: callsLoading, refetch: refetchCalls } = useApi(() => fetchCalls({ per_page: 5 }), []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchMetrics(), refetchCalls()]);
    setRefreshing(false);
  }, [refetchMetrics, refetchCalls]);

  const displayMetrics = metrics ?? MOCK_METRICS;
  const recentCalls = callsData?.calls ?? [];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hi, {user?.name?.split(' ')[0]} \u{1F44B}</Text>
          <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.trophyBtn} onPress={() => router.push('/leaderboard')}>
            <Text style={{ fontSize: 18 }}>\u{1F3C6}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.avatarBtn} onPress={logout}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0) ?? 'S'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionTitle}>My KPIs — This Month</Text>
      {metricsLoading && !metrics ? <LoadingSpinner /> : (
        <View style={styles.grid}>
          {displayMetrics.map((m, i) => (
            <MetricCard key={i} {...m} accent={KPI_COLORS[i % KPI_COLORS.length]} />
          ))}
        </View>
      )}

      <View style={styles.quickActions}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.primary }]} onPress={() => router.push('/(sdr)/log-call')}>
          <Text style={{ fontSize: 22 }}>\u{1F4DE}</Text>
          <Text style={styles.actionText}>Log a Call</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.accent }]} onPress={() => router.push('/(sdr)/log-meeting')}>
          <Text style={{ fontSize: 22 }}>\u{1F91D}</Text>
          <Text style={styles.actionText}>Log a Meeting</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Recent Calls</Text>
      {callsLoading && !callsData ? <LoadingSpinner message="Loading calls..." /> :
        recentCalls.length > 0 ? recentCalls.map(call => (
          <CallCard key={call.id} call={call} onPress={() => router.push('/(crm)/calls')} />
        )) : (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No calls yet. Log your first call above!</Text>
          </View>
        )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg.base },
  content: { padding: 16, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { color: Colors.text.primary, fontSize: 20, fontWeight: '700' },
  date: { color: Colors.text.muted, fontSize: 12, marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  trophyBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.warning + '22', alignItems: 'center', justifyContent: 'center' },
  avatarBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  sectionTitle: { color: Colors.text.secondary, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  quickActions: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  actionBtn: { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center', gap: 4 },
  actionText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  emptyBox: { backgroundColor: Colors.bg.card, borderRadius: 12, padding: 24, alignItems: 'center' },
  emptyText: { color: Colors.text.muted, fontSize: 14, textAlign: 'center' },
});
