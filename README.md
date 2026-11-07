# GRANTLY — Unified Scholarship Discovery & Management Platform

> Unified Scholarship Discovery & Management Platform • Built for Higher Education Financial Aid

GRANTLY is a modern, region-neutral unified scholarship discovery and management platform designed to help international and domestic students navigate educational financial aid through one transparent, organized workspace:

$$\textbf{Discover} \longrightarrow \textbf{Understand} \longrightarrow \textbf{Match} \longrightarrow \textbf{Save} \longrightarrow \textbf{Apply} \longrightarrow \textbf{Track}$$

---

## Chapter 02 Highlights

### 1. Region-Neutral Product Architecture
- **International Data Model**: Does not hardcode US or Indian grading/aid standards. First-class support for diverse currencies (USD, EUR, GBP, CAD, INR, SGD), education levels (High School, Undergraduate, Master's, Doctorate, Vocational), and grading scales (GPA 4.0, GPA 5.0, Percentage).
- **Independent Currency Handling**: Never sums incomparable currencies together; provides localized formatting (`$`, `€`, `£`, `CA$`, `₹`, `S$`) with explicit ISO currency badges.
- **Honest Sample Data Attribution**: Visibly labels all fictional scholarships and entities as simulated prototype records, avoiding misleading verification claims.

### 2. Comprehensive Scholarship Discovery (`/scholarships`)
- **Fast Full-Text Search**: Live keyword search indexing titles, providers, descriptions, categories, and tags with keyboard shortcut `/` to focus.
- **Multi-Attribute Filter Drawer**:
  - Study level (Undergraduate, Master's, Doctorate, Vocational)
  - Region & destination matching (Global, North America, Europe, Asia, etc.)
  - Award structure (One-time, Renewable, Full Tuition)
  - Funding range presets
  - Academic & need-based requirements
  - Bookmarked-only filter toggle
- **Deterministic Multi-Sort**: Sort by Deadline (Urgent first), Award Amount (High to Low / Low to High), or Match Relevance Score.
- **Deep Scholarship Detail Modal**: Complete breakdown of funding terms, renewal conditions, target levels, disbursement schedules, required document checklists, and application instructions.

### 3. Deterministic Explainable Eligibility Matching Engine
- **Pure Rule Evaluation**: Located in `src/features/eligibility/services/eligibilityEngine.ts`, evaluating student profile attributes against scholarship criteria without external hallucinating AI calls.
- **Structured Assessment Statuses**:
  - `strong_match`: All mandatory eligibility criteria satisfied (Score $\ge 80$).
  - `potential_match`: Minor gaps or partial alignment (Score $50\text{--}79$).
  - `not_eligible`: Fails one or more strict mandatory requirements (Score $< 50$).
- **Explainable Breakdown**: Dissects each requirement into **Satisfied Criteria**, **Failed Criteria**, and **Missing Profile Information** with clear rationales.
- **Informational Estimate Disclaimer**: Prominently informs students that match determinations are estimates based on self-reported data and do not guarantee selection.

### 4. Region-Neutral Student Profile (`/profile`)
- **Configurable Attributes**: Country of residence, nationality, region/state, preferred study destinations, current institution, education level, field of study, and flexible academic scoring (GPA 4.0, 5.0, percentage).
- **Optional Circumstances**: First-generation college student indicator and financial need declaration.
- **Profile Completion Tracker**: Dynamic visual progress indicator guiding students to complete their information for better matching.

### 5. Robust Persistence & Cross-View Sync
- **Safe Storage Service**: `src/services/storage.ts` provides a resilient `localStorage` wrapper that gracefully catches `QuotaExceededError` or JSON parse errors without crashing the app.
- **Isolated Saved Service**: `src/features/saved/services/savedService.ts` maintains bookmarks independently from application workflow stages. Emits custom `grantly:saved_changed` DOM events for instant multi-component reactivity.
- **Profile Service**: `src/features/profile/services/profileService.ts` persists student profile edits and broadcasts `grantly:profile_changed` events across active views.

### 6. Power-User Keyboard Shortcuts
- `/`: Quickly focuses search inputs on discovery views.
- `Escape`: Closes detail modals, drawers, and command overlays with focus restoration.
- `Ctrl + K` or `Cmd + K`: Opens the global **Command Palette** to navigate across pages (`/`, `/scholarships`, `/profile`, `/dashboard`), search scholarships directly, or jump to actions.

### 7. Audited & Stabilized Foundation
- **Dynamic Date Calculations**: Replaced hardcoded default dates with dynamic date-only calculations (`calculateDaysRemaining`) that handle passed deadlines accurately without rendering `0 days remaining`.
- **Accessible UI Primitives**: Modal focus trapping and focus restoration to the trigger element on close; multi-modal urgency indicators pairing color with text and icons.
- **Brand Monogram Favicon**: Replaced generic Vite logo with custom emerald & forest GRANTLY monogram icon.

---

## Project Structure

```
src/
  app/
    App.tsx                     # React Router 7 setup (/, /scholarships, /profile, /dashboard, 404)
    providers.tsx               # Root application providers
  components/
    shared/
      CommandPalette.tsx        # Global Ctrl+K / Cmd+K command menu
      DemoNotice.tsx            # Prototype sample-data notice banner
      Footer.tsx                # Region-neutral educational finance footer
      Header.tsx                # Accessible navigation bar with mobile drawer
    ui/
      Badge.tsx                 # Category, urgency, and status badges
      Button.tsx                # Accessible button component with variants
      Card.tsx                  # Elevated card component with warm neutral styling
      Input.tsx                 # Accessible search and text input
      Modal.tsx                 # Focus-trapped accessible dialog
  features/
    dashboard/
      components/               # Dashboard layout, metrics, deadlines timeline, insights
      data/
        mockNotifications.ts    # Demo notification dataset
        mockScholarships.ts     # Chapter 01 pipeline dataset (fully typed)
        mockStudentProfile.ts   # Demo profile dataset
      pages/
        DashboardPage.tsx       # Application dashboard (/dashboard)
      types/
        dashboard.ts
    eligibility/
      components/
        EligibilityBadge.tsx    # Visual match rating badge (Strong, Potential, Not Eligible)
        EligibilityBreakdownCard.tsx # Detailed explainable criteria breakdown
      services/
        eligibilityEngine.ts    # Deterministic explainable matching engine
        eligibilityEngine.test.ts # Unit tests for pure eligibility rules
      types/
        eligibility.ts
    landing/
      components/               # Hero, How It Works, Benefits, Catalog preview, CTA
      pages/
        LandingPage.tsx         # Landing page (/)
    profile/
      components/
        ProfileForm.tsx         # Region-neutral profile editor
      data/
        defaultProfile.ts       # Default student profile
      pages/
        ProfilePage.tsx         # Profile workspace (/profile)
      services/
        profileService.ts       # Profile persistence & event dispatcher
        profileService.test.ts  # Profile storage tests
      types/
        profile.ts
    saved/
      services/
        savedService.ts         # Bookmarks persistence & event dispatcher
        savedService.test.ts    # Saved items tests
    scholarships/
      components/
        ScholarshipCard.tsx     # Card with currency, deadlines, match badge, save toggle
        ScholarshipDetailsView.tsx # Deep inspection modal for scholarships
        ScholarshipFilterDrawer.tsx # Multi-attribute filter sidebar
      data/
        mockScholarships.ts     # 12 diverse international scholarships across 6 currencies
      hooks/
        useScholarshipFilters.ts # Search, multi-facet filtering, deterministic sorting
        useScholarshipFilters.test.ts # Filter & sort unit tests
      pages/
        DiscoveryPage.tsx       # Comprehensive scholarship discovery (/scholarships)
      types/
        scholarship.ts          # Central scholarship data model
  hooks/
    useReducedMotion.ts         # Respects prefers-reduced-motion media query
    useScholarshipPipeline.ts   # Chapter 01 pipeline state & metrics hook
    useScholarshipPipeline.test.ts # Pipeline test suite
  lib/
    utils.ts                    # Dynamic date math, currency formatting, classnames
    utils.test.ts               # Date math & multi-currency unit tests
  services/
    storage.ts                  # Fault-tolerant localStorage wrapper
    storage.test.ts             # Storage resilience unit tests
  styles/
    index.css                   # Single global stylesheet with Tailwind CSS v4 design tokens
  main.tsx                      # Application bootstrap entry point
```

---

## Available Scripts

- `npm run dev`: Start Vite development server at `http://localhost:5173`.
- `npm run build`: Typecheck with TypeScript (`tsc -b`) and bundle for production (`vite build`).
- `npm run lint`: Lint source files using ESLint.
- `npm test`: Run automated Vitest test suite.
- `npm run preview`: Preview the production build locally.
