'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { User, Mail, Phone, Lock, Book, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function ProfileSection() {
  const { refreshUser } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Role Specific Form State
  const [className, setClassName] = useState('');
  const [board, setBoard] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [qualification, setQualification] = useState('');
  const [experience, setExperience] = useState('');
  const [subjects, setSubjects] = useState('');
  const [biography, setBiography] = useState('');
  const [relation, setRelation] = useState('');
  const [address, setAddress] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get('/auth/me');
      const userData = response.data.user;
      setProfileData(userData);
      
      // Initialize form fields
      setName(userData.name || '');
      setEmail(userData.email || '');
      setPhone(userData.phone || '');

      if (userData.role === 'STUDENT' && userData.studentProfile) {
        setClassName(userData.studentProfile.className || '');
        setBoard(userData.studentProfile.board || '');
        setRollNumber(userData.studentProfile.rollNumber || '');
      } else if (userData.role === 'FACULTY' && userData.facultyProfile) {
        setQualification(userData.facultyProfile.qualification || '');
        setExperience(userData.facultyProfile.experience || '');
        
        let subjectsVal = userData.facultyProfile.subjects || '';
        try {
          // If stored as JSON string
          const parsed = JSON.parse(subjectsVal);
          if (Array.isArray(parsed)) {
            subjectsVal = parsed.join(', ');
          }
        } catch (e) {
          // Keep as string
        }
        setSubjects(subjectsVal);
        setBiography(userData.facultyProfile.biography || '');
      } else if (userData.role === 'PARENT' && userData.parentProfile) {
        setRelation(userData.parentProfile.relation || '');
        setAddress(userData.parentProfile.address || '');
        setAlternatePhone(userData.parentProfile.alternatePhone || '');
      }
    } catch (err: any) {
      setErrorMsg('Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (password && password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setSaving(true);

    const payload: any = {
      name,
      email,
      phone,
    };

    if (password) {
      payload.password = password;
    }

    if (profileData.role === 'STUDENT') {
      payload.className = className;
      payload.board = board;
    } else if (profileData.role === 'FACULTY') {
      payload.qualification = qualification;
      payload.experience = experience;
      payload.subjects = subjects;
      payload.biography = biography;
    } else if (profileData.role === 'PARENT') {
      payload.relation = relation;
      payload.address = address;
      payload.alternatePhone = alternatePhone;
    }

    try {
      await api.put('/auth/me', payload);
      setSuccessMsg('Profile updated successfully!');
      setPassword('');
      setConfirmPassword('');
      // Sync authentication context state
      await refreshUser();
      // Re-fetch current data
      await fetchProfile();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">Loading your profile...</p>
      </div>
    );
  }

  const roleLabels: Record<string, string> = {
    ADMIN: 'Academy Administrator',
    FACULTY: 'Teaching Faculty / Mentor',
    STUDENT: 'Enrolled Student',
    PARENT: 'Parent / Guardian',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in p-2">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">My Profile Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your account credentials and dashboard preferences.</p>
      </div>

      {/* Alert Feedbacks */}
      {successMsg && (
        <div className="flex items-center space-x-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm">
          <CheckCircle size={18} className="flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center space-x-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: User Summary Card */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center justify-start h-fit">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl mb-4 border border-primary/20 shadow-inner">
            {name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate max-w-full">{name}</h2>
          <p className="text-xs font-semibold text-primary uppercase tracking-wider mt-1">{roleLabels[profileData?.role]}</p>
          <div className="w-full border-t border-slate-100 dark:border-slate-800/60 my-5" />
          
          <div className="w-full space-y-4 text-left text-sm text-slate-600 dark:text-slate-300">
            <div className="flex items-center space-x-3">
              <Mail size={16} className="text-slate-400" />
              <span className="truncate">{email}</span>
            </div>
            {phone && (
              <div className="flex items-center space-x-3">
                <Phone size={16} className="text-slate-400" />
                <span>{phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Profile Edit Form */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-850 pb-4">
              <h3 className="text-md font-bold text-slate-900 dark:text-white">Account Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 rounded-xl border focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 rounded-xl border focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 rounded-xl border focus:outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Role Specific Configurations */}
            {profileData?.role === 'STUDENT' && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-850 pb-4 pt-2">
                  <h3 className="text-md font-bold text-slate-900 dark:text-white">Academic Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-2">Class Name</label>
                    <input
                      type="text"
                      disabled
                      value={className}
                      className="w-full h-11 px-4 rounded-xl border bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-sm cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-2">Academic Board</label>
                    <input
                      type="text"
                      disabled
                      value={board}
                      className="w-full h-11 px-4 rounded-xl border bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-sm cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-2">Roll Number</label>
                    <input
                      type="text"
                      disabled
                      value={rollNumber}
                      className="w-full h-11 px-4 rounded-xl border bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-sm cursor-not-allowed"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Contact admin to modify locked student parameters.</p>
              </div>
            )}

            {profileData?.role === 'FACULTY' && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-850 pb-4 pt-2">
                  <h3 className="text-md font-bold text-slate-900 dark:text-white">Faculty Bio & Qualifications</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-2">Qualifications</label>
                    <input
                      type="text"
                      required
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      placeholder="e.g. M.Sc. in Physics, IIT Kanpur"
                      className="w-full h-11 px-4 rounded-xl border focus:outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-2">Teaching Experience</label>
                    <input
                      type="text"
                      required
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      placeholder="e.g. 5+ Years"
                      className="w-full h-11 px-4 rounded-xl border focus:outline-none text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-2">Subjects Taught (comma separated)</label>
                    <div className="relative">
                      <Book className="absolute left-3 top-3 text-slate-400" size={18} />
                      <input
                        type="text"
                        required
                        value={subjects}
                        onChange={(e) => setSubjects(e.target.value)}
                        placeholder="Physics, Mathematics"
                        className="w-full h-11 pl-10 pr-4 rounded-xl border focus:outline-none text-sm"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-2">Brief Bio</label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 text-slate-400" size={18} />
                      <textarea
                        required
                        value={biography}
                        onChange={(e) => setBiography(e.target.value)}
                        rows={3}
                        placeholder="Tell students about your teaching philosophy..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none text-sm min-h-[80px]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {profileData?.role === 'PARENT' && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-850 pb-4 pt-2">
                  <h3 className="text-md font-bold text-slate-900 dark:text-white">Parent / Guardian Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-2">Relation to Student</label>
                    <input
                      type="text"
                      required
                      value={relation}
                      onChange={(e) => setRelation(e.target.value)}
                      placeholder="Father, Mother, Guardian"
                      className="w-full h-11 px-4 rounded-xl border focus:outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-2">Alternate Phone</label>
                    <input
                      type="tel"
                      value={alternatePhone}
                      onChange={(e) => setAlternatePhone(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border focus:outline-none text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-2">Residential Address</label>
                    <textarea
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl border focus:outline-none text-sm min-h-[60px]"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-850 pb-4 pt-2">
                <h3 className="text-md font-bold text-slate-900 dark:text-white">Security & Password</h3>
                <p className="text-xs text-slate-450 mt-1">Leave these blank if you do not wish to change your password.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-2">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 rounded-xl border focus:outline-none text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 rounded-xl border focus:outline-none text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full h-11 flex items-center justify-center rounded-xl bg-primary text-white hover:bg-indigo-700 transition-colors text-sm font-semibold shadow-md cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  Saving updates...
                </>
              ) : (
                'Save Profile Changes'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
