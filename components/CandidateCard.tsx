import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, withAlpha } from '@/constants/Colors';
import { FontSize, Radius, Spacing } from '@/constants/Theme';
import { CANDIDATE_STATUS_LABEL } from '@/constants/ApiConfig';
import type { Candidate } from '@/services/api';

interface Props {
  candidate: Candidate;
  onPress?: () => void;
}

export function CandidateCard({ candidate, onPress }: Props) {
  const color = Colors.status[candidate.status] ?? Colors.text.muted;
  const initials =
    `${candidate.first_name?.charAt(0) ?? ''}${candidate.last_name?.charAt(0) ?? ''}`.toUpperCase() ||
    '?';
  const fullName = `${candidate.first_name} ${candidate.last_name}`.trim();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      disabled={!onPress}
    >
      <View style={[styles.avatar, { backgroundColor: withAlpha(color, 0.2) }]}>
        <Text style={[styles.avatarText, { color }]}>{initials}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {fullName}
        </Text>
        {candidate.job_title ? (
          <Text style={styles.role} numberOfLines={1}>
            {candidate.job_title}
          </Text>
        ) : null}
        <Text style={styles.email} numberOfLines={1}>
          {candidate.email}
        </Text>
      </View>
      <View style={[styles.badge, { backgroundColor: withAlpha(color, 0.15) }]}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <Text style={[styles.badgeText, { color }]}>
          {CANDIDATE_STATUS_LABEL[candidate.status] ?? candidate.status}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: FontSize.md, fontWeight: '800' },
  info: { flex: 1, gap: 2 },
  name: { color: Colors.text.primary, fontSize: FontSize.md, fontWeight: '700' },
  role: { color: Colors.text.secondary, fontSize: FontSize.xs },
  email: { color: Colors.text.muted, fontSize: FontSize.xs },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radius.pill,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: FontSize.xs, fontWeight: '700' },
});
