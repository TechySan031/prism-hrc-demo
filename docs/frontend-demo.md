# Prism HRC AI Resume Platform — Frontend Demo Guide

This document outlines the complete interactive user journey implemented in the frontend demo, details the testing paths, and explains how to demonstrate all features to stakeholders.

---

## 🧭 Primary Demo Journey

The application is structured around a natural candidate conversion and resume improvement lifecycle:

```
Landing Page (/)
       │
       ▼ [Click "Get Started" or "Demo Login"]
Candidate Dashboard (/dashboard)
       │
       ├─────────────────────────────────────────┐
       ▼ [Click "Edit Resume" on Sarah Jenkins]  ▼ [Click "Upload Resume"]
Resume Builder (/builder/resume-1)        Resume Analyzer (/analyzer/upload)
       │                                         │
       ├─ Edit Personal, Summary, Experience     ▼ [Simulated Upload & Extraction]
       ├─ Reorder sections & toggle visibility   Analysis Report (/analyzer/analysis-1)
       ├─ Open AI Assistant for bullet rewrites  │
       ├─ Switch templates (ATS / Modern / Mini) ├─ Inspect Category Scores (Ring chart)
       ├─ Tweak fonts, margins & colors          ├─ Review ATS Recommendations
       │                                         ├─ Click "Apply" to update resume
       ▼ [Click "Export"]                        ├─ Answer Missing Info Q&A
Export Studio (/export)                          └─ Click "Edit Resume"
       │
       ▼ [Select PDF / DOCX and Download]
Simulated Download Completed
```

---

## 🔍 Detailed Walkthrough of Pages

### 1. Landing Page (`/`)
- **Visuals**: Aligned with Prism HRC's corporate aesthetic. High-contrast hero section with value propositions, trust metrics, and responsive navigation.
- **Key Actions**:
  - **"Try Demo" / "Get Started"**: Instantly logs in as the pre-configured demo candidate (Sarah Jenkins) and redirects to `/dashboard`.
  - **"See Templates"**: Jumps to the interactive template showcase section or navigates to `/templates`.
  - **Feature Matrix**: Explains ATS scanning, AI enhancements, role matching, and recruiter insights.

### 2. Candidate Dashboard (`/dashboard`)
- **Features**:
  - **Candidate Hero Card**: Shows candidate profile, current subscription plan (Pro Career), and aggregate profile strength (92%).
  - **Active Resumes Grid**:
    - *Sarah Jenkins — Senior Product Designer* (Score: 92)
    - *Alex Rivera — Full Stack Engineer* (Score: 84)
    - *Elena Rostova — VP of Operations* (Score: 78)
  - **Per-Resume Actions**:
    - **Edit**: Launches builder with selected resume.
    - **Duplicate**: Creates a fresh clone with modified title in LocalStorage.
    - **Delete**: Prompts a safe confirmation dialog before removal.
    - **Download**: Directly triggers export workflow.
  - **Quick Stats & Analysis History**: Shows past ATS scan records with date and score tags.

### 3. Split-Screen Resume Builder (`/builder/[resumeId]`)
- **Left Panel (Editor)**:
  - Tabbed or accordion sections: Personal Information, Professional Headline, Summary, Work Experience, Education, Skills, Projects, Certifications, Achievements, Languages.
  - Form fields include auto-expanding textareas, skill tags, date inputs, and company/title metadata.
  - **AI Assistant Integration**: Any bullet point or summary has a "Sparkles" button that opens the AI Assistant drawer.
  - **Section Reordering & Visibility**: Use up/down chevron buttons to rearrange order; eye icon to show/hide sections.
  - **Live Status**: Displays auto-saved timestamp and save button.
- **Right Panel (Live Preview)**:
  - **Instant Rendering**: All edits in the left form reflect immediately in the right pane without lag.
  - **Template Switcher**: Toggle between **ATS Professional**, **Modern Split**, and **Minimal Executive**.
  - **Styling Customizer**: Adjust font size (compact/regular/large), section spacing, and accent color palettes.
  - **Mobile Responsive**: On mobile viewports, toggles seamlessly between "Editor" and "Preview" tabs.

### 4. AI Assistant Drawer
- Located within the Resume Builder.
- Provides 3 candidate rewrites per bullet:
  1. *Impact-driven with quantifiable metrics*
  2. *Action-verb optimized for ATS parsing*
  3. *Concise & executive summary formulation*
- Clicking **"Apply Suggestion"** immediately replaces the text in the active editor field and triggers a notification toast.

### 5. Resume Analyzer (`/analyzer/upload` & `/analyzer/[analysisId]`)
- **Upload Screen**: Drag-and-drop zone with format hints (PDF, DOCX).
- **Processing State**: 4-stage visual progress animation: Uploading → Text Extraction → Keyword Scoring → ATS Report Generation.
- **Report View**:
  - SVG Score Ring with color-coded score (Green 90+, Amber 70-89, Red <70).
  - Detailed dimension breakdowns: Impact & Metrics, Brevity, Section Structure, and Hard Skills.
  - Interactive recommendations classified by priority (High, Medium, Low).
  - **Missing Info Wizard**: Modal Q&A that prompts for missing metrics (e.g. team size, revenue impact, tooling).

### 6. Job Match Studio (`/job-match`)
- Paste any target job description or click **"Load Sample JD"** (Senior Product Designer role).
- Evaluates resume match percentage against JD requirements.
- Displays matched skills (green badges), missing skills (amber/red badges), and recommendations for ATS keyword density.

### 7. Export Center (`/export`)
- Configure export format: PDF (ATS optimized), Word (.docx), or Plain Text (.txt).
- Set custom filename.
- Interactive progress bar simulating generation, followed by automatic browser download simulation.

### 8. Recruiter & Admin Dashboard (`/admin`)
- Accessible via the top bar or Demo Controls widget.
- Overview of platform metrics: active candidates, resumes created, ATS scans run, and template adoption rates.
- Feature toggle switches for experimental AI models, candidate sharing, and automated ATS rules.

---

## 🎛 Floating Demo Control Toolbar

A floating toolbar is fixed at the bottom right of the screen across all authenticated views. It allows instant demonstration of edge cases:

- **Persona Switcher**: Switch instantly between *Sarah Jenkins (Designer)*, *Alex Rivera (Engineer)*, and *Elena Rostova (Executive)*.
- **Admin/Recruiter Mode Toggle**: Toggle admin permissions on the fly to inspect recruiter-only analytics.
- **Network Simulation**: Toggle simulated latency (Fast / 1.5s delay) to show loading skeletons and spinner states.
- **Reset Demo Data**: One-click wipe of LocalStorage to restore all original pristine demo data.
