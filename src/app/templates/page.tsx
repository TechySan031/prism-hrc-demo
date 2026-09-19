'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Palette, Check } from 'lucide-react';
import { useApp } from '@/lib/context';
import { Button, Card, Badge } from '@/components/ui';
import { mockTemplates } from '@/lib/mock/templates';

export default function TemplatesPage() {
  const { state, dispatch, addToast } = useApp();
  const router = useRouter();

  const handleSelect = (templateId: string) => {
    dispatch({ type: 'SET_TEMPLATE_SETTINGS', payload: { templateId } });
    addToast('success', `Template "${mockTemplates.find((t) => t.id === templateId)?.name}" selected`);
    if (state.currentResume) {
      router.push(`/builder/${state.currentResume.id}`);
    } else if (state.resumes.length > 0) {
      dispatch({ type: 'SET_CURRENT_RESUME', payload: state.resumes[0] });
      router.push(`/builder/${state.resumes[0].id}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-navy-800">Resume Templates</h1>
        <p className="text-sm text-warm-500 mt-1">Choose a template and customize it to match your style</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {mockTemplates.map((tmpl) => {
          const isActive = state.templateSettings.templateId === tmpl.id;
          return (
            <Card key={tmpl.id} className={`!p-5 ${isActive ? '!border-prism-400 ring-2 ring-prism-100' : ''}`}>
              <div className="aspect-[8.5/11] bg-warm-50 rounded-lg border border-border mb-4 flex items-center justify-center relative overflow-hidden">
                <Palette className="w-10 h-10 text-warm-300" />
                {isActive && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-prism-500 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-sm font-semibold text-navy-800">{tmpl.name}</h3>
                <Badge variant="prism" className="!text-[10px]">{tmpl.label}</Badge>
              </div>
              <p className="text-xs text-warm-500 mb-4">{tmpl.description}</p>
              <Button
                variant={isActive ? 'secondary' : 'primary'}
                size="sm"
                className="w-full"
                onClick={() => handleSelect(tmpl.id)}
              >
                {isActive ? 'Selected' : 'Use Template'}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
