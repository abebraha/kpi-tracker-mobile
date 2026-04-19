import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, withAlpha } from '@/constants/Colors';
import { FontSize, Radius, Spacing } from '@/constants/Theme';
import { FilterBar } from '@/components/FilterBar';
import { CandidateCard } from '@/components/CandidateCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { useApi } from '@/hooks/useApi';
import { fetchCandidates, Candidate } from '@/services/api';
import {
  CANDIDATE_STATUSES,
  CANDIDATE_STATUS_LABEL,
  CandidateStatus,
} from '@/constants/ApiConfig';

const STATUS_OPTIONS = CANDIDATE_STATUSES.map((s) => ({
  label: CANDIDATE_STATUS_LABEL[s],
  value: s,
}));

const MOCK_CANDIDATES: Candidate[] = [
  { id: 1, first_name: 'Jordan', last_name: 'Smith', email: 'jordan.smith@email.com', job_id: 1, job_title: 'SDR Manager', status: 'interview', created_at: '2026-03-10T00:00:00Z' },
  { id: 2, first_name: 'Priya', last_name: 'Kapoor', email: 'priya.k@email.com', job_id: 2, job_title: 'Account Executive', status: 'offer', created_at: '2026-03-08T00:00:00Z' },
  { id: 3, first_name: 'Marcus', last_name: 'Williams', email: 'm.williams@email.com', job_id: 1, job_title: 'SDR Manager', status: 'screening', created_at: '2026-03-15T00:00:00Z' },
  { id: 4, first_name: 'Sofia', last_name: 'Chen', email: 'sofia.chen@email.com', job_id: 3, job_title: 'BDR', status: 'applied', created_at: '2026-03-20T00:00:00Z' },
  { id: 5, first_name: 'Eli', last_name: 'Torres', email: 'eli.torres@email.com', job_id: 3, job_title: 'BDR', status: 'hired', created_at: '2026-03-01T00:00:00Z' },
  { id: 6, first_name: 'Nina', last_name: 'Osei', email: 'nina.osei@email.com', job_id: 2, job_title: 'Account Executive', status: 'rejected', created_at: '2026-03-05T00:00:00Z' },
];

const PIPELINE_STAGES: CandidateStatus[] = ['applied', 'screening', 'interview', 'offer', 'hired'];

function PipelineBar({ candidates }: { candidates: Candidate[] }) {
  const counts = useMemo(() => {
    const map: Record<CandidateStatus, number> = {
      applied: 0,
      screening: 0,
      interview: 0,
      offer: 0,
      hired: 0,
      rejected: 0,
    };
    candidates.forEach((c) => {
      map[c.status] = (map[c.status] ?? 0) + 1;
    });
    return map;
  }, [candidates]);

  const activeTotal = PIPELINE_STAGES.reduce((acc, s) => acc + counts[s], 0);

  return (
    <View style={pStyles.wrapper}>
      <View style={pStyles.row}>
        <Text style={pStyles.title}>Active pipeline</Text>
        <Text style={pStyles.total}>
          {activeTotal} {activeTotal === 1 ? 'candidate' : 'candidates'}
        </Text>
      </View>
      <View style={pStyles.bar}>
        {PIPELINE_STAGES.map((s) => {
          const count = counts[s];
          const pct = activeTotal > 0 ? (count / activeTotal) * 100 : 0;
          return (
            <View
              key={s}
              style={[
                pStyles.segment,
                {
                  flex: Math.max(pct, 4),
                  backgroundColor: Colors.status[s],
                  opacity: count === 0 ? 0.25 : 1,
                },
              ]}
            />
          );
        })}
      </View>
      <View style={pStyles.legendRow}>
        {PIPELINE_STAGES.map((s) => (
          <View key={s} style={pStyles.legendItem}>
            <View style={[pStyles.dot, { backgroundColor: Colors.status[s] }]} />
            <Text style={pStyles.legendCount}>{counts[s]}</Text>
            <Text style={pStyles.legendLabel}>{CANDIDATE_STATUS_LABEL[s]}</Text>
          </View>
        ))}
      </View>
      {counts.rejected > 0 ? (
        <Text style={pStyles.rejected}>
          • {counts.rejected} rejected (not shown in funnel)
        </Text>
      ) : null}
    </View>
  );
}

const pStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: Colors.text.secondary,
    fontSize: FontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  total: { color: Colors.text.primary, fontSize: FontSize.md, fontWeight: '700' },
  bar: {
    flexDirection: 'row',
    height: 10,
    borderRadius: Radius.pill,
    overflow: 'hidden',
    gap: 2,
  },
  segment: { height: '100%' },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    rowGap: Spacing.sm,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendCount: { color: Colors.text.primary, fontSize: FontSize.sm, fontWeight: '700' },
  legendLabel: { color: Colors.text.muted, fontSize: FontSize.xs },
  rejected: { color: withAlpha(Colors.danger, 0.9), fontSize: FontSize.xs, fontWeight: '600' },
});

export default function CandidatesScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, error, refetch } = useApi(
    () => fetchCandidates({ status: (statusFilter as CandidateStatus) || undefined }),
    [statusFilter]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const candidates = data?.candidates ?? MOCK_CANDIDATES;
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return candidates;
    return candidates.filter(
      (c) =>
        `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.job_title ?? '').toLowerCase().includes(q)
    );
  }, [candidates, search]);

  return (
    <View style={styles.screen}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        ListHeaderComponent={
          <>
            <PipelineBar candidates={candidates} />
            <FilterBar
              searchPlaceholder="Search by name, email, role…"
              searchValue={search}
              onSearchChange={setSearch}
              filters={[
                {
                  key: 'status',
                  label: 'Status',
                  options: STATUS_OPTIONS,
                  value: statusFilter,
                  onChange: setStatusFilter,
                },
              ]}
            />
            {isLoading && !data ? <LoadingSpinner message="Loading candidates…" /> : null}
            {error && !data ? (
              <EmptyState
                icon="⚠️"
                title="Couldn't load candidates"
                subtitle={error}
                actionLabel="Retry"
                onAction={refetch}
              />
            ) : null}
          </>
        }
        ListEmptyComponent={
          !isLoading && !error ? (
            <EmptyState
              icon="👥"
              title="No candidates found"
              subtitle="Try clearing filters or searching with a different term."
            />
          ) : null
        }
        renderItem={({ item }) => (
          <CandidateCard
            candidate={item}
            onPress={() => router.push(`/(recruiting)/candidate/${item.id}`)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg.base },
  content: { padding: Spacing.screen, paddingBottom: 40 },
});
