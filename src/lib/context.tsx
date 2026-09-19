'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect, type ReactNode } from 'react';
import { Resume, TemplateSettings } from '@/types/resume';
import { AnalysisReport } from '@/types/analysis';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'CANDIDATE' | 'RECRUITER' | 'ADMIN';
  planTier: 'FREE' | 'PRO' | 'ENTERPRISE';
}

export interface UsageStats {
  resumesCreated: number;
  analysesRun: number;
  aiSuggestionsUsed: number;
  exportsUsed: number;
}

interface AppState {
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  isAdmin: boolean;
  user: UserProfile | null;
  resumes: Resume[];
  currentResume: Resume | null;
  analysisReport: AnalysisReport | null;
  templateSettings: TemplateSettings;
  usage: UsageStats;
  sidebarOpen: boolean;
  toasts: Toast[];
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

const defaultTemplateSettings: TemplateSettings = {
  templateId: 'ats-professional',
  fontSize: 'regular',
  spacing: 'normal',
  accentColor: '#3B7A8C',
};

const initialState: AppState = {
  isAuthenticated: false,
  isLoadingAuth: true,
  isAdmin: false,
  user: null,
  resumes: [],
  currentResume: null,
  analysisReport: null,
  templateSettings: defaultTemplateSettings,
  usage: { resumesCreated: 0, analysesRun: 0, aiSuggestionsUsed: 0, exportsUsed: 0 },
  sidebarOpen: true,
  toasts: [],
};

type Action =
  | { type: 'SET_AUTH_USER'; payload: UserProfile | null }
  | { type: 'LOGOUT' }
  | { type: 'SET_RESUMES'; payload: Resume[] }
  | { type: 'SET_CURRENT_RESUME'; payload: Resume | null }
  | { type: 'SET_ANALYSIS_REPORT'; payload: AnalysisReport | null }
  | { type: 'UPDATE_RESUME'; payload: Resume }
  | { type: 'ADD_RESUME'; payload: Resume }
  | { type: 'REMOVE_RESUME'; payload: string }
  | { type: 'SET_TEMPLATE_SETTINGS'; payload: Partial<TemplateSettings> }
  | { type: 'SET_USAGE'; payload: Partial<UsageStats> }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'ADD_TOAST'; payload: Toast }
  | { type: 'REMOVE_TOAST'; payload: string };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_AUTH_USER':
      return {
        ...state,
        isAuthenticated: Boolean(action.payload),
        isLoadingAuth: false,
        isAdmin: action.payload?.role === 'ADMIN' || action.payload?.role === 'RECRUITER',
        user: action.payload,
      };
    case 'LOGOUT':
      return { ...initialState, isLoadingAuth: false };
    case 'SET_RESUMES':
      return { ...state, resumes: action.payload };
    case 'SET_CURRENT_RESUME':
      return { ...state, currentResume: action.payload };
    case 'SET_ANALYSIS_REPORT':
      return { ...state, analysisReport: action.payload };
    case 'UPDATE_RESUME': {
      const updated = { ...action.payload, updatedAt: new Date().toISOString() };
      return {
        ...state,
        currentResume: state.currentResume?.id === updated.id ? updated : state.currentResume,
        resumes: state.resumes.map((r) => (r.id === updated.id ? updated : r)),
      };
    }
    case 'ADD_RESUME':
      return { ...state, resumes: [action.payload, ...state.resumes] };
    case 'REMOVE_RESUME':
      return {
        ...state,
        resumes: state.resumes.filter((r) => r.id !== action.payload),
        currentResume: state.currentResume?.id === action.payload ? null : state.currentResume,
      };
    case 'SET_TEMPLATE_SETTINGS':
      return { ...state, templateSettings: { ...state.templateSettings, ...action.payload } };
    case 'SET_USAGE':
      return { ...state, usage: { ...state.usage, ...action.payload } };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, action.payload] };
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.payload) };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  addToast: (type: Toast['type'], message: string) => void;
  refreshUser: () => Promise<UserProfile | null>;
  refreshResumes: () => Promise<void>;
  logout: () => Promise<void>;
  loginDemo: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const addToast = useCallback((type: Toast['type'], message: string) => {
    const id = `toast-${Date.now()}`;
    dispatch({ type: 'ADD_TOAST', payload: { id, type, message } });
    setTimeout(() => dispatch({ type: 'REMOVE_TOAST', payload: id }), 4000);
  }, []);

  const refreshResumes = useCallback(async () => {
    try {
      const res = await fetch('/api/resumes');
      if (res.ok) {
        const data = await res.json();
        dispatch({ type: 'SET_RESUMES', payload: data.resumes || [] });
      }
    } catch {
      // ignore
    }
  }, []);

  const refreshUser = useCallback(async (): Promise<UserProfile | null> => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          dispatch({ type: 'SET_AUTH_USER', payload: data.user });
          await refreshResumes();
          return data.user;
        }
      }
      dispatch({ type: 'SET_AUTH_USER', payload: null });
      return null;
    } catch {
      dispatch({ type: 'SET_AUTH_USER', payload: null });
      return null;
    }
  }, [refreshResumes]);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  // Backwards compatible helper for any demo buttons
  const loginDemo = useCallback(async () => {
    // Attempt login with default demo account
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'demo@prismhrc.com', password: 'password123' }),
      });
      if (res.ok) {
        await refreshUser();
      }
    } catch {
      // ignore
    }
  }, [refreshUser]);

  // Check active session on initial load
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <AppContext.Provider value={{ state, dispatch, addToast, refreshUser, refreshResumes, logout, loginDemo }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
