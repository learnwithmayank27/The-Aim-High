'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookOpen, Phone, MapPin, CheckCircle, ArrowRight, Sun, Moon, 
  Menu, X, Sparkles, Trophy, Video, Users, HelpCircle, FileText, GraduationCap 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock/Real content matching the image logo and details
const CONTACT_INFO = {
  phone: '9151646849',
  whatsapp: '9151646849',
  email: 'aimhighkanpur@gmail.com',
  address: 'Plot No. 938 A, Coaching Mandi, Barra-2 Kanpur',
  officeHours: '8:00 AM - 8:00 PM (Mon-Sat)',
};

const COURSES = [
  { id: 1, name: 'IIT-JEE Foundation', grade: 'Class 9th to 12th', subjects: 'Physics, Chemistry, Mathematics', highlight: 'Special target batches' },
  { id: 2, name: 'NEET Foundation', grade: 'Class 9th to 12th', subjects: 'Physics, Chemistry, Biology', highlight: 'Comprehensive biology lab setup' },
  { id: 3, name: 'CBSE / ICSE Board Batches', grade: 'Class 9th to 10th', subjects: 'Mathematics, Science, English, Social Science', highlight: 'Concept building sessions' },
  { id: 4, name: 'Commerce & Economics', grade: 'Class 11th & 12th', subjects: 'Accountancy, Business Studies, Economics', highlight: 'Available online/offline' }
];

const FACULTY = [
  {
    name: 'Prashant Rajput',
    role: 'Founder & Managing Director',
    qualification: 'B.Tech, IIT Kanpur (8+ Yrs Exp)',
    subjects: ['Mathematics', 'Physics', 'Chemistry'],
    bio: 'Dedicated tutor who has successfully sent hundreds of students into IITs and premier medical colleges. Focuses on deep analytical skills and concept foundation.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
  },
  {
    name: 'Dr. Ananya Sen',
    role: 'Senior Biology Specialist',
    qualification: 'Ph.D in Botany (6+ Yrs Exp)',
    subjects: ['Biology'],
    bio: 'Mentors NEET aspirants with interactive diagrams, memory maps, and rigorous paper discussion.',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300',
  }
];

const FAQS = [
  { q: 'Where is the institute located?', a: 'We are situated at Plot No. 938 A, Coaching Mandi, Barra-2 Kanpur. It is easily accessible from all key parts of Kanpur.' },
  { q: 'Do you offer a demo or trial class?', a: 'Yes! We offer a 3-Day Free Trial (Take Demo Then Decide) to evaluate teaching quality.' },
  { q: 'Is there support for both online and offline learning?', a: 'Yes, our courses are available in both online and offline formats with synced homework and progress tracking.' },
  { q: 'Which boards do you support?', a: 'We support CBSE, ICSE, ISC, and State Boards for all core science and commerce streams.' }
];

export default function LandingPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Sync dark mode toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactName && contactPhone) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setContactName('');
        setContactPhone('');
        setContactMessage('');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* 1. Header/Navigation */}
      <header className="sticky top-0 z-50 glass border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/file_00000000717871fb90a931daa4d88bac.png" 
                alt="The Aim High Academy Logo" 
                className="h-12 w-auto object-contain block dark:hidden rotate-90"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/file_00000000f1d071faac6893ada3b5df28.png" 
                alt="The Aim High Academy Logo" 
                className="h-12 w-auto object-contain hidden dark:block"
              />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-905 dark:text-white block leading-none">THE AIM HIGH</span>
              <span className="text-[0.95rem] tracking-[0.31em] uppercase text-slate-500 dark:text-slate-400 font-bold block mt-1 leading-none">ACADEMY</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
            <Link href="#about" className="hover:text-primary dark:hover:text-white transition-colors text-slate-700 dark:text-slate-300">About</Link>
            <Link href="#courses" className="hover:text-primary dark:hover:text-white transition-colors text-slate-700 dark:text-slate-300">Courses</Link>
            <Link href="#faculty" className="hover:text-primary dark:hover:text-white transition-colors text-slate-700 dark:text-slate-300">Faculty</Link>
            <Link href="#faqs" className="hover:text-primary dark:hover:text-white transition-colors text-slate-700 dark:text-slate-300">FAQ</Link>
            <Link href="#contact" className="hover:text-primary dark:hover:text-white transition-colors text-slate-700 dark:text-slate-300">Contact</Link>
          </nav>

          {/* Call-to-actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Link 
              href="/login" 
              className="px-5 h-11 rounded-xl bg-primary text-white hover:bg-slate-800 dark:bg-primary dark:text-white dark:hover:bg-blue-700 font-semibold text-sm flex items-center transition-all shadow-md"
            >
              Portal Login <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center space-x-3 md:hidden">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden glass fixed top-20 left-0 right-0 p-6 border-b border-slate-200 dark:border-slate-800 shadow-xl z-40"
          >
            <nav className="flex flex-col space-y-4 text-center font-medium">
              <Link href="#about" onClick={() => setMobileMenuOpen(false)} className="py-2 text-slate-800 dark:text-slate-200">About</Link>
              <Link href="#courses" onClick={() => setMobileMenuOpen(false)} className="py-2 text-slate-800 dark:text-slate-200">Courses</Link>
              <Link href="#faculty" onClick={() => setMobileMenuOpen(false)} className="py-2 text-slate-800 dark:text-slate-200">Faculty</Link>
              <Link href="#faqs" onClick={() => setMobileMenuOpen(false)} className="py-2 text-slate-800 dark:text-slate-200">FAQ</Link>
              <Link href="#contact" onClick={() => setMobileMenuOpen(false)} className="py-2 text-slate-800 dark:text-slate-200">Contact</Link>
              <Link 
                href="/login" 
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 rounded-xl bg-primary text-white dark:bg-secondary dark:text-primary font-semibold text-center block shadow-md"
              >
                Portal Login
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32 flex items-center justify-center">
        {/* Background gradient rings */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 rounded-full bg-secondary/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-96 h-96 rounded-full bg-primary/20 blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Hero details */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-left"
          >
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary dark:text-primary text-xs font-semibold uppercase tracking-wider mb-6">
              <Sparkles size={14} />
              <span>3-Day Free Demo Trial Batch</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              Learn Smart.<br />
              <span className="text-primary dark:text-primary">Aim High.</span><br />
              Achieve Success.
            </h1>
            <p className="mt-6 text-lg text-slate-600 dark:text-slate-300 max-w-xl">
              Empower Your Mind, Empower Your Life. The Aim High Academy Kanpur is your premium study destination for Class 9th to 12th CBSE, ICSE, and ISC Boards, plus specialized IIT-JEE & NEET foundations.
            </p>

            {/* Bullet points */}
            <div className="mt-8 space-y-3">
              <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-200">
                <CheckCircle size={18} className="text-primary" />
                <span className="font-medium text-sm">Managed by Prashant Rajput & Senior IIT-JEE Mentors</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-200">
                <CheckCircle size={18} className="text-primary" />
                <span className="font-medium text-sm">Comprehensive Online & Offline Hybrid Learning Modes</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-200">
                <CheckCircle size={18} className="text-primary" />
                <span className="font-medium text-sm">Regular Mock Exams, Pyqs, and Personalized Grading Reports</span>
              </div>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link 
                href="#courses"
                className="px-8 h-12 rounded-xl bg-primary text-white dark:bg-secondary dark:text-white dark:hover:bg-slate-700 hover:bg-slate-800 font-bold text-center flex items-center justify-center transition-all shadow-lg"
              >
                Explore Courses
              </Link>
              <Link 
                href="#contact"
                className="px-8 h-12 rounded-xl border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-900 font-bold text-center flex items-center justify-center transition-all"
              >
                Book Free Trial
              </Link>
            </div>
          </motion.div>

          {/* Hero Image / Banner Art */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative flex justify-center"
          >
            <div className="relative w-full max-w-md h-[450px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800" 
                alt="Aim High Students" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent flex flex-col justify-end p-8 text-white">
                <span className="text-xs uppercase text-secondary font-bold tracking-widest">Kanpur's Leading Coaching</span>
                <h3 className="text-xl font-bold mt-1">The Aim High Academy</h3>
                <p className="text-xs text-slate-300 mt-2">Plot No. 938 A, Coaching Mandi, Barra-2 Kanpur</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. Why Choose Us Section */}
      <section id="about" className="py-20 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Why Aim High?</h2>
            <p className="mt-4 text-slate-600 dark:text-slate-300">
              We focus on building strong concepts from foundation level, ensuring our students excel in board examinations as well as national level engineering & medical entrances.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-md border border-slate-200/50 dark:border-slate-700/50">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                <Trophy size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Top Results Track</h3>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                Highly validated records of students clearing IIT-JEE mains & advanced, NEET, and achieving 95%+ in Class 10/12 Board examinations.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-md border border-slate-200/50 dark:border-slate-700/50">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                <Video size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Hybrid Flexibility</h3>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                Students can attend classroom lectures at our Kanpur facility or stream live online classes with full video archives and bookmarks.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-md border border-slate-200/50 dark:border-slate-700/50">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">IITian Mentorship</h3>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                Direct classroom delivery and doubts clearing sessions led by प्रशांत राजपूत (B.Tech IIT Kanpur) & senior subject experts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Courses Section */}
      <section id="courses" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Our Educational Programs</h2>
            <p className="mt-4 text-slate-600 dark:text-slate-300">
              Tailored learning curricula designed for boards alignment and competitive level accuracy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {COURSES.map((course) => (
              <div key={course.id} className="glass rounded-2xl p-6 flex flex-col justify-between border border-slate-200 dark:border-slate-800 shadow-md">
                <div>
                  <span className="text-xs font-bold text-primary uppercase tracking-widest">{course.grade}</span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2 leading-snug">{course.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{course.subjects}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 italic">{course.highlight}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Faculty Section */}
      <section id="faculty" className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Meet Our Core Mentors</h2>
            <p className="mt-4 text-slate-600 dark:text-slate-300">
              Experienced, dedicated educators focused on empowering student thinking and scores.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {FACULTY.map((f, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-200/50 dark:border-slate-700/50 flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={f.image} 
                  alt={f.name} 
                  className="w-28 h-28 rounded-2xl object-cover border-2 border-primary shadow-md"
                />
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{f.name}</h3>
                  <p className="text-sm font-semibold text-primary uppercase tracking-wider">{f.role}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{f.qualification}</p>
                  
                  <div className="mt-3 flex flex-wrap gap-1">
                    {f.subjects.map((sub, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {sub}
                      </span>
                    ))}
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-4 leading-relaxed">{f.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section id="faqs" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
            <p className="mt-4 text-slate-600 dark:text-slate-300">
              Quick answers to help you get onboarded with Aim High Academy.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-start space-x-2">
                  <HelpCircle size={18} className="text-primary mt-1 flex-shrink-0" />
                  <span>{faq.q}</span>
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-3 pl-7 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Contact Section */}
      <section id="contact" className="py-20 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Info Card */}
          <div className="flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Get in Touch with Us</h2>
              <p className="text-slate-600 dark:text-slate-300 mt-4 leading-relaxed">
                Have questions about fee structures, batch timings, or demo trial runs? Leave us a message or call directly to speak with Prashant Rajput or our counselors.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-center space-x-3 text-slate-700 dark:text-slate-300">
                  <Phone size={18} className="text-secondary" />
                  <span className="font-medium">{CONTACT_INFO.phone}</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-700 dark:text-slate-300">
                  <MapPin size={18} className="text-secondary" />
                  <span className="font-medium">{CONTACT_INFO.address}</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-700 dark:text-slate-300">
                  <BookOpen size={18} className="text-secondary" />
                  <span className="font-medium">{CONTACT_INFO.officeHours}</span>
                </div>
              </div>
            </div>

            {/* Embedded maps or mock */}
            <div className="mt-12 w-full h-64 rounded-3xl overflow-hidden border border-slate-300 dark:border-slate-700 shadow-md">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3573.0728267252277!2d80.2970513!3d26.4372545!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjbCsDI2JzE0LjEiTiA4MMKwMTcnNDkuNCJF!5e0!3m2!1sen!2sin!4v1680000000000!5m2!1sen!2sin" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-700/50">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Book Your 3-Day Demo Trial</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Submit the form below and we will call you back to schedule your session.</p>

            <form onSubmit={handleContactSubmit} className="mt-8 space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Student Name</label>
                <input 
                  type="text" 
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Mayank Sharma" 
                  required
                  className="w-full h-11 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Mobile Number</label>
                <input 
                  type="tel" 
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="e.g. +91 9151646849" 
                  required
                  className="w-full h-11 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Message or Grade (Optional)</label>
                <textarea 
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Interested in Class 10 Math Demo Class" 
                  rows={4}
                  className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary resize-none" 
                />
              </div>

              <button 
                type="submit"
                disabled={submitted}
                className="w-full h-12 rounded-xl bg-primary text-white dark:bg-primary dark:text-white font-bold shadow-lg flex items-center justify-center transition-all hover:bg-indigo-700 dark:hover:bg-blue-600 disabled:opacity-75"
              >
                {submitted ? 'Demo Request Submitted!' : 'Reserve My Seat'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 py-12 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-slate-900 dark:text-white font-bold text-xl">The Aim High Academy</h3>
            <p className="mt-4 text-sm max-w-sm">
              Empower Your Mind, Empower Your Life. Learn Smart. Aim High. Achieve Success. CBSE/ICSE Board Prep & IIT-JEE/NEET foundation.
            </p>
            <p className="mt-8 text-xs">
              © {new Date().getFullYear()} The Aim High Academy, Kanpur. All rights reserved.
            </p>
          </div>

          <div>
            <h4 className="text-slate-900 dark:text-white font-semibold text-sm uppercase tracking-widest mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#about" className="hover:text-primary dark:hover:text-white transition-colors">About</Link></li>
              <li><Link href="#courses" className="hover:text-primary dark:hover:text-white transition-colors">Courses</Link></li>
              <li><Link href="#faculty" className="hover:text-primary dark:hover:text-white transition-colors">Faculty</Link></li>
              <li><Link href="/login" className="hover:text-primary dark:hover:text-white transition-colors">Portal Login</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-900 dark:text-white font-semibold text-sm uppercase tracking-widest mb-4">Contact Info</h4>
            <ul className="space-y-2 text-sm">
              <li>Plot No. 938 A, Coaching Mandi</li>
              <li>Barra-2, Kanpur</li>
              <li>Phone: +91 {CONTACT_INFO.phone}</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
