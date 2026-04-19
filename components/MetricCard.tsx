import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, withAlpha } from '@/constants/Colors';
import { FontSize, Radius, Spacing } from '@/constants/Theme';

export interface MetricCardProps {
  label: string;
  value: number | string;
  target?: number;
  unit?: string;
  trend?: 'up' | 'down' | 'flat';
  trendPct?: number;
  accent?: string;
}

function formatValue(value: number | string, unit?: string): string {
  if (typeof value === 'number') {
    return unit ? `${value}${unit}` : String(value);
  }
  return value;
}

export function MetricCard({
  label,
  value,
  target,
  unit,
  trend,
  trendPct,
  accent = Colors.primary,
}: MetricCardProps) {
  const numericValue = typeof value === 'number' ? value : Number(value);
  const hasProgress = typeof target === 'number' && target > 0 && !Number.isNaN(numericValue);
  const progress = hasProgress ? Math.min(1, Math.max(0, numericValue / target)) : 0;
  const progressColor =
    progress >= 1 ? Colors.success : progress >= 0.66 ? accent : progress >= 0.33 ? Colors.warning : Colors.danger;

  const trendColor =
    trend === 'up' ? Colors.success : trend === 'down' ? Colors.danger : Colors.text.muted;
  const trendArrow = trend === 'up' ? '▲' : trend === 'down' ? '▼' : '→';

  return (
    <View style={[styles.card, { borderColor: withAlpha(accent, 0.35) }]}>
      <View style={[styles.accentBar, { backgroundColor: accent }]} />
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{formatValue(value, unit)}</Text>
        {hasProgress ? (
          <Text style={styles.target}>/ {target}</Text>
        ) : null}
      </View>

      {hasProgress ? (
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress * 100}%`, backgroundColor: progressColor },
            ]}
          />
        </View>
      ) : null}

      {trend ? (
        <View style={styles.footerRow}>
          <Text style={[styles.trendText, { color: trendColor }]}>
            {trendArrow} {trendPct != null ? `${trendPct}%` : ''}
          </Text>
          <Text style={styles.footerMuted}>vs last period</Text>
        </View>
      ) : hasProgress ? (
        <Text style={styles.footerMuted}>{Math.round(progress * 100)}% of target</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexGrow: 1,
    flexBasis: '47%',
    minWidth: 150,
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    gap: Spacing.xs,
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  label: {
    color: Colors.text.secondary,
    fontSize: FontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginLeft: 2,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.xs,
  },
  value: {
    color: Colors.text.primary,
    fontSize: FontSize.xxxl,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  target: {
    color: Colors.text.muted,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  progressTrack: {
    height: 6,
    backgroundColor: Colors.bg.input,
    borderRadius: Radius.pill,
    overflow: 'hidden',
    marginTop: Spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.pill,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  trendText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  footerMuted: {
    color: Colors.text.muted,
    fontSize: FontSize.xs,
  },
});
