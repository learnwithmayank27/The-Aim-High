'use client';

import React, { useState, useEffect, Suspense } from 'react';
import api from '../../lib/api';
import { useSearchParams } from 'next/navigation';
import ProfileSection from '../components/ProfileSection';
import { 
  CheckSquare, Clock, CreditCard, Video, Award, 
  ArrowRight, ShieldAlert, Sparkles, CheckCircle, FileText, Upload
} from 'lucide-react';
import { motion } from 'framer-motion';

function StudentDashboardContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'overview';

  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>({
    attendanceRate: 0,
    pendingHomework: 0,
    pendingFeesAmount: 0
  });
  const [upcomingLive, setUpcomingLive] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [feeInvoices, setFeeInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dynamic Data Lists for Tabs
  const [videos, setVideos] = useState<any[]>([]);
  const [papers, setPapers] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);

  // Billing states
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [paying, setPaying] = useState(false);
  const [paySuccessMsg, setPaySuccessMsg] = useState('');

  // Homework submission state
  const [submittingHomeworkId, setSubmittingHomeworkId] = useState<string | null>(null);
  const [hwFile, setHwFile] = useState<File | null>(null);
  const [hwSuccessMsg, setHwSuccessMsg] = useState('');

  // Paper solution state
  const [solvingPaperId, setSolvingPaperId] = useState<string | null>(null);
  const [solutionFile, setSolutionFile] = useState<File | null>(null);
  const [solveSuccessMsg, setSolveSuccessMsg] = useState('');

  useEffect(() => {
    fetchStudentDashboard();
  }, []);

  useEffect(() => {
    if (profile?.id) {
      if (tab === 'lectures') fetchVideos();
      if (tab === 'papers') fetchPapers();
      if (tab === 'homework') fetchSubmissions();
    }
  }, [tab, profile]);

  const fetchStudentDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/stats');
      if (res.data) {
        setProfile(res.data.profile || {});
        setStats(res.data.stats || {});
        setUpcomingLive(res.data.upcomingLive || []);
        setResults(res.data.latestResults || []);
        
        if (res.data.profile?.id) {
          const feeRes = await api.get(`/fees/student/${res.data.profile.id}`);
          setFeeInvoices(feeRes.data || []);
        }
      }
    } catch (err) {
      console.error('Failed to load student stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVideos = async () => {
    try {
      const res = await api.get('/videos');
      setVideos(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPapers = async () => {
    try {
      const res = await api.get('/papers');
      setPapers(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const res = await api.get('/homework/my-submissions');
      setSubmissions(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimulatePayment = async () => {
    if (!selectedInvoice) return;
    try {
      setPaying(true);
      await api.post(`/fees/${selectedInvoice.id}/pay`, { paymentMethod });
      
      setPaySuccessMsg('Payment Successful! Receipt generated.');
      setSelectedInvoice(null);
      
      setTimeout(() => {
        setPaySuccessMsg('');
        fetchStudentDashboard();
      }, 2500);
    } catch (err) {
      console.error('Payment simulation failed:', err);
    } finally {
      setPaying(false);
    }
  };

  const handleSubmitHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingHomeworkId || !hwFile) return;
    try {
      const formData = new FormData();
      formData.append('homeworkId', submittingHomeworkId);
      formData.append('file', hwFile);
      
      await api.post('/homework/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setHwSuccessMsg('Homework submitted successfully!');
      setSubmittingHomeworkId(null);
      setHwFile(null);
      fetchSubmissions();
      setTimeout(() => setHwSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to submit homework:', err);
    }
  };

  const handleSubmitPaperSolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!solvingPaperId || !solutionFile) return;
    try {
      const formData = new FormData();
      formData.append('paperId', solvingPaperId);
      formData.append('file', solutionFile);

      await api.post('/papers/solution', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSolveSuccessMsg('Solution uploaded successfully for review!');
      setSolvingPaperId(null);
      setSolutionFile(null);
      setTimeout(() => setSolveSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to submit paper solution:', err);
    }
  };

  if (loading || !profile) {
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
            Welcome, {profile.user?.name || 'Student'}.
          </p>
        </div>
        <span className="text-xs px-3 py-1.5 rounded-full bg-slate-200 dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-300 mt-2 md:mt-0">
          Roll: {profile.rollNumber} | {profile.className} ({profile.board})
        </span>
      </div>

      {tab === 'overview' && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Attendance Rate</span>
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{stats.attendanceRate}%</h3>
              </div>
              <div className="w-12 h-12 bg-primary/10 dark:bg-secondary/15 rounded-2xl flex items-center justify-center text-primary dark:text-secondary">
                <CheckSquare size={20} />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Pending Homework</span>
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{stats.pendingHomework}</h3>
              </div>
              <div className="w-12 h-12 bg-primary/10 dark:bg-secondary/15 rounded-2xl flex items-center justify-center text-primary dark:text-secondary">
                <Clock size={20} />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Unpaid Fees</span>
                <h3 className="text-3xl font-extrabold text-red-500 mt-1">₹{stats.pendingFeesAmount}</h3>
              </div>
              <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500">
                <CreditCard size={20} />
              </div>
            </div>
          </div>

          {paySuccessMsg && (
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 text-xs font-semibold flex items-center space-x-2">
              <CheckCircle size={16} />
              <span>{paySuccessMsg}</span>
            </div>
          )}

          {/* Main grids */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Live Classes */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Upcoming Live Class Schedule</h3>
                <div className="space-y-4">
                  {upcomingLive.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-8">No online live sessions active.</p>
                  ) : (
                    upcomingLive.map((live) => (
                      <div key={live.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                        <div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-secondary font-bold uppercase">
                            {live.platform}
                          </span>
                          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mt-2">{live.title}</h4>
                          <p className="text-xs text-slate-500 mt-1">Instructor: {live.faculty.user.name}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-left sm:text-right">
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{new Date(live.scheduledTime).toLocaleDateString()}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{new Date(live.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({live.durationMins} mins)</p>
                          </div>
                          <a href={live.link} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/95 transition-all flex items-center cursor-pointer">
                            Join Class <ArrowRight size={12} className="ml-1" />
                          </a>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Grades */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Latest Test Gradebook</h3>
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
                            <p className="text-xs text-slate-500 mt-1">Subject: {res.subject.name} | Type: {res.type}</p>
                          </div>
                          <div className="flex items-center space-x-6">
                            <div className="text-right">
                              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{res.marksObtained}/{res.totalMarks}</p>
                              <p className="text-[10px] text-slate-500">{percent}% Correct</p>
                            </div>
                            <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs border ${
                              percent >= 90 
                                ? 'bg-green-500/10 border-green-500/20 text-green-500' 
                                : percent >= 75 
                                ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' 
                                : 'bg-red-500/10 border-red-500/20 text-red-500'
                            }`}>
                              {percent >= 90 ? 'A+' : percent >= 75 ? 'B' : 'C'}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="space-y-8">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Fees Billing</h3>
                <div className="space-y-4">
                  {feeInvoices.map((inv) => (
                    <div key={inv.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 relative">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">{inv.invoiceNo}</span>
                          <h4 className="font-bold text-slate-800 dark:text-slate-200 mt-1">₹{inv.amount}</h4>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                          inv.status === 'PAID' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-500">Due: {new Date(inv.dueDate).toLocaleDateString()}</span>
                        {inv.status === 'PENDING' && (
                          <button onClick={() => setSelectedInvoice(inv)} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-bold text-[10px] hover:bg-primary/95 transition-all cursor-pointer">
                            Pay Online
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {tab === 'homework' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 max-w-4xl mx-auto space-y-6">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Homework Submissions Log</h3>
          
          {hwSuccessMsg && (
            <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 text-xs font-semibold">
              {hwSuccessMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">My Submitted Tasks</h4>
              <div className="space-y-4">
                {submissions.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4">No submissions made yet.</p>
                ) : (
                  submissions.map((sub) => (
                    <div key={sub.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between">
                        <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200">{sub.homework.title}</h5>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-green-500/10 text-green-500 border border-green-500/20 uppercase font-bold">{sub.status}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-2">Submitted: {new Date(sub.submittedAt).toLocaleDateString()}</p>
                      {sub.marks !== null && (
                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs">
                          <span className="font-semibold text-slate-700">Grade: {sub.marks} Marks</span>
                          <span className="text-slate-500 italic">Feedback: "{sub.feedback || 'None'}"</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Upload Assignment Solution</h4>
              <form onSubmit={handleSubmitHomework} className="space-y-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Homework ID</label>
                  <input type="text" value={submittingHomeworkId || ''} onChange={(e) => setSubmittingHomeworkId(e.target.value)} required placeholder="Paste homework UUID" className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Solution File</label>
                  <input 
                    type="file" 
                    required 
                    onChange={(e) => setHwFile(e.target.files?.[0] || null)}
                    className="w-full h-11 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none text-slate-700 dark:text-slate-300" 
                  />
                </div>
                <button type="submit" className="w-full h-10 rounded-lg bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/95 transition-all flex items-center justify-center space-x-2 cursor-pointer">
                  <Upload size={14} />
                  <span>Submit Solutions</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {tab === 'lectures' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 space-y-6">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Active Video Lectures Library</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center col-span-full">No video lectures cataloged.</p>
            ) : (
              videos.map((vid) => (
                <div key={vid.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold uppercase">{vid.chapter}</span>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mt-2">{vid.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{vid.description}</p>
                  </div>
                  <a href={vid.youtubeUrl || '#'} target="_blank" rel="noreferrer" className="w-full mt-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs text-center block hover:bg-red-700 transition-all">
                    Watch on YouTube
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {tab === 'papers' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 space-y-6">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">PYQs & Model Study Papers</h3>
            
            {solveSuccessMsg && (
              <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 text-xs font-semibold">
                {solveSuccessMsg}
              </div>
            )}

            <div className="space-y-4">
              {papers.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No study papers listed.</p>
              ) : (
                papers.map((p) => (
                  <div key={p.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center space-y-4 sm:space-y-0">
                    <div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary dark:text-secondary font-bold uppercase">{p.type}</span>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mt-2">{p.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">Year: {p.year} | Difficulty: {p.difficulty}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <a href={p.fileUrl} target="_blank" rel="noreferrer" className="px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 font-bold text-xs text-slate-700 dark:text-slate-200">
                        View PDF
                      </a>
                      <button onClick={() => setSolvingPaperId(p.id)} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-xs cursor-pointer">
                        Submit Solution
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            {solvingPaperId ? (
              <form onSubmit={handleSubmitPaperSolution} className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 space-y-4">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Submit Paper Solution</h3>
                <p className="text-[10px] text-slate-500 font-medium">Browse and upload your solved solution paper.</p>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Solution Document</label>
                  <input 
                    type="file" 
                    required 
                    onChange={(e) => setSolutionFile(e.target.files?.[0] || null)}
                    className="w-full h-11 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none text-slate-700 dark:text-slate-300" 
                  />
                </div>
                <div className="flex space-x-2">
                  <button type="submit" className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground font-bold text-xs cursor-pointer">Submit</button>
                  <button type="button" onClick={() => setSolvingPaperId(null)} className="px-4 h-10 rounded-lg bg-slate-100 text-slate-500 text-xs cursor-pointer">Cancel</button>
                </div>
              </form>
            ) : (
              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 text-center py-12">
                <FileText className="mx-auto text-slate-300" size={36} />
                <p className="text-xs text-slate-400 mt-2">Select a paper solution to submit solved answers.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'attendance' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 max-w-md mx-auto space-y-6">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">My Attendance Rate</h3>
          <div className="flex items-center space-x-6 p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
            <div className="w-20 h-20 rounded-full border-4 border-emerald-500 flex items-center justify-center font-extrabold text-lg text-slate-800 dark:text-white">
              {stats.attendanceRate}%
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Regular Attendance</h4>
              <p className="text-xs text-slate-500 mt-1">Aim High requires at least 75% attendance for board exam registrations.</p>
            </div>
          </div>
        </div>
      )}

      {tab === 'results' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 max-w-3xl mx-auto space-y-6">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">My Gradebook Test Results</h3>
          <div className="space-y-4">
            {results.map((res) => {
              const percent = Math.round((res.marksObtained / res.totalMarks) * 100);
              return (
                <div key={res.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{res.examName}</h4>
                    <p className="text-xs text-slate-500 mt-1">Subject: {res.subject.name} | Format: {res.type}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{res.marksObtained} / {res.totalMarks} ({percent}%)</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${percent >= 75 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {percent >= 75 ? 'PASS' : 'FAIL'}
                    </span>
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
            {feeInvoices.map((inv) => (
              <div key={inv.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">{inv.invoiceNo}</span>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 mt-1">₹{inv.amount}</h4>
                  <p className="text-[10px] text-slate-500">Due: {new Date(inv.dueDate).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold border ${inv.status === 'PAID' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>{inv.status}</span>
                  {inv.status === 'PENDING' && (
                    <button onClick={() => setSelectedInvoice(inv)} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs cursor-pointer">
                      Pay Bill
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pay Drawer Backdrop Simulator */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-2xl relative">
            <h3 className="font-bold text-xl text-slate-900 dark:text-white">Aim High Payment Portal</h3>
            <p className="text-xs text-slate-500 mt-1">Simulating Card/UPI billing for invoice {selectedInvoice.invoiceNo}</p>

            <div className="my-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 text-center border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 block uppercase font-bold tracking-wider">Amount Due</span>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">₹{selectedInvoice.amount}</h2>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Select Payment Option</label>
              <div onClick={() => setPaymentMethod('UPI')} className={`p-3 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all ${paymentMethod === 'UPI' ? 'border-secondary bg-secondary/10' : 'border-slate-200 dark:border-slate-700'}`}>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">UPI (GPay / PhonePe)</span>
                <span className="text-[10px] text-slate-400">Zero surcharge</span>
              </div>
              <div onClick={() => setPaymentMethod('CARD')} className={`p-3 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all ${paymentMethod === 'CARD' ? 'border-secondary bg-secondary/10' : 'border-slate-200 dark:border-slate-700'}`}>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Debit / Credit Card</span>
                <span className="text-[10px] text-slate-400">Standard gateway charge</span>
              </div>
            </div>

            <div className="flex items-center space-x-4 mt-6">
              <button onClick={handleSimulatePayment} disabled={paying} className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg cursor-pointer">
                {paying ? 'Authorizing...' : 'Pay Simulated Amount'}
              </button>
              <button onClick={() => setSelectedInvoice(null)} className="px-4 h-11 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {tab === 'profile' && (
        <ProfileSection />
      )}
    </div>
  );
}

export default function StudentDashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-500 font-semibold">Loading student panel...</div>}>
      <StudentDashboardContent />
    </Suspense>
  );
}
