# Prism HRC AI Resume Platform — Mock Data & State Architecture

This document specifies the mock data models, schemas, and in-browser state management used throughout the frontend demo.

---

## 💾 State Management Architecture

State is managed globally via React Context and `useReducer` in `src/lib/context.tsx`:

- **Key State Properties**:
  - `user`: Currently active user profile (name, email, avatar, tier, usage limits).
  - `resumes`: Array of `Resume` objects loaded into the candidate's account.
  - `currentResume`: The resume actively being edited or previewed.
  - `analysisReport`: Latest ATS scan results and recommendation items.
  - `isAdmin`: Boolean flag unlocking Recruiter / Admin features.
  - `isSimulatingDelay`: Flag introducing realistic network latency to async mocks.
  - `toasts`: Active notification queue with auto-dismiss timers.
- **Persistence**:
  - State changes automatically synchronize to `localStorage` under the key `prism_hrc_resume_studio_state`.
  - Reloading or opening links in new tabs retains user edits and newly created resumes.
  - The **Demo Controls Toolbar** provides an instant **"Reset Demo Data"** action to return to pristine baseline data.

---

## 🗃 Mock Datasets

### 1. Pre-Configured Resumes (`src/lib/mock/resumes.ts`)

#### Resume 1: `resume-1` — Sarah Jenkins (Lead Product Designer)
- **Target Role**: Principal / Staff Product Designer
- **ATS Score**: 92 / 100
- **Highlights**:
  - 8+ years experience scaling design systems across 45+ product teams.
  - Reduced design-to-engineering handoff cycle time by 40%.
  - Comprehensive skills divided by Category: Design Systems, Prototyping, Research, Front-end.

#### Resume 2: `resume-2` — Alex Rivera (Full Stack Cloud Engineer)
- **Target Role**: Senior Full Stack / Cloud Architect
- **ATS Score**: 84 / 100
- **Highlights**:
  - Microservices migration on AWS & Kubernetes servicing 10M+ MAUs.
  - Golang, TypeScript, React, Docker, Terraform.

#### Resume 3: `resume-3` — Elena Rostova (VP of Global Operations)
- **Target Role**: Chief Operating Officer / VP Operations
- **ATS Score**: 78 / 100
- **Highlights**:
  - Multi-million dollar supply chain restructuring across 14 global territories.
  - Board member, strategic planning, EBITDA enhancement.

---

### 2. ATS Analysis Data (`src/lib/mock/analysis.ts`)

- **Overall Score**: 88 / 100
- **Category Scores**:
  - *Impact & Quantification*: 78 / 100 (Needs more numerical metrics on earlier roles)
  - *Brevity & Conciseness*: 94 / 100 (Clear, well-proportioned bullet lengths)
  - *Section Structure & Parsing*: 96 / 100 (Standard headings, chronological layout)
  - *Skill Relevance & Keyword Density*: 84 / 100 (Missing specific cloud / analytics tools)
- **Actionable Recommendations**:
  - High Priority: *"Quantify impact in Senior Product Designer role (e.g., % increase in user adoption or revenue metric)."*
  - Medium Priority: *"Add industry standard tool keywords: Figma Tokens, Design Tokens, WCAG 2.1 AAA."*
  - Low Priority: *"Trim earlier junior role bullet points to keep page length compact."*

---

### 3. AI Rewrite Suggestions (`src/lib/mock/analysis.ts`)

Each bullet point rewrite suggestion conforms to the `AIRewriteSuggestion` schema:
```typescript
interface AIRewriteSuggestion {
  id: string;
  field: string;
  original: string;
  suggested: string;
  explanation: string;
  action: 'improve_impact' | 'fix_grammar' | 'make_concise' | 'add_metrics';
  status: 'pending' | 'accepted' | 'rejected';
}
```

---

### 4. Job Matching Dataset (`src/lib/mock/job-match.ts`)

- **Target Job**: Senior Product Designer at FinTech Unicorn.
- **Match Score**: 86%
- **Matched Hard Skills**: Design Systems, Figma, Rapid Prototyping, Usability Testing, Cross-Functional Leadership.
- **Missing / Keyword Opportunities**: Micro-animations, Mixpanel, A/B Testing at Scale.
- **Tailoring Advice**: Specific suggested phrases to integrate into the summary and recent experience sections to maximize interview invitation probability.
