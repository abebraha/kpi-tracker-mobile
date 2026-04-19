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
import { fetchMeetings, Meeting } from '@/services/api';

const MOCK_MEETINGS: Meeting[] = [
  {
    id: 1,
    title: 'Demo — Acme Corp',
    duration: 60,
    meeting_date: '2026-03-29',
    participants: 'John Doe, Jane Smith',
    meeting_notes: 'Live demo of the dashboard. Strong positive reception.',
    ai_analysis: {
      sentiment: 'positive',
      summary:
        'Demo went well. Stakeholders impressed with analytics features. Moving to procurement.',
      action_items: ['Send follow-up email', 'Prepare commercial proposal'],
    },
    created_at: '2026-03-29T15:00:00Z',
    user_name: 'Alex Johnson',
  },
  {
    id: 2,
    title: 'QBR — TechVentures',
    duration: 90,
    meeting_date: '2026-03-27',
    participants: 'CFO, VP Sales',
    meeting_notes: 'Quarterly business review. Discussed renewal.',
    ai_analysis: {
      sentiment: 'neutral',
      summary: 'Renewal discussions ongoing. CFO wants additional ROI data.',
      action_items: ['Prepare ROI report', 'Schedule renewal call'],
    },
    created_at: '2026-03-27T13:00:00Z',
    user_name: 'Sam Lee',
  },
  {
    id: 3,
    title: 'Internal sync — Sales team',
    duration: 30,
    meeting_date: '2026-03-26',
    participants: 'Alex, Sam, Maria',
    meeting_notes: 'Weekly sales sync. Reviewed pipeline.',
    ai_analysis: {
      sentiment: 'positive',
      summary:
        'Team morale high. Pipeline healthy. 3 deals moving to close stage.',
      action_items: ['Update CRM', 'Follow up with open deals'],
    },
    created_at: '2026-03-26T09:00:00Z',
    user_name: 'Alex Johnson',
  },
];

const SENTIMENT_OPTIONS = [
  { label: 'Positive', value: 'positive' },
  { label: 'Neutral', value: 'neutral' },
  { label: 'Negative', value: 'negative' },
];

export default function MeetingsScreen() {
  const [search, setSearch] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<Meeting | null>(null);

  const { data, isLoading, error, refetch } = useApi(() => fetchMeetings({ per_page: 50 }), []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const meetings = data?.meetings ?? MOCK_MEETINGS;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return meetings.filter((m) => {
      const matchSearch =
        !q ||
        m.title.toLowerCase().includes(q) ||
        (m.participants ?? '').toLowerCase().includes(q) ||
        (m.user_name ?? '').toLowerCase().includes(q) ||
        (m.meeting_notes ?? '').toLowerCase().includes(q);
      const matchSentiment = !sentimentFilter || m.ai_analysis?.sentiment === sentimentFilter;
      return matchSearch && matchSentiment;
    });
  }, [meetings, search, sentimentFilter]);

  return (
    <View style={styles.screen}>
      <FlatList
        data={filtered}
        keyExtractor={(m) => String(m.id)}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        ListHeaderComponent={
          <>
            <View style={styles.summary}>
              <Text style={styles.summaryCount}>{filtered.length}</Text>
              <Text style={styles.summaryLabel}>
                {filtered.length === 1 ? 'meeting shown' : 'meetings shown'}
              </Text>
            </View>
            <FilterBar
              searchPlaceholder="Search meetings, participants, notes…"
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
            {isLoading && !data ? <LoadingSpinner message="Loading meetings…" /> : null}
            {error && !data ? (
              <EmptyState
                icon="⚠️"
                title="Couldn't load meetings"
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
              icon="🤝"
              title="No meetings match your filters"
              subtitle="Try clearing search or a different sentiment."
            />
          ) : null
        }
        renderItem={({ item }) => <CallCard call={item} onPress={() => setSelected(item)} />}
      />
      <MeetingDetailModal meeting={selected} onClose={() => setSelected(null)} />
    </View>
  );
}

function MeetingDetailModal({
  meeting,
  onClose,
}: {
  meeting: Meeting | null;
  onClose: () => void;
}) {
  if (!meeting) return null;
  const sentiment = meeting.ai_analysis?.sentiment;
  const sentimentColor =
    sentiment === 'positive'
      ? Colors.success
      : sentiment === 'negative'
      ? Colors.danger
      : Colors.text.secondary;

  const d = new Date(meeting.meeting_date || meeting.created_at);
  const dateLabel = Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <Modal
      visible={!!meeting}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={modalStyles.container}>
        <View style={modalStyles.header}>
          <View style={{ flex: 1 }}>
            <Text style={modalStyles.eyebrow}>Meeting detail</Text>
            <Text style={modalStyles.title} numberOfLines={2}>
              {meeting.title}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={modalStyles.closeBtn} hitSlop={8}>
            <Text style={modalStyles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={modalStyles.content}>
          <View style={modalStyles.metaRow}>
            <Text style={modalStyles.meta}>⏱ {meeting.duration} min</Text>
            {dateLabel ? <Text style={modalStyles.meta}>📅 {dateLabel}</Text> : null}
            {meeting.user_name ? <Text style={modalStyles.meta}>👤 {meeting.user_name}</Text> : null}
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

          {meeting.participants ? (
            <View style={modalStyles.section}>
              <Text style={modalStyles.sectionTitle}>Participants</Text>
              <Text style={modalStyles.body}>{meeting.participants}</Text>
            </View>
          ) : null}

          {meeting.ai_analysis?.summary ? (
            <View style={modalStyles.section}>
              <Text style={modalStyles.sectionTitle}>AI Summary</Text>
              <Text style={modalStyles.body}>{meeting.ai_analysis.summary}</Text>
            </View>
          ) : null}

          {(meeting.ai_analysis?.action_items?.length ?? 0) > 0 ? (
            <View style={modalStyles.section}>
              <Text style={modalStyles.sectionTitle}>Action Items</Text>
              {meeting.ai_analysis!.action_items!.map((item, i) => (
                <View key={i} style={modalStyles.actionRow}>
                  <Text style={modalStyles.actionBullet}>✓</Text>
                  <Text style={modalStyles.body}>{item}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {meeting.meeting_notes ? (
            <View style={modalStyles.section}>
              <Text style={modalStyles.sectionTitle}>Notes</Text>
              <Text style={modalStyles.body}>{meeting.meeting_notes}</Text>
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
