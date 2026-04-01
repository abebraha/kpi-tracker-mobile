/**
 * IceBreakerBD KPI Tracker — Color System
 * Dark navy base with teal/blue accent palette.
 */

export const Colors = {
  // Brand
  primary: '#0EA5E9',
  primaryDark: '#0284C7',
  primaryLight: '#38BDF8',
  accent: '#14B8A6',

  // Backgrounds
  bg: {
    base: '#0F172A',
    card: '#1E293B',
    elevated: '#334155',
    input: '#1E293B',
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

  // Status colors (candidate pipeline)
  status: {
    applied: '#64748B',
    screening: '#0EA5E9',
    interview: '#F59E0B',
    offer: '#14B8A6',
    hired: '#22C55E',
    rejected: '#EF4444',
  },

  // Borders
  border: '#334155',
  borderLight: '#475569',

  // Gradients (use as array for LinearGradient)
  gradientPrimary: ['#0EA5E9', '#0284C7'],
  gradientCard: ['#1E293B', '#0F172A'],
};

export type ColorKey = keyof typeof Colors;
