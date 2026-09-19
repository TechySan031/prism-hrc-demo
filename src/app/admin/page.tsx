'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Users, FileText, BarChart3, Sparkles, Activity, ToggleLeft, ToggleRight, Shield } from 'lucide-react';
import { useApp } from '@/lib/context';
import { Card, Badge, ErrorState } from '@/components/ui';
import { mockAdminStats } from '@/lib/mock/user';

export default function AdminPage() {
  const { state, addToast } = useApp();
  const router = useRouter();

  if (!state.isAdmin) {
    return (
      <ErrorState
        title="Access Denied"
        message="You need admin privileges to view this page. Use the Demo Controls to switch to admin mode."
        onRetry={() => router.push('/dashboard')}
      />
    );
  }

  const stats = mockAdminStats;

  const statCards = [
    { icon: <Users className="w-5 h-5 text-prism-500" />, label: 'Total Users', value: stats.totalUsers.toLocaleString() },
    { icon: <FileText className="w-5 h-5 text-prism-500" />, label: 'Total Resumes', value: stats.totalResumes.toLocaleString() },
    { icon: <BarChart3 className="w-5 h-5 text-prism-500" />, label: 'Total Analyses', value: stats.totalAnalyses.toLocaleString() },
    { icon: <Sparkles className="w-5 h-5 text-prism-500" />, label: 'AI Usage', value: stats.aiUsageCount.toLocaleString() },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Shield className="w-5 h-5 text-prism-500" />
        <h1 className="text-xl font-bold text-navy-800">Admin Dashboard</h1>
        <Badge variant="warning" className="!text-[10px]">Demo</Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="!p-4">
            <div className="flex items-center gap-2 mb-2">{stat.icon}<span className="text-xs text-warm-500">{stat.label}</span></div>
            <p className="text-2xl font-bold text-navy-800">{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <h2 className="text-base font-semibold text-navy-800 mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-prism-500" /> Recent Activity
        </h2>
        <div className="space-y-3">
          {stats.recentActivity.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div>
                <p className="text-sm text-navy-800">{item.user}</p>
                <p className="text-xs text-warm-500">{item.action} — {item.target}</p>
              </div>
              <span className="text-xs text-warm-400">{new Date(item.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Feature Flags */}
      <Card>
        <h2 className="text-base font-semibold text-navy-800 mb-4">Feature Flags</h2>
        <div className="space-y-3">
          {stats.featureFlags.map((flag) => (
            <div key={flag.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div>
                <p className="text-sm font-medium text-navy-800">{flag.name}</p>
                <p className="text-xs text-warm-500">{flag.description}</p>
              </div>
              <button
                onClick={() => addToast('info', `"${flag.name}" toggled (demo)`)}
                className="cursor-pointer text-prism-500"
              >
                {flag.enabled ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6 text-warm-300" />}
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* System info */}
      <Card className="!bg-warm-50">
        <h2 className="text-sm font-semibold text-navy-800 mb-2">System Info</h2>
        <div className="grid grid-cols-2 gap-2 text-xs text-warm-600">
          <div>Prompt Version: <span className="font-mono text-navy-800">v2.1.0-demo</span></div>
          <div>AI Model: <span className="font-mono text-navy-800">mock-provider</span></div>
          <div>Payment Status: <span className="font-mono text-navy-800">stripe-test</span></div>
          <div>Environment: <span className="font-mono text-navy-800">demo</span></div>
        </div>
      </Card>

      <p className="text-[10px] text-warm-400 text-center">
        This admin page uses mock data. All statistics and controls are simulated.
      </p>
    </div>
  );
}
