'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import { Button, Input } from '@/components/ui';

export default function SignupPage() {
  const router = useRouter();
  const { refreshUser, addToast } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name || !email || !password) {
      setErrorMsg('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to create account');
        return;
      }

      addToast('success', 'Account created successfully!');
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
          <h1 className="text-xl font-bold text-navy-800">Create your account</h1>
          <p className="text-sm text-warm-500 mt-1">Access the Prism HRC AI Resume Agent</p>
        </div>

        <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-xs border border-red-200">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <Input
              label="Full name"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
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
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" loading={loading}>
              Sign Up
            </Button>
          </form>

          <p className="text-center text-xs text-warm-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-prism-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
