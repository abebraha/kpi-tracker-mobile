import React, { useState, useMemo } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Colors } from '@/constants/Colors';
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

export default function JobsScreen() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed'>('all');
  const { data: jobs, isLoading, error } = useApi(() => fetchJobs(), []);
  const displayJobs = jobs ?? MOCK_JOBS;

  const filtered = useMemo(() => displayJobs.filter(j => {
    const matchSearch = !search || j.title.toLowerCase().includes(search.toLowerCase()) || (j.department ?? '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || j.status === statusFilter;
    return matchSearch && matchStatus;
  }), [displayJobs, search, statusFilter]);

  return (
    <View style={styles.screen}>
      <FlatList
        data={filtered}
        keyExtractor={(j) => String(j.id)}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <View style={styles.searchRow}>
              <TextInput style={styles.searchInput} placeholder="Search jobs..." placeholderTextColor={Colors.text.muted} value={search} onChangeText={setSearch} />
            </View>
            <View style={styles.filterRow}>
              {(['all', 'open', 'closed'] as const).map(s => (
                <TouchableOpacity key={s} style={[styles.filterBtn, statusFilter === s && styles.filterBtnActive]} onPress={() => setStatusFilter(s)}>
                  <Text style={[styles.filterBtnText, statusFilter === s && styles.filterBtnTextActive]}>{s.charAt(0).toUpperCase() + s.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {isLoading && !jobs && <LoadingSpinner />}
            {error && !jobs && <EmptyState icon="\u26a0\ufe0f" title="Could not load jobs" subtitle={error} />}
          </>
        }
        ListEmptyComponent={!isLoading ? <EmptyState icon="\u{1F4BC}" title="No jobs found" subtitle="Try changing your search or filter." /> : null}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} activeOpacity={0.8}>
            <View style={styles.cardHeader}>
              <View style={styles.titleBlock}>
                <Text style={styles.jobTitle}>{item.title}</Text>
                {item.department && <Text style={styles.dept}>{item.department}</Text>}
              </View>
              <View style={[styles.badge, { backgroundColor: item.status === 'open' ? Colors.success + '22' : Colors.text.muted + '22' }]}>
                <Text style={[styles.badgeText, { color: item.status === 'open' ? Colors.success : Colors.text.muted }]}>{item.status === 'open' ? '● Open' : '○ Closed'}</Text>
              </View>
            </View>
            <View style={styles.meta}>
              {item.salary_range && <Text style={styles.metaItem}>\u{1F4B0} {item.salary_range}</Text>}
              {item.candidate_count != null && <Text style={styles.metaItem}>\u{1F464} {item.candidate_count} candidate{item.candidate_count !== 1 ? 's' : ''}</Text>}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg.base },
  content: { padding: 16, paddingBottom: 40 },
  searchRow: { backgroundColor: Colors.bg.card, borderRadius: 10, paddingHorizontal: 12, marginBottom: 10, borderWidth: 1, borderColor: Colors.border },
  searchInput: { color: Colors.text.primary, fontSize: 14, paddingVertical: 10 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  filterBtn: { flex: 1, borderRadius: 8, paddingVertical: 8, alignItems: 'center', backgroundColor: Colors.bg.card, borderWidth: 1, borderColor: Colors.border },
  filterBtnActive: { backgroundColor: Colors.primary + '22', borderColor: Colors.primary },
  filterBtnText: { color: Colors.text.secondary, fontSize: 12, fontWeight: '600' },
  filterBtnTextActive: { color: Colors.primary },
  card: { backgroundColor: Colors.bg.card, borderRadius: 12, padding: 14, marginBottom: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, gap: 10 },
  titleBlock: { flex: 1 },
  jobTitle: { color: Colors.text.primary, fontSize: 16, fontWeight: '700' },
  dept: { color: Colors.text.muted, fontSize: 12, marginTop: 2 },
  badge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metaItem: { color: Colors.text.secondary, fontSize: 12 },
});
