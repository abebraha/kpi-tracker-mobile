import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors, withAlpha } from '@/constants/Colors';
import { FontSize, Radius, Spacing } from '@/constants/Theme';
import { FilterBar } from '@/components/FilterBar';
import { CallCard } from '@/components/CallCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { useApi } from '@/hooks/useApi';
import { fetchCalls, Call } from '@/services/api';

const MOCK_CALLS: Call[] = [
  {
    id: 1,
    title: 'Discovery — Acme Corp',
    duration: 32,
    call_date: '2026-03-29',
    crm_notes: 'Decision maker interested in Q2 pilot.',
    ai_analysis: {
      sentiment: 'positive',
      summary: 'Prospect showed strong interest in the pilot and aligned on timelines.',
      action_items: ['Send proposal', 'Schedule follow-up for next week'],
    },
    created_at: '2026-03-29T14:00:00Z',
    user_name: 'Alex Johnson',
  },
  {
    id: 2,
    title: 'Follow-up — TechVentures',
    duration: 18,
    call_date: '2026-03-28',
    crm_notes: 'Budget concerns flagged.',
    ai_analysis: {
      sentiment: 'neutral',
      summary: 'Discussed pricing. CFO sign-off still needed.',
      action_items: ['Send pricing deck'],
    },
    created_at: '2026-03-28T10:30:00Z',
    user_name: 'Sam Lee',
  },
  {
    id: 3,
    title: 'Cold call — GlobalFin',
    duration: 7,
    call_date: '2026-03-27',
    crm_notes: 'Left voicemail.',
    ai_analysis: { sentiment: 'neutral', summary: 'No answer. Voicemail left.' },
    created_at: '2026-03-27T09:00:00Z',
    user_name: 'Alex Johnson',
  },
  {
    id: 4,
    title: 'Objection handling — Zenith',
    duration: 45,
    call_date: '2026-03-26',
    crm_notes: 'Moving to demo.',
    ai_analysis: {
      sentiment: 'positive',
      summary: 'Pricing objections resolved. Demo scheduled.',
      action_items: ['Book demo', 'Send case studies'],
    },
    created_at: '2026-03-26T15:00:00Z',
    user_name: 'Maria Garcia',
  },
  {
    id: 5,
    title: 'Churn risk — OldClient Inc',
    duration: 22,
    call_date: '2026-03-25',
    crm_notes: 'Escalated to Customer Success.',
    ai_analysis: {
      sentiment: 'negative',
      summary: 'Customer frustrated with support response times.',
    },
    created_at: '2026-03-25T11:00:00Z',
    user_name: 'Sam Lee',
  },
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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return displayCalls.filter((c) => {
      const matchesSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        (c.user_name ?? '').toLowerCase().includes(q) ||
        (c.crm_notes ?? '').toLowerCase().includes(q);
      const matchesSentiment =
        !sentimentFilter || c.ai_analysis?.sentiment === sentimentFilter;
      return matchesSearch && matchesSentiment;
    });
  }, [displayCalls, search, sentimentFilter]);

  return (
    <View style={styles.screen}>
      <FlatList
        data={filtered}
        keyExtractor={(c) => String(c.id)}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        ListHeaderComponent={
          <>
            <View style={styles.summary}>
              <Text style={styles.summaryCount}>{filtered.length}</Text>
              <Text style={styles.summaryLabel}>
                {filtered.length === 1 ? 'call shown' : 'calls shown'}
              </Text>
            </View>
            <FilterBar
              searchPlaceholder="Search calls, notes, reps…"
              searchValue={search}
              onSearchChange={setSearch}
              filters={[
                {
                  key: 'sentiment',
                  label: 'Sentiment',
                  options: SENTIMENT_OPTIONS,
                  value: sentimentFilter,
                  onChange: setSentimentFilter,
                },
              ]}
            />
            {isLoading && !data ? <LoadingSpinner message="Loading calls…" /> : null}
            {error && !data ? (
              <EmptyState
                icon="⚠️"
                title="Couldn't load calls"
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
              icon="📞"
              title="No calls match your filters"
              subtitle="Try clearing search or a different sentiment."
            />
          ) : null
        }
        renderItem={({ item }) => <CallCard call={item} onPress={() => setSelectedCall(item)} />}
      />
      <CallDetailModal call={selectedCall} onClose={() => setSelectedCall(null)} />
    </View>
  );
}

function CallDetailModal({ call, onClose }: { call: Call | null; onClose: () => void }) {
  if (!call) return null;
  const sentiment = call.ai_analysis?.sentiment;
  const sentimentColor =
    sentiment === 'positive'
      ? Colors.success
      : sentiment === 'negative'
      ? Colors.danger
      : Colors.text.secondary;

  const date = new Date(call.call_date || call.created_at);
  const dateLabel = Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <Modal
      visible={!!call}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={modalStyles.container}>
        <View style={modalStyles.header}>
          <View style={{ flex: 1 }}>
            <Text style={modalStyles.eyebrow}>Call detail</Text>
            <Text style={modalStyles.title} numberOfLines={2}>
              {call.title}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={modalStyles.closeBtn} hitSlop={8}>
            <Text style={modalStyles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={modalStyles.content}>
          <View style={modalStyles.metaRow}>
            <Text style={modalStyles.meta}>⏱ {call.duration} min</Text>
            {dateLabel ? <Text style={modalStyles.meta}>📅 {dateLabel}</Text> : null}
            {call.user_name ? <Text style={modalStyles.meta}>👤 {call.user_name}</Text> : null}
            {sentiment ? (
              <View
                style={[modalStyles.sentimentBadge, { backgroundColor: withAlpha(sentimentColor, 0.18) }]}
              >
                <Text style={[modalStyles.sentimentText, { color: sentimentColor }]}>
                  {sentiment}
                </Text>
              </View>
            ) : null}
          </View>

          {call.ai_analysis?.summary ? (
            <View style={modalStyles.section}>
              <Text style={modalStyles.sectionTitle}>AI Summary</Text>
              <Text style={modalStyles.body}>{call.ai_analysis.summary}</Text>
            </View>
          ) : null}

          {(call.ai_analysis?.action_items?.length ?? 0) > 0 ? (
            <View style={modalStyles.section}>
              <Text style={modalStyles.sectionTitle}>Action Items</Text>
              {call.ai_analysis!.action_items!.map((item, i) => (
                <View key={i} style={modalStyles.actionRow}>
                  <Text style={modalStyles.actionBullet}>✓</Text>
                  <Text style={modalStyles.body}>{item}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {call.crm_notes ? (
            <View style={modalStyles.section}>
              <Text style={modalStyles.sectionTitle}>CRM Notes</Text>
              <Text style={modalStyles.body}>{call.crm_notes}</Text>
            </View>
          ) : null}
        </ScrollView>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.base },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.md,
  },
  eyebrow: {
    color: Colors.primary,
    fontSize: FontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: { color: Colors.text.primary, fontSize: FontSize.xl, fontWeight: '800', marginTop: 2 },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.bg.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { color: Colors.text.secondary, fontSize: FontSize.md, fontWeight: '700' },
  content: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: 40 },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    alignItems: 'center',
  },
  meta: { color: Colors.text.secondary, fontSize: FontSize.sm },
  sentimentBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  sentimentText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  section: {
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  sectionTitle: {
    color: Colors.text.secondary,
    fontSize: FontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  body: { color: Colors.text.primary, fontSize: FontSize.md, lineHeight: 22, flex: 1 },
  actionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  actionBullet: {
    color: Colors.success,
    fontSize: FontSize.md,
    fontWeight: '800',
    marginTop: 1,
  },
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg.base },
  content: { padding: Spacing.screen, paddingBottom: 40 },
  summary: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  summaryCount: {
    color: Colors.text.primary,
    fontSize: FontSize.xxl,
    fontWeight: '800',
  },
  summaryLabel: { color: Colors.text.muted, fontSize: FontSize.sm },
});
