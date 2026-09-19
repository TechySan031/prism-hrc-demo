'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Palette, Shield, Sparkles, Trash2 } from 'lucide-react';
import { useApp } from '@/lib/context';
import { Button, Card, Input, Select, Tabs, Badge, ConfirmDialog } from '@/components/ui';

export default function SettingsPage() {
  const { state, addToast, logout } = useApp();
  const router = useRouter();
  const user = state.user;
  const [activeTab, setActiveTab] = useState('profile');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User className="w-3.5 h-3.5" /> },
    { id: 'preferences', label: 'Preferences', icon: <Palette className="w-3.5 h-3.5" /> },
    { id: 'ai', label: 'AI Settings', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'privacy', label: 'Privacy', icon: <Shield className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="max-w-2xl mx-auto py-4 animate-fade-in">
      <h1 className="text-xl font-bold text-navy-800 mb-6">Settings</h1>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-6" />

      {activeTab === 'profile' && (
        <Card className="!p-6 space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-prism-100 flex items-center justify-center">
              <span className="text-xl font-bold text-prism-700">{name.charAt(0)}</span>
            </div>
            <div>
              <p className="text-base font-semibold text-navy-800">{name}</p>
              <Badge variant={user?.planTier === 'PRO' ? 'prism' : 'default'}>{user?.planTier === 'PRO' ? 'Pro' : user?.planTier === 'ENTERPRISE' ? 'Enterprise' : 'Free'} plan</Badge>
            </div>
          </div>
          <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button onClick={() => addToast('success', 'Profile updated (demo)')}>Save Changes</Button>
        </Card>
      )}

      {activeTab === 'preferences' && (
        <Card className="!p-6 space-y-5">
          <Select
            label="Default Template"
            value={state.templateSettings.templateId}
            options={[
              { value: 'ats-professional', label: 'ATS Professional' },
              { value: 'modern-split', label: 'Modern Split' },
              { value: 'minimal-executive', label: 'Minimal Executive' },
            ]}
            onChange={() => addToast('info', 'Default template updated (demo)')}
          />
          <Select
            label="Default Font Size"
            value="10"
            options={[
              { value: '9', label: '9pt' },
              { value: '10', label: '10pt' },
              { value: '11', label: '11pt' },
              { value: '12', label: '12pt' },
            ]}
            onChange={() => addToast('info', 'Font size preference saved (demo)')}
          />
          <Button onClick={() => addToast('success', 'Preferences saved (demo)')}>Save Preferences</Button>
        </Card>
      )}

      {activeTab === 'ai' && (
        <Card className="!p-6 space-y-5">
          <Select
            label="AI Suggestion Tone"
            value="professional"
            options={[
              { value: 'professional', label: 'Professional' },
              { value: 'friendly', label: 'Friendly' },
              { value: 'concise', label: 'Concise' },
            ]}
            onChange={() => addToast('info', 'AI tone preference saved (demo)')}
          />
          <div className="p-3 bg-warm-50 rounded-lg border border-border">
            <p className="text-sm text-warm-600">
              AI suggestions are powered by language models and are always simulated in this demo.
              In production, suggestions would be generated from your resume content with explainable reasoning.
            </p>
          </div>
          <Button onClick={() => addToast('success', 'AI preferences saved (demo)')}>Save AI Settings</Button>
        </Card>
      )}

      {activeTab === 'privacy' && (
        <Card className="!p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-navy-800">Privacy Mode</p>
              <p className="text-xs text-warm-500">Minimize data stored during AI processing</p>
            </div>
            <button
              className="w-10 h-6 rounded-full bg-warm-200 relative cursor-pointer transition-colors"
              onClick={() => addToast('info', 'Privacy setting toggled (demo)')}
            >
              <span className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow transition-transform" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-navy-800">Integration Status</p>
              <p className="text-xs text-warm-500">No integrations connected</p>
            </div>
            <Badge variant="default">None</Badge>
          </div>

          <div className="pt-4 border-t border-border">
            <Button variant="danger" size="sm" onClick={() => setDeleteConfirm(true)} icon={<Trash2 className="w-3.5 h-3.5" />}>
              Delete Account
            </Button>
            <p className="text-xs text-warm-500 mt-2">This will permanently delete all your data.</p>
          </div>
        </Card>
      )}

      <ConfirmDialog
        open={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        onConfirm={() => { logout(); router.push('/'); }}
        title="Delete Account"
        description="Are you sure you want to delete your account? All resumes, analyses, and data will be permanently removed. This action cannot be undone."
        confirmLabel="Delete My Account"
        variant="danger"
      />
    </div>
  );
}
