'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, Loader2, CheckCircle, ArrowRight, PenLine } from 'lucide-react';
import { useApp } from '@/lib/context';
import { Button, Card, StepIndicator } from '@/components/ui';

type Stage = 'upload' | 'uploading' | 'parsing' | 'complete' | 'error';

export default function AnalyzerUploadPage() {
  const router = useRouter();
  const { addToast, refreshResumes } = useApp();
  const [stage, setStage] = useState<Stage>('upload');
  const [dragOver, setDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [createdResumeId, setCreatedResumeId] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps = ['Upload', 'Extract Text', 'Parse Sections', 'Ready'];
  const stepIndex = stage === 'upload' ? 0 : stage === 'uploading' ? 1 : stage === 'parsing' ? 2 : 3;

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    const validExtensions = ['pdf', 'docx', 'doc', 'txt'];

    if (!validExtensions.includes(ext || '')) {
      addToast('error', 'Please upload a valid PDF, DOCX, or TXT file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      addToast('error', 'File size exceeds the 10MB limit.');
      return;
    }

    setFileName(file.name);
    setStage('uploading');
    setErrorMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      setStage('parsing');
      const res = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      });

      let data: { success?: boolean; resumeId?: string; error?: string } = {};
      try {
        data = await res.json();
      } catch {
        const text = await res.text().catch(() => '');
        data = { error: text || `Server error (${res.status})` };
      }

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to upload and parse resume.');
        setStage('error');
        return;
      }

      setCreatedResumeId(data.resumeId || null);
      setStage('complete');
      addToast('success', 'Resume parsed and saved to your account!');
      await refreshResumes();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error occurred during upload. Please try again.';
      setErrorMessage(msg);
      setStage('error');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleRunAnalysis = async () => {
    if (!createdResumeId) return;
    try {
      const res = await fetch('/api/analyses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeId: createdResumeId }),
      });

      const data = await res.json();
      if (!res.ok) {
        addToast('error', data.error || 'Analysis failed. Check your AI configuration.');
        return;
      }

      router.push(`/analyzer/${data.analysis.id}`);
    } catch {
      addToast('error', 'Failed to run analysis');
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 animate-fade-in">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-navy-800">Upload Your Resume</h1>
        <p className="text-sm text-warm-500 mt-1">
          Our AI Agent will parse your actual document into structured sections.
        </p>
      </div>

      <StepIndicator steps={steps} currentStep={stepIndex} className="mb-8 justify-center" />

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc,.txt"
        className="hidden"
        onChange={handleSelectFile}
      />

      {stage === 'upload' && (
        <Card className="!p-8">
          <div
            className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer ${
              dragOver ? 'border-prism-400 bg-prism-50' : 'border-border hover:border-warm-300'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-10 h-10 text-warm-300 mx-auto mb-4" />
            <p className="text-sm font-medium text-navy-800 mb-1">Drop your resume here or click to browse</p>
            <p className="text-xs text-warm-500 mb-4">Supported formats: PDF, DOCX, TXT (up to 10MB)</p>
            <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
              Browse files
            </Button>
          </div>
        </Card>
      )}

      {(stage === 'uploading' || stage === 'parsing') && (
        <Card className="!p-10 text-center">
          <Loader2 className="w-10 h-10 text-prism-500 animate-spin mx-auto mb-4" />
          <p className="text-base font-semibold text-navy-800">
            {stage === 'uploading' ? 'Extracting text from file...' : 'Parsing structured sections...'}
          </p>
          <p className="text-sm text-warm-500 mt-1">{fileName}</p>
          <p className="text-xs text-warm-400 mt-4">
            Extracting contact info, work history, education, and skills into structured JSON...
          </p>
        </Card>
      )}

      {stage === 'complete' && (
        <Card className="!p-8 text-center animate-fade-in">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-navy-800">Resume Ingestion Complete</h2>
          <p className="text-sm text-warm-500 mt-1">{fileName}</p>
          <p className="text-xs text-warm-600 mt-3 max-w-sm mx-auto">
            Your document has been extracted, validated, and saved to your PostgreSQL database.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                if (createdResumeId) router.push(`/builder/${createdResumeId}`);
              }}
              icon={<PenLine className="w-4 h-4" />}
            >
              Open in Resume Builder
            </Button>
            <Button onClick={handleRunAnalysis} icon={<ArrowRight className="w-4 h-4" />}>
              Run AI Analysis
            </Button>
          </div>
        </Card>
      )}

      {stage === 'error' && (
        <Card className="!p-8 text-center animate-fade-in border-red-200 bg-red-50/50">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-200">
            <FileText className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-navy-800">Upload & Extraction Failed</h2>
          <p className="text-sm text-red-600 mt-2 max-w-md mx-auto">{errorMessage}</p>

          <div className="flex items-center justify-center gap-3 mt-6">
            <Button variant="secondary" size="sm" onClick={() => setStage('upload')}>
              Try Another File
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
