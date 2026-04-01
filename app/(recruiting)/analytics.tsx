import React from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useApi } from '@/hooks/useApi';
import { fetchRecruitingAnalytics } from '@/services/api';
import { CANDIDATE_STATUSES, CandidateStatus } from '@/constants/ApiConfig';

const MOCK = {
  total_candidates: 45,
  by_status: { applied: 12, screening: 8, interview: 10, offer: 4, hired: 7, rejected: 4 } as Record<CandidateStatus, number>,
  hired_this_month: 3,
  pipeline_conversion_rate: 15.5,
  avg_time_to_hire_days: 22,
  top_job: 'BDR',
};

export default function RecruitingAnalytics() {
  const { data, isLoading } = useApi(() => fetchRecruitingAnalytics(), []);
  const analytics = data ?? MOCK;
  const total = analytics.total_candidates;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Recruiting Analytics</Text>
      {isLoading && !data ? <LoadingSpinner /> : (
        <>
          <View style={styles.grid}>
            <Card label="Total" value={analytics.total_candidates} icon="\u{1F464}" color={Colors.primary} />
            <Card label="Hired" value={analytics.hired_this_month} icon="\u2705" color={Colors.success} />
            <Card label="Conversion" value={`${analytics.pipeline_conversion_rate}%`} icon="\u{1F4C8}" color={Colors.accent} />
            <Card label="Days to Hire" value={analytics.avg_time_to_hire_days ?? '—'} icon="\u23F1" color={Colors.warning} />
          </View>
          <Text style={styles.sectionTitle}>Pipeline Funnel</Text>
          <View style={styles.funnel}>
            {CANDIDATE_STATUSES.filter(s => s !== 'rejected').map(status => {
              const count = analytics.by_status[status] ?? 0;
              const pct = total > 0 ? (count / total) * 100 : 0;
              return (
                <View key={status} style={styles.row}>
                  <Text style={styles.rowLabel}>{status.charAt(0).toUpperCase() + status.slice(1)}</Text>
                  <View style={styles.barBg}>
                    <View style={[styles.barFill, { width: `${Math.max(pct, 4)}%`, backgroundColor: Colors.status[status] }]} />
                  </View>
                  <Text style={[styles.rowCount, { color: Colors.status[status] }]}>{count}</Text>
                </View>
              );
            })}
          </View>
        </>
      )}
    </ScrollView>
  );
}

function Card({ label, value, icon, color }: { label: string; value: number | string; icon: string; color: string }) {
  return (
    <View style={[cStyles.card, { borderTopColor: color }]}>
      <Text style={cStyles.icon}>{icon}</Text>
      <Text style={[cStyles.value, { color }]}>{value}</Text>
      <Text style={cStyles.label}>{label}</Text>
    </View>
  );
}

const cStyles = StyleSheet.create({
  card: { flex: 1, minWidth: '45%', backgroundColor: Colors.bg.card, borderRadius: 12, padding: 14, borderTopWidth: 3, alignItems: 'center', gap: 4 },
  icon: { fontSize: 24 },
  value: { fontSize: 24, fontWeight: '800' },
  label: { color: Colors.text.muted, fontSize: 11, textAlign: 'center' },
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg.base },
  content: { padding: 16, paddingBottom: 40 },
  title: { color: Colors.text.primary, fontSize: 22, fontWeight: '700', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  sectionTitle: { color: Colors.text.secondary, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },
  funnel: { backgroundColor: Colors.bg.card, borderRadius: 12, padding: 16, gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowLabel: { color: Colors.text.secondary, fontSize: 12, width: 72 },
  barBg: { flex: 1, height: 8, backgroundColor: Colors.bg.elevated, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
  rowCount: { fontSize: 13, fontWeight: '700', width: 28, textAlign: 'right' },
});
