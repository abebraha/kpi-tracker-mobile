/**
 * IceBreakerBD KPI Tracker — Design tokens.
 * Centralises spacing, typography, radius, and elevation so every screen
 * stays visually consistent.
 */

export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  screen: 16,
} as const;

export const Radius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const FontSize = {
  xs: 11,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
  xxxl: 28,
  display: 34,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  black: '800' as const,
};

export const Typography = {
  display: { fontSize: FontSize.display, fontWeight: FontWeight.black, letterSpacing: -0.6 },
  h1: { fontSize: FontSize.xxxl, fontWeight: FontWeight.black, letterSpacing: -0.4 },
  h2: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, letterSpacing: -0.2 },
  h3: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  body: { fontSize: FontSize.md, fontWeight: FontWeight.regular },
  bodyStrong: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  label: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  eyebrow: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },
  caption: { fontSize: FontSize.xs, fontWeight: FontWeight.regular },
} as const;

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
} as const;
