'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, FileText, File, CheckCircle, Loader2, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useApp } from '@/lib/context';
import { Button, Card } from '@/components/ui';

type ExportStage = 'options' | 'processing' | 'complete' | 'error';

export default function ExportPage() {
  const { state, addToast, dispatch } = useApp();
  const router = useRouter();
  const [format, setFormat] = useState('pdf');
  const [fileName, setFileName] = useState(state.currentResume?.title ?? 'My Resume');
  const [stage, setStage] = useState<ExportStage>('options');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resume = state.currentResume ?? state.resumes[0];

  const handleExport = async () => {
    if (!resume) {
      addToast('warning', 'No resume selected');
      return;
    }

    setStage('processing');
    setErrorMessage(null);

    try {
      const endpoint = format === 'pdf' ? '/api/exports/pdf' : '/api/exports/docx';
      const res = await fetch(`${endpoint}?resumeId=${resume.id}`);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Export failed' }));
        throw new Error(errorData.error || 'Export failed');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setStage('complete');
      dispatch({ type: 'SET_USAGE', payload: { exportsUsed: state.usage.exportsUsed + 1 } });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Export failed. Please try again.');
      setStage('error');
    }
  };

  const handleDownload = () => {
    if (!downloadUrl) return;
    const sanitizedName = (fileName || 'resume').replace(/[^a-zA-Z0-9_\- ]/g, '_');
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${sanitizedName}.${format}`;
    a.click();
    addToast('success', `${format.toUpperCase()} downloaded`);
  };

  const handleReset = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setStage('options');
    setErrorMessage(null);
  };

  return (
    <div className="max-w-lg mx-auto py-8 animate-fade-in">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-navy-800">Export Resume</h1>
        <p className="text-sm text-warm-500 mt-1">Download your resume in your preferred format</p>
      </div>

      {!resume && (
        <Card className="!bg-warn-light !border-amber-200 !p-4 mb-6">
          <p className="text-sm text-warm-700">
            <AlertTriangle className="w-4 h-4 inline mr-1 text-warn" />
            No resume selected. Go to the <a href="/dashboard" className="text-prism-600 underline">dashboard</a> to select one.
          </p>
        </Card>
      )}

      {stage === 'options' && resume && (
        <Card className="!p-6 space-y-5">
          <div className="p-3 bg-warm-50 rounded-lg border border-border flex items-center gap-3">
            <FileText className="w-5 h-5 text-prism-500" />
            <div>
              <p className="text-sm font-medium text-navy-800">{resume.title}</p>
              <p className="text-xs text-warm-500">Template: {state.templateSettings.templateId}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setFormat('pdf')}
              className={`p-4 rounded-lg border text-center transition-colors cursor-pointer ${format === 'pdf' ? 'border-prism-400 bg-prism-50' : 'border-border hover:border-warm-300'}`}
            >
              <File className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <span className="text-sm font-medium text-navy-800">PDF</span>
              <p className="text-[10px] text-warm-500">Best for sharing</p>
            </button>
            <button
              onClick={() => setFormat('docx')}
              className={`p-4 rounded-lg border text-center transition-colors cursor-pointer ${format === 'docx' ? 'border-prism-400 bg-prism-50' : 'border-border hover:border-warm-300'}`}
            >
              <File className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <span className="text-sm font-medium text-navy-800">DOCX</span>
              <p className="text-[10px] text-warm-500">Best for editing</p>
            </button>
          </div>

          <div>
            <label className="text-sm font-medium text-navy-800 block mb-1.5">File Name</label>
            <input
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg bg-white text-navy-800 border-border focus:border-prism-400 focus:outline-none"
            />
          </div>

          <Button onClick={handleExport} className="w-full" icon={<Download className="w-4 h-4" />}>
            Export as {format.toUpperCase()}
          </Button>
        </Card>
      )}

      {stage === 'processing' && (
        <Card className="!p-10 text-center">
          <Loader2 className="w-10 h-10 text-prism-500 animate-spin mx-auto mb-4" />
          <p className="text-base font-semibold text-navy-800">Generating your {format.toUpperCase()}...</p>
          <p className="text-sm text-warm-500 mt-1">Applying template and formatting</p>
        </Card>
      )}

      {stage === 'error' && (
        <Card className="!p-6 text-center">
          <AlertTriangle className="w-10 h-10 text-warn mx-auto mb-4" />
          <p className="text-base font-semibold text-navy-800">Export Failed</p>
          <p className="text-sm text-warm-500 mt-1">{errorMessage}</p>
          <Button variant="secondary" onClick={handleReset} className="mt-4">
            Try Again
          </Button>
        </Card>
      )}

      {stage === 'complete' && (
        <Card className="!p-10 text-center">
          <CheckCircle className="w-10 h-10 text-success mx-auto mb-4" />
          <p className="text-base font-semibold text-navy-800">Export Ready</p>
          <p className="text-sm text-warm-500 mt-1">{fileName}.{format}</p>
          <div className="flex flex-col gap-3 mt-6">
            <Button onClick={handleDownload} icon={<Download className="w-4 h-4" />}>
              Download File
            </Button>
            <Button variant="secondary" onClick={() => {
              handleReset();
              if (resume) router.push(`/builder/${resume.id}`);
            }} icon={<ArrowLeft className="w-4 h-4" />}>
              Return to Builder
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
