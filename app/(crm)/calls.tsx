import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  RefreshControl,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { FilterBar } from '@/components/FilterBar';
import { CallCard } from '@/components/CallCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { useApi } from '@/hooks/useApi';
import { fetchCalls, fetchCallAnalysis, Call } from '@/services/api';

const MOCK_CALLS: Call[] = [
  { id: 1, title: 'Discovery — Acme Corp', duration: 32, call_date: '2026-03-29', crm_notes: 'Decision maker interested in Q2 pilot.', ai_analysis: { sentiment: 'positive', summary: 'Prospect showed strong interest.', action_items: ['Send proposal', 'Schedule follow-up'] }, created_at: '2026-03-29T14:00:00Z', user_name: 'Alex Johnson' },
  { id: 2, title: 'Follow-up — TechVentures', duration: 18, call_date: '2026-03-28', crm_notes: 'Budget concerns.', ai_analysis: { sentiment: 'neutral', summary: 'Discussed pricing. CFO sign-off needed.', action_items: ['Send pricing deck'] }, created_at: '2026-03-28T10:30:00Z', user_name: 'Sam Lee' },
  { id: 3, title: 'Cold call — GlobalFin', duration: 7, call_date: '2026-03-27', crm_notes: 'Left voicemail.', ai_analysis: { sentiment: 'neutral', summary: 'No answer, left voicemail.' }, created_at: '2026-03-27T09:00:00Z', user_name: 'Alex Johnson' },
  { id: 4, title: 'Objection handling — Zenith', duration: 45, call_date: '2026-03-26', crm_notes: 'Moving to demo.', ai_analysis: { sentiment: 'positive', summary: 'Price objections resolved. Demo scheduled.', action_items: ['Book demo', 'Send case studies'] }, created_at: '2026-03-26T15:00:00Z', user_name: 'Maria Garcia' },
  { id: 5, title: 'Churn risk — OldClient Inc', duration: 22, call_date: '2026-03-25', crm_notes: 'Escalated to CS.', ai_analysis: { sentiment: 'negative', summary: 'Customer frustrated with support.' }, created_at: '2026-03-25T11:00:00Z', user_name: 'Sam Lee' },
];

const SENTIMENT_OPTIONS = [
  { label: 'Positive', value: 'positive' },
  { label: 'Neutral', value: 'neutral' },
  { label: 'Negative', value: 'negative' },
];

export default function CallsScreen() {
  const [search, setSearch] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const { data, isLoading, error, refetch } = useApi(() => fetchCalls({ per_page: 50 }), []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const displayCalls = data?.calls ?? MOCK_CALLS;

  const filtered = useMemo(() => displayCalls.filter((c) => {
    const q = search.toLowerCase();
    return (!search || c.title.toLowerCase().includes(q) || (c.user_name ?? '').toLowerCase().includes(q)) &&
      (!sentimentFilter || c.ai_analysis?.sentiment === sentimentFilter);
  }), [displayCalls, search, sentimentFilter]);

  return (
    <View style={styles.screen}>
      <FlatList
        data={filtered}
        keyExtractor={(c) => String(c.id)}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        ListHeaderComponent={
          <>
            <View style={styles.summary}>
              <Text style={styles.summaryText}>{displayCalls.length} calls total</Text>
            </View>
            <FilterBar
              searchPlaceholder="Search calls..."
              searchValue={search}
              onSearchChange={setSearch}
              filters={[{ key: 'sentiment', label: 'Sentiment', options: SENTIMENT_OPTIONS, value: sentimentFilter, onChange: setSentimentFilter }]}
            />
            {isLoading && !data && <LoadingSpinner message="Loading calls..." />}
            {error && !data && <EmptyState icon="\u26a0\ufe0f" title="Could not load calls" subtitle={error} />}
          </>
        }
        ListEmptyComponent={!isLoading ? <EmptyState icon="\ud83d\udcde" title="No calls found" subtitle="Try adjusting your search." /> : null}
        renderItem={({ item }) => <CallCard call={item} onPress={() => setSelectedCall(item)} />}
      />
      <CallDetailModal call={selectedCall} onClose={() => setSelectedCall(null)} />
    </View>
  );
}

function CallDetailModal({ call, onClose }: { call: Call | null; onClose: () => void }) {
  if (!call) return null;
  const sentiment = call.ai_analysis?.sentiment;
  const sentimentColor = sentiment === 'positive' ? Colors.success : sentiment === 'negative' ? Colors.danger : Colors.text.muted;
  return (
    <Modal visible={!!call} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={modalStyles.container}>
        <View style={modalStyles.header}>
          <Text style={modalStyles.title} numberOfLines={2}>{call.title}</Text>
          <TouchableOpacity onPress={onClose} style={modalStyles.closeBtn}>
            <Text style={modalStyles.closeBtnText}>\u2715</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={modalStyles.content}>
          <View style={modalStyles.metaRow}>
            {call.user_name && <Text style={modalStyles.meta}>{call.user_name}</Text>}
            {sentiment && (
              <View style={[modalStyles.sentimentBadge, { backgroundColor: sentimentColor + '22' }]}>
                <Text style={[modalStyles.sentimentText, { color: sentimentColor }]}>{sentiment}</Text>
              </View>
            )}
          </View>
          {call.ai_analysis?.summary && (
            <View style={modalStyles.section}>
              <Text style={modalStyles.sectionTitle}>AI Summary</Text>
              <Text style={modalStyles.body}>{call.ai_analysis.summary}</Text>
            </View>
          )}
          {(call.ai_analysis?.action_items ?? []).length > 0 && (
            <View style={modalStyles.section}>
              <Text style={modalStyles.sectionTitle}>Action Items</Text>
              {call.ai_analysis!.action_items!.map((item, i) => (
                <Text key={i} style={modalStyles.listItem}>• {item}</Text>
              ))}
            </View>
          )}
          {call.crm_notes && (
            <View style={modalStyles.section}>
              <Text style={modalStyles.sectionTitle}>CRM Notes</Text>
              <Text style={modalStyles.body}>{call.crm_notes}</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.base },
  header: { flexDirection: 'row', alignItems: 'flex-start', padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 12 },
  title: { flex: 1, color: Colors.text.primary, fontSize: 18, fontWeight: '700' },
  closeBtn: { padding: 4 },
  closeBtnText: { color: Colors.text.muted, fontSize: 18 },
  content: { padding: 16, gap: 16 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center' },
  meta: { color: Colors.text.muted, fontSize: 12 },
  sentimentBadge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  sentimentText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  section: { backgroundColor: Colors.bg.card, borderRadius: 12, padding: 14 },
  sectionTitle: { color: Colors.text.secondary, fontSize: 12, fontWeight: '700', marginBottom: 8 },
  body: { color: Colors.text.primary, fontSize: 14, lineHeight: 22 },
  listItem: { color: Colors.text.primary, fontSize: 14, lineHeight: 24 },
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg.base },
  content: { padding: 16, paddingBottom: 40 },
  summary: { marginBottom: 8 },
  summaryText: { color: Colors.text.muted, fontSize: 12 },
});
