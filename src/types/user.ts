// User, auth, and app-level types

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  plan: 'free' | 'pro';
  createdAt: string;
  resumeCount: number;
  analysisCount: number;
  isAdmin: boolean;
}

export interface UserPreferences {
  defaultTemplate: string;
  defaultFontSize: number;
  defaultSpacing: number;
  accentColor: string;
  aiTone: 'professional' | 'friendly' | 'concise';
  privacyMode: boolean;
}

export interface UsageStats {
  resumesCreated: number;
  resumeLimit: number;
  analysesRun: number;
  analysisLimit: number;
  aiSuggestionsUsed: number;
  aiSuggestionLimit: number;
  exportsUsed: number;
  exportLimit: number;
}

export interface AdminStats {
  totalUsers: number;
  totalResumes: number;
  totalAnalyses: number;
  aiUsageCount: number;
  recentActivity: ActivityItem[];
  featureFlags: FeatureFlag[];
}

export interface ActivityItem {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
}

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  highlighted: boolean;
  cta: string;
}
