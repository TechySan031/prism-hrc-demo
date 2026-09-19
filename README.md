# Prism HRC AI Resume Platform — Frontend Demo

A high-fidelity, interactive frontend demo for **Prism HRC AI Resume Platform**, designed and built to showcase the end-to-end user experience for recruitment candidates, job seekers, and staffing recruiters.

---

## 🌟 Overview

The **Prism HRC AI Resume Platform** is an enterprise-grade AI resume studio tailored to Prism HRC's staffing and recruitment ecosystem. It provides intelligent resume building, automated ATS scoring, deep multi-dimensional analysis, proactive AI bullet enhancement, role-based job matching, and multi-template export.

This repository hosts the **complete interactive frontend demo** — fully functional with mock data and services cleanly isolated behind service contracts for future API integration.

---

## 🚀 Key Features & Main User Journey

1. **Landing Page (`/`)**:
   - Modern enterprise hero aligned with Prism HRC branding (teal, navy, warm neutrals).
   - Value proposition, live template showcase, interactive stats, feature highlights, and clear CTAs.

2. **Authentication Flow (`/login`, `/signup`)**:
   - One-click **Demo Account** instant login.
   - Realistic email/password forms with validation and demo feedback.

3. **Candidate Dashboard (`/dashboard`)**:
   - Overview of candidate resumes, recent ATS scores, quick action cards, and analysis history.
   - Instant actions: Edit, Duplicate, Delete, Download, and Start New Resume.

4. **Interactive Resume Builder (`/builder/[resumeId]`, `/builder/new`)**:
   - **Split Screen Layout**: Real-time side-by-side editing and live resume rendering.
   - **Full Section Editing**: Personal Info, Summary, Experience, Education, Skills, Projects, Certifications, Achievements, Languages.
   - **Reordering & Visibility**: Drag/move sections up and down, toggle visibility on/off.
   - **AI Assistant Drawer**: In-line AI bullet enhancement, action verb suggestions, and metric quantification suggestions.
   - **Auto-save & Status Indicators**: Visual feedback for drafts and saved states.

5. **Live Multi-Template Preview & Customization**:
   - **ATS Professional**: Clean, high-parsing rate traditional layout.
   - **Modern Split**: Contemporary dual-column layout with visual emphasis.
   - **Minimal Executive**: Elegant typography-driven layout for senior leadership.
   - **Dynamic Customizer**: Live font size, section spacing, accent color palettes, and margin controls.

6. **AI Resume Analyzer (`/analyzer/upload`, `/analyzer/[analysisId]`)**:
   - Simulated upload and multi-stage extraction pipeline with realistic animations.
   - Comprehensive ATS report with circular score ring and category breakdowns (Impact, Brevity, Structure, Skills).
   - Interactive recommendation cards with one-click **"Apply to Resume"** demo actions.
   - **Missing Information Flow**: Guided Q&A prompt to extract quantifiable accomplishments.

7. **Job Matching Studio (`/job-match`)**:
   - Paste job descriptions to evaluate keyword match score, missing skills, keyword frequency, and targeted enhancement advice.

8. **Export Center (`/export`)**:
   - Multi-format simulation: PDF (print-ready ATS), Word (DOCX), and Plain Text.
   - Realistic export progression and instant client-side download simulation.

9. **Templates Gallery (`/templates`)**:
   - Visual catalog of all templates with category filtering and instant preview.

10. **Pricing & Plans (`/pricing`)**:
    - Transparent tiers (Free Candidate, Pro Career, Recruiter Enterprise) with interactive mock checkout.

11. **Settings (`/settings`) & Recruiter/Admin Dashboard (`/admin`)**:
    - Account settings, notifications, demo reset.
    - Recruiter portal with candidate candidate metrics, template usage analytics, and platform controls.

12. **Floating Demo Control Toolbar**:
    - Persistently accessible floating widget to switch between candidate personas, toggle Admin/Recruiter mode, simulate network delay, or reset demo state.

---

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript 5 (Strict mode)
- **Styling**: Tailwind CSS v4 + Custom Prism HRC Design Tokens
- **Icons**: Lucide React
- **State Management**: React Context + useReducer with LocalStorage persistence
- **Architecture**: Modular Service Interface Pattern (Ready for REST / GraphQL backend)

---

## 🏁 Getting Started

### Prerequisites
- Node.js 18.18+ or 20+
- npm or yarn

### Installation

```bash
# Clone or navigate to the project directory
cd prism-hrc-resume-studio

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Scripts

- `npm run dev` — Starts local Turbopack development server on port 3000.
- `npm run build` — Builds the optimized production application.
- `npm run start` — Runs the production build locally.
- `npm run lint` — Runs ESLint checks across `src/`.
- `npx tsc --noEmit` — Validates TypeScript types across the entire codebase.

---

## 📁 Project Structure

```
prism-hrc-resume-studio/
├── docs/                             # Architecture & Demo Documentation
│   ├── frontend-demo.md              # User flows & interactive demo guide
│   ├── component-map.md              # Design system & component hierarchy
│   ├── mock-data.md                  # Mock models & schema documentation
│   └── future-api-integration.md     # Backend API contracts & integration guide
├── public/                           # Static assets
├── src/
│   ├── app/                          # Next.js App Router routes
│   │   ├── admin/                    # Recruiter / Admin dashboard
│   │   ├── analyzer/                 # Upload & Analysis report pages
│   │   ├── builder/                  # Split-screen Resume Builder
│   │   ├── dashboard/                # User dashboard
│   │   ├── export/                   # Export configuration & download
│   │   ├── job-match/                # JD keyword matcher
│   │   ├── login/ & signup/          # Authentication flows
│   │   ├── pricing/                  # Subscription plans & mock checkout
│   │   ├── settings/                 # Profile & application settings
│   │   ├── templates/                # Template showcase catalog
│   │   ├── globals.css               # Design tokens & core styles
│   │   ├── layout.tsx                # Root layout with providers & demo controls
│   │   ├── page.tsx                  # Public landing page
│   │   └── providers.tsx             # Context provider wrapper
│   ├── components/
│   │   ├── builder/                  # ResumePreview, AIAssistant, section forms
│   │   ├── layout/                   # AppShell, Sidebar, Topbar, DemoControls
│   │   └── ui/                       # Button, Card, Badge, Modal, FormControls, etc.
│   ├── lib/
│   │   ├── context.tsx               # Global state management (useApp hook)
│   │   └── mock/                     # Mock data sets and mock API services
│   └── types/                        # TypeScript definitions (resume, analysis, user)
```

---

## 🎨 Design System

Colors and visual styling are derived directly from the **Prism HRC** brand:
- **Brand Primary Teal**: `#3b7a8c` (Light: `#f0f7f9`, Dark: `#1e3742`)
- **Brand Secondary Coral/Gold**: Warm accent highlights for CTAs and status tags
- **Enterprise Navy**: `#0f1b2d` / `#1e293b` for crisp typography and executive chrome
- **Warm Canvas**: `#fdfcfb` / `#fafaf8` for eye-friendly, paper-like reading surfaces
