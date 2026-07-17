'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { User, Mail, Phone, Lock, Book, FileText, CheckCircle, AlertCircle, Loader2, Upload } from 'lucide-react';

export default function ProfileSection() {
  const { refreshUser } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Profile picture file & preview
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

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

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('phone', phone);
    
    if (password) {
      formData.append('password', password);
    }
    
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    if (profileData.role === 'STUDENT') {
      formData.append('className', className);
      formData.append('board', board);
    } else if (profileData.role === 'FACULTY') {
      formData.append('qualification', qualification);
      formData.append('experience', experience);
      formData.append('subjects', subjects);
      formData.append('biography', biography);
    } else if (profileData.role === 'PARENT') {
      formData.append('relation', relation);
      formData.append('address', address);
      formData.append('alternatePhone', alternatePhone);
    }

    try {
      await api.put('/auth/me', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccessMsg('Profile updated successfully!');
      setPassword('');
      setConfirmPassword('');
      setAvatarFile(null);
      setAvatarPreview(null);
      setIsEditing(false);
      
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

  const getAvatarUrl = (avatarPath: string) => {
    if (!avatarPath) return '';
    if (avatarPath.startsWith('http')) return avatarPath;
    const apiBase = api.defaults.baseURL || 'http://localhost:5000/api';
    const host = apiBase.replace('/api', '');
    return `${host}${avatarPath}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary dark:text-secondary" size={40} />
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

  const getInputClassName = (isFieldEditable: boolean) => {
    const base = "w-full h-11 rounded-xl border text-sm transition-all focus:outline-none";
    if (isFieldEditable) {
      return `${base} border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:border-primary`;
    }
    return `${base} border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/40 text-slate-550 dark:text-slate-450 cursor-not-allowed`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in p-2">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">My Profile Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your account credentials, biography, and profile picture.</p>
        </div>
        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 font-bold text-sm shadow-md transition-all cursor-pointer self-start sm:self-auto"
          >
            Edit Profile
          </button>
        )}
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
        {/* Left Column: User Summary Card & Avatar Upload */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center justify-start h-fit">
          
          {/* Interactive Avatar Container */}
          <div className="relative group w-24 h-24 mb-4">
            {avatarPreview ? (
              <img 
                src={avatarPreview} 
                alt={name} 
                className="w-24 h-24 rounded-full object-cover border border-primary/25 shadow-md"
              />
            ) : profileData?.avatar ? (
              <img 
                src={getAvatarUrl(profileData.avatar)} 
                alt={name} 
                className="w-24 h-24 rounded-full object-cover border border-primary/25 shadow-md"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-secondary font-bold text-3xl border border-primary/20 shadow-inner">
                {name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
              </div>
            )}
            {/* Camera Overlay for Quick Upload (active only in editing mode) */}
            {isEditing && (
              <label className="absolute inset-0 bg-black/50 text-white rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-bold">
                <Upload size={16} className="mb-1" />
                <span>Upload Photo</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setAvatarFile(file);
                      setAvatarPreview(URL.createObjectURL(file));
                    }
                  }}
                  className="hidden" 
                />
              </label>
            )}
          </div>
          
          <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate max-w-full">{name}</h2>
          <p className="text-xs font-semibold text-primary dark:text-secondary uppercase tracking-wider mt-1">{roleLabels[profileData?.role]}</p>
          
          {/* File Picker Display below avatar (active only in editing mode) */}
          {isEditing ? (
            <label className="mt-3 inline-flex items-center space-x-1 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[10px] font-bold text-slate-500 dark:text-slate-400 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 transition-all">
              <Upload size={12} />
              <span>{avatarFile ? 'Change Pending File' : 'Browse Avatar Image'}</span>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setAvatarFile(file);
                    setAvatarPreview(URL.createObjectURL(file));
                  }
                }}
                className="hidden" 
              />
            </label>
          ) : (
            <span className="mt-3 inline-flex items-center space-x-1 px-3 py-1 bg-slate-100 dark:bg-slate-800/40 text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest rounded-full">
              Profile locked
            </span>
          )}
          {avatarFile && (
            <p className="text-[10px] text-emerald-500 font-bold mt-2 truncate max-w-full">
              Selected: {avatarFile.name}
            </p>
          )}

          <div className="w-full border-t border-slate-100 dark:border-slate-800/60 my-5" />
          
          <div className="w-full space-y-4 text-left text-sm text-slate-600 dark:text-slate-350">
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
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center justify-between">
              <h3 className="text-md font-bold text-slate-900 dark:text-white">Account Details</h3>
              {isEditing && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                  Edit Mode Active
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input
                    type="text"
                    required
                    disabled={!isEditing}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`${getInputClassName(isEditing)} pl-10 pr-4`}
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
                    disabled={!isEditing}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`${getInputClassName(isEditing)} pl-10 pr-4`}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input
                    type="tel"
                    disabled={!isEditing}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`${getInputClassName(isEditing)} pl-10 pr-4`}
                  />
                </div>
              </div>
            </div>

            {/* Role Specific Configurations */}
            {profileData?.role === 'STUDENT' && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4 pt-2">
                  <h3 className="text-md font-bold text-slate-900 dark:text-white">Academic Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-2">Class Name</label>
                    <input
                      type="text"
                      disabled
                      value={className}
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/40 text-slate-400 dark:text-slate-500 text-sm cursor-not-allowed focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-2">Academic Board</label>
                    <input
                      type="text"
                      disabled
                      value={board}
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/40 text-slate-400 dark:text-slate-500 text-sm cursor-not-allowed focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-2">Roll Number</label>
                    <input
                      type="text"
                      disabled
                      value={rollNumber}
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/40 text-slate-400 dark:text-slate-500 text-sm cursor-not-allowed focus:outline-none"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Contact admin to modify locked student parameters.</p>
              </div>
            )}

            {profileData?.role === 'FACULTY' && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4 pt-2">
                  <h3 className="text-md font-bold text-slate-900 dark:text-white">Faculty Bio & Qualifications</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-2">Qualifications</label>
                    <input
                      type="text"
                      required
                      disabled={!isEditing}
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      placeholder="e.g. M.Sc. in Physics, IIT Kanpur"
                      className={`${getInputClassName(isEditing)} px-4`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-2">Teaching Experience</label>
                    <input
                      type="text"
                      required
                      disabled={!isEditing}
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      placeholder="e.g. 5+ Years"
                      className={`${getInputClassName(isEditing)} px-4`}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-2">Subjects Taught (comma separated)</label>
                    <div className="relative">
                      <Book className="absolute left-3 top-3 text-slate-400" size={18} />
                      <input
                        type="text"
                        required
                        disabled={!isEditing}
                        value={subjects}
                        onChange={(e) => setSubjects(e.target.value)}
                        placeholder="Physics, Mathematics"
                        className={`${getInputClassName(isEditing)} pl-10 pr-4`}
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-2">Brief Bio</label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 text-slate-400" size={18} />
                      <textarea
                        required
                        disabled={!isEditing}
                        value={biography}
                        onChange={(e) => setBiography(e.target.value)}
                        rows={3}
                        placeholder="Tell students about your teaching philosophy..."
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all focus:outline-none min-h-[80px] resize-none ${isEditing ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:border-primary' : 'border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/40 text-slate-550 dark:text-slate-450 cursor-not-allowed'}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {profileData?.role === 'PARENT' && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4 pt-2">
                  <h3 className="text-md font-bold text-slate-900 dark:text-white">Parent / Guardian Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-2">Relation to Student</label>
                    <input
                      type="text"
                      required
                      disabled={!isEditing}
                      value={relation}
                      onChange={(e) => setRelation(e.target.value)}
                      placeholder="Father, Mother, Guardian"
                      className={`${getInputClassName(isEditing)} px-4`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-2">Alternate Phone</label>
                    <input
                      type="tel"
                      disabled={!isEditing}
                      value={alternatePhone}
                      onChange={(e) => setAlternatePhone(e.target.value)}
                      className={`${getInputClassName(isEditing)} px-4`}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-2">Residential Address</label>
                    <textarea
                      required
                      disabled={!isEditing}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={2}
                      className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none min-h-[60px] resize-none ${isEditing ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:border-primary' : 'border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/40 text-slate-550 dark:text-slate-450 cursor-not-allowed'}`}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4 pt-2">
                <h3 className="text-md font-bold text-slate-900 dark:text-white">Security & Password</h3>
                <p className="text-xs text-slate-400 mt-1">Passwords can be updated only when Edit Mode is active.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-2">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input
                      type="password"
                      disabled={!isEditing}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={isEditing ? "Type new password" : "••••••••"}
                      className={`${getInputClassName(isEditing)} pl-10 pr-4`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input
                      type="password"
                      disabled={!isEditing}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={isEditing ? "Re-type new password" : "••••••••"}
                      className={`${getInputClassName(isEditing)} pl-10 pr-4`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {isEditing ? (
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 h-11 flex items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all text-sm font-semibold shadow-md cursor-pointer disabled:opacity-50"
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
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    fetchProfile();
                    setAvatarFile(null);
                    setAvatarPreview(null);
                    setPassword('');
                    setConfirmPassword('');
                  }}
                  className="px-6 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-650 dark:text-slate-350 text-sm font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="w-full h-11 flex items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all text-sm font-semibold shadow-md cursor-pointer"
              >
                Edit Profile
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
