# KPI Tracker — React Native / Expo Mobile App

A unified React Native + Expo codebase that runs on **iOS, Android, and Web** from a single source of truth. This is the mobile/cross-platform frontend for the IceBreakerBD KPI Tracker.

> **Backend:** The existing Python/Flask backend at `https://app.icebreakerbd.com` is untouched. This repo is frontend-only.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Expo](https://expo.dev) ~51 with Expo Router |
| Language | TypeScript |
| Navigation | Expo Router (file-based, like Next.js) |
| Web support | React Native Web |
| Auth | Flask session cookies + `expo-web-browser` for Google OAuth |
| State | React Context + custom `useApi` hook |
| Styling | React Native StyleSheet (no external CSS framework) |

---

## Project Structure

```
app/
  _layout.tsx           # Root layout + AuthProvider
  index.tsx             # Role-based redirect (admin/sdr/recruiter/employee)
  login.tsx             # Google OAuth login screen
  (admin)/              # Admin role screens (tabs)
    dashboard.tsx       # Team overview + KPI metrics
  (sdr)/                # SDR role screens (tabs)
    dashboard.tsx       # Personal KPI dashboard
    log-call.tsx        # Log a new call
    log-meeting.tsx     # Log a new meeting
  (recruiting)/         # Recruiter role screens (tabs)
    candidates.tsx      # Candidate pipeline with filter bar
    jobs.tsx            # Job board
    analytics.tsx       # Recruiting funnel analytics
    candidate/[id].tsx  # Candidate detail + stage update
  (crm)/                # CRM screens (tabs)
    calls.tsx           # Calls list with AI sentiment + detail modal
    meetings.tsx        # Meetings list with AI summary + detail modal
  leaderboard.tsx       # Team leaderboard with podium

components/             # Shared UI components
  MetricCard.tsx        # KPI card with progress bar
  FilterBar.tsx         # Search + filter chips
  CandidateCard.tsx     # Candidate pipeline card
  CallCard.tsx          # Call/meeting list card
  LoadingSpinner.tsx    # Loading state
  EmptyState.tsx        # Empty/error state with optional action
  ScreenHeader.tsx      # Eyebrow + title + subtitle header
  SectionTitle.tsx      # Uppercase section label

context/
  AuthContext.tsx       # Auth state + login/logout

services/
  api.ts                # All API calls + TypeScript types

constants/
  Colors.ts             # IceBreakerBD color system + withAlpha helper
  Theme.ts              # Spacing, radius, typography, shadow tokens
  ApiConfig.ts          # Endpoints + candidate status config

hooks/
  useApi.ts             # Generic data-fetching hook
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`

### Install
```bash
cd kpi-tracker-mobile
npm install
```

### Configure environment
```bash
cp .env.example .env
# Set EXPO_PUBLIC_API_BASE_URL=https://app.icebreakerbd.com
```

### Run
```bash
# Web (recommended for development)
npm run web

# iOS simulator
npm run ios

# Android emulator
npm run android
```

---

## Backend API Notes

The Flask backend serves HTML via Jinja2 templates. The following JSON endpoints already exist and are used by this app:

| Endpoint | Returns |
|---|---|
| `GET /api/leaderboard` | Leaderboard JSON |
| `GET /api/calls` | Calls list JSON |
| `GET /api/meetings` | Meetings list JSON |
| `GET /api/call_analysis/:id` | Call with AI analysis |
| `GET /api/candidates` | Candidates list JSON |
| `GET /api/candidates/filters` | Filter options |

### Endpoints that still need to be added to Flask

For the full mobile experience, add these JSON endpoints to the backend:

```python
GET   /api/me                         # Return current_user as JSON
GET   /api/dashboard                  # Role-scoped KPI metrics
GET   /api/jobs                       # Jobs list
GET   /api/recruiting/analytics       # Recruiting funnel stats
PATCH /api/candidates/<id>/status     # Update candidate status
POST  /auth/logout                    # Clear session cookie
```

Until these endpoints are live, screens gracefully fall back to mock data
so the UI can be designed and reviewed end-to-end.

---

## Auth Flow

On **web**: the app redirects to `/login` on the Flask backend, which handles Google OAuth and sets a session cookie. After login the cookie is shared with API calls.

On **native (iOS/Android)**: `expo-web-browser` opens the Flask Google OAuth flow in an in-app browser. After completion, the session cookie is captured and stored in AsyncStorage for subsequent API calls.

> For native deep-link redirects to work properly, the Flask `/auth/callback` route needs to support a `redirect_uri` parameter pointing to `kpitracker://` (the app's scheme). This is a one-line change in `auth.py`.

---

## Design System

Colors are defined in `constants/Colors.ts`. The palette is:
- **Base**: Deep navy `#0F172A`
- **Card**: `#1E293B`
- **Primary**: Sky blue `#0EA5E9`
- **Accent**: Teal `#14B8A6`
- Semantic: success (green), warning (amber), danger (red)

---

## Screens by Role

| Role | Screens shown |
|---|---|
| `admin` | Dashboard, Performance, Employees, Targets, CRM, Leaderboard |
| `sdr` | My KPIs, Log Call, Log Meeting, CRM, Leaderboard |
| `recruiter` | Candidates, Jobs, Analytics, Candidate Detail |
| `employee` | SDR Dashboard (timesheet features TBD) |
