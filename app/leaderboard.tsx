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
import { fetchLeaderboard, LeaderboardEntry } from '@/services/api';

const MOCK: LeaderboardEntry[] = [
  { rank: 1, user_id: 1, name: 'Alex Johnson', calls_logged: 48, meetings_logged: 12, score: 285 },
  { rank: 2, user_id: 2, name: 'Sam Lee', calls_logged: 42, meetings_logged: 10, score: 248 },
  { rank: 3, user_id: 3, name: 'Maria Garcia', calls_logged: 38, meetings_logged: 9, score: 221 },
  { rank: 4, user_id: 4, name: 'Jordan Kim', calls_logged: 30, meetings_logged: 8, score: 190 },
  { rank: 5, user_id: 5, name: 'Taylor Patel', calls_logged: 28, meetings_logged: 7, score: 175 },
  { rank: 6, user_id: 6, name: 'Casey Morgan', calls_logged: 24, meetings_logged: 6, score: 148 },
  { rank: 7, user_id: 7, name: 'Riley Park', calls_logged: 20, meetings_logged: 5, score: 122 },
];

const MEDALS = ['🥇', '🥈', '🥉'];
const MEDAL_COLORS = [Colors.warning, '#94A3B8', '#CD7F32'];

function initials(name: string): string {
  return name
    .split(' ')
    .map((s) => s.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function LeaderboardScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { data, isLoading, error, refetch } = useApi(() => fetchLeaderboard());
  const entries = data ?? MOCK;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const [first, second, third] = entries;
  const podium = [second, first, third].filter(Boolean) as LeaderboardEntry[];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.primary}
        />
      }
    >
      <ScreenHeader
        eyebrow="This Month"
        title="Leaderboard"
        subtitle="Top performers across the team."
      />

      {isLoading && !data ? (
        <LoadingSpinner message="Loading rankings…" />
      ) : error && !data ? (
        <EmptyState
          icon="⚠️"
          title="Couldn't load leaderboard"
          subtitle={error}
          actionLabel="Retry"
          onAction={refetch}
        />
      ) : entries.length === 0 ? (
        <EmptyState icon="🏆" title="No scores yet" subtitle="Log calls and meetings to climb the board." />
      ) : (
        <>
          {podium.length > 0 ? (
            <View style={styles.podium}>
              {podium.map((entry) => {
                const position = entry.rank - 1;
                const pedestalHeight = entry.rank === 1 ? 96 : entry.rank === 2 ? 72 : 56;
                return (
                  <View key={entry.user_id} style={styles.podiumCol}>
                    <View
                      style={[
                        styles.podiumAvatar,
                        {
                          borderColor: MEDAL_COLORS[position] ?? Colors.border,
                          backgroundColor: withAlpha(MEDAL_COLORS[position] ?? Colors.primary, 0.18),
                        },
                      ]}
                    >
                      <Text style={styles.podiumInitials}>{initials(entry.name)}</Text>
                    </View>
                    <Text style={styles.medal}>{MEDALS[position]}</Text>
                    <Text style={styles.podiumName} numberOfLines={1}>
                      {entry.name}
                    </Text>
                    <Text style={styles.podiumScore}>{entry.score} pts</Text>
                    <View
                      style={[
                        styles.pedestal,
                        {
                          height: pedestalHeight,
                          backgroundColor: withAlpha(MEDAL_COLORS[position] ?? Colors.primary, 0.2),
                          borderColor: withAlpha(MEDAL_COLORS[position] ?? Colors.primary, 0.5),
                        },
                      ]}
                    >
                      <Text style={[styles.pedestalRank, { color: MEDAL_COLORS[position] }]}>
                        {entry.rank}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : null}

          <SectionTitle title="Full Rankings" />
          <View style={styles.list}>
            {entries.map((entry) => (
              <View key={entry.user_id} style={styles.row}>
                <Text style={styles.rank}>#{entry.rank}</Text>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initials(entry.name)}</Text>
                </View>
                <View style={styles.rowInfo}>
                  <Text style={styles.rowName} numberOfLines={1}>
                    {entry.name}
                  </Text>
                  <Text style={styles.rowMeta}>
                    {entry.calls_logged} calls · {entry.meetings_logged} meetings
                  </Text>
                </View>
                <Text style={styles.rowScore}>{entry.score}</Text>
              </View>
            ))}
          </View>
        </>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg.base },
  content: { padding: Spacing.screen, paddingBottom: 40 },
  podium: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  podiumCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  podiumAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumInitials: {
    color: Colors.text.primary,
    fontWeight: '800',
    fontSize: FontSize.lg,
  },
  medal: { fontSize: 22 },
  podiumName: {
    color: Colors.text.primary,
    fontSize: FontSize.sm,
    fontWeight: '700',
    textAlign: 'center',
    maxWidth: 100,
  },
  podiumScore: {
    color: Colors.text.secondary,
    fontSize: FontSize.xs,
  },
  pedestal: {
    width: '100%',
    marginTop: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pedestalRank: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
  },
  list: {
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  rank: {
    color: Colors.text.muted,
    fontSize: FontSize.sm,
    fontWeight: '700',
    width: 36,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: withAlpha(Colors.primary, 0.15),
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  rowInfo: { flex: 1 },
  rowName: { color: Colors.text.primary, fontSize: FontSize.md, fontWeight: '600' },
  rowMeta: { color: Colors.text.muted, fontSize: FontSize.xs, marginTop: 2 },
  rowScore: {
    color: Colors.primary,
    fontSize: FontSize.md,
    fontWeight: '800',
  },
});
