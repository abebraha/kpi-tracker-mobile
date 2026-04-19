import React, { useCallback, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, withAlpha } from '@/constants/Colors';
import { FontSize, Radius, Spacing } from '@/constants/Theme';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { SectionTitle } from '@/components/SectionTitle';
import { useApi } from '@/hooks/useApi';
import { fetchCandidate, updateCandidateStatus, Candidate } from '@/services/api';
import {
  CANDIDATE_STATUSES,
  CANDIDATE_STATUS_LABEL,
  CandidateStatus,
} from '@/constants/ApiConfig';

export default function CandidateDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [localStatus, setLocalStatus] = useState<CandidateStatus | null>(null);

  const { data, isLoading, error, refetch } = useApi<Candidate | null>(
    () => (id ? fetchCandidate(id) : Promise.resolve(null)),
    [id]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const candidate = data;
  const status = localStatus ?? candidate?.status;

  async function handleStatusChange(newStatus: CandidateStatus) {
    if (!id || updating) return;
    const previous = status;
    setLocalStatus(newStatus);
    setUpdating(true);
    try {
      await updateCandidateStatus(id, newStatus);
    } catch (err) {
      setLocalStatus(previous ?? null);
      Alert.alert(
        "Couldn't update status",
        err instanceof Error ? err.message : 'Please try again.'
      );
    } finally {
      setUpdating(false);
    }
  }

  if (isLoading && !candidate) {
    return (
      <View style={styles.screen}>
        <LoadingSpinner message="Loading candidate…" />
      </View>
    );
  }

  if (error || !candidate) {
    return (
      <View style={styles.screen}>
        <EmptyState
          icon="⚠️"
          title="Couldn't load candidate"
          subtitle={error ?? 'No candidate found.'}
          actionLabel="Back"
          onAction={() => router.back()}
        />
      </View>
    );
  }

  const color = Colors.status[status ?? candidate.status];
  const fullName = `${candidate.first_name} ${candidate.last_name}`.trim();

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: fullName }} />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        <View style={[styles.hero, { borderColor: withAlpha(color, 0.4) }]}>
          <View style={[styles.avatar, { backgroundColor: withAlpha(color, 0.2) }]}>
            <Text style={[styles.avatarText, { color }]}>
              {`${candidate.first_name.charAt(0)}${candidate.last_name.charAt(0)}`.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{fullName}</Text>
          {candidate.job_title ? <Text style={styles.role}>{candidate.job_title}</Text> : null}
          <View style={[styles.badge, { backgroundColor: withAlpha(color, 0.18) }]}>
            <View style={[styles.dot, { backgroundColor: color }]} />
            <Text style={[styles.badgeText, { color }]}>
              {CANDIDATE_STATUS_LABEL[(status ?? candidate.status) as CandidateStatus]}
            </Text>
          </View>
        </View>

        <SectionTitle title="Contact" />
        <View style={styles.card}>
          <InfoRow label="Email" value={candidate.email} />
          {candidate.phone ? <InfoRow label="Phone" value={candidate.phone} /> : null}
          {candidate.job_title ? <InfoRow label="Role" value={candidate.job_title} /> : null}
          <InfoRow
            label="Applied"
            value={new Date(candidate.created_at).toLocaleDateString(undefined, {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          />
        </View>

        <SectionTitle title="Update stage" />
        <View style={styles.stageGrid}>
          {CANDIDATE_STATUSES.map((s) => {
            const active = (status ?? candidate.status) === s;
            const sColor = Colors.status[s];
            return (
              <TouchableOpacity
                key={s}
                style={[
                  styles.stageBtn,
                  active ? { backgroundColor: withAlpha(sColor, 0.22), borderColor: sColor } : null,
                ]}
                onPress={() => handleStatusChange(s)}
                disabled={updating}
                activeOpacity={0.85}
              >
                <View style={[styles.stageDot, { backgroundColor: sColor }]} />
                <Text style={[styles.stageLabel, active ? { color: sColor } : null]}>
                  {CANDIDATE_STATUS_LABEL[s]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {candidate.notes ? (
          <>
            <SectionTitle title="Notes" />
            <View style={styles.card}>
              <Text style={styles.body}>{candidate.notes}</Text>
            </View>
          </>
        ) : null}
      </ScrollView>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg.base },
  content: { padding: Spacing.screen, paddingBottom: 40 },
  hero: {
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: Radius.lg,
    backgroundColor: Colors.bg.card,
    borderWidth: 1,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  avatarText: { fontSize: FontSize.xl, fontWeight: '800' },
  name: { color: Colors.text.primary, fontSize: FontSize.xxl, fontWeight: '800' },
  role: { color: Colors.text.secondary, fontSize: FontSize.sm },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    marginTop: Spacing.xs,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: FontSize.xs, fontWeight: '700' },
  card: {
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: 6,
  },
  infoLabel: { color: Colors.text.muted, fontSize: FontSize.xs, fontWeight: '600' },
  infoValue: { color: Colors.text.primary, fontSize: FontSize.sm, fontWeight: '600', flex: 1, textAlign: 'right' },
  stageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  stageBtn: {
    flexGrow: 1,
    flexBasis: '30%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.bg.card,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stageDot: { width: 8, height: 8, borderRadius: 4 },
  stageLabel: { color: Colors.text.secondary, fontSize: FontSize.sm, fontWeight: '600' },
  body: { color: Colors.text.primary, fontSize: FontSize.md, lineHeight: 22 },
});
