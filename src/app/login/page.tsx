'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import { Button, Input } from '@/components/ui';

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser, addToast } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Invalid credentials');
        return;
      }

      addToast('success', `Welcome back, ${data.user.name}!`);
      await refreshUser();
      router.push('/dashboard');
    } catch {
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-lg bg-prism-600 flex items-center justify-center">
              <span className="text-white font-bold text-base">P</span>
            </div>
          </Link>
          <h1 className="text-xl font-bold text-navy-800">Welcome back</h1>
          <p className="text-sm text-warm-500 mt-1">Sign in to Prism HRC AI Resume Studio</p>
        </div>

        <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-xs border border-red-200">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleFormLogin} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" loading={loading}>
              Sign in
            </Button>
          </form>

          <p className="text-center text-xs text-warm-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-prism-600 font-medium hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
