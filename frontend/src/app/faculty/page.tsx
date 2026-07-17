'use client';

import React, { useState, useEffect, Suspense } from 'react';
import api from '../../lib/api';
import { useSearchParams } from 'next/navigation';
import ProfileSection from '../components/ProfileSection';
import { 
  ClipboardList, Video, FileText, CheckCircle, 
  Calendar, Clock, Plus, BookOpen, AlertCircle,
  Users, CheckSquare, Award
} from 'lucide-react';
import { motion } from 'framer-motion';

function FacultyDashboardContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'overview';

  const [stats, setStats] = useState<any>({
    homeworkCount: 0,
    liveCount: 0,
    attendanceCount: 0,
    pendingGrading: 0
  });
  const [upcomingLive, setUpcomingLive] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Alert Notifications
  const [msg, setMsg] = useState({ type: '', text: '' });
  
  // 1. Video Form
  const [vTitle, setVTitle] = useState('');
  const [vDesc, setVDesc] = useState('');
  const [vUrl, setVUrl] = useState('');
  const [vClass, setVClass] = useState('Class 10');
  const [vChapter, setVChapter] = useState('');
  const [vTopic, setVTopic] = useState('');
  const [vSubId, setVSubId] = useState('');

  // 2. Homework Form
  const [hwTitle, setHwTitle] = useState('');
  const [hwInst, setHwInst] = useState('');
  const [hwDue, setHwDue] = useState('');
  const [hwSubId, setHwSubId] = useState('');
  const [hwFile, setHwFile] = useState<File | null>(null);

  // 3. Paper Form
  const [paperTitle, setPaperTitle] = useState('');
  const [paperType, setPaperType] = useState('PREVIOUS_YEAR');
  const [paperDiff, setPaperDiff] = useState('MEDIUM');
  const [paperYear, setPaperYear] = useState(new Date().getFullYear());
  const [paperSubId, setPaperSubId] = useState('');
  const [paperFile, setPaperFile] = useState<File | null>(null);

  // 4. Attendance Form
  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0]);
  const [attStatus, setAttStatus] = useState('PRESENT');
  const [attStudentId, setAttStudentId] = useState('');

  // 5. Grading Form
  const [submissionId, setSubmissionId] = useState('');
  const [gradeMarks, setGradeMarks] = useState('');
  const [gradeFeedback, setGradeFeedback] = useState('');

  useEffect(() => {
    fetchFacultyData();
  }, []);

  const fetchFacultyData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/stats');
      if (res.data) {
        setStats(res.data.stats || {});
        setUpcomingLive(res.data.upcomingLive || []);
      }

      // Load courses list for dropdowns
      const courseRes = await api.get('/courses');
      if (courseRes.data) {
        setCourses(courseRes.data);
        const firstSubject = courseRes.data[0]?.subjects[0]?.id || '';
        setVSubId(firstSubject);
        setHwSubId(firstSubject);
        setPaperSubId(firstSubject);
      }
    } catch (err) {
      console.error('Failed to load faculty stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const triggerAlert = (type: 'success' | 'error', text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 4000);
  };

  const handlePublishVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vTitle || !vChapter || !vTopic || !vSubId) return;
    try {
      await api.post('/videos', {
        title: vTitle,
        description: vDesc,
        youtubeUrl: vUrl,
        className: vClass,
        chapter: vChapter,
        topic: vTopic,
        subjectId: vSubId
      });
      triggerAlert('success', 'Video lecture published successfully!');
      setVTitle('');
      setVDesc('');
      setVUrl('');
      setVChapter('');
      setVTopic('');
      fetchFacultyData();
    } catch (err: any) {
      triggerAlert('error', err.response?.data?.message || 'Failed to publish video.');
    }
  };

  const handleAssignHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hwTitle || !hwInst || !hwDue || !hwSubId) return;
    try {
      const formData = new FormData();
      formData.append('title', hwTitle);
      formData.append('instructions', hwInst);
      formData.append('dueDate', new Date(hwDue).toISOString());
      formData.append('subjectId', hwSubId);
      if (hwFile) {
        formData.append('file', hwFile);
      }

      await api.post('/homework', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      triggerAlert('success', 'Homework assigned to student portal!');
      setHwTitle('');
      setHwInst('');
      setHwDue('');
      setHwFile(null);
      fetchFacultyData();
    } catch (err: any) {
      triggerAlert('error', err.response?.data?.message || 'Failed to assign homework.');
    }
  };

  const handleUploadPaper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paperTitle || !paperSubId || !paperFile) return;
    try {
      const formData = new FormData();
      formData.append('title', paperTitle);
      formData.append('type', paperType);
      formData.append('difficulty', paperDiff);
      formData.append('year', paperYear.toString());
      formData.append('subjectId', paperSubId);
      formData.append('fileType', 'PDF');
      formData.append('file', paperFile);

      await api.post('/papers', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      triggerAlert('success', 'Study paper cataloged!');
      setPaperTitle('');
      setPaperFile(null);
    } catch (err: any) {
      triggerAlert('error', err.response?.data?.message || 'Failed to upload paper.');
    }
  };

  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attStudentId) return;
    try {
      await api.post('/attendance', {
        studentId: attStudentId,
        date: new Date(attDate),
        status: attStatus
      });
      triggerAlert('success', 'Attendance recorded successfully!');
      setAttStudentId('');
    } catch (err: any) {
      triggerAlert('error', err.response?.data?.message || 'Failed to mark attendance.');
    }
  };

  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionId || !gradeMarks) return;
    try {
      await api.patch(`/homework/submission/${submissionId}/grade`, {
        marks: parseFloat(gradeMarks),
        feedback: gradeFeedback
      });
      triggerAlert('success', 'Homework solution graded!');
      setSubmissionId('');
      setGradeMarks('');
      setGradeFeedback('');
      fetchFacultyData();
    } catch (err: any) {
      triggerAlert('error', err.response?.data?.message || 'Failed to grade submission.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Messages */}
      {msg.text && (
        <div className={`fixed top-6 right-6 p-4 rounded-xl text-white font-semibold text-xs shadow-2xl flex items-center space-x-2 z-50 animate-bounce ${
          msg.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {msg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white capitalize">
            Faculty Hub - {tab}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {tab === 'overview' && 'Review your assigned classes, homeworks, and schedules.'}
            {tab === 'homework' && 'Assign new tasks and exercises for your students.'}
            {tab === 'lectures' && 'Record and publish concept video lectures library.'}
            {tab === 'papers' && 'Add Board papers and Model papers with answer keys.'}
            {tab === 'attendance' && 'Mark student class attendance sheets.'}
            {tab === 'results' && 'Grade student homework solutions.'}
          </p>
        </div>
      </div>

      {tab === 'overview' && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Assigned Homework</span>
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{stats.homeworkCount}</h3>
              </div>
              <div className="w-12 h-12 bg-primary/10 dark:bg-secondary/15 rounded-2xl flex items-center justify-center text-primary dark:text-secondary">
                <ClipboardList size={20} />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Live Classes</span>
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{stats.liveCount}</h3>
              </div>
              <div className="w-12 h-12 bg-primary/10 dark:bg-secondary/15 rounded-2xl flex items-center justify-center text-primary dark:text-secondary">
                <Video size={20} />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Attendance Recorded</span>
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{stats.attendanceCount}</h3>
              </div>
              <div className="w-12 h-12 bg-primary/10 dark:bg-secondary/15 rounded-2xl flex items-center justify-center text-primary dark:text-secondary">
                <CheckSquare size={20} />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Pending Grading</span>
                <h3 className="text-3xl font-extrabold text-amber-500 mt-1">{stats.pendingGrading}</h3>
              </div>
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
                <Clock size={20} />
              </div>
            </div>
          </div>

          {/* Live classes list */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">My Upcoming Sessions</h3>
            <div className="space-y-4">
              {upcomingLive.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No live classes scheduled.</p>
              ) : (
                upcomingLive.map((live) => (
                  <div key={live.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary dark:text-secondary font-bold uppercase">{live.platform}</span>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mt-2">{live.title}</h4>
                      <p className="text-xs text-slate-500">Subject: {live.subject.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{new Date(live.scheduledTime).toLocaleDateString()}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{new Date(live.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {tab === 'homework' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 max-w-xl mx-auto space-y-6">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center space-x-2">
            <ClipboardList className="text-primary dark:text-secondary" />
            <span>Create Homework Assignment</span>
          </h3>
          <form onSubmit={handleAssignHomework} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Subject Selection</label>
              <select value={hwSubId} onChange={(e) => setHwSubId(e.target.value)} required className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none text-slate-700 dark:text-slate-300">
                {courses.map(c => c.subjects?.map((s: any) => (
                  <option key={s.id} value={s.id}>{c.name} - {s.name}</option>
                )))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Homework Title</label>
              <input type="text" value={hwTitle} onChange={(e) => setHwTitle(e.target.value)} required placeholder="e.g. Quadratic Equations Exercise 4.2" className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Instructions</label>
              <textarea value={hwInst} onChange={(e) => setHwInst(e.target.value)} required rows={4} placeholder="Solve questions 1-10..." className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none resize-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Due Date</label>
              <input type="date" value={hwDue} onChange={(e) => setHwDue(e.target.value)} required className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Worksheet/Reference File (Optional)</label>
              <input 
                type="file" 
                onChange={(e) => setHwFile(e.target.files?.[0] || null)}
                className="w-full h-11 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none text-slate-700 dark:text-slate-300" 
              />
            </div>
            <button type="submit" className="w-full h-11 rounded-xl bg-primary text-white dark:bg-secondary dark:text-primary font-bold shadow-md hover:bg-slate-800 transition-all flex items-center justify-center cursor-pointer">
              Publish Assignment
            </button>
          </form>
        </div>
      )}

      {tab === 'lectures' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 max-w-xl mx-auto space-y-6">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center space-x-2">
            <Video className="text-primary dark:text-secondary" />
            <span>Publish Video Lecture</span>
          </h3>
          <form onSubmit={handlePublishVideo} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Subject</label>
              <select value={vSubId} onChange={(e) => setVSubId(e.target.value)} required className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none text-slate-700 dark:text-slate-300">
                {courses.map(c => c.subjects?.map((s: any) => (
                  <option key={s.id} value={s.id}>{c.name} - {s.name}</option>
                )))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Chapter</label>
                <input type="text" value={vChapter} onChange={(e) => setVChapter(e.target.value)} required placeholder="e.g. Chapter 1: Real Numbers" className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Topic</label>
                <input type="text" value={vTopic} onChange={(e) => setVTopic(e.target.value)} required placeholder="e.g. Proof of Irrationality" className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Video Title</label>
              <input type="text" value={vTitle} onChange={(e) => setVTitle(e.target.value)} required placeholder="Video Lecture Title" className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">YouTube Video URL</label>
              <input type="text" value={vUrl} onChange={(e) => setVUrl(e.target.value)} required placeholder="https://www.youtube.com/watch?v=..." className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Description</label>
              <textarea value={vDesc} onChange={(e) => setVDesc(e.target.value)} rows={3} placeholder="Brief summary of lecture content..." className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none resize-none" />
            </div>
            <button type="submit" className="w-full h-11 rounded-xl bg-primary text-white dark:bg-secondary dark:text-primary font-bold shadow-md hover:bg-slate-800 transition-all flex items-center justify-center">
              Publish Video Lecture
            </button>
          </form>
        </div>
      )}

      {tab === 'papers' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 max-w-xl mx-auto space-y-6">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center space-x-2">
            <FileText className="text-primary dark:text-secondary" />
            <span>Upload Notes / Board PYQs</span>
          </h3>
          <form onSubmit={handleUploadPaper} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Subject</label>
              <select value={paperSubId} onChange={(e) => setPaperSubId(e.target.value)} required className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none text-slate-700 dark:text-slate-300">
                {courses.map(c => c.subjects?.map((s: any) => (
                  <option key={s.id} value={s.id}>{c.name} - {s.name}</option>
                )))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Document Title</label>
              <input type="text" value={paperTitle} onChange={(e) => setPaperTitle(e.target.value)} required placeholder="e.g. CBSE 10 Math 2025 Board Paper" className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Type</label>
                <select value={paperType} onChange={(e) => setPaperType(e.target.value)} className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none">
                  <option value="PREVIOUS_YEAR">Previous Year Paper</option>
                  <option value="MODEL">Model Paper</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Difficulty</label>
                <select value={paperDiff} onChange={(e) => setPaperDiff(e.target.value)} className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none">
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Year</label>
                <input type="number" value={paperYear} onChange={(e) => setPaperYear(parseInt(e.target.value))} required className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Upload Document File (PDF)</label>
                <input 
                  type="file" 
                  required 
                  onChange={(e) => setPaperFile(e.target.files?.[0] || null)}
                  className="w-full h-11 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none text-slate-700 dark:text-slate-300" 
                />
              </div>
            </div>
            <button type="submit" className="w-full h-11 rounded-xl bg-primary text-white dark:bg-secondary dark:text-primary font-bold shadow-md hover:bg-slate-800 transition-all flex items-center justify-center cursor-pointer">
              Publish Paper
            </button>
          </form>
        </div>
      )}

      {tab === 'attendance' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 max-w-md mx-auto space-y-6">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center space-x-2">
            <CheckSquare className="text-primary dark:text-secondary" />
            <span>Mark Student Attendance</span>
          </h3>
          <form onSubmit={handleMarkAttendance} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Student Profile UUID</label>
              <input type="text" value={attStudentId} onChange={(e) => setAttStudentId(e.target.value)} required placeholder="Paste student ID" className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Date</label>
              <input type="date" value={attDate} onChange={(e) => setAttDate(e.target.value)} required className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Attendance Status</label>
              <select value={attStatus} onChange={(e) => setAttStatus(e.target.value)} className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none">
                <option value="PRESENT">Present</option>
                <option value="ABSENT">Absent</option>
                <option value="LATE">Late</option>
              </select>
            </div>
            <button type="submit" className="w-full h-11 rounded-xl bg-primary text-white dark:bg-secondary dark:text-primary font-bold shadow-md hover:bg-slate-800 transition-all flex items-center justify-center">
              Mark Attendance
            </button>
          </form>
        </div>
      )}

      {tab === 'results' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 max-w-md mx-auto space-y-6">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center space-x-2">
            <Award className="text-primary dark:text-secondary" />
            <span>Grade Homework Submission</span>
          </h3>
          <form onSubmit={handleGradeSubmission} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Submission ID</label>
              <input type="text" value={submissionId} onChange={(e) => setSubmissionId(e.target.value)} required placeholder="Paste student submission UUID" className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Marks Scored</label>
              <input type="number" value={gradeMarks} onChange={(e) => setGradeMarks(e.target.value)} required placeholder="Score (e.g. 9)" className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Feedback Notes</label>
              <textarea value={gradeFeedback} onChange={(e) => setGradeFeedback(e.target.value)} rows={3} placeholder="Good conceptual clarity..." className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none resize-none" />
            </div>
            <button type="submit" className="w-full h-11 rounded-xl bg-primary text-white dark:bg-secondary dark:text-primary font-bold shadow-md hover:bg-slate-800 transition-all flex items-center justify-center">
              Submit Grading Result
            </button>
          </form>
        </div>
      )}

      {tab === 'profile' && (
        <ProfileSection />
      )}
    </div>
  );
}

export default function FacultyDashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-500 font-semibold">Loading faculty panel...</div>}>
      <FacultyDashboardContent />
    </Suspense>
  );
}
