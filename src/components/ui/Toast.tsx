'use client';

import React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useApp, type Toast } from '@/lib/context';

const toastIcons: Record<Toast['type'], React.ReactNode> = {
  success: <CheckCircle className="w-4 h-4 text-success" />,
  error: <AlertCircle className="w-4 h-4 text-error" />,
  warning: <AlertTriangle className="w-4 h-4 text-warn" />,
  info: <Info className="w-4 h-4 text-info" />,
};

const toastStyles: Record<Toast['type'], string> = {
  success: 'border-l-success bg-success-light/50',
  error: 'border-l-error bg-error-light/50',
  warning: 'border-l-warn bg-warn-light/50',
  info: 'border-l-info bg-info-light/50',
};

export function ToastContainer() {
  const { state, dispatch } = useApp();

  if (state.toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm" aria-live="polite">
      {state.toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 px-4 py-3 border-l-4 rounded-lg shadow-lg bg-white animate-slide-in ${toastStyles[toast.type]}`}
          role="alert"
        >
          <div className="mt-0.5">{toastIcons[toast.type]}</div>
          <p className="text-sm text-navy-800 flex-1">{toast.message}</p>
          <button
            onClick={() => dispatch({ type: 'REMOVE_TOAST', payload: toast.id })}
            className="text-warm-400 hover:text-warm-600 cursor-pointer"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
