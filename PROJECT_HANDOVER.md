# Project Handover – CampusBuddy Final Frontend

## 1️⃣ Overview
The **CampusBuddy** application is a modern React/Next.js web‑app that provides:
- **Student dashboard** (fees, attendance, results, credentials)
- **AI‑Hub** with autonomous career‑agent, mock‑interview, and chat features
- **Blockchain credential minting** (stores cryptographic proof in Supabase)
- **PWA** support with a custom Service Worker (`public/sw.js`)
- **Supabase** backend for auth, storage and data tables (`career_matches`, `credential_ledger`, …)

The repository lives at `e:\CampusBuddyFinal` and is deployed on **Vercel**.

---

## 2️⃣ Repository Structure
```
CampusBuddyFinal/
├─ .env.local                # Supabase and AI API keys (never commit)
├─ app/                      # Next.js app routes (dashboard, api, …)
│   └─ dashboard/            # UI sections
│       ├─ ai-hub/           # AI career, interview, mock interview
│       ├─ credentials/      # Minting blockchain credentials
│       └─ fees/             # Payment history UI
├─ components/               # Re‑usable UI components (ChatInterface, …)
├─ lib/                       # Supabase client helper
├─ public/                    # Static assets + Service Worker (sw.js)
├─ supabase/                  # SQL schema files for Phase 3 (career_matches, …)
├─ next.config.ts             # Next config (output, headers, etc.)
├─ package.json & lockfile    # Dependencies (React 18, Next 16, Supabase SDK)
└─ README.md                 # High‑level project description
```

---

## 3️⃣ Setup & Development
1. **Clone & install**
   ```bash
   git clone https://github.com/Orsted10/Campus-Buddy-Final-Frontend.git
   cd CampusBuddyFinal
   npm ci
   ```
2. **Environment variables** – copy the example and fill in your own keys:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with:
   #   NEXT_PUBLIC_SUPABASE_URL
   #   NEXT_PUBLIC_SUPABASE_ANON_KEY
   #   SUPABASE_SERVICE_ROLE_KEY (server‑side only)
   #   GROQ_API_KEY, GOOGLE_GEMINI_API_KEY, OPENROUTER_API_KEY
   ```
3. **Run locally**
   ```bash
   npm run dev   # starts Next dev server at http://localhost:3000
   ```
4. **Supabase schema** – apply Phase 3 tables:
   ```bash
   psql < supabase/phase3_career_agent.sql
   # also run any other migration files under supabase/
   ```

---

## 4️⃣ Build & Deployment
* **Vercel** – continuous deployment is configured via the `vercel.json` and the GitHub repo. The Next.js build runs:
  ```bash
  npm run build
  ```
* **PWA** – `public/sw.js` implements a Network‑first strategy for API routes and Cache‑first for static assets. After a fresh deploy, clear the browser cache or do a hard refresh (`Ctrl+Shift+R`).
* **Service‑worker cache busting** – the `CACHE_NAME` constant is versioned (`campus-buddy-v1`). Increment it when making breaking changes to assets.

---

## 5️⃣ Core Features & Important Files
| Feature | Key Files | Description |
|---------|-----------|-------------|
| **Authentication** | `lib/supabase/client.ts` | `createBrowserClient` with PKCE flow. Memoized client in pages to avoid auth‑lock race conditions. |
| **AI Career Agent** | `app/dashboard/ai-hub/career/page.tsx` | Fetches `career_matches` from Supabase, displays cover letters, allows copy & apply actions. Uses `useMemo` for Supabase client and `fetchMatches` with error handling. |
| **Credentials Minting** | `app/dashboard/credentials/page.tsx` | Generates a cryptographic hash of the user’s profile and stores it in `credential_ledger`. Updated to use memoized Supabase client. |
| **Chat Interface** | `components/chat/ChatInterface.tsx` | Connects to `/api/ai/interview` route, passes user profile via `usePortalStore`. |
| **Service Worker** | `public/sw.js` | Offline‑first PWA with API cache fallback. |
| **Supabase Migrations** | `supabase/phase3_career_agent.sql` | Creates `career_matches` table and row‑level security policy. |
| **Design System** | `components/*` | Uses Tailwind‑based utility classes, glassmorphism containers, and Framer Motion animations for premium UI. |

---

## 6️⃣ Known Issues / Gotchas
- **403 errors** from Supabase when the auth session isn’t restored. Ensure the Supabase client is memoized and wait for `auth.getSession()` before any DB query (as fixed in `career/page.tsx`).
- **Service‑worker cache** can serve stale bundles; after each deployment, perform a hard refresh or clear site data.
- **Windows PowerShell execution policy** may block `npm` scripts; run PowerShell as Administrator and set `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` if needed.
- **Large 3‑D assets** for the holographic campus will require a CDN (e.g., Vercel Edge or AWS S3) and streaming support.

---

## 7️⃣ Future Work & Roadmap
1. **Phase 3 – Holographic Navigation**
   - Obtain LiDAR scans or export existing BIM models.
   - Store meshes in Supabase storage bucket (or external CDN).
   - Build a WebGL/Three.js viewer that consumes the geometry via a new API endpoint.
2. **AI‑driven Career Automation**
   - Replace manual `fetchMatches` demo data with a daily cron job (Render.com) that scrapes LinkedIn and populates `career_matches`.
   - Integrate Groq Llama 3.1 to generate cover letters server‑side.
3. **Enhanced Accessibility** – voice‑over support, dark‑mode theming, and screen‑reader friendly components.
4. **Testing** – add unit tests for Supabase helpers and integration tests for the PWA offline flow.

---

## 8️⃣ Contacts & Ownership
- **Project Lead**: Ankan (GitHub: `Orsted10`)
- **Backend (Supabase) Admin**: [Name/Email]
- **Design System**: Based on custom Tailwind components, see `components/` folder.
- **Repository**: `https://github.com/Orsted10/Campus-Buddy-Final-Frontend`

---

*This handover document is intended for developers taking over the CampusBuddy frontend. It captures the current architecture, setup steps, key files, known issues, and next‑step roadmap.*
