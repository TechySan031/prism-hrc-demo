# Prism HRC AI Resume Platform — Future API Integration Guide

This guide describes how the current mock services layer in `src/lib/mock/services.ts` can be seamlessly transitioned to production REST/GraphQL backends and AI model endpoints.

---

## 🔌 The Service Interface Pattern

The entire frontend demo interacts with business logic exclusively through isolated service contracts located in `src/lib/mock/services.ts`:

1. `resumeService` — CRUD operations for candidate resumes.
2. `analysisService` — ATS parsing, scoring, and recommendation generation.
3. `aiService` — LLM-powered bullet enhancement, question generation, and rewriting.
4. `jobMatchService` — Resume vs. Job Description semantic comparison.
5. `authService` — Authentication, session tokens, and role authorization.

To connect to a live backend, developers only need to replace the implementations in `services.ts` (or swap with an environment-based service factory) without changing any UI component code.

---

## 🛠 Target API Specifications

### 1. Resume Management (`resumeService`)

```typescript
// Replace mock implementation with API client:
export const resumeService = {
  async getResumes(): Promise<Resume[]> {
    const res = await apiClient.get('/api/v1/resumes');
    return res.data;
  },

  async getResumeById(id: string): Promise<Resume | null> {
    const res = await apiClient.get(`/api/v1/resumes/${id}`);
    return res.data;
  },

  async saveResume(resume: Resume): Promise<Resume> {
    const res = await apiClient.put(`/api/v1/resumes/${resume.id}`, resume);
    return res.data;
  },

  async createResume(resume: Omit<Resume, 'id' | 'createdAt' | 'updatedAt'>): Promise<Resume> {
    const res = await apiClient.post('/api/v1/resumes', resume);
    return res.data;
  },

  async deleteResume(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/resumes/${id}`);
  }
};
```

### 2. AI Intelligence Endpoints (`aiService` & `analysisService`)

#### `POST /api/v1/ai/enhance-bullet`
- **Request Body**:
  ```json
  {
    "bulletText": "Designed and maintained UI components for the web app.",
    "roleTitle": "Senior Product Designer",
    "goal": "add_metrics"
  }
  ```
- **Response**:
  ```json
  {
    "suggestedText": "Architected and maintained a multi-brand design system of 120+ components, accelerating feature shipping velocity by 35% across 8 squads.",
    "explanation": "Added quantifiable scope (120+ components, 8 squads) and business outcome (35% velocity boost).",
    "action": "add_metrics"
  }
  ```

#### `POST /api/v1/ai/analyze-resume`
- **Payload**: Multi-part form data containing the uploaded PDF/DOCX file, or JSON payload containing the structured `Resume` object.
- **Response**: Full `AnalysisReport` conforming to `src/types/analysis.ts`.

### 3. PDF Generation & Export Architecture

While the frontend demo provides a client-side visual simulation, production export can be handled in two ways:

1. **Client-Side Headless Print**:
   - Using CSS print media queries (`@media print`) already structured in `ResumePreview.tsx`.
   - Native browser `window.print()` rendering directly to high-DPI vector PDF.
2. **Server-Side Chromium Rendering**:
   - Sending HTML or Resume JSON to a serverless worker running `@sparticuz/chromium` or Puppeteer.
   - Generates pixel-perfect, selectable, ATS-parsable PDF binaries with embedded metadata.

---

## 🔒 Authentication & Multi-Tenancy

Prism HRC plans to integrate this tool into its central staffing ecosystem:
- **Single Sign-On (SSO)**: The `authService` can easily be adapted for OAuth2 / OpenID Connect (e.g. NextAuth / Auth0 / Supabase / Prism HRC Central Auth).
- **Candidate Sharing**: Admin / Recruiter mode (`isAdmin`) will query recruiter-scoped candidate rosters via `/api/v1/recruiter/candidates`.

---

## ⚙️ Environment Variables Roadmap

When moving to production, define the following variables in `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.prismhrc.com
NEXT_PUBLIC_AI_GATEWAY_URL=https://ai.prismhrc.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_ENABLE_MOCKS=false
DATABASE_URL=postgresql://user:password@host:5432/prism_resume_studio
```
