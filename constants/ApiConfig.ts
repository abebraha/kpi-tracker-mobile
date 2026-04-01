export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://app.icebreakerbd.com';

export const ENDPOINTS = {
  login: '/login',
  logout: '/auth/logout',
  authCallback: '/auth/callback',
  leaderboard: '/api/leaderboard',
  calls: '/api/calls',
  meetings: '/api/meetings',
  callAnalysis: (id: string | number) => `/api/call_analysis/${id}`,
  candidates: '/api/candidates',
  candidateFilters: '/api/candidates/filters',
  syncStatus: '/api/sync_status',
  sdrDashboard: '/sdr/dashboard',
  logCall: '/sdr/log_calls',
  logMeeting: '/sdr/log_meetings',
  recruitingJobs: '/recruiting/jobs',
  recruitingCandidates: '/recruiting/candidates',
  recruitingAnalytics: '/recruiting/analytics',
  candidateDetail: (id: string | number) => `/recruiting/candidates/${id}`,
} as const;

export const CANDIDATE_STATUSES = [
  'applied', 'screening', 'interview', 'offer', 'hired', 'rejected',
] as const;

export type CandidateStatus = (typeof CANDIDATE_STATUSES)[number];
