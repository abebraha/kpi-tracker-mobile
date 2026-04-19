export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://app.icebreakerbd.com';

export const ENDPOINTS = {
  // Auth
  login: '/login',
  logout: '/auth/logout',
  authCallback: '/auth/callback',
  me: '/api/me',

  // Metrics / dashboards
  dashboard: '/api/dashboard',
  leaderboard: '/api/leaderboard',

  // CRM
  calls: '/api/calls',
  meetings: '/api/meetings',
  callAnalysis: (id: string | number) => `/api/call_analysis/${id}`,
  logCall: '/sdr/log_calls',
  logMeeting: '/sdr/log_meetings',

  // Recruiting
  candidates: '/api/candidates',
  candidateFilters: '/api/candidates/filters',
  candidateDetail: (id: string | number) => `/recruiting/candidates/${id}`,
  updateCandidateStatus: (id: string | number) => `/api/candidates/${id}/status`,
  recruitingJobs: '/api/jobs',
  recruitingAnalytics: '/api/recruiting/analytics',
} as const;

export const CANDIDATE_STATUSES = [
  'applied',
  'screening',
  'interview',
  'offer',
  'hired',
  'rejected',
] as const;

export type CandidateStatus = (typeof CANDIDATE_STATUSES)[number];

export const CANDIDATE_STATUS_LABEL: Record<CandidateStatus, string> = {
  applied: 'Applied',
  screening: 'Screening',
  interview: 'Interview',
  offer: 'Offer',
  hired: 'Hired',
  rejected: 'Rejected',
};
