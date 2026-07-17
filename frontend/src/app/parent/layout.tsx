'use client';

import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, BookOpen, FileText, CheckSquare, Award, CreditCard, 
  LayoutDashboard, LogOut, Bell, HeartHandshake 
} from 'lucide-react';

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'PARENT')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'PARENT') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-55 dark:bg-slate-950">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-slate-500">Checking credentials...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 md:h-screen bg-white dark:bg-slate-900 text-slate-800 dark:text-white flex-shrink-0 flex flex-col md:justify-between border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 md:sticky md:top-0">
        <div className="flex flex-col w-full">
          {/* Header */}
          <div className="p-4 md:p-6 flex items-center justify-between md:justify-start border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="relative w-10 h-10 flex items-center justify-center flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="/file_00000000717871fb90a931daa4d88bac.png" 
                  alt="The Aim High Academy Logo" 
                  className="h-10 w-auto object-contain block dark:hidden rotate-90"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="/file_00000000f1d071faac6893ada3b5df28.png" 
                  alt="The Aim High Academy Logo" 
                  className="h-10 w-auto object-contain hidden dark:block"
                />
              </div>
              <div>
                <span className="font-bold tracking-tight text-slate-900 dark:text-white block">Aim High</span>
                <span className="text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold tracking-wider flex items-center">
                  <HeartHandshake size={12} className="mr-1 text-primary" /> Parent Portal
                </span>
              </div>
            </div>
            {/* Mobile Sign Out */}
            <button 
              onClick={logout}
              className="md:hidden p-2 rounded-xl bg-red-500/10 hover:bg-red-500/15 text-red-500 transition-all"
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="p-2 md:p-4 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible space-x-2 md:space-x-0 md:space-y-1 scrollbar-none">
            <Link href="/parent?tab=overview" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-colors text-slate-700 dark:text-slate-200 hover:text-primary whitespace-nowrap flex-shrink-0">
              <LayoutDashboard size={18} />
              <span>Overview</span>
            </Link>
            <div className="hidden md:block px-4 py-2 text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
              Child Tracking
            </div>
            <Link href="/parent?tab=attendance" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-colors text-slate-700 dark:text-slate-200 hover:text-primary whitespace-nowrap flex-shrink-0">
              <CheckSquare size={18} />
              <span>Child Attendance</span>
            </Link>
            <Link href="/parent?tab=results" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-colors text-slate-700 dark:text-slate-200 hover:text-primary whitespace-nowrap flex-shrink-0">
              <Award size={18} />
              <span>Grades & Performance</span>
            </Link>
            <Link href="/parent?tab=fees" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-colors text-slate-700 dark:text-slate-200 hover:text-primary whitespace-nowrap flex-shrink-0">
              <CreditCard size={18} />
              <span>Child Tuition Fees</span>
            </Link>
            <Link href="/parent?tab=notices" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-colors text-slate-700 dark:text-slate-200 hover:text-primary whitespace-nowrap flex-shrink-0">
              <Bell size={18} />
              <span>Notice board</span>
            </Link>
          </nav>
        </div>

        {/* Footer */}
        <div className="hidden md:block p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4 px-4">
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-white truncate max-w-[120px]">{user.name}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">parent@aimhigh.com</p>
            </div>
          </div>
          <button 
            onClick={logout} 
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/15 text-red-500 dark:text-red-400 text-sm font-medium transition-all"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 overflow-y-auto p-4 md:p-10">
        {children}
      </main>
    </div>
  );
}
