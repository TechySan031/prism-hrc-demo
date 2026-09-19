'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, PenTool, Upload, Target,
  Palette, Download, Settings, Shield, ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '@/lib/context';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/builder/new', label: 'New Resume', icon: PenTool },
  { href: '/analyzer/upload', label: 'Analyze Resume', icon: Upload },
  { href: '/job-match', label: 'Job Matching', icon: Target },
  { href: '/templates', label: 'Templates', icon: Palette },
  { href: '/export', label: 'Export', icon: Download },
];

const bottomItems = [
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { state, dispatch } = useApp();
  const open = state.sidebarOpen;

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 z-30 flex flex-col bg-white border-r border-border transition-all duration-200 ${open ? 'w-56' : 'w-16'} hidden md:flex`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-prism-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">P</span>
        </div>
        {open && (
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-navy-800 truncate">Prism HRC</span>
            <span className="text-[10px] text-warm-500 truncate">Resume Studio</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-prism-50 text-prism-700'
                  : 'text-warm-600 hover:bg-warm-50 hover:text-navy-800'
              } ${!open ? 'justify-center' : ''}`}
              title={!open ? item.label : undefined}
            >
              <item.icon className="w-4.5 h-4.5 flex-shrink-0" />
              {open && <span>{item.label}</span>}
            </Link>
          );
        })}

        {/* Admin link if admin */}
        {state.isAdmin && (
          <Link
            href="/admin"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === '/admin'
                ? 'bg-prism-50 text-prism-700'
                : 'text-warm-600 hover:bg-warm-50 hover:text-navy-800'
            } ${!open ? 'justify-center' : ''}`}
            title={!open ? 'Admin' : undefined}
          >
            <Shield className="w-4.5 h-4.5 flex-shrink-0" />
            {open && <span>Admin</span>}
          </Link>
        )}
      </nav>

      {/* Bottom */}
      <div className="py-3 px-2 border-t border-border space-y-0.5">


        {bottomItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active ? 'bg-prism-50 text-prism-700' : 'text-warm-600 hover:bg-warm-50 hover:text-navy-800'
              } ${!open ? 'justify-center' : ''}`}
              title={!open ? item.label : undefined}
            >
              <item.icon className="w-4.5 h-4.5 flex-shrink-0" />
              {open && <span>{item.label}</span>}
            </Link>
          );
        })}

        {/* Collapse toggle */}
        <button
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-warm-400 hover:bg-warm-50 hover:text-warm-600 transition-colors w-full cursor-pointer"
          aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {open ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          {open && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
