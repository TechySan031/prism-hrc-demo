'use client';

import React, { useState } from 'react';
import { Sparkles, Check, X, RefreshCw, AlertCircle } from 'lucide-react';
import { Button, Badge } from '@/components/ui';

interface AIAssistantDrawerProps {
  open: boolean;
  onClose: () => void;
  field: string;
  originalText: string;
  roleTitle?: string;
  onApply: (text: string) => void;
}

const actionMap: Record<string, { label: string; action: string }> = {
  improve: { label: 'Improve wording', action: 'improve_wording' },
  concise: { label: 'Make more concise', action: 'make_concise' },
  achievement: { label: 'Make achievement-focused', action: 'make_achievement_oriented' },
  grammar: { label: 'Improve grammar', action: 'improve_grammar' },
  tailor: { label: 'Tailor to target role', action: 'tailor_to_job' },
};

export function AIAssistantDrawer({ open, onClose, field, originalText, roleTitle, onApply }: AIAssistantDrawerProps) {
  const [selectedKey, setSelectedKey] = useState('improve');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [suggestion, setSuggestion] = useState<{ suggested: string; explanation: string; warning?: string } | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setErrorMsg('');
    setSuggestion(null);

    const targetAction = actionMap[selectedKey]?.action || 'improve_wording';
    const endpoint = field === 'summary' ? '/api/ai/rewrite-summary' : '/api/ai/improve-bullet';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: originalText,
          action: targetAction,
          roleTitle: roleTitle || 'Professional',
          field,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === 'AI_NOT_CONFIGURED') {
          setErrorMsg(data.error || 'AI provider is not configured. Please set your AI_API_KEY in .env.');
        } else {
          setErrorMsg(data.error || 'Failed to generate AI rewrite.');
        }
        return;
      }

      if (data.result) {
        setSuggestion({
          suggested: data.result.suggested,
          explanation: data.result.explanation,
          warning: data.result.missingInformationPrompt,
        });
      }
    } catch {
      setErrorMsg('Network error occurred while communicating with the AI Agent.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label="AI Assistant">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-lg max-h-[85vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-prism-500" />
            <h2 className="text-base font-semibold text-navy-800">Prism AI Assistant</h2>
            <Badge variant="prism" className="!text-[10px]">Active Agent</Badge>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-warm-100 text-warm-400 cursor-pointer" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Action selection */}
          <div>
            <label className="text-xs font-medium text-navy-800 block mb-2">Enhancement Goal</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {Object.entries(actionMap).map(([key, item]) => (
                <button
                  key={key}
                  onClick={() => setSelectedKey(key)}
                  className={`px-2.5 py-2 rounded-lg border text-xs font-medium text-left cursor-pointer transition-colors ${
                    selectedKey === key ? 'border-prism-500 bg-prism-50 text-prism-700' : 'border-border text-warm-600 hover:border-warm-300'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Original text */}
          <div>
            <label className="text-xs font-medium text-warm-500 block mb-1">Original Text</label>
            <div className="p-3 rounded-lg bg-warm-50 border border-border text-sm text-navy-800 max-h-32 overflow-y-auto">
              {originalText || '(empty field)'}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2 text-xs text-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{errorMsg}</p>
                <p className="mt-1 text-warm-500">
                  Prism HRC AI uses your configured server-side AI provider. Ensure AI_API_KEY is defined in .env.
                </p>
              </div>
            </div>
          )}

          {/* Generate button */}
          {!suggestion && (
            <Button
              onClick={handleGenerate}
              loading={loading}
              className="w-full"
              icon={<Sparkles className="w-4 h-4" />}
            >
              Generate AI Suggestion
            </Button>
          )}

          {/* Result */}
          {suggestion && (
            <div className="space-y-3 animate-fade-in">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-prism-600">AI Suggested Enhancement</label>
                  <span className="text-[10px] text-emerald-600 font-medium">Factuality verified</span>
                </div>
                <div className="p-3.5 rounded-lg bg-prism-50/60 border border-prism-200 text-sm text-navy-800 font-medium leading-relaxed">
                  {suggestion.suggested}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-warm-500 block mb-1">Why this is stronger</label>
                <p className="text-xs text-warm-600 leading-relaxed bg-warm-50 p-2.5 rounded-md border border-border">
                  {suggestion.explanation}
                </p>
              </div>

              {suggestion.warning && (
                <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-800">
                  <strong>Missing metric prompt: </strong>{suggestion.warning}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => {
                    onApply(suggestion.suggested);
                    onClose();
                  }}
                  className="flex-1"
                  icon={<Check className="w-4 h-4" />}
                >
                  Apply Suggestion
                </Button>
                <Button
                  variant="outline"
                  onClick={handleGenerate}
                  loading={loading}
                  icon={<RefreshCw className="w-3.5 h-3.5" />}
                >
                  Regenerate
                </Button>
                <Button variant="ghost" onClick={onClose}>
                  Reject
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
