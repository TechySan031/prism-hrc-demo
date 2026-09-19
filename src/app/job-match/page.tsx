'use client';

import React, { useState } from 'react';
import { Target, CheckCircle, XCircle, AlertTriangle, Sparkles, Loader2 } from 'lucide-react';
import { Button, Card, Badge, Textarea } from '@/components/ui';
import { useApp } from '@/lib/context';

interface SkillMatch {
  skill: string;
  found: boolean;
  context?: string;
}

interface JobMatchResult {
  overallMatch: number;
  matchedSkills: SkillMatch[];
  missingSkills: SkillMatch[];
  relevantExperience: string[];
  suggestions: string[];
  warnings: string[];
  jobTitle?: string;
  company?: string;
}

export default function JobMatchPage() {
  const { state, addToast, dispatch } = useApp();
  const [jdText, setJdText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<JobMatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resume = state.currentResume ?? state.resumes[0];

  const handleAnalyze = async () => {
    if (!resume) {
      addToast('warning', 'Please select a resume first from the dashboard');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/job-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeId: resume.id,
          jobDescription: jdText,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === 'AI_NOT_CONFIGURED') {
          setError('AI provider is not configured. Please set AI_API_KEY in your .env file.');
        } else {
          setError(data.error || 'Failed to run job matching');
        }
        return;
      }

      setResult(data.matchResult);
      dispatch({ type: 'SET_USAGE', payload: { aiSuggestionsUsed: state.usage.aiSuggestionsUsed + 1 } });
    } catch {
      setError('Failed to connect to the server. Please check if the dev server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-navy-800">Job Description Matching</h1>
        <p className="text-sm text-warm-500 mt-1">Compare your resume against a specific job description</p>
      </div>

      {!resume && (
        <Card className="!bg-warn-light !border-amber-200 !p-4">
          <p className="text-sm text-warm-700">
            <AlertTriangle className="w-4 h-4 inline mr-1 text-warn" />
            No resume selected. Go to the <a href="/dashboard" className="text-prism-600 underline">dashboard</a> or <a href="/analyzer/upload" className="text-prism-600 underline">upload a resume</a> first.
          </p>
        </Card>
      )}

      {resume && !result && (
        <Card className="!p-6">
          {resume && (
            <div className="p-3 bg-warm-50 rounded-lg border border-border mb-4 flex items-center gap-3">
              <Target className="w-5 h-5 text-prism-500" />
              <div>
                <p className="text-sm font-medium text-navy-800">{resume.title}</p>
                <p className="text-xs text-warm-500">Selected for matching</p>
              </div>
            </div>
          )}

          <Textarea
            label="Paste Job Description"
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste the full job description here..."
            rows={8}
          />

          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex items-center justify-end mt-4">
            <Button onClick={handleAnalyze} loading={loading} disabled={!jdText.trim() || !resume} icon={<Target className="w-4 h-4" />}>
              {loading ? 'Analyzing...' : 'Analyze Match'}
            </Button>
          </div>
        </Card>
      )}

      {loading && (
        <Card className="!p-10 text-center">
          <Loader2 className="w-8 h-8 text-prism-500 animate-spin mx-auto mb-4" />
          <p className="text-base font-semibold text-navy-800">Analyzing job match...</p>
          <p className="text-sm text-warm-500 mt-1">Comparing your resume against the job description</p>
        </Card>
      )}

      {result && (
        <>
          {/* Match score */}
          <Card className="!p-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full border-4 border-prism-400 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-prism-600">{result.overallMatch}%</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-navy-800">
                  {result.jobTitle || 'Job Match Analysis'}
                </h2>
                {result.company && <p className="text-sm text-warm-500">{result.company}</p>}
                <Badge variant="prism" className="mt-2">Overall Match: {result.overallMatch}%</Badge>
              </div>
            </div>
          </Card>

          {/* Matched skills */}
          {result.matchedSkills.length > 0 && (
            <Card>
              <h2 className="text-base font-semibold text-navy-800 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" /> Matched Skills
                <Badge variant="success">{result.matchedSkills.length}</Badge>
              </h2>
              <div className="flex flex-wrap gap-2">
                {result.matchedSkills.map((s) => (
                  <Badge key={s.skill} variant="success">✓ {s.skill}</Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Missing skills */}
          {result.missingSkills.length > 0 && (
            <Card>
              <h2 className="text-base font-semibold text-navy-800 mb-3 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-error" /> Missing or Unverified Skills
                <Badge variant="error">{result.missingSkills.length}</Badge>
              </h2>
              <div className="flex flex-wrap gap-2">
                {result.missingSkills.map((s) => (
                  <Badge key={s.skill} variant="error">✗ {s.skill}</Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Relevant experience */}
          {result.relevantExperience.length > 0 && (
            <Card>
              <h2 className="text-base font-semibold text-navy-800 mb-3">Relevant Experience</h2>
              <ul className="space-y-2">
                {result.relevantExperience.map((exp, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-warm-700">
                    <CheckCircle className="w-4 h-4 text-prism-500 flex-shrink-0 mt-0.5" />
                    {exp}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Suggestions */}
          {result.suggestions.length > 0 && (
            <Card>
              <h2 className="text-base font-semibold text-navy-800 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-prism-500" /> Suggestions
              </h2>
              <ul className="space-y-2">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="text-sm text-warm-700 pl-4 border-l-2 border-prism-200">{s}</li>
                ))}
              </ul>
            </Card>
          )}

          {/* Warnings */}
          {result.warnings.length > 0 && (
            <Card className="!bg-warn-light !border-amber-200">
              <h2 className="text-sm font-semibold text-navy-800 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warn" /> Important
              </h2>
              <ul className="space-y-1">
                {result.warnings.map((w, i) => (
                  <li key={i} className="text-xs text-warm-700">• {w}</li>
                ))}
              </ul>
            </Card>
          )}

          <Button variant="secondary" onClick={() => setResult(null)}>
            Analyze another job description
          </Button>
        </>
      )}
    </div>
  );
}
