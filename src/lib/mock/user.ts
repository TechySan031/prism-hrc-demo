import { DemoUser, UserPreferences, UsageStats, AdminStats, PricingPlan } from '@/types/user';

export const mockUser: DemoUser = {
  id: 'user-demo',
  name: 'Alex Morgan',
  email: 'alex.morgan@email.com',
  avatar: '',
  plan: 'free',
  createdAt: '2025-08-01T00:00:00Z',
  resumeCount: 3,
  analysisCount: 2,
  isAdmin: false,
};

export const mockAdminUser: DemoUser = {
  ...mockUser,
  id: 'user-admin',
  name: 'Admin User',
  email: 'admin@prismhrc.com',
  plan: 'pro',
  isAdmin: true,
};

export const mockPreferences: UserPreferences = {
  defaultTemplate: 'ats-professional',
  defaultFontSize: 10,
  defaultSpacing: 1,
  accentColor: '#3B7A8C',
  aiTone: 'professional',
  privacyMode: false,
};

export const mockUsageStats: UsageStats = {
  resumesCreated: 3,
  resumeLimit: 5,
  analysesRun: 2,
  analysisLimit: 3,
  aiSuggestionsUsed: 8,
  aiSuggestionLimit: 20,
  exportsUsed: 1,
  exportLimit: 3,
};

export const mockAdminStats: AdminStats = {
  totalUsers: 1247,
  totalResumes: 3891,
  totalAnalyses: 2156,
  aiUsageCount: 18432,
  recentActivity: [
    { id: 'act-1', user: 'sarah.c@email.com', action: 'Created resume', target: 'Full-Stack Engineer Resume', timestamp: '2025-09-15T14:30:00Z' },
    { id: 'act-2', user: 'arjun.m@email.com', action: 'Ran analysis', target: 'AI/ML Engineer Resume', timestamp: '2025-09-15T13:15:00Z' },
    { id: 'act-3', user: 'maya.r@email.com', action: 'Exported PDF', target: 'Product Analyst Resume', timestamp: '2025-09-15T12:00:00Z' },
    { id: 'act-4', user: 'james.w@email.com', action: 'Applied AI suggestion', target: 'Backend Engineer Resume', timestamp: '2025-09-15T11:30:00Z' },
    { id: 'act-5', user: 'lisa.p@email.com', action: 'Signed up', target: 'Free plan', timestamp: '2025-09-15T10:45:00Z' },
  ],
  featureFlags: [
    { id: 'ff-1', name: 'AI Rewrite V2', description: 'Use updated AI model for rewrite suggestions', enabled: true },
    { id: 'ff-2', name: 'Job Match Beta', description: 'Enable job description matching feature', enabled: true },
    { id: 'ff-3', name: 'Template Editor', description: 'Allow custom template editing', enabled: false },
    { id: 'ff-4', name: 'Bulk Export', description: 'Export multiple resumes at once', enabled: false },
  ],
};

export const mockPricingPlans: PricingPlan[] = [
  {
    id: 'plan-free',
    name: 'Starter',
    price: 0,
    period: 'forever',
    features: [
      'Up to 3 resumes',
      '3 AI analyses per month',
      '20 AI suggestions per month',
      '3 PDF exports per month',
      'ATS Professional template',
      'Basic job matching',
    ],
    highlighted: false,
    cta: 'Get Started Free',
  },
  {
    id: 'plan-pro',
    name: 'Professional',
    price: 12,
    period: 'month',
    features: [
      'Unlimited resumes',
      'Unlimited AI analyses',
      'Unlimited AI suggestions',
      'Unlimited exports (PDF & DOCX)',
      'All 3 premium templates',
      'Advanced job matching',
      'Priority processing',
      'Custom accent colors',
      'Resume version history',
    ],
    highlighted: true,
    cta: 'Start Pro Trial',
  },
];
