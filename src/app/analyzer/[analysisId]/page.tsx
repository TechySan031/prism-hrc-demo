'use client';

import React, { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle, AlertTriangle,
  ArrowRight, Sparkles, ChevronDown, ChevronUp, HelpCircle,
  Check, SkipForward
} from 'lucide-react';
import { useApp } from '@/lib/context';
import { Button, Card, Badge, ProgressBar, ScoreRing, Modal } from '@/components/ui';
import { mockAnalysisReport } from '@/lib/mock/analysis';
import { AnalysisRecommendation, AnalysisReport } from '@/types/analysis';

interface AnalysisPageProps {
  params: Promise<{ analysisId: string }>;
}

export default function AnalysisReportPage({ params }: AnalysisPageProps) {
  const { analysisId: _analysisId } = use(params);
  const { state, addToast, dispatch } = useApp();
  const router = useRouter();
  const report: AnalysisReport = state.analysisReport ?? mockAnalysisReport;
  const [expandedRec, setExpandedRec] = useState<string | null>(null);
  const [appliedRecs, setAppliedRecs] = useState<Set<string>>(new Set());
  const [missingInfoOpen, setMissingInfoOpen] = useState(false);
  const [missingInfoStep, setMissingInfoStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const priorityColors: Record<string, string> = {
    high: 'error',
    medium: 'warning',
    low: 'info',
  };

  const handleApplyRec = (rec: AnalysisRecommendation) => {
    setAppliedRecs((prev) => new Set(prev).add(rec.id));
    addToast('success', `Applied: "${rec.title}" (demo)`);
  };

  const missingQuestions = report.missingInfo;

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-navy-800">Analysis Report</h1>
          <p className="text-sm text-warm-500">{report.resumeTitle} · Analyzed {new Date(report.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setMissingInfoOpen(true)} icon={<HelpCircle className="w-3.5 h-3.5" />}>
            Answer Questions
          </Button>
          <Button size="sm" onClick={() => {
            if (state.resumes.length > 0) {
              dispatch({ type: 'SET_CURRENT_RESUME', payload: state.resumes[0] });
              router.push(`/builder/${state.resumes[0].id}`);
            }
          }} icon={<ArrowRight className="w-3.5 h-3.5" />}>
            Edit Resume
          </Button>
        </div>
      </div>

      {/* Overall Score */}
      <Card className="!p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <ScoreRing score={report.overallScore} size={100} strokeWidth={8} label="Overall" />
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-navy-800 mb-3">Score Breakdown</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {report.scores.map((score) => (
                <div key={score.category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-warm-700 font-medium">{score.label}</span>
                    <span className="text-warm-500">{score.score}/{score.maxScore}</span>
                  </div>
                  <ProgressBar
                    value={score.score}
                    max={score.maxScore}
                    color={score.score >= 80 ? 'bg-success' : score.score >= 60 ? 'bg-prism-500' : 'bg-warn'}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Strengths */}
      <Card>
        <h2 className="text-base font-semibold text-navy-800 mb-3 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-success" /> What&apos;s Working
        </h2>
        <ul className="space-y-2">
          {report.strengths.map((s, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-warm-700">
              <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
              {s}
            </li>
          ))}
        </ul>
      </Card>

      {/* Recommendations */}
      <div>
        <h2 className="text-base font-semibold text-navy-800 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-prism-500" /> Recommendations
          <Badge variant="prism">{report.recommendations.length}</Badge>
        </h2>
        <div className="space-y-3">
          {report.recommendations.map((rec) => {
            const isExpanded = expandedRec === rec.id;
            const isApplied = appliedRecs.has(rec.id);
            return (
              <Card key={rec.id} className={`!p-4 ${isApplied ? '!bg-success-light !border-green-200' : ''}`}>
                <div className="flex items-start gap-3">
                  <Badge variant={priorityColors[rec.priority] as 'error' | 'warning' | 'info'} className="mt-0.5 !text-[10px]">
                    {rec.priority}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-medium text-navy-800">{rec.title}</h3>
                      <button onClick={() => setExpandedRec(isExpanded ? null : rec.id)} className="text-warm-400 cursor-pointer">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-warm-500 mt-0.5">Section: {rec.section}</p>

                    {isExpanded && (
                      <div className="mt-3 space-y-3 animate-fade-in">
                        <p className="text-sm text-warm-600">{rec.explanation}</p>
                        <p className="text-sm text-warm-700"><strong>Suggested: </strong>{rec.suggestedAction}</p>

                        {rec.originalText && rec.suggestedText && (
                          <div className="grid grid-cols-1 gap-2">
                            <div className="p-3 bg-warm-50 rounded-lg border border-border">
                              <p className="text-[10px] text-warm-400 mb-1">Original</p>
                              <p className="text-sm text-warm-600">{rec.originalText}</p>
                            </div>
                            <div className="p-3 bg-prism-50 rounded-lg border border-prism-100">
                              <p className="text-[10px] text-prism-500 mb-1 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> Suggested (AI-generated, simulated)
                              </p>
                              <p className="text-sm text-navy-800">{rec.suggestedText}</p>
                            </div>
                          </div>
                        )}

                        {!isApplied && rec.suggestedText && (
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleApplyRec(rec)} icon={<Check className="w-3 h-3" />}>
                              Apply Suggestion
                            </Button>
                            <Button variant="ghost" size="sm">
                              Dismiss
                            </Button>
                          </div>
                        )}

                        {isApplied && (
                          <Badge variant="success">✓ Applied</Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Keywords */}
      <Card>
        <h2 className="text-base font-semibold text-navy-800 mb-3">Keyword Coverage</h2>
        <div className="flex flex-wrap gap-2">
          {report.keywords.map((kw) => (
            <Badge key={kw.keyword} variant={kw.found ? 'success' : 'error'}>
              {kw.found ? '✓' : '✗'} {kw.keyword}
            </Badge>
          ))}
        </div>
      </Card>

      {/* Formatting warnings */}
      {report.formattingWarnings.length > 0 && (
        <Card className="!bg-warn-light !border-amber-200">
          <h2 className="text-base font-semibold text-navy-800 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warn" /> Formatting Notes
          </h2>
          <ul className="space-y-1">
            {report.formattingWarnings.map((w, i) => (
              <li key={i} className="text-sm text-warm-700">• {w}</li>
            ))}
          </ul>
        </Card>
      )}

      <p className="text-[10px] text-warm-400 text-center">
        All scores and recommendations are simulated. This demo does not perform real AI analysis.
      </p>

      {/* Missing Info Modal */}
      <Modal open={missingInfoOpen} onClose={() => setMissingInfoOpen(false)} title="Missing Information" maxWidth="max-w-md">
        {missingInfoStep < missingQuestions.length ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="prism">Question {missingInfoStep + 1} of {missingQuestions.length}</Badge>
              <span className="text-xs text-warm-400">{missingQuestions[missingInfoStep].section}</span>
            </div>
            <p className="text-sm font-medium text-navy-800">{missingQuestions[missingInfoStep].question}</p>
            <p className="text-xs text-warm-500">{missingQuestions[missingInfoStep].context}</p>
            <textarea
              value={answers[missingQuestions[missingInfoStep].id] ?? ''}
              onChange={(e) => setAnswers({ ...answers, [missingQuestions[missingInfoStep].id]: e.target.value })}
              placeholder="Type your answer..."
              className="w-full px-3 py-2 text-sm border rounded-lg bg-white text-navy-800 border-border focus:border-prism-400 focus:outline-none resize-y min-h-[80px]"
            />
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setMissingInfoStep((s) => s + 1)} icon={<SkipForward className="w-3.5 h-3.5" />}>
                Skip
              </Button>
              <Button size="sm" className="ml-auto" onClick={() => {
                addToast('success', 'Answer saved');
                setMissingInfoStep((s) => s + 1);
              }}>
                Continue
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <CheckCircle className="w-8 h-8 text-success mx-auto mb-3" />
            <p className="text-sm font-medium text-navy-800">All questions reviewed</p>
            <p className="text-xs text-warm-500 mt-1">Your answers can be applied to improve your resume.</p>
            <Button size="sm" className="mt-4" onClick={() => {
              setMissingInfoOpen(false);
              addToast('success', 'Answers applied to resume (demo)');
            }}>
              Apply Answers
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
