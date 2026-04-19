/**
 * IceBreakerBD KPI Tracker — Color System
 * Dark navy base with sky-blue + teal accent palette.
 */

export const Colors = {
  // Brand
  primary: '#0EA5E9',
  primaryDark: '#0284C7',
  primaryLight: '#38BDF8',
  accent: '#14B8A6',
  accentAlt: '#8B5CF6',

  // Backgrounds
  bg: {
    base: '#0B1220',
    card: '#1E293B',
    cardAlt: '#182234',
    elevated: '#334155',
    input: '#0F1C2E',
    overlay: 'rgba(8, 12, 22, 0.78)',
  },

  // Text
  text: {
    primary: '#F1F5F9',
    secondary: '#94A3B8',
    muted: '#64748B',
    inverse: '#0F172A',
  },

  // Semantic
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#0EA5E9',

  // Candidate pipeline
  status: {
    applied: '#94A3B8',
    screening: '#0EA5E9',
    interview: '#F59E0B',
    offer: '#14B8A6',
    hired: '#22C55E',
    rejected: '#EF4444',
  },

  // Borders
  border: '#1F2D44',
  borderStrong: '#334155',

  // Gradients (use with LinearGradient)
  gradientPrimary: ['#0EA5E9', '#0284C7'],
  gradientAccent: ['#14B8A6', '#0EA5E9'],
  gradientCard: ['#1E293B', '#0F172A'],
} as const;

/** Apply an alpha channel to any hex colour, e.g. withAlpha(Colors.primary, 0.14). */
export function withAlpha(hex: string, alpha: number): string {
  const a = Math.max(0, Math.min(1, alpha));
  const hexAlpha = Math.round(a * 255)
    .toString(16)
    .padStart(2, '0')
    .toUpperCase();
  return `${hex}${hexAlpha}`;
}

export type ColorKey = keyof typeof Colors;
