'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Lock, Mail, Users, Sparkles, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const { login, googleLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'STUDENT' | 'FACULTY' | 'ADMIN' | 'PARENT'>('STUDENT');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Invalid email, password or role.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleMockLogin = async () => {
    setError('');
    setLoading(true);
    try {
      // Send mock credentials for Google Login simulation
      const mockGoogleEmail = `${role.toLowerCase()}-google@aimhigh.com`;
      const mockGoogleName = `Google ${role.charAt(0) + role.slice(1).toLowerCase()} User`;
      await googleLogin(mockGoogleEmail, mockGoogleName, 'mock-google-token-xyz');
    } catch (err: any) {
      setError(err.message || 'Google Auth simulation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 relative">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-secondary/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />

      <div className="w-full max-w-md relative">
        <Link href="/" className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white mb-6 transition-colors">
          <ArrowLeft size={16} />
          <span>Back to homepage</span>
        </Link>

        <div className="glass rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-2xl">
          {/* Header */}
          <div className="text-center">
            <div className="relative mx-auto w-14 h-14 flex items-center justify-center mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/file_00000000717871fb90a931daa4d88bac.png" 
                alt="The Aim High Academy Logo" 
                className="h-14 w-auto object-contain block dark:hidden rotate-90"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/file_00000000f1d071faac6893ada3b5df28.png" 
                alt="The Aim High Academy Logo" 
                className="h-14 w-auto object-contain hidden dark:block"
              />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-4">Welcome back</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Access your Aim High Academy dashboard portal.</p>
          </div>

          {error && (
            <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center space-x-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Portal Role</label>
              <div className="relative">
                <Users className="absolute left-3 top-3.5 text-slate-400" size={18} />
                <select
                  value={role}
                  onChange={(e: any) => setRole(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary appearance-none cursor-pointer text-slate-700 dark:text-slate-300"
                >
                  <option value="STUDENT">Student Portal</option>
                  <option value="FACULTY">Faculty Portal</option>
                  <option value="PARENT">Parent Portal</option>
                  <option value="ADMIN">Administrator Portal</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="e.g. student@aimhigh.com"
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary text-slate-700 dark:text-slate-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary text-slate-700 dark:text-slate-300"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg flex items-center justify-center transition-all hover:bg-primary/95 disabled:opacity-70 mt-8 cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
