'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, Upload, FileText, MoreVertical, Copy, Trash2,
  PenLine, BarChart3, ArrowRight, Clock, Sparkles
} from 'lucide-react';
import { useApp } from '@/lib/context';
import { Button, Card, ProgressBar, ConfirmDialog, EmptyState } from '@/components/ui';
import type { Resume } from '@/types/resume';

export default function DashboardPage() {
  const { state, dispatch, addToast, refreshResumes } = useApp();
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  React.useEffect(() => {
    refreshResumes();
  }, [refreshResumes]);

  const resumes = state.resumes;
  const user = state.user;
  const usage = state.usage;

  const handleDuplicate = async (resume: Resume) => {
    try {
      const res = await fetch(`/api/resumes/${resume.id}`);
      if (!res.ok) throw new Error('Failed to fetch resume');
      const data = await res.json();
      const content = data.resume?.content;

      const createRes = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${resume.title} (Copy)`,
          content,
          templateId: resume.templateId,
        }),
      });
      if (createRes.ok) {
        await refreshResumes();
        addToast('success', `"${resume.title}" duplicated`);
      }
    } catch {
      addToast('error', 'Failed to duplicate resume');
    }
    setMenuOpen(null);
  };

  const handleDelete = async () => {
    if (deleteTarget) {
      try {
        const res = await fetch(`/api/resumes/${deleteTarget}`, { method: 'DELETE' });
        if (res.ok) {
          await refreshResumes();
          addToast('success', 'Resume deleted');
        }
      } catch {
        addToast('error', 'Failed to delete resume');
      }
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-navy-800">
            Welcome back, {user?.name?.split(' ')[0] ?? 'there'}
          </h1>
          <p className="text-sm text-warm-500 mt-0.5">
            Manage your resumes and track your progress.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => router.push('/analyzer/upload')} icon={<Upload className="w-4 h-4" />}>
            Analyze Resume
          </Button>
          <Button size="sm" onClick={() => router.push('/builder/new')} icon={<Plus className="w-4 h-4" />}>
            New Resume
          </Button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Resumes', value: resumes.length, icon: <FileText className="w-4 h-4 text-prism-500" /> },
          { label: 'Analyses', value: usage.analysesRun, icon: <BarChart3 className="w-4 h-4 text-prism-500" /> },
          { label: 'AI Suggestions', value: usage.aiSuggestionsUsed, icon: <Sparkles className="w-4 h-4 text-prism-500" /> },
          { label: 'Exports', value: usage.exportsUsed, icon: <ArrowRight className="w-4 h-4 text-prism-500" /> },
        ].map((stat) => (
          <Card key={stat.label} className="!p-4">
            <div className="flex items-center gap-2 mb-2">
              {stat.icon}
              <span className="text-xs font-medium text-warm-500">{stat.label}</span>
            </div>
            <p className="text-lg font-bold text-navy-800">
              {stat.value}
            </p>
          </Card>
        ))}
      </div>

      {/* Resumes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-navy-800">Your Resumes</h2>
          <span className="text-xs text-warm-400">{resumes.length} resume{resumes.length !== 1 ? 's' : ''}</span>
        </div>

        {resumes.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-6 h-6" />}
            title="No resumes yet"
            description="Create your first resume or upload an existing one to get started."
            action={{ label: 'Create Resume', onClick: () => router.push('/builder/new') }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resumes.map((resume) => (
              <Card key={resume.id} hover className="relative group">
                {/* Card content */}
                <div onClick={() => {
                  dispatch({ type: 'SET_CURRENT_RESUME', payload: resume });
                  router.push(`/builder/${resume.id}`);
                }} className="cursor-pointer">
                  {/* Mini preview */}
                  <div className="aspect-[8.5/6] bg-warm-50 rounded-lg border border-border mb-3 p-3 overflow-hidden">
                    <div className="space-y-1.5">
                      <div className="h-3 w-24 bg-navy-800 rounded" />
                      <div className="h-2 w-20 bg-warm-300 rounded" />
                      <div className="h-px bg-border my-1" />
                      <div className="h-2 w-full bg-warm-200 rounded" />
                      <div className="h-2 w-5/6 bg-warm-200 rounded" />
                      <div className="h-2 w-4/6 bg-warm-200 rounded" />
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-navy-800 truncate">{resume.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3 text-warm-400" />
                    <span className="text-xs text-warm-400">
                      Updated {new Date(resume.updatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  {resume.atsScore != null && (
                    <div className="flex items-center gap-2 mt-3">
                      <ProgressBar value={resume.atsScore} className="flex-1" />
                      <span className="text-xs font-medium text-warm-500">{resume.atsScore}/100</span>
                    </div>
                  )}
                </div>

                {/* Actions menu */}
                <div className="absolute top-3 right-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === resume.id ? null : resume.id); }}
                    className="p-1.5 rounded-lg hover:bg-warm-100 text-warm-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    aria-label="Resume actions"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {menuOpen === resume.id && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(null)} />
                      <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-border rounded-xl shadow-lg z-50 py-1 animate-fade-in">
                        <button
                          onClick={() => { dispatch({ type: 'SET_CURRENT_RESUME', payload: resume }); router.push(`/builder/${resume.id}`); setMenuOpen(null); }}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-warm-600 hover:bg-warm-50 w-full text-left cursor-pointer"
                        >
                          <PenLine className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => handleDuplicate(resume)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-warm-600 hover:bg-warm-50 w-full text-left cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" /> Duplicate
                        </button>
                        <button
                          onClick={() => { setDeleteTarget(resume.id); setMenuOpen(null); }}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-error hover:bg-error-light w-full text-left cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Suggested next action */}
      {resumes.length > 0 && (
        <Card className="!bg-prism-50 !border-prism-100">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-prism-100 flex items-center justify-center text-prism-600 flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-navy-800">Suggested next step</h3>
              <p className="text-sm text-warm-600 mt-0.5">
                Run an AI analysis on your resume to get improvement suggestions and a quality score.
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => {
              dispatch({ type: 'SET_CURRENT_RESUME', payload: resumes[0] ?? null });
              router.push('/analyzer/upload');
            }}>
              Analyze
            </Button>
          </div>
        </Card>
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete resume"
        description="Are you sure you want to delete this resume? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
