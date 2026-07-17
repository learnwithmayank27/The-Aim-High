'use client';

import React, { useState, useEffect, Suspense } from 'react';
import api from '../../lib/api';
import { useSearchParams } from 'next/navigation';
import ProfileSection from '../components/ProfileSection';
import { 
  Users, BookOpen, CreditCard, Bell, 
  Plus, Calendar, Mail, FileText, CheckCircle,
  FilePlus, ShieldAlert, Sparkles, CheckSquare, Award, Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

function AdminDashboardContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'overview';

  const [stats, setStats] = useState<any>({
    studentCount: 0,
    facultyCount: 0,
    courseCount: 0,
    subjectCount: 0,
    collectedFees: 0,
    pendingFees: 0
  });
  const [notices, setNotices] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');
  const [actionErrorMsg, setActionErrorMsg] = useState('');

  // 1. Notice Board State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isImportant, setIsImportant] = useState(false);

  // 2. User Creation State
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('STUDENT');
  const [userPhone, setUserPhone] = useState('');
  const [studentClass, setStudentClass] = useState('Class 10');
  const [studentBoard, setStudentBoard] = useState('CBSE');
  const [studentRoll, setStudentRoll] = useState('');
  const [facultyQual, setFacultyQual] = useState('');
  const [facultyExp, setFacultyExp] = useState('');
  const [facultySubj, setFacultySubj] = useState('');
  const [facultyBio, setFacultyBio] = useState('');
  const [parentRel, setParentRel] = useState('Father');
  const [parentAddr, setParentAddr] = useState('');

  // 3. Course & Subject State
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [courseClass, setCourseClass] = useState('Class 10');
  const [courseBoard, setCourseBoard] = useState('CBSE');
  const [subjectName, setSubjectName] = useState('');
  const [subCourseId, setSubCourseId] = useState('');

  // 4. Paper State
  const [paperTitle, setPaperTitle] = useState('');
  const [paperType, setPaperType] = useState('PREVIOUS_YEAR');
  const [paperDifficulty, setPaperDifficulty] = useState('MEDIUM');
  const [paperYear, setPaperYear] = useState(new Date().getFullYear());
  const [paperSubjId, setPaperSubjId] = useState('');
  const [paperFile, setPaperFile] = useState<File | null>(null);

  // 5. Attendance State
  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0]);
  const [attStatus, setAttStatus] = useState('PRESENT');
  const [attStudentId, setAttStudentId] = useState('');

  // 6. Result State
  const [resExamName, setResExamName] = useState('');
  const [resType, setResType] = useState('MCQ');
  const [resMarks, setResMarks] = useState('');
  const [resTotal, setResTotal] = useState('');
  const [resStudentId, setResStudentId] = useState('');
  const [resSubjId, setResSubjId] = useState('');

  // 7. Fee State
  const [feeTitle, setFeeTitle] = useState('');
  const [feeAmount, setFeeAmount] = useState('');
  const [feeDueDate, setFeeDueDate] = useState('');
  const [feeStudentId, setFeeStudentId] = useState('');

  const [studentsList, setStudentsList] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchCourses();
    fetchStudentsList();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/stats');
      if (res.data) {
        setStats(res.data.stats || {});
        setNotices(res.data.recentNotices || []);
        setStudents(res.data.recentStudents || []);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      setCourses(res.data || []);
    } catch (err) {
      console.error('Failed to load courses:', err);
    }
  };

  const fetchStudentsList = async () => {
    try {
      const res = await api.get('/auth/students');
      const list = res.data.students || [];
      setStudentsList(list);
      if (list.length > 0) {
        setAttStudentId(list[0].id);
        setResStudentId(list[0].id);
        setFeeStudentId(list[0].id);
      }
    } catch (err) {
      console.error('Failed to load students list:', err);
    }
  };

  const triggerAlert = (success: boolean, msg: string) => {
    if (success) {
      setActionSuccessMsg(msg);
      setTimeout(() => setActionSuccessMsg(''), 4000);
    } else {
      setActionErrorMsg(msg);
      setTimeout(() => setActionErrorMsg(''), 4000);
    }
  };

  // Submit Notice
  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    try {
      await api.post('/content/notice', { title, content, isImportant });
      triggerAlert(true, 'Announcement posted successfully!');
      setTitle('');
      setContent('');
      setIsImportant(false);
      fetchStats();
    } catch (err: any) {
      triggerAlert(false, err.response?.data?.message || 'Failed to publish notice.');
    }
  };

  // Create User Profile
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      email: userEmail,
      password: userPassword,
      name: userName,
      role: userRole,
      phone: userPhone
    };

    if (userRole === 'STUDENT') {
      payload.className = studentClass;
      payload.board = studentBoard;
      payload.rollNumber = studentRoll;
    } else if (userRole === 'FACULTY') {
      payload.qualification = facultyQual;
      payload.experience = facultyExp;
      payload.subjects = JSON.stringify(facultySubj.split(',').map(s => s.trim()));
      payload.biography = facultyBio;
    } else if (userRole === 'PARENT') {
      payload.relation = parentRel;
      payload.address = parentAddr;
    }

    try {
      await api.post('/auth/register', payload);
      triggerAlert(true, `Successfully registered ${userName} as ${userRole}!`);
      // Clear forms
      setUserEmail('');
      setUserPassword('');
      setUserName('');
      setUserPhone('');
      setStudentRoll('');
      setFacultyBio('');
      setFacultyQual('');
      setFacultyExp('');
      setFacultySubj('');
      setParentAddr('');
      fetchStats();
    } catch (err: any) {
      triggerAlert(false, err.response?.data?.message || 'Failed to register user.');
    }
  };

  // Create Course
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/courses', {
        name: courseName,
        code: courseCode,
        description: courseDesc,
        className: courseClass,
        board: courseBoard
      });
      triggerAlert(true, `Course ${courseName} created!`);
      setCourseName('');
      setCourseCode('');
      setCourseDesc('');
      fetchCourses();
      fetchStats();
    } catch (err: any) {
      triggerAlert(false, err.response?.data?.message || 'Failed to create course.');
    }
  };

  // Create Subject
  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subCourseId) return triggerAlert(false, 'Please select a Course first.');
    try {
      await api.post('/courses/subject', {
        name: subjectName,
        courseId: subCourseId
      });
      triggerAlert(true, `Subject ${subjectName} added successfully!`);
      setSubjectName('');
      fetchStats();
    } catch (err: any) {
      triggerAlert(false, err.response?.data?.message || 'Failed to add subject.');
    }
  };

  // Upload Paper
  const handleCreatePaper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paperSubjId) return triggerAlert(false, 'Please select a Subject ID.');
    if (!paperFile) return triggerAlert(false, 'Please select a file to upload.');
    try {
      const formData = new FormData();
      formData.append('title', paperTitle);
      formData.append('type', paperType);
      formData.append('difficulty', paperDifficulty);
      formData.append('year', paperYear.toString());
      formData.append('subjectId', paperSubjId);
      formData.append('fileType', 'PDF');
      formData.append('file', paperFile);

      await api.post('/papers', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      triggerAlert(true, 'Study Paper / PYQ published successfully!');
      setPaperTitle('');
      setPaperFile(null);
      fetchStats();
    } catch (err: any) {
      triggerAlert(false, err.response?.data?.message || 'Failed to create paper.');
    }
  };

  // Save Attendance
  const handleSaveAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attStudentId) return triggerAlert(false, 'Please enter a Student Profile ID.');
    try {
      await api.post('/attendance', {
        studentId: attStudentId,
        date: new Date(attDate),
        status: attStatus
      });
      triggerAlert(true, 'Attendance sheet marked!');
      setAttStudentId('');
    } catch (err: any) {
      triggerAlert(false, err.response?.data?.message || 'Failed to save attendance.');
    }
  };

  // Publish Results
  const handlePublishResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resStudentId || !resSubjId) return triggerAlert(false, 'Missing student or subject ID.');
    try {
      await api.post('/results', {
        examName: resExamName,
        type: resType,
        marksObtained: parseFloat(resMarks),
        totalMarks: parseFloat(resTotal),
        studentId: resStudentId,
        subjectId: resSubjId,
        analysis: JSON.stringify({ weakAreas: [] })
      });
      triggerAlert(true, 'Student result published in Gradebook.');
      setResExamName('');
      setResMarks('');
      setResTotal('');
      setResStudentId('');
      setResSubjId('');
    } catch (err: any) {
      triggerAlert(false, err.response?.data?.message || 'Failed to publish results.');
    }
  };

  // Generate Fee Bill
  const handleCreateFeeInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feeStudentId) return triggerAlert(false, 'Student ID is required.');
    try {
      await api.post('/fees', {
        studentId: feeStudentId,
        amount: parseFloat(feeAmount),
        dueDate: new Date(feeDueDate)
      });
      triggerAlert(true, 'Tuition fee invoice generated.');
      setFeeAmount('');
      setFeeDueDate('');
      setFeeStudentId('');
      fetchStats();
    } catch (err: any) {
      triggerAlert(false, err.response?.data?.message || 'Failed to generate invoice.');
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

  const totalInvoiced = (stats.collectedFees || 0) + (stats.pendingFees || 0);
  const collectionPercent = totalInvoiced > 0 ? Math.round((stats.collectedFees / totalInvoiced) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Alert Banners */}
      {actionSuccessMsg && (
        <div className="fixed top-6 right-6 p-4 rounded-xl bg-green-500 text-white font-semibold text-xs shadow-2xl flex items-center space-x-2 z-50 animate-bounce">
          <CheckCircle size={16} />
          <span>{actionSuccessMsg}</span>
        </div>
      )}
      {actionErrorMsg && (
        <div className="fixed top-6 right-6 p-4 rounded-xl bg-red-500 text-white font-semibold text-xs shadow-2xl flex items-center space-x-2 z-50 animate-pulse">
          <ShieldAlert size={16} />
          <span>{actionErrorMsg}</span>
        </div>
      )}

      {/* Welcome header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white capitalize">
            Admin Console - {tab}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {tab === 'overview' && 'Real-time statistics & center configurations for The Aim High Academy.'}
            {tab === 'users' && 'Register and manage student, faculty, parent, and admin profiles.'}
            {tab === 'courses' && 'Define academy syllabus batches, study subjects, and classes.'}
            {tab === 'papers' && 'Upload and catalog Board papers, study materials, and Model papers.'}
            {tab === 'attendance' && 'Review daily student attendance sheets and record check-ins.'}
            {tab === 'results' && 'Publish scores, descriptive feedback, and rank analysis.'}
            {tab === 'fees' && 'Track uncollected tuitions and generate student billing invoices.'}
            {tab === 'notices' && 'Publish important notifications and circular updates.'}
          </p>
        </div>
        <span className="text-xs px-3 py-1.5 rounded-full bg-slate-200 dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-300 mt-2 md:mt-0">
          Kanpur Campus Active
        </span>
      </div>

      {/* Render based on tab */}
      {tab === 'overview' && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Students</span>
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{stats.studentCount}</h3>
              </div>
              <div className="w-12 h-12 bg-primary/10 dark:bg-secondary/15 rounded-2xl flex items-center justify-center text-primary dark:text-secondary">
                <Users size={20} />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Faculty</span>
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{stats.facultyCount}</h3>
              </div>
              <div className="w-12 h-12 bg-primary/10 dark:bg-secondary/15 rounded-2xl flex items-center justify-center text-primary dark:text-secondary">
                <BookOpen size={20} />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Collected Fees</span>
                <h3 className="text-2xl font-extrabold text-green-600 dark:text-green-400 mt-1">₹{stats.collectedFees}</h3>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500">
                <CreditCard size={20} />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Pending Bills</span>
                <h3 className="text-2xl font-extrabold text-red-500 dark:text-red-400 mt-1">₹{stats.pendingFees}</h3>
              </div>
              <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500">
                <CreditCard size={20} />
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Notice creation inside overview */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">Publish Notice Board Announcement</h3>
                  <Bell size={18} className="text-slate-400" />
                </div>
                <form onSubmit={handleCreateNotice} className="space-y-4">
                  <div>
                    <input 
                      type="text" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Notice Title (e.g. Weekly Test Schedule)" 
                      required
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary text-slate-700 dark:text-slate-300"
                    />
                  </div>
                  <div>
                    <textarea 
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Compose notice body..." 
                      required
                      rows={4}
                      className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary text-slate-700 dark:text-slate-300 resize-none"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={isImportant}
                        onChange={(e) => setIsImportant(e.target.checked)}
                        className="rounded text-secondary focus:ring-secondary cursor-pointer"
                      />
                      <span>Mark as Urgent/Important</span>
                    </label>
                    <button 
                      type="submit"
                      className="px-6 h-11 rounded-xl bg-primary text-white dark:bg-secondary dark:text-primary font-bold shadow-md flex items-center space-x-2 hover:bg-slate-800 transition-all"
                    >
                      <Plus size={16} />
                      <span>Publish Notice</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Progress Analysis */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6">Financial Collections Ratio</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm font-semibold mb-2">
                      <span className="text-slate-500">Collected vs Invoiced</span>
                      <span className="text-primary dark:text-secondary">{collectionPercent}% Completed</span>
                    </div>
                    <div className="w-full h-4 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${collectionPercent}%` }}
                        transition={{ duration: 1 }}
                        className="h-full bg-gradient-to-r from-emerald-500 to-green-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Feed Column */}
            <div className="space-y-8">
              {/* Notices */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Latest Announcements</h3>
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                  {notices.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-8">No notices posted yet.</p>
                  ) : (
                    notices.map((n) => (
                      <div key={n.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 relative">
                        {n.isImportant && (
                          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-[9px] font-bold text-red-500 uppercase">
                            Urgent
                          </span>
                        )}
                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 pr-12">{n.title}</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed line-clamp-3">{n.content}</p>
                        <span className="text-[10px] text-slate-400 mt-3 flex items-center space-x-1">
                          <Calendar size={12} className="mr-1" />
                          <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Enrolments */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Recent Enrolments</h3>
                <div className="space-y-4">
                  {students.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">No students signed up yet.</p>
                  ) : (
                    students.map((s) => (
                      <div key={s.id} className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-sm text-slate-600 dark:text-slate-300 uppercase">
                          {s.user.name.slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{s.user.name}</p>
                          <p className="text-xs text-slate-400 truncate flex items-center">
                            <Mail size={12} className="mr-1" />
                            {s.user.email}
                          </p>
                        </div>
                        <span className="text-[10px] px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 font-semibold text-slate-500">
                          {s.className}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {tab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6 flex items-center space-x-2">
              <Users className="text-primary dark:text-secondary" />
              <span>Create New User Profile</span>
            </h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Name</label>
                  <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} required className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none text-slate-700 dark:text-slate-300" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email</label>
                  <input type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} required className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none text-slate-700 dark:text-slate-300" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Password</label>
                  <input type="password" value={userPassword} onChange={(e) => setUserPassword(e.target.value)} required className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none text-slate-700 dark:text-slate-300" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Phone</label>
                  <input type="text" value={userPhone} onChange={(e) => setUserPhone(e.target.value)} className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none text-slate-700 dark:text-slate-300" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Portal Role</label>
                <select value={userRole} onChange={(e) => setUserRole(e.target.value)} className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none text-slate-700 dark:text-slate-300">
                  <option value="STUDENT">Student Profile</option>
                  <option value="FACULTY">Faculty Member</option>
                  <option value="PARENT">Parent Profile</option>
                  <option value="ADMIN">Coaching Administrator</option>
                </select>
              </div>

              {/* Role specific inputs */}
              {userRole === 'STUDENT' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Student Configuration Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Class/Grade</label>
                      <select value={studentClass} onChange={(e) => setStudentClass(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs">
                        <option value="Class 8">Class 8th</option>
                        <option value="Class 9">Class 9th</option>
                        <option value="Class 10">Class 10th</option>
                        <option value="Class 11">Class 11th</option>
                        <option value="Class 12">Class 12th</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Board</label>
                      <select value={studentBoard} onChange={(e) => setStudentBoard(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs">
                        <option value="CBSE">CBSE</option>
                        <option value="ICSE">ICSE</option>
                        <option value="State Boards">State Boards</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Roll Number</label>
                      <input type="text" value={studentRoll} onChange={(e) => setStudentRoll(e.target.value)} required placeholder="AH-2026-XXXX" className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300" />
                    </div>
                  </div>
                </motion.div>
              )}

              {userRole === 'FACULTY' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Faculty Qualification Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Degree/Qualification</label>
                      <input type="text" value={facultyQual} onChange={(e) => setFacultyQual(e.target.value)} required placeholder="B.Tech, IIT Kanpur" className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Experience Years</label>
                      <input type="text" value={facultyExp} onChange={(e) => setFacultyExp(e.target.value)} required placeholder="8+ Years" className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Teachable Subjects (comma separated)</label>
                    <input type="text" value={facultySubj} onChange={(e) => setFacultySubj(e.target.value)} required placeholder="Mathematics, Physics" className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Teachable Biography</label>
                    <textarea value={facultyBio} onChange={(e) => setFacultyBio(e.target.value)} required placeholder="Brief biography details..." rows={3} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs resize-none" />
                  </div>
                </motion.div>
              )}

              {userRole === 'PARENT' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Parent Relationship Details</h4>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Relation</label>
                    <select value={parentRel} onChange={(e) => setParentRel(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs">
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Guardian">Guardian</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Residential Address</label>
                    <input type="text" value={parentAddr} onChange={(e) => setParentAddr(e.target.value)} required placeholder="Residential address details..." className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs" />
                  </div>
                </motion.div>
              )}

              <button type="submit" className="w-full h-11 rounded-xl bg-primary text-white dark:bg-secondary dark:text-primary font-bold shadow-md hover:bg-slate-800 transition-all flex items-center justify-center space-x-2">
                <Plus size={16} />
                <span>Create User Profile</span>
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Latest Members</h3>
            <div className="space-y-4">
              {students.map((s) => (
                <div key={s.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col space-y-1">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{s.user.name}</span>
                  <span className="text-[10px] text-slate-400">ID: {s.id}</span>
                  <span className="text-[10px] text-slate-500">Roll: {s.rollNumber} | {s.className}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'courses' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 space-y-6">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center space-x-2">
              <BookOpen className="text-primary dark:text-secondary" />
              <span>Define Academic Course</span>
            </h3>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Course Name</label>
                <input type="text" value={courseName} onChange={(e) => setCourseName(e.target.value)} required placeholder="e.g., Class 10 CBSE Foundation" className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-300 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Unique Code</label>
                  <input type="text" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} required placeholder="e.g., CBSE10" className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-300 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Class Name</label>
                  <select value={courseClass} onChange={(e) => setCourseClass(e.target.value)} className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-300 focus:outline-none">
                    <option value="Class 8">Class 8</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Board</label>
                <select value={courseBoard} onChange={(e) => setCourseBoard(e.target.value)} className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-300 focus:outline-none">
                  <option value="CBSE">CBSE</option>
                  <option value="ICSE">ICSE</option>
                  <option value="State Boards">State Boards</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Description</label>
                <textarea value={courseDesc} onChange={(e) => setCourseDesc(e.target.value)} required rows={3} placeholder="Course details..." className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-300 focus:outline-none resize-none" />
              </div>
              <button type="submit" className="w-full h-11 rounded-xl bg-primary text-white dark:bg-secondary dark:text-primary font-bold shadow-md hover:bg-slate-800 transition-all flex items-center justify-center space-x-2">
                <Plus size={16} />
                <span>Create Course</span>
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 space-y-6">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center space-x-2">
              <BookOpen className="text-primary dark:text-secondary" />
              <span>Add Subject to Course</span>
            </h3>
            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Parent Course</label>
                <select value={subCourseId} onChange={(e) => setSubCourseId(e.target.value)} required className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-300 focus:outline-none">
                  <option value="">-- Select Course --</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Subject Name</label>
                <input type="text" value={subjectName} onChange={(e) => setSubjectName(e.target.value)} required placeholder="e.g. Mathematics" className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-300 focus:outline-none" />
              </div>
              <button type="submit" className="w-full h-11 rounded-xl bg-primary text-white dark:bg-secondary dark:text-primary font-bold shadow-md hover:bg-slate-800 transition-all flex items-center justify-center space-x-2">
                <Plus size={16} />
                <span>Add Subject</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {tab === 'papers' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 max-w-2xl mx-auto">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6 flex items-center space-x-2">
            <FilePlus className="text-primary dark:text-secondary" />
            <span>Upload PYQ / Mock Test Paper</span>
          </h3>
          <form onSubmit={handleCreatePaper} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Paper Title</label>
              <input type="text" value={paperTitle} onChange={(e) => setPaperTitle(e.target.value)} required placeholder="e.g. CBSE Class 10 Math 2025 Board Paper" className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-300 focus:outline-none" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Paper Type</label>
                <select value={paperType} onChange={(e) => setPaperType(e.target.value)} className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-300 focus:outline-none">
                  <option value="PREVIOUS_YEAR">Previous Year Paper</option>
                  <option value="MODEL">Model / Practice Paper</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Difficulty</label>
                <select value={paperDifficulty} onChange={(e) => setPaperDifficulty(e.target.value)} className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-300 focus:outline-none">
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Subject ID</label>
                <input type="text" value={paperSubjId} onChange={(e) => setPaperSubjId(e.target.value)} required placeholder="Paste prisma subject UUID" className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-300 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Calendar Year</label>
                <input type="number" value={paperYear} onChange={(e) => setPaperYear(parseInt(e.target.value))} required className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-300 focus:outline-none" />
              </div>
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

            <button type="submit" className="w-full h-11 rounded-xl bg-primary text-white dark:bg-secondary dark:text-primary font-bold shadow-md hover:bg-slate-800 transition-all flex items-center justify-center space-x-2 cursor-pointer">
              <Plus size={16} />
              <span>Publish Paper</span>
            </button>
          </form>
        </div>
      )}

      {tab === 'attendance' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 max-w-md mx-auto">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6 flex items-center space-x-2">
            <CheckSquare className="text-primary dark:text-secondary" />
            <span>Mark Daily Check-In</span>
          </h3>
          <form onSubmit={handleSaveAttendance} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Student</label>
              <select value={attStudentId} onChange={(e) => setAttStudentId(e.target.value)} required className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-300 focus:outline-none">
                {studentsList.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.className} - {s.rollNumber})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Check-in Date</label>
              <input type="date" value={attDate} onChange={(e) => setAttDate(e.target.value)} required className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-300 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Status</label>
              <select value={attStatus} onChange={(e) => setAttStatus(e.target.value)} className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-300 focus:outline-none">
                <option value="PRESENT">Present</option>
                <option value="ABSENT">Absent</option>
                <option value="LATE">Late</option>
              </select>
            </div>
            <button type="submit" className="w-full h-11 rounded-xl bg-primary text-white dark:bg-secondary dark:text-primary font-bold shadow-md hover:bg-slate-800 transition-all flex items-center justify-center">
              Record Check-in
            </button>
          </form>
        </div>
      )}

      {tab === 'results' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 max-w-xl mx-auto">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6 flex items-center space-x-2">
            <Award className="text-primary dark:text-secondary" />
            <span>Publish Test Score</span>
          </h3>
          <form onSubmit={handlePublishResult} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Exam / Assessment Name</label>
              <input type="text" value={resExamName} onChange={(e) => setResExamName(e.target.value)} required placeholder="e.g. Chapter 1 Quadratic Equations Test" className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-300 focus:outline-none" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Student</label>
                <select value={resStudentId} onChange={(e) => setResStudentId(e.target.value)} required className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-300 focus:outline-none">
                  {studentsList.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.className} - {s.rollNumber})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Subject ID</label>
                <input type="text" value={resSubjId} onChange={(e) => setResSubjId(e.target.value)} required placeholder="Paste subject UUID" className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-300 focus:outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Exam Format</label>
                <select value={resType} onChange={(e) => setResType(e.target.value)} className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-300 focus:outline-none">
                  <option value="MCQ">MCQ Sheet</option>
                  <option value="DESCRIPTIVE">Descriptive Test</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Marks Scored</label>
                <input type="number" value={resMarks} onChange={(e) => setResMarks(e.target.value)} required placeholder="Marks Scored" className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-300 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Total Marks</label>
                <input type="number" value={resTotal} onChange={(e) => setResTotal(e.target.value)} required placeholder="Total Max Marks" className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-300 focus:outline-none" />
              </div>
            </div>

            <button type="submit" className="w-full h-11 rounded-xl bg-primary text-white dark:bg-secondary dark:text-primary font-bold shadow-md hover:bg-slate-800 transition-all flex items-center justify-center">
              Publish Result
            </button>
          </form>
        </div>
      )}

      {tab === 'fees' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 max-w-md mx-auto">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6 flex items-center space-x-2">
            <CreditCard className="text-primary dark:text-secondary" />
            <span>Generate Tuition Invoice</span>
          </h3>
          <form onSubmit={handleCreateFeeInvoice} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Student</label>
              <select value={feeStudentId} onChange={(e) => setFeeStudentId(e.target.value)} required className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-300 focus:outline-none">
                {studentsList.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.className} - {s.rollNumber})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Invoice Amount (₹)</label>
              <input type="number" value={feeAmount} onChange={(e) => setFeeAmount(e.target.value)} required placeholder="4500" className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-300 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Payment Due Date</label>
              <input type="date" value={feeDueDate} onChange={(e) => setFeeDueDate(e.target.value)} required className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-300 focus:outline-none" />
            </div>
            <button type="submit" className="w-full h-11 rounded-xl bg-primary text-white dark:bg-secondary dark:text-primary font-bold shadow-md hover:bg-slate-800 transition-all flex items-center justify-center">
              Generate Invoice
            </button>
          </form>
        </div>
      )}

      {tab === 'notices' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Publish Notice Board Announcement</h3>
            <Bell size={18} className="text-slate-400" />
          </div>
          <form onSubmit={handleCreateNotice} className="space-y-4">
            <div>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Notice Title (e.g. Weekly Test Schedule)" 
                required
                className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary text-slate-700 dark:text-slate-300"
              />
            </div>
            <div>
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Compose notice body..." 
                required
                rows={5}
                className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary text-slate-700 dark:text-slate-300 resize-none"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={isImportant}
                  onChange={(e) => setIsImportant(e.target.checked)}
                  className="rounded text-secondary focus:ring-secondary cursor-pointer"
                />
                <span>Mark as Urgent/Important</span>
              </label>
              <button 
                type="submit"
                className="px-6 h-11 rounded-xl bg-primary text-white dark:bg-secondary dark:text-primary font-bold shadow-md flex items-center space-x-2 hover:bg-slate-800 transition-all"
              >
                <Plus size={16} />
                <span>Publish Notice</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {tab === 'profile' && (
        <ProfileSection />
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-500 font-semibold">Loading admin console...</div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}
