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
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState'
import { useApi } from '@/hooks/useApi';
import { fetchMeetings, Meeting } from '@/services/api';

const MOCK_MEETINGS: Meeting[] = [
  { id: 1, title: 'Demo — Acme Corp', duration: 60, meeting_date: '2026-03-29', participants: 'John Doe, Jane Smith', meeting_notes: 'Live demo of the dashboard. Strong positive reception.', ai_analysis: { sentiment: 'positive', summary: 'Demo went well. Stakeholders impressed with analytics features. Moving to procurement.', action_items: ['Send follow-up email', 'Prepare commercial proposal'] }, created_at: '2026-03-29T15:00:00Z', user_name: 'Alex Johnson' },
  { id: 2, title: 'QBR — TechVentures', duration: 90, meeting_date: '2026-03-27', participants: 'CFO, VP Sales', meeting_notes: 'Quarterly business review. Discussed renewal.', ai_analysis: { sentiment: 'neutral', summary: 'Renewal discussions ongoing. CFO wants additional ROI data.', action_items: ['Prepare ROI report', 'Schedule renewal call'] }, created_at: '2026-03-27T13:00:00Z', user_name: 'Sam Lee' },
  { id: 3, title: 'Internal sync — Sales team', duration: 30, meeting_date: '2026-03-26', participants: 'Alex, Sam, Maria', meeting_notes: 'Weekly sales sync. Reviewed pipeline.', ai_analysis: { sentiment: 'positive', summary: 'Team morale high. Pipeline healthy. 3 deals moving to close stage.', action_items: ['Update CRM', 'Follow up with open deals'] }, created_at: '2026-03-26T09:00:00Z', user_name: 'Alex Johnson' },
];

export default function MeetingsScreen() {
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

  const { data, isLoading, error, refetch } = useApi(() => fetchMeetings({ per_page: 50 }), []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const displayMeetings = data?.meetings ?? MOCK_MEETINGS;

  const filtered = useMemo(() => {
    if (!search) return displayMeetings;
    const q = search.toLowerCase();
    return displayMeetings.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        (m.participants ?? '').toLowerCase().includes(q) ||
        (m.user_name ?? '').toLowerCase().includes(q)
    );
  }, [displayMeetings, search]);

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
            <FilterBar
              searchPlaceholder="Search meetings..."
              searchValue={search}
              onSearchChange={setSearch}
            />
            {isLoading && !data && <LoadingSpinner message="Loading meetings..." />}
            {error && !data && <EmptyState icon="⚠️" title="Could not load meetings" subtitle={error} />}
          </>
        }
        ListEmptyComponent={!isLoading ? <EmptyState icon="🤝" title="No meetings found" /> : null}
        renderItem={({ item }) => (
          <MeetingCard meeting={item} onPress={() => setSelectedMeeting(item)} />
        )}
      />

      <MeetingDetailModal meeting={selectedMeeting} onClose={() => setSelectedMeeting(null)} />
    </View>
  );
}
