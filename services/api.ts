import { API_BASE_URL, ENDPOINTS, CandidateStatus } from '@/constants/ApiConfig';

/* ------------------------------------------------------------------ */
/* Types shared across the app                                         */
/* ------------------------------------------------------------------ */

export type UserRole = 'admin' | 'sdr' | 'recruiter' | 'employee';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatar_url?: string | null;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  name: string;
  calls_logged: number;
  meetings_logged: number;
  score: number;
}

export interface MetricItem {
  label: string;
  value: number | string;
  target?: number;
  unit?: string;
  trend?: 'up' | 'down' | 'flat';
  trendPct?: number;
}

export interface AiAnalysis {
  sentiment?: 'positive' | 'neutral' | 'negative';
  summary?: string;
  action_items?: string[];
}

export interface Call {
  id: number;
  title: string;
  duration: number;
  call_date: string;
  crm_notes?: string | null;
  ai_analysis?: AiAnalysis | null;
  created_at: string;
  user_name?: string | null;
}

export interface CallAnalysis extends Call {
  transcript?: string | null;
}

export interface Meeting {
  id: number;
  title: string;
  duration: number;
  meeting_date: string;
  participants?: string | null;
  meeting_notes?: string | null;
  ai_analysis?: AiAnalysis | null;
  created_at: string;
  user_name?: string | null;
}

export interface Candidate {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  job_id?: number | null;
  job_title?: string | null;
  status: CandidateStatus;
  notes?: string | null;
  created_at: string;
}

export interface Job {
  id: number;
  title: string;
  department?: string | null;
  salary_range?: string | null;
  status: 'open' | 'closed';
  candidate_count?: number;
  description?: string | null;
  created_at: string;
}

export interface RecruitingAnalytics {
  total_candidates: number;
  by_status: Record<CandidateStatus, number>;
  hired_this_month: number;
  pipeline_conversion_rate: number;
  avg_time_to_hire_days: number | null;
  top_job?: string | null;
}

export interface DashboardMetrics {
  metrics: MetricItem[];
}

export interface PaginatedCalls {
  calls: Call[];
  total?: number;
  page?: number;
}

export interface PaginatedMeetings {
  meetings: Meeting[];
  total?: number;
  page?: number;
}

export interface PaginatedCandidates {
  candidates: Candidate[];
  total?: number;
}

/* ------------------------------------------------------------------ */
/* Internal request helper                                             */
/* ------------------------------------------------------------------ */

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string>;
};

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const base = API_BASE_URL.replace(/\/+$/, '');
  const url = `${base}${path}`;
  if (!query) return url;
  const params = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return params ? `${url}?${params}` : url;
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query, headers = {} } = opts;
  const url = buildUrl(path, query);

  const init: RequestInit = {
    method,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  };

  let res: Response;
  try {
    res = await fetch(url, init);
  } catch (err) {
    throw new ApiError(
      err instanceof Error ? err.message : 'Network error — check your connection',
      0
    );
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let message = `Request failed (${res.status})`;
    try {
      const parsed = JSON.parse(text);
      if (parsed?.error) message = parsed.error;
      else if (parsed?.message) message = parsed.message;
    } catch {
      if (text && text.length < 200) message = text;
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as unknown as T;
  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return undefined as unknown as T;
  }
  return (await res.json()) as T;
}

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */

export async function fetchCurrentUser(): Promise<User | null> {
  try {
    return await request<User>(ENDPOINTS.me);
  } catch (err) {
    if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
      return null;
    }
    throw err;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await request<void>(ENDPOINTS.logout, { method: 'POST' });
  } catch {
    /* ignore — local state is cleared by the caller regardless */
  }
}

/* ------------------------------------------------------------------ */
/* Dashboard / leaderboard                                             */
/* ------------------------------------------------------------------ */

export function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  return request<DashboardMetrics>(ENDPOINTS.dashboard);
}

export function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  return request<LeaderboardEntry[]>(ENDPOINTS.leaderboard);
}

/* ------------------------------------------------------------------ */
/* CRM — calls & meetings                                              */
/* ------------------------------------------------------------------ */

export function fetchCalls(
  params: { per_page?: number; page?: number } = {}
): Promise<PaginatedCalls> {
  return request<PaginatedCalls>(ENDPOINTS.calls, { query: params });
}

export function fetchCallAnalysis(id: number | string): Promise<CallAnalysis> {
  return request<CallAnalysis>(ENDPOINTS.callAnalysis(id));
}

export function fetchMeetings(
  params: { per_page?: number; page?: number } = {}
): Promise<PaginatedMeetings> {
  return request<PaginatedMeetings>(ENDPOINTS.meetings, { query: params });
}

export interface LogCallPayload {
  title: string;
  duration: number;
  call_date: string;
  crm_notes?: string;
}

export function logCall(payload: LogCallPayload): Promise<Call> {
  return request<Call>(ENDPOINTS.logCall, { method: 'POST', body: payload });
}

export interface LogMeetingPayload {
  title: string;
  duration: number;
  meeting_date: string;
  participants?: string;
  meeting_notes?: string;
}

export function logMeeting(payload: LogMeetingPayload): Promise<Meeting> {
  return request<Meeting>(ENDPOINTS.logMeeting, { method: 'POST', body: payload });
}

/* ------------------------------------------------------------------ */
/* Recruiting                                                          */
/* ------------------------------------------------------------------ */

export function fetchCandidates(
  params: { status?: CandidateStatus; job_id?: number; search?: string } = {}
): Promise<PaginatedCandidates> {
  return request<PaginatedCandidates>(ENDPOINTS.candidates, { query: params });
}

export function fetchCandidate(id: number | string): Promise<Candidate> {
  return request<Candidate>(ENDPOINTS.candidateDetail(id));
}

export function updateCandidateStatus(
  id: number | string,
  status: CandidateStatus
): Promise<Candidate> {
  return request<Candidate>(ENDPOINTS.updateCandidateStatus(id), {
    method: 'PATCH',
    body: { status },
  });
}

export function fetchJobs(): Promise<Job[]> {
  return request<Job[]>(ENDPOINTS.recruitingJobs);
}

export function fetchRecruitingAnalytics(): Promise<RecruitingAnalytics> {
  return request<RecruitingAnalytics>(ENDPOINTS.recruitingAnalytics);
}
