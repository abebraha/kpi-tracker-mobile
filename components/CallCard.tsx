import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, withAlpha } from '@/constants/Colors';
import { FontSize, Radius, Spacing } from '@/constants/Theme';
import type { Call, Meeting } from '@/services/api';

interface Props {
  call: Call | Meeting;
  onPress?: () => void;
}

function sentimentColor(sentiment?: string | null): string {
  switch (sentiment) {
    case 'positive':
      return Colors.success;
    case 'negative':
      return Colors.danger;
    case 'neutral':
      return Colors.text.secondary;
    default:
      return Colors.text.muted;
  }
}

function formatDate(input?: string | null): string {
  if (!input) return '';
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function getDateString(item: Call | Meeting): string | undefined {
  return 'call_date' in item ? item.call_date : item.meeting_date;
}

export function CallCard({ call, onPress }: Props) {
  const sentiment = call.ai_analysis?.sentiment;
  const sColor = sentimentColor(sentiment);
  const date = formatDate(getDateString(call) ?? call.created_at);
  const summary = call.ai_analysis?.summary;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      disabled={!onPress}
    >
      <View style={styles.headerRow}>
        <Text style={styles.title} numberOfLines={1}>
          {call.title}
        </Text>
        {sentiment ? (
          <View style={[styles.sentiment, { backgroundColor: withAlpha(sColor, 0.15) }]}>
            <View style={[styles.sentimentDot, { backgroundColor: sColor }]} />
            <Text style={[styles.sentimentText, { color: sColor }]}>{sentiment}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.meta}>⏱ {call.duration} min</Text>
        {date ? <Text style={styles.meta}>📅 {date}</Text> : null}
        {call.user_name ? <Text style={styles.meta}>👤 {call.user_name}</Text> : null}
      </View>

      {summary ? (
        <Text style={styles.summary} numberOfLines={2}>
          {summary}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    flex: 1,
    color: Colors.text.primary,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  sentiment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  sentimentDot: { width: 6, height: 6, borderRadius: 3 },
  sentimentText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  meta: {
    color: Colors.text.secondary,
    fontSize: FontSize.xs,
  },
  summary: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
});
