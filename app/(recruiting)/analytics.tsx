import React, { useCallback, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Colors, withAlpha } from '@/constants/Colors';
import { FontSize, Radius, Spacing } from '@/constants/Theme';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SectionTitle } from '@/components/SectionTitle';
import { useApi } from '@/hooks/useApi';
import { fetchRecruitingAnalytics, RecruitingAnalytics } from '@/services/api';
import {
  CANDIDATE_STATUSES,
  CANDIDATE_STATUS_LABEL,
  CandidateStatus,
} from '@/constants/ApiConfig';

const MOCK: RecruitingAnalytics = {
  total_candidates: 45,
  by_status: {
    applied: 12,
    screening: 8,
    interview: 10,
    offer: 4,
    hired: 7,
    rejected: 4,
  },
  hired_this_month: 3,
  pipeline_conversion_rate: 15.5,
  avg_time_to_hire_days: 22,
  top_job: 'BDR',
};

const PIPELINE_STAGES = CANDIDATE_STATUSES.filter(
  (s) => s !== 'rejected'
) as CandidateStatus[];

export default function RecruitingAnalyticsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { data, isLoading, error, refetch } = useApi(() => fetchRecruitingAnalytics(), []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const analytics = data ?? MOCK;
  const total = analytics.total_candidates;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
      }
    >
      <ScreenHeader
        eyebrow="Recruiting"
        title="Analytics"
        subtitle="Pipeline health and hiring velocity."
      />

      {isLoading && !data ? (
        <LoadingSpinner message="Loading analytics…" />
      ) : error && !data ? (
        <EmptyState
          icon="⚠️"
          title="Couldn't load analytics"
          subtitle={error}
          actionLabel="Retry"
          onAction={refetch}
        />
      ) : (
        <>
          <View style={styles.grid}>
            <StatCard
              label="Total candidates"
              value={analytics.total_candidates}
              icon="👥"
              color={Colors.primary}
            />
            <StatCard
              label="Hired this month"
              value={analytics.hired_this_month}
              icon="✅"
              color={Colors.success}
            />
            <StatCard
              label="Conversion"
              value={`${analytics.pipeline_conversion_rate}%`}
              icon="📈"
              color={Colors.accent}
            />
            <StatCard
              label="Avg days to hire"
              value={analytics.avg_time_to_hire_days ?? '—'}
              icon="⏱"
              color={Colors.warning}
            />
          </View>

          {analytics.top_job ? (
            <View style={styles.topJobCard}>
              <Text style={styles.topJobLabel}>Most applications</Text>
              <Text style={styles.topJobValue}>{analytics.top_job}</Text>
            </View>
          ) : null}

          <SectionTitle title="Pipeline funnel" />
          <View style={styles.funnel}>
            {PIPELINE_STAGES.map((status) => {
              const count = analytics.by_status[status] ?? 0;
              const pct = total > 0 ? (count / total) * 100 : 0;
              return (
                <View key={status} style={styles.row}>
                  <Text style={styles.rowLabel}>{CANDIDATE_STATUS_LABEL[status]}</Text>
                  <View style={styles.barBg}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${Math.max(pct, count > 0 ? 4 : 0)}%`,
                          backgroundColor: Colors.status[status],
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.rowCount, { color: Colors.status[status] }]}>
                    {count}
                  </Text>
                </View>
              );
            })}
          </View>
        </>
      )}
    </ScrollView>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: string;
  color: string;
}) {
  return (
    <View style={[statCardStyles.card, { borderColor: withAlpha(color, 0.35) }]}>
      <View style={[statCardStyles.iconBox, { backgroundColor: withAlpha(color, 0.18) }]}>
        <Text style={statCardStyles.icon}>{icon}</Text>
      </View>
      <Text style={[statCardStyles.value, { color }]}>{value}</Text>
      <Text style={statCardStyles.label}>{label}</Text>
    </View>
  );
}

const statCardStyles = StyleSheet.create({
  card: {
    flexGrow: 1,
    flexBasis: '47%',
    minWidth: 150,
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  icon: { fontSize: 18 },
  value: {
    fontSize: FontSize.xxxl,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  label: { color: Colors.text.muted, fontSize: FontSize.xs },
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg.base },
  content: { padding: Spacing.screen, paddingBottom: 40 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  topJobCard: {
    backgroundColor: withAlpha(Colors.primary, 0.1),
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: withAlpha(Colors.primary, 0.4),
    marginBottom: Spacing.md,
  },
  topJobLabel: {
    color: Colors.primary,
    fontSize: FontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  topJobValue: {
    color: Colors.text.primary,
    fontSize: FontSize.xl,
    fontWeight: '800',
    marginTop: 4,
  },
  funnel: {
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  rowLabel: { color: Colors.text.secondary, fontSize: FontSize.sm, width: 84 },
  barBg: {
    flex: 1,
    height: 10,
    backgroundColor: Colors.bg.input,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: Radius.pill },
  rowCount: {
    fontSize: FontSize.md,
    fontWeight: '800',
    width: 32,
    textAlign: 'right',
  },
});
