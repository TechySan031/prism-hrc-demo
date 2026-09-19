'use client';

import React from 'react';
import { AppProvider } from '@/lib/context';
import { AppShell } from '@/components/layout/AppShell';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <AppShell>{children}</AppShell>
    </AppProvider>
  );
}
