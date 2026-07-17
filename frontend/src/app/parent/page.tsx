'use client';

import React, { useState, useEffect, Suspense } from 'react';
import api from '../../lib/api';
import { useSearchParams } from 'next/navigation';
import ProfileSection from '../components/ProfileSection';
import { 
  HeartHandshake, CheckSquare, Award, CreditCard, 
  Bell, Calendar, Clock, BookOpen, User 
} from 'lucide-react';
import { motion } from 'framer-motion';

function ParentDashboardContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'overview';

  const [studentName, setStudentName] = useState('');
  const [stats, setStats] = useState<any>({
    attendanceRate: 0,
    pendingFeesCount: 0,
    latestResultPercentage: 0
  });
  const [results, setResults] = useState<any[]>([]);
  const [pendingFees, setPendingFees] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchParentDashboard();
  }, []);

  const fetchParentDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/stats');
      if (res.data) {
        setStudentName(res.data.studentName || 'Student');
        setStats(res.data.stats || {});
        setResults(res.data.results || []);
        setPendingFees(res.data.pendingFees || []);
        setNotices(res.data.notices || []);
      }
    } catch (err) {
      console.error('Failed to load parent stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white capitalize">
            {tab} View
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Tracking academic records for <strong>{studentName}</strong>.
          </p>
        </div>
        <span className="text-xs px-3 py-1.5 rounded-full bg-slate-200 dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-300 mt-2 md:mt-0">
          Parent Supervision Active
        </span>
      </div>

      {tab === 'overview' && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Child Attendance</span>
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{stats.attendanceRate}%</h3>
              </div>
              <div className="w-12 h-12 bg-primary/10 dark:bg-secondary/15 rounded-2xl flex items-center justify-center text-primary dark:text-secondary">
                <CheckSquare size={20} />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Latest Grade</span>
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{stats.latestResultPercentage}%</h3>
              </div>
              <div className="w-12 h-12 bg-primary/10 dark:bg-secondary/15 rounded-2xl flex items-center justify-center text-primary dark:text-secondary">
                <Award size={20} />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Pending Invoices</span>
                <h3 className="text-3xl font-extrabold text-red-500 mt-1">{stats.pendingFeesCount} Bills</h3>
              </div>
              <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500">
                <CreditCard size={20} />
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Test Results list */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Latest Academic Performance</h3>
                <div className="space-y-4">
                  {results.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">No test marks published yet.</p>
                  ) : (
                    results.map((res) => {
                      const percent = Math.round((res.marksObtained / res.totalMarks) * 100);
                      return (
                        <div key={res.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{res.examName}</h4>
                            <p className="text-xs text-slate-500 mt-1">Subject: {res.subject.name} | Format: {res.type}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{res.marksObtained}/{res.totalMarks}</p>
                            <p className="text-[10px] text-slate-500">{percent}% Correct</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Unpaid Tuitions and Notice links */}
            <div className="space-y-8">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">tuition fee Invoices</h3>
                <div className="space-y-4">
                  {pendingFees.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">No pending bills.</p>
                  ) : (
                    pendingFees.map((inv) => (
                      <div key={inv.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                        <span className="text-[9px] font-bold text-slate-400 block uppercase">{inv.invoiceNo}</span>
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 mt-1">₹{inv.amount}</h4>
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500">
                          <span>Due: {new Date(inv.dueDate).toLocaleDateString()}</span>
                          <span className="text-red-500 font-bold uppercase">{inv.status}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {tab === 'attendance' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 max-w-md mx-auto space-y-6">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Child Attendance Summary</h3>
          <div className="flex items-center space-x-6 p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
            <div className="w-20 h-20 rounded-full border-4 border-primary dark:border-secondary flex items-center justify-center font-extrabold text-lg text-slate-800 dark:text-white">
              {stats.attendanceRate}%
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Current Attendance Rate</h4>
              <p className="text-xs text-slate-500 mt-1">The academy monitors student attendance daily to optimize performance.</p>
            </div>
          </div>
        </div>
      )}

      {tab === 'results' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 max-w-2xl mx-auto space-y-6">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Child Test Performance Report</h3>
          <div className="space-y-4">
            {results.map((res) => {
              const percent = Math.round((res.marksObtained / res.totalMarks) * 100);
              return (
                <div key={res.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{res.examName}</h4>
                    <p className="text-xs text-slate-500 mt-1">Subject: {res.subject.name} | Type: {res.type}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">{res.marksObtained} / {res.totalMarks}</span>
                    <span className="text-[10px] text-slate-500 block">{percent}% Correct</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === 'fees' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 max-w-xl mx-auto space-y-6">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Tuition Fee Bills</h3>
          <div className="space-y-4">
            {pendingFees.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No bills pending payment.</p>
            ) : (
              pendingFees.map((inv) => (
                <div key={inv.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block uppercase">{inv.invoiceNo}</span>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 mt-1">₹{inv.amount}</h4>
                    <p className="text-[10px] text-slate-500">Due: {new Date(inv.dueDate).toLocaleDateString()}</p>
                  </div>
                  <span className="px-3 py-1 rounded text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20">{inv.status}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {tab === 'notices' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 max-w-2xl mx-auto space-y-6">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Notice Board Announcements</h3>
          <div className="space-y-4">
            {notices.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No notices posted yet.</p>
            ) : (
              notices.map((n) => (
                <div key={n.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 relative">
                  {n.isImportant && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-[9px] font-bold text-red-500 uppercase">Urgent</span>
                  )}
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{n.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{n.content}</p>
                  <span className="text-[10px] text-slate-400 mt-3 flex items-center space-x-1">
                    <Calendar size={12} className="mr-1" />
                    <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {tab === 'profile' && (
        <ProfileSection />
      )}
    </div>
  );
}

export default function ParentDashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-500 font-semibold">Loading parent panel...</div>}>
      <ParentDashboardContent />
    </Suspense>
  );
}
