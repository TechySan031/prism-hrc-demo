'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FilePlus, Upload } from 'lucide-react';
import { useApp } from '@/lib/context';
import { Card } from '@/components/ui';

export default function NewResumePage() {
  const router = useRouter();
  const { addToast } = useApp();
  const [loading, setLoading] = useState(false);

  const handleCreateBlank = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Resume' }),
      });

      if (!res.ok) {
        addToast('error', 'Failed to create resume in database');
        return;
      }

      const data = await res.json();
      addToast('success', 'Resume created successfully');
      router.push(`/builder/${data.resume.id}`);
    } catch {
      addToast('error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-xl font-bold text-navy-800">Create a new resume</h1>
        <p className="text-sm text-warm-500 mt-1">Choose how you want to get started</p>
      </div>

      <div className="space-y-3">
        <Card
          hover
          onClick={loading ? undefined : handleCreateBlank}
          className={`!p-6 ${loading ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-prism-50 flex items-center justify-center text-prism-600 flex-shrink-0">
              <FilePlus className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-navy-800">Start from scratch</h3>
              <p className="text-sm text-warm-500 mt-1">
                Create a blank resume in your account and fill in your details step by step.
              </p>
            </div>
          </div>
        </Card>

        <Card hover onClick={() => router.push('/analyzer/upload')} className="!p-6 cursor-pointer">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-prism-50 flex items-center justify-center text-prism-600 flex-shrink-0">
              <Upload className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-navy-800">Upload your existing resume</h3>
              <p className="text-sm text-warm-500 mt-1">
                Upload your actual PDF or DOCX file. The AI Agent extracts your sections and loads them directly into the editor.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
