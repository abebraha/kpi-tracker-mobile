import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors, withAlpha } from '@/constants/Colors';
import { FontSize, Radius, Spacing } from '@/constants/Theme';
import { FilterBar } from '@/components/FilterBar';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { useApi } from '@/hooks/useApi';
import { fetchJobs, Job } from '@/services/api';

const MOCK_JOBS: Job[] = [
  { id: 1, title: 'SDR Manager', department: 'Sales', salary_range: '$80k–$100k', status: 'open', candidate_count: 8, created_at: '2026-02-01T00:00:00Z' },
  { id: 2, title: 'Account Executive', department: 'Sales', salary_range: '$75k–$95k', status: 'open', candidate_count: 5, created_at: '2026-02-15T00:00:00Z' },
  { id: 3, title: 'BDR', department: 'Sales', salary_range: '$50k–$65k', status: 'open', candidate_count: 12, created_at: '2026-03-01T00:00:00Z' },
  { id: 4, title: 'Head of Marketing', department: 'Marketing', salary_range: '$110k–$140k', status: 'closed', candidate_count: 3, created_at: '2026-01-10T00:00:00Z' },
];

const STATUS_OPTIONS = [
  { label: 'Open', value: 'open' },
  { label: 'Closed', value: 'closed' },
];

export default function JobsScreen() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const { data: jobs, isLoading, error, refetch } = useApi(() => fetchJobs(), []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const displayJobs = jobs ?? MOCK_JOBS;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return displayJobs.filter((j) => {
      const matchSearch =
        !q ||
        j.title.toLowerCase().includes(q) ||
        (j.department ?? '').toLowerCase().includes(q);
      const matchStatus = !statusFilter || j.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [displayJobs, search, statusFilter]);

  const openCount = displayJobs.filter((j) => j.status === 'open').length;

  return (
    <View style={styles.screen}>
      <FlatList
        data={filtered}
        keyExtractor={(j) => String(j.id)}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        ListHeaderComponent={
          <>
            <View style={styles.summary}>
              <View>
                <Text style={styles.summaryCount}>{openCount}</Text>
                <Text style={styles.summaryLabel}>open positions</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View>
                <Text style={styles.summaryCount}>
                  {displayJobs.reduce((acc, j) => acc + (j.candidate_count ?? 0), 0)}
                </Text>
                <Text style={styles.summaryLabel}>total candidates</Text>
              </View>
            </View>
            <FilterBar
              searchPlaceholder="Search jobs or department…"
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
            {isLoading && !jobs ? <LoadingSpinner message="Loading jobs…" /> : null}
            {error && !jobs ? (
              <EmptyState
                icon="⚠️"
                title="Couldn't load jobs"
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
              icon="💼"
              title="No jobs match your filters"
              subtitle="Try clearing search or switching status."
            />
          ) : null
        }
        renderItem={({ item }) => <JobCard job={item} />}
      />
    </View>
  );
}

function JobCard({ job }: { job: Job }) {
  const open = job.status === 'open';
  const color = open ? Colors.success : Colors.text.muted;
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85}>
      <View style={styles.cardHeader}>
        <View style={styles.titleBlock}>
          <Text style={styles.jobTitle}>{job.title}</Text>
          {job.department ? <Text style={styles.dept}>{job.department}</Text> : null}
        </View>
        <View style={[styles.badge, { backgroundColor: withAlpha(color, 0.15) }]}>
          <View style={[styles.badgeDot, { backgroundColor: color }]} />
          <Text style={[styles.badgeText, { color }]}>{open ? 'Open' : 'Closed'}</Text>
        </View>
      </View>
      <View style={styles.meta}>
        {job.salary_range ? (
          <View style={styles.chip}>
            <Text style={styles.chipIcon}>💰</Text>
            <Text style={styles.chipText}>{job.salary_range}</Text>
          </View>
        ) : null}
        {job.candidate_count != null ? (
          <View style={styles.chip}>
            <Text style={styles.chipIcon}>👥</Text>
            <Text style={styles.chipText}>
              {job.candidate_count} {job.candidate_count === 1 ? 'candidate' : 'candidates'}
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg.base },
  content: { padding: Spacing.screen, paddingBottom: 40 },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: Colors.border,
  },
  summaryCount: {
    color: Colors.text.primary,
    fontSize: FontSize.xxl,
    fontWeight: '800',
  },
  summaryLabel: { color: Colors.text.muted, fontSize: FontSize.xs, marginTop: 2 },
  card: {
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  titleBlock: { flex: 1 },
  jobTitle: { color: Colors.text.primary, fontSize: FontSize.lg, fontWeight: '700' },
  dept: { color: Colors.text.muted, fontSize: FontSize.xs, marginTop: 2 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radius.pill,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: FontSize.xs, fontWeight: '700' },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.bg.input,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.pill,
  },
  chipIcon: { fontSize: FontSize.sm },
  chipText: { color: Colors.text.secondary, fontSize: FontSize.xs, fontWeight: '600' },
});
