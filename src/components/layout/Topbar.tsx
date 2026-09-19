'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, LogOut, User, CreditCard, X } from 'lucide-react';
import { useApp } from '@/lib/context';

export function Topbar() {
  const { state, logout } = useApp();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <>
      <header className="sticky top-0 z-20 h-14 bg-white/90 backdrop-blur border-b border-border flex items-center justify-between px-4 md:px-6">
        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-warm-100 text-warm-600 cursor-pointer"
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Demo Mode indicator */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Demo Mode
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/pricing" className="text-sm text-warm-600 hover:text-prism-600 transition-colors hidden sm:inline-flex items-center gap-1">
            <CreditCard className="w-3.5 h-3.5" />
            Pricing
          </Link>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-warm-100 transition-colors cursor-pointer"
              aria-label="User menu"
            >
              <div className="w-7 h-7 rounded-full bg-prism-100 flex items-center justify-center">
                <span className="text-xs font-semibold text-prism-700">
                  {state.user?.name?.charAt(0) ?? 'D'}
                </span>
              </div>
              <span className="text-sm font-medium text-navy-800 hidden sm:inline">
                {state.user?.name ?? 'Demo User'}
              </span>
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-border rounded-xl shadow-lg z-50 py-1 animate-fade-in">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-sm font-medium text-navy-800">{state.user?.name}</p>
                    <p className="text-xs text-warm-500">{state.user?.email}</p>
                  </div>
                  <Link href="/settings" className="flex items-center gap-2 px-3 py-2 text-sm text-warm-600 hover:bg-warm-50 transition-colors" onClick={() => setMenuOpen(false)}>
                    <User className="w-4 h-4" /> Settings
                  </Link>
                  <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-sm text-warm-600 hover:bg-warm-50 transition-colors w-full text-left cursor-pointer">
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile navigation overlay */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/40" onClick={() => setMobileNavOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-64 bg-white shadow-xl animate-slide-in">
            <div className="flex items-center justify-between px-4 h-14 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-prism-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="text-sm font-semibold text-navy-800">Prism HRC</span>
              </div>
              <button onClick={() => setMobileNavOpen(false)} className="p-1 rounded-lg hover:bg-warm-100 cursor-pointer" aria-label="Close">
                <X className="w-5 h-5 text-warm-500" />
              </button>
            </div>
            <nav className="p-3 space-y-1">
              {[
                { href: '/dashboard', label: 'Dashboard' },
                { href: '/builder/new', label: 'New Resume' },
                { href: '/analyzer/upload', label: 'Analyze Resume' },
                { href: '/job-match', label: 'Job Matching' },
                { href: '/templates', label: 'Templates' },
                { href: '/export', label: 'Export' },
                { href: '/settings', label: 'Settings' },
                { href: '/pricing', label: 'Pricing' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-3 py-2.5 rounded-lg text-sm font-medium text-warm-600 hover:bg-warm-50 hover:text-navy-800"
                  onClick={() => setMobileNavOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
