import React, { useState, useCallback, useMemo } from 'react';
import { View, FlatList, Text, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { FilterBar } from '@/components/FilterBar';
import { CandidateCard } from '@/components/CandidateCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { useApi } from '@/hooks/useApi';
import { fetchCandidates, Candidate } from '@/services/api';
import { CANDIDATE_STATUSES, CandidateStatus } from '@/constants/ApiConfig';

const STATUS_OPTIONS = CANDIDATE_STATUSES.map((s) => ({
  label: s.charAt(0).toUpperCase() + s.slice(1), value: s,
}));

const MOCK_CANDIDATES: Candidate[] = [
  { id: 1, first_name: 'Jordan', last_name: 'Smith', email: 'jordan.smith@email.com', job_id: 1, job_title: 'SDR Manager', status: 'interview', created_at: '2026-03-10T00:00:00Z' },
  { id: 2, first_name: 'Priya', last_name: 'Kapoor', email: 'priya.k@email.com', job_id: 2, job_title: 'Account Executive', status: 'offer', created_at: '2026-03-08T00:00:00Z' },
  { id: 3, first_name: 'Marcus', last_name: 'Williams', email: 'm.williams@email.com', job_id: 1, job_title: 'SDR Manager', status: 'screening', created_at: '2026-03-15T00:00:00Z' },
  { id: 4, first_name: 'Sofia', last_name: 'Chen', email: 'sofia.chen@email.com', job_id: 3, job_title: 'BDR', status: 'applied', created_at: '2026-03-20T00:00:00Z' },
  { id: 5, first_name: 'Eli', last_name: 'Torres', email: 'eli.torres@email.com', job_id: 3, job_title: 'BDR', status: 'hired', created_at: '2026-03-01T00:00:00Z' },
  { id: 6, first_name: 'Nina', last_name: 'Osei', email: 'nina.osei@email.com', job_id: 2, job_title: 'Account Executive', status: 'rejected', created_at: '2026-03-05T00:00:00Z' },
];

function PipelineBar({ candidates }: { candidates: Candidate[] }) {
  const counts = useMemo(() => {
    const map: Partial<Record<CandidateStatus, number>> = {};
    CANDIDATE_STATUSES.forEach((s) => { map[s] = 0; });
    candidates.forEach((c) => { map[c.status] = (map[c.status] ?? 0) + 1; });
    return map;
  }, [candidates]);
  return (
    <View style={pStyles.bar}>
      {CANDIDATE_STATUSES.filter((s) => s !== 'rejected').map((s) => (
        <View key={s} style={pStyles.stage}>
          <View style={[pStyles.dot, { backgroundColor: Colors.status[s] }]} />
          <Text style={pStyles.count}>{counts[s] ?? 0}</Text>
          <Text style={pStyles.label}>{s.charAt(0).toUpperCase() + s.slice(1)}</Text>
        </View>
      ))}
    </View>
  );
}

const pStyles = StyleSheet.create({
  bar: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: Colors.bg.card, borderRadius: 12, padding: 12, marginBottom: 12 },
  stage: { alignItems: 'center', gap: 3 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  count: { color: Colors.text.primary, fontSize: 16, fontWeight: '700' },
  label: { color: Colors.text.muted, fontSize: 10 },
});

export default function CandidatesScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const { data, isLoading, error, refetch } = useApi(() => fetchCandidates({ status: statusFilter as CandidateStatus || undefined }), [statusFilter]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const displayCandidates = data?.candidates ?? MOCK_CANDIDATES;
  const filtered = useMemo(() => {
    if (!search) return displayCandidates;
    const q = search.toLowerCase();
    return displayCandidates.filter((c) => `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
  }, [displayCandidates, search]);

  return (
    <View style={styles.screen}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        ListHeaderComponent={
          <>
            <PipelineBar candidates={displayCandidates} />
            <FilterBar searchPlaceholder="Search candidates..." searchValue={search} onSearchChange={setSearch}
              filters={[{ key: 'status', label: 'Status', options: STATUS_OPTIONS, value: statusFilter, onChange: setStatusFilter }]} />
            {isLoading && !data && <LoadingSpinner message="Loading candidates..." />}
            {error && !data && <EmptyState icon="\u26a0\ufe0f" title="Couldn't load" subtitle={error} />}
          </>
        }
        ListEmptyComponent={!isLoading ? <EmptyState icon="\u{1F464}" title="No candidates found" subtitle="Try adjusting your filters." /> : null}
        renderItem={({ item }) => <CandidateCard candidate={item} onPress={() => router.push(`/(recruiting)/candidate/${item.id}`)} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg.base },
  content: { padding: 16, paddingBottom: 40 },
});
