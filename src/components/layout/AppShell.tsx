'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { DemoControls } from './DemoControls';
import { ToastContainer } from '@/components/ui/Toast';
import { useApp } from '@/lib/context';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { state } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect to login if not authenticated on protected routes
  useEffect(() => {
    const publicPaths = ['/', '/login', '/signup', '/pricing'];
    if (!state.isAuthenticated && !publicPaths.includes(pathname)) {
      router.push('/login');
    }
  }, [state.isAuthenticated, pathname, router]);

  const isPublicPage = ['/', '/login', '/signup', '/pricing'].includes(pathname);

  if (isPublicPage) {
    return (
      <>
        {children}
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-warm-50">
      <Sidebar />
      <div className={`transition-all duration-200 ${state.sidebarOpen ? 'md:ml-56' : 'md:ml-16'}`}>
        <Topbar />
        <main className="p-4 md:p-6 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
      <DemoControls />
      <ToastContainer />
    </div>
  );
}
