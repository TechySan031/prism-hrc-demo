# Prism HRC AI Resume Platform — Component & Architecture Map

This document catalogues the UI and layout architecture, component hierarchy, and design system tokens used across the application.

---

## 🏗 Component Hierarchy

```
src/
├── app/                              # Route Pages (App Router)
│   ├── layout.tsx                    # Root HTML, Fonts, Global Toast container
│   ├── page.tsx                      # Public Landing Page
│   ├── login/page.tsx                # Candidate Login
│   ├── signup/page.tsx               # Candidate Registration
│   ├── pricing/page.tsx              # Pricing Matrix & Mock Checkout Modal
│   ├── dashboard/page.tsx            # Protected: Candidate Hub
│   ├── builder/                      
│   │   ├── new/page.tsx              # New Resume initiator
│   │   └── [resumeId]/page.tsx       # Main Split-Screen Builder
│   ├── analyzer/
│   │   ├── upload/page.tsx           # Multi-stage dropzone
│   │   └── [analysisId]/page.tsx     # Comprehensive ATS Scorecard
│   ├── job-match/page.tsx            # JD Keyword Matcher
│   ├── templates/page.tsx            # Template Gallery
│   ├── export/page.tsx               # File format generator
│   ├── settings/page.tsx             # User preferences & privacy
│   └── admin/page.tsx                # Recruiter portal
│
├── components/
│   ├── layout/                       # Layout & Navigation
│   │   ├── AppShell.tsx              # Protected layout wrapper with Sidebar & Topbar
│   │   ├── Sidebar.tsx               # Primary vertical navigation (collapsible)
│   │   ├── Topbar.tsx                # Global header with candidate profile & quick links
│   │   └── DemoControls.tsx          # Floating demo switcher & reset controls
│   │
│   ├── builder/                      # Builder Feature Components
│   │   ├── ResumePreview.tsx         # Real-time multi-template renderer (ATS, Modern, Minimal)
│   │   └── AIAssistant.tsx           # Drawer for AI rewrites, tone changes, action verbs
│   │
│   └── ui/                           # Reusable UI Primitives
│       ├── Button.tsx                # Primary, secondary, outline, ghost, danger, sizes
│       ├── Card.tsx                  # Standard, elevated, flat, interactive cards
│       ├── FormControls.tsx          # Input, Textarea, Select, Checkbox, Switch, Label
│       ├── States.tsx                # Badge, ProgressBar, ScoreRing, StepIndicator, EmptyState, ErrorState
│       └── Toast.tsx                 # Modal dialogs, confirmation dialogs, toast notifications
```

---

## 🧩 UI Primitives Guide

### `Button`
- **Variants**: `primary` (Prism teal), `secondary` (warm outline), `outline`, `ghost`, `danger`, `prism` (high-emphasis gradient).
- **Sizes**: `sm`, `md`, `lg`.
- **States**: Supports `loading` (animated spinner), `disabled`, leading/trailing icon slots.

### `Card`
- **Variants**: `default` (subtle border with warm shadow), `elevated` (interactive hover lift), `flat` (background-only), `interactive` (clickable card).

### `FormControls`
- **`Input`**: Accessible input with optional label, helper text, error message, and icon slots.
- **`Textarea`**: Auto-resizing textarea with character count support.
- **`Select`**: Custom styled dropdown selector.
- **`Switch`**: Smooth toggle switch for binary options.

### `States & Data Visualization`
- **`ScoreRing`**: Circular SVG progress meter with animated stroke and color thresholds (Green ≥ 85, Amber 60–84, Red < 60).
- **`ProgressBar`**: Horizontal bar with smooth width transitions and label support.
- **`Badge`**: Status indicators (`success`, `warning`, `error`, `info`, `neutral`, `prism`).
- **`StepIndicator`**: Multi-step numbered stepper for wizard workflows (Upload → Parse → Score).
- **`EmptyState` & `ErrorState`**: Standardized fallback views with illustrations, explanatory copy, and recovery buttons.

---

## 🎨 Design Tokens & Theme Configuration

Defined in `src/app/globals.css` using CSS custom properties:

| Category | Token | Value | Description |
|---|---|---|---|
| **Prism Teal** | `--prism-50` | `#f0f7f9` | Light background tint |
| | `--prism-500` | `#3b7a8c` | Core Prism HRC brand color |
| | `--prism-700` | `#244e5c` | Active/Hover state for primary buttons |
| | `--prism-900` | `#1e3742` | Dark brand accent |
| **Warm Canvas** | `--neutral-25` | `#fdfcfb` | Primary paper canvas |
| | `--neutral-100` | `#f5f3ef` | Light card backgrounds |
| | `--neutral-200` | `#e8e5df` | Divider lines & borders |
| **Typography Navy** | `--navy-700` | `#1e293b` | Body and subheading text |
| | `--navy-800` | `#0f1b2d` | Primary headings & high-contrast titles |
| **Functional** | `--success` | `#22885a` | ATS score pass & verified skills |
| | `--warning` | `#e08b1a` | Medium priority recommendations |
| | `--danger` | `#c93b3b` | Critical errors & high priority fixes |

---

## 📄 Resume Template Architecture

All templates render dynamically within `ResumePreview.tsx` using the unified `Resume` data model:

1. **`ats-professional`**:
   - Single-column layout.
   - Standard chronological ordering.
   - High-contrast typography with clear divider rules.
   - Certified parsing compatibility with legacy ATS parsers (Taleo, Workday, Greenhouse).

2. **`modern-split`**:
   - Two-column asymmetric layout (35% left sidebar, 65% right main stream).
   - Sidebar hosts contact details, core competencies, education, and language badges.
   - Main column hosts executive summary, work history with bold metrics, and projects.

3. **`minimal-executive`**:
   - Centered executive header.
   - Subtle geometric spacers.
   - Emphasis on leadership competencies, board positions, and strategic revenue impacts.
