'use client';

import React from 'react';
import { FileText, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="w-12 h-12 rounded-xl bg-warm-100 flex items-center justify-center text-warm-400 mb-4">
        {icon || <FileText className="w-6 h-6" />}
      </div>
      <h3 className="text-base font-semibold text-navy-800 mb-1">{title}</h3>
      <p className="text-sm text-warm-500 max-w-sm mb-4">{description}</p>
      {action && (
        <Button variant="primary" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <Loader2 className="w-8 h-8 text-prism-500 animate-spin mb-4" />
      <p className="text-sm text-warm-500">{message}</p>
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title = 'Something went wrong', message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="w-12 h-12 rounded-xl bg-error-light flex items-center justify-center text-error mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-navy-800 mb-1">{title}</h3>
      <p className="text-sm text-warm-500 max-w-sm mb-4">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export function StepIndicator({ steps, currentStep, className = '' }: StepIndicatorProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {steps.map((step, i) => (
        <React.Fragment key={step}>
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
              i < currentStep ? 'bg-prism-500 text-white' : i === currentStep ? 'bg-prism-100 text-prism-700 ring-2 ring-prism-300' : 'bg-warm-100 text-warm-400'
            }`}>
              {i < currentStep ? '✓' : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:inline ${i <= currentStep ? 'text-navy-800' : 'text-warm-400'}`}>
              {step}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-px min-w-[16px] ${i < currentStep ? 'bg-prism-300' : 'bg-warm-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export function ScoreRing({ score, max = 100, size = 80, strokeWidth = 6, label }: { score: number; max?: number; size?: number; strokeWidth?: number; label?: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percent = Math.min(100, Math.max(0, (score / max) * 100));
  const offset = circumference - (percent / 100) * circumference;
  const color = percent >= 80 ? 'text-success' : percent >= 60 ? 'text-prism-500' : percent >= 40 ? 'text-warn' : 'text-error';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-warm-100" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className={`${color} score-ring`} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-navy-800">{score}</span>
        {label && <span className="text-[10px] text-warm-500">{label}</span>}
      </div>
    </div>
  );
}
