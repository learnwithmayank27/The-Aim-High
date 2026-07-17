'use client';

import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, BookOpen, FileText, CheckSquare, Award, Video, 
  LayoutDashboard, LogOut, GraduationCap, ClipboardList 
} from 'lucide-react';

export default function FacultyLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'FACULTY')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'FACULTY') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
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
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 text-slate-800 dark:text-white flex-shrink-0 flex flex-col justify-between border-r border-slate-200 dark:border-slate-800">
        <div>
          {/* Header */}
          <div className="p-6 flex items-center space-x-3 border-b border-slate-200 dark:border-slate-800">
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
                <GraduationCap size={12} className="mr-1 text-primary" /> Faculty Hub
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1">
            <Link href="/faculty?tab=overview" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-colors text-slate-700 dark:text-slate-200 hover:text-primary">
              <LayoutDashboard size={18} />
              <span>Overview</span>
            </Link>
            <div className="px-4 py-2 text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
              Academic Delivery
            </div>
            <Link href="/faculty?tab=homework" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-colors text-slate-700 dark:text-slate-200 hover:text-primary">
              <ClipboardList size={18} />
              <span>Assign Homework</span>
            </Link>
            <Link href="/faculty?tab=lectures" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-colors text-slate-700 dark:text-slate-200 hover:text-primary">
              <Video size={18} />
              <span>Publish Lectures</span>
            </Link>
            <Link href="/faculty?tab=papers" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-colors text-slate-700 dark:text-slate-200 hover:text-primary">
              <FileText size={18} />
              <span>Upload Notes & PYQs</span>
            </Link>
            <Link href="/faculty?tab=attendance" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-colors text-slate-700 dark:text-slate-200 hover:text-primary">
              <CheckSquare size={18} />
              <span>Take Attendance</span>
            </Link>
            <Link href="/faculty?tab=results" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-colors text-slate-700 dark:text-slate-200 hover:text-primary">
              <Award size={18} />
              <span>Gradebook Marks</span>
            </Link>
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4 px-4">
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-white truncate max-w-[120px]">{user.name}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">prashant@aimhigh.com</p>
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
      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        {children}
      </main>
    </div>
  );
}
