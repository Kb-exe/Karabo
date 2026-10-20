import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, FileText, Bot, Clock, Accessibility, 
  Sun, Moon, Download, Smartphone, Monitor, Info, X, 
  Sparkles, CheckCircle2, ChevronRight, Home, ArrowRight,
  User, ShieldCheck, LogIn, KeyRound, Phone, AlertCircle,
  Ban, ShieldAlert, BarChart3
} from 'lucide-react';
import { 
  ScreenType, 
  AuthModalType, 
  LearnerActivity, 
  PaperActivity, 
  PromptActivity 
} from './types';
import { 
  auth, 
  testFirestoreConnection, 
  fetchLearnerProfile, 
  LearnerProfile,
  fetchLearnerActivities,
  saveLearnerActivity,
  deleteLearnerActivity,
  logoutLearner
} from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

// Views
import Grade12Dashboard from './components/Grade12Dashboard';
import PastPapersView from './components/PastPapersView';
import Grade12AITutor from './components/Grade12AITutor';
import LearnerAuthModal from './components/LearnerAuthModal';
import AdminPortal from './components/AdminPortal';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState<boolean>(false);
  
  // Accessibility features state
  const [dyslexicFont, setDyslexicFont] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<'standard' | 'large' | 'extra-large'>('standard');
  const [highContrast, setHighContrast] = useState<boolean>(false);

  // Resume navigation state
  const [resumingPaperId, setResumingPaperId] = useState<string | undefined>(undefined);
  const [resumingQuestionNumber, setResumingQuestionNumber] = useState<string | undefined>(undefined);
  const [resumingAIPrompt, setResumingAIPrompt] = useState<PromptActivity | null>(null);

  // Authentication & Database state
  const [currentLearner, setCurrentLearner] = useState<LearnerProfile | null>(null);
  const [authModalType, setAuthModalType] = useState<AuthModalType>('none');
  const [isDbConnected, setIsDbConnected] = useState<boolean>(true);

  // Toast Notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Install PWA states
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [activeInstallTab, setActiveInstallTab] = useState<'ios' | 'android' | 'desktop'>('android');

  // Used and Unfinished Papers and Prompts
  const [activities, setActivities] = useState<LearnerActivity[]>([]);

  // Toast helper
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // 1. Firebase Auth listener & initial connection check
  useEffect(() => {
    testFirestoreConnection().then((connected) => {
      setIsDbConnected(connected);
    });

    const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
      if (user) {
        try {
          const profile = await fetchLearnerProfile(user.uid);
          if (profile) {
            setCurrentLearner(profile);
          } else {
            setCurrentLearner({
              uid: user.uid,
              initials: 'K.M.',
              username: user.email?.split('@')[0] || 'grade12_learner',
              email: user.email || 'learner@gmail.com',
              displayName: user.displayName || user.email?.split('@')[0] || 'Grade 12 Learner',
              phoneNumber: user.phoneNumber || '',
              phoneVerified: !!user.phoneNumber,
              emailVerified: user.emailVerified,
              schoolName: 'Grade 12 High School',
              selectedSubjects: ['maths', 'physci', 'lifesci'],
              createdAt: new Date().toISOString()
            });
          }

          // Fetch user's saved activities from cloud database
          const cloudActivities = await fetchLearnerActivities(user.uid);
          if (cloudActivities && cloudActivities.length > 0) {
            setActivities(cloudActivities);
          }
        } catch (err) {
          console.error("Error loading learner profile / activities:", err);
        }
      } else {
        setCurrentLearner(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Hash listener for direct administrator gateway navigation (#admin)
  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === '#admin') {
        setCurrentScreen('admin');
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  // 2. PWA prompt listener
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      
      if (navigator.userAgent.indexOf('Android') !== -1) {
        setActiveInstallTab('android');
      } else if (navigator.userAgent.indexOf('iPhone') !== -1 || navigator.userAgent.indexOf('iPad') !== -1) {
        setActiveInstallTab('ios');
      } else {
        setActiveInstallTab('desktop');
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleNativeInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setIsInstallable(false);
      setIsInstallModalOpen(false);
      showToast("LumnySA successfully installed on your device!");
    }
    setDeferredPrompt(null);
  };

  // Activity Management Handlers
  const handleTrackPaperActivity = (activity: PaperActivity) => {
    setActivities(prev => {
      const idx = prev.findIndex(a => a.id === activity.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...activity };
        return copy;
      }
      return [activity, ...prev];
    });

    if (currentLearner) {
      saveLearnerActivity(currentLearner.uid, activity).catch(console.warn);
    }
  };

  const handleSaveAIActivity = (activity: PromptActivity) => {
    setActivities(prev => {
      const idx = prev.findIndex(a => a.id === activity.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...activity };
        return copy;
      }
      return [activity, ...prev];
    });

    if (currentLearner) {
      saveLearnerActivity(currentLearner.uid, activity).catch(console.warn);
    }
    showToast(`Saved prompt to Dashboard (${activity.status === 'completed' ? 'Completed' : 'In Progress'})!`);
  };

  const handleUpdateActivityStatus = (activityId: string, status: 'in_progress' | 'completed', percentage?: number) => {
    setActivities(prev => prev.map(a => {
      if (a.id === activityId) {
        return {
          ...a,
          status,
          percentage: percentage !== undefined ? percentage : (status === 'completed' ? 100 : 50),
          lastUpdated: new Date().toISOString()
        };
      }
      return a;
    }));
    showToast(`Activity status updated to ${status === 'completed' ? 'Completed' : 'In-Progress'}`);
  };

  const handleDeleteActivity = (activityId: string) => {
    setActivities(prev => prev.filter(a => a.id !== activityId));
    if (currentLearner) {
      deleteLearnerActivity(currentLearner.uid, activityId).catch(console.warn);
    }
    showToast("Removed from Dashboard.");
  };

  // Resume handlers from Dashboard
  const handleResumePaperFromDashboard = (paperId: string, questionNumber?: string) => {
    setResumingPaperId(paperId);
    setResumingQuestionNumber(questionNumber);
    setCurrentScreen('past_papers');
    showToast("Resuming past paper...");
  };

  const handleResumePromptFromDashboard = (promptAct: PromptActivity) => {
    setResumingAIPrompt(promptAct);
    setCurrentScreen('ai_tutor');
    showToast(`Resuming Mzansi Tuta: ${promptAct.title}`);
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    } ${dyslexicFont ? 'font-mono' : 'font-sans'} ${
      fontSize === 'large' ? 'text-lg' : fontSize === 'extra-large' ? 'text-xl' : 'text-base'
    } ${highContrast ? 'contrast-125 saturate-150' : ''}`}>
      
      {/* Toast Notification Container */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-xs font-bold border ${
              toast.type === 'error' 
                ? 'bg-red-600 text-white border-red-500' 
                : toast.type === 'info'
                ? 'bg-blue-900 text-white border-blue-700'
                : 'bg-emerald-700 text-white border-emerald-600'
            }`}
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{toast.message}</span>
            <button 
              onClick={() => setToast(null)}
              className="ml-2 hover:opacity-80 p-0.5 rounded cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Top Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/95 dark:bg-slate-900/95 border-b border-blue-900/10 dark:border-slate-800 px-4 md:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div 
            onClick={() => setCurrentScreen('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 flex items-center justify-center text-amber-400 shadow-md border border-amber-400/30">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-blue-950 dark:text-white">
                  Lumny<span className="text-amber-500">SA</span>
                </span>
                <span className="text-xs text-slate-400 font-semibold hidden sm:inline">(Lumina SA)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300/40">
                  Grade 12
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Matric Past Papers &amp; Mzansi Tuta AI
              </p>
            </div>
          </div>
        </div>

        {/* Right header controls */}
        <div className="flex items-center gap-2">

          {/* Admin Account Button */}
          <button
            onClick={() => setCurrentScreen('admin')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              currentScreen === 'admin'
                ? 'bg-red-600 text-white border-red-700 shadow-xs ring-1 ring-red-400'
                : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/40 hover:bg-red-100'
            }`}
            title="Admin Account - Behind the Scenes & User Management"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-red-500" />
            <span className="hidden sm:inline">Admin Account</span>
          </button>
          
          {/* Learner Account / Login Button */}
          {currentLearner ? (
            <button
              onClick={() => setAuthModalType('profile')}
              className="px-3 py-1.5 rounded-xl bg-blue-900/10 dark:bg-blue-950/60 hover:bg-blue-900/20 text-blue-950 dark:text-amber-300 border border-blue-900/20 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <div className="h-6 w-6 rounded-full bg-blue-950 text-amber-300 flex items-center justify-center text-[10px] font-black">
                {currentLearner.initials || currentLearner.displayName?.charAt(0).toUpperCase() || 'M'}
              </div>
              <span className="hidden sm:inline max-w-[110px] truncate">
                @{currentLearner.username || currentLearner.displayName}
              </span>
              {currentLearner.phoneVerified && (
                <span className="h-2 w-2 rounded-full bg-emerald-500" title="SMS Verified" />
              )}
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setAuthModalType('login')}
                className="px-3 py-1.5 rounded-xl bg-blue-950 hover:bg-blue-900 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <LogIn className="h-3.5 w-3.5 text-amber-400" />
                <span>Log In</span>
              </button>
              <button
                onClick={() => setAuthModalType('register')}
                className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black hidden sm:flex items-center gap-1 transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <span>Create Account</span>
              </button>
            </div>
          )}

          {/* Accessibility Setting Button */}
          <button 
            onClick={() => setIsAccessibilityOpen(!isAccessibilityOpen)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
              isAccessibilityOpen 
                ? 'bg-blue-900 text-white border-transparent' 
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
            title="Accessibility Settings"
          >
            <Accessibility className="h-4 w-4" />
          </button>

          {/* Dark Mode toggle */}
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 flex items-center justify-center transition-all cursor-pointer"
            title="Toggle Light/Dark Theme"
          >
            {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-blue-900" />}
          </button>

          {/* Install App button */}
          <button 
            onClick={() => setIsInstallModalOpen(true)}
            className="h-9 px-3 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all duration-200 active:scale-95 cursor-pointer"
            title="Install LumnySA PWA"
          >
            <Download className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">Install</span>
          </button>
        </div>
      </header>

      {/* Main Grid Container */}
      <div className="flex flex-col md:flex-row max-w-7xl mx-auto w-full px-4 md:px-8 py-8 gap-8">
        
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden md:flex flex-col gap-4 w-64 shrink-0">
          <div className="bg-white dark:bg-slate-800/90 p-4 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4 px-3">
              Grade 12 Navigation
            </span>
            
            {/* The 3 Main Tabs per voice note: Dashboard, Past Papers, Mzansi Tuta */}
            <nav className="space-y-1.5">
              {/* Tab 1: Dashboard */}
              <button 
                onClick={() => setCurrentScreen('dashboard')}
                className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-black flex items-center gap-3 transition-all cursor-pointer ${
                  currentScreen === 'dashboard' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-900'
                }`}
              >
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </button>

              {/* Tab 2: Past Papers */}
              <button 
                onClick={() => setCurrentScreen('past_papers')}
                className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-black flex items-center gap-3 transition-all cursor-pointer ${
                  currentScreen === 'past_papers' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-900'
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>Past Papers</span>
              </button>

              {/* Tab 3: Mzansi Tutor */}
              <button 
                onClick={() => setCurrentScreen('ai_tutor')}
                className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-black flex items-center gap-3 transition-all cursor-pointer ${
                  currentScreen === 'ai_tutor' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-900'
                }`}
              >
                <Bot className="h-4 w-4 text-amber-500" />
                <span>Mzansi Tutor</span>
              </button>
            </nav>

            {/* Learner Account Link */}
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setAuthModalType(currentLearner ? 'profile' : 'login')}
                className="w-full text-left px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-blue-50 text-xs font-extrabold text-blue-950 dark:text-slate-200 flex items-center justify-between transition-all cursor-pointer border border-slate-200 dark:border-slate-800"
              >
                <span className="flex items-center gap-2 truncate">
                  <User className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">
                    {currentLearner ? `@${currentLearner.username || currentLearner.displayName}` : 'Login / Create Account'}
                  </span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              </button>
            </div>
          </div>

          {/* School & Registered Subjects Card */}
          {currentLearner ? (
            <div className="bg-blue-50/90 dark:bg-slate-800/80 p-5 rounded-3xl border-2 border-blue-200 dark:border-blue-900/50 text-slate-900 dark:text-white space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-900 dark:text-blue-300">
                  {currentLearner.schoolName || 'Grade 12 High School'}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-extrabold">
                  {currentLearner.initials || 'K.M.'}
                </span>
              </div>
              <h4 className="font-extrabold text-xs text-blue-950 dark:text-white">
                {currentLearner.selectedSubjects?.length || 0} Registered Subjects
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Your registered subjects are automatically recommended on the Past Papers tab.
              </p>
              <button
                onClick={() => setCurrentScreen('past_papers')}
                className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all text-center cursor-pointer shadow-xs"
              >
                View Recommended Papers
              </button>
            </div>
          ) : (
            <div className="bg-amber-50 dark:bg-amber-950/30 p-5 rounded-3xl border-2 border-amber-300 dark:border-amber-800/40 text-slate-900 dark:text-slate-200 space-y-2.5 shadow-xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 dark:text-amber-400">
                Grade 12 Account
              </span>
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">
                Get Personalized Papers
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Create your Grade 12 account with your school and subjects to get tailored past papers and Mzansi Tutor AI help.
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setAuthModalType('register')}
                  className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer"
                >
                  Create
                </button>
                <button
                  onClick={() => setAuthModalType('login')}
                  className="py-2 px-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Log In
                </button>
              </div>
            </div>
          )}

          {/* Discrete Administrator Lock Entry (Separated from regular learner view) */}
          <div className="pt-2 text-center">
            <button
              onClick={() => setCurrentScreen('admin')}
              className="text-[10px] text-slate-400 hover:text-red-500 transition-colors inline-flex items-center gap-1 cursor-pointer py-1 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Restricted master administrator access"
            >
              <ShieldCheck className="h-3 w-3" />
              <span>Examiner &amp; Admin Gateway</span>
            </button>
          </div>
        </aside>

        {/* Core Content Area */}
        <main className="flex-grow min-w-0">

          {/* Banned User Warning Screen */}
          {currentLearner?.isBanned ? (
            <div className="p-8 rounded-3xl bg-red-50 dark:bg-red-950/40 border-2 border-red-300 dark:border-red-900 text-center space-y-4 shadow-lg my-6">
              <div className="w-16 h-16 rounded-3xl bg-red-100 dark:bg-red-900/60 text-red-600 mx-auto flex items-center justify-center">
                <Ban className="h-8 w-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h2 className="text-xl font-black text-red-900 dark:text-red-200">
                  Account Suspended / Banned
                </h2>
                <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed">
                  Your learner profile (@{currentLearner.username || currentLearner.email}) has been suspended by the school administrator. Please contact your school admin or support to resolve this issue.
                </p>
              </div>
              <button
                onClick={async () => {
                  await logoutLearner();
                  setCurrentLearner(null);
                  showToast("Logged out of banned account.", "info");
                }}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs cursor-pointer"
              >
                Log Out
              </button>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentScreen}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                {/* 1. Tab 1: Dashboard */}
                {currentScreen === 'dashboard' && (
                  <Grade12Dashboard 
                    onNavigate={setCurrentScreen}
                    activities={activities}
                    currentLearner={currentLearner}
                    onSelectPaperToResume={handleResumePaperFromDashboard}
                    onResumeAIPrompt={handleResumePromptFromDashboard}
                    onUpdateActivityStatus={handleUpdateActivityStatus}
                    onDeleteActivity={handleDeleteActivity}
                    onStartNewPaper={() => setCurrentScreen('past_papers')}
                    onStartNewAIPrompt={() => {
                      setResumingAIPrompt(null);
                      setCurrentScreen('ai_tutor');
                    }}
                  />
                )}

                {/* 2. Tab 2: Past Papers */}
                {currentScreen === 'past_papers' && (
                  <PastPapersView 
                    initialPaperId={resumingPaperId}
                    initialQuestionNumber={resumingQuestionNumber}
                    currentLearner={currentLearner}
                    onTrackPaperActivity={handleTrackPaperActivity}
                  />
                )}

                {/* 3. Tab 3: Mzansi Tuta (AI) */}
                {currentScreen === 'ai_tutor' && (
                  <Grade12AITutor 
                    initialActivity={resumingAIPrompt}
                    onSaveActivityToDashboard={handleSaveAIActivity}
                    onNavigateToDashboard={() => setCurrentScreen('dashboard')}
                  />
                )}

                {/* 4. Admin Account: Behind the scenes analytics, ban, delete users */}
                {currentScreen === 'admin' && (
                  <AdminPortal 
                    onBackToApp={() => setCurrentScreen('dashboard')}
                    onNotify={showToast}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          )}

        </main>
      </div>

      {/* Floating Accessibility Settings Modal */}
      <AnimatePresence>
        {isAccessibilityOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              onClick={() => setIsAccessibilityOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            ></div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl relative max-w-md w-full z-10"
            >
              <button 
                onClick={() => setIsAccessibilityOpen(false)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <Accessibility className="text-blue-900 dark:text-blue-400 h-6 w-6" />
                <h3 className="text-lg font-bold">Accessibility Options</h3>
              </div>

              <div className="space-y-5">
                {/* Dyslexia friendly toggle */}
                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <h4 className="font-bold text-xs">Dyslexia-Friendly Font</h4>
                    <p className="text-[10px] text-slate-400">High-legibility monospace spacing for reading</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={dyslexicFont}
                      onChange={() => setDyslexicFont(!dyslexicFont)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-900"></div>
                  </label>
                </div>

                {/* High Contrast Mode toggle */}
                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <h4 className="font-bold text-xs">High Contrast Mode</h4>
                    <p className="text-[10px] text-slate-400">Sharper borders and deep academic contrast</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={highContrast}
                      onChange={() => setHighContrast(!highContrast)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-900"></div>
                  </label>
                </div>

                {/* Font Scaling */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs">Text Size</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      onClick={() => setFontSize('standard')}
                      className={`py-2 rounded-xl text-xs font-semibold border cursor-pointer ${
                        fontSize === 'standard' 
                          ? 'border-blue-900 bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-amber-400' 
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      Standard
                    </button>
                    <button 
                      onClick={() => setFontSize('large')}
                      className={`py-2 rounded-xl text-xs font-semibold border cursor-pointer ${
                        fontSize === 'large' 
                          ? 'border-blue-900 bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-amber-400' 
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      Large
                    </button>
                    <button 
                      onClick={() => setFontSize('extra-large')}
                      className={`py-2 rounded-xl text-xs font-semibold border cursor-pointer ${
                        fontSize === 'extra-large' 
                          ? 'border-blue-900 bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-amber-400' 
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      Extra Large
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PWA Install Guide Modal */}
      <AnimatePresence>
        {isInstallModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              onClick={() => setIsInstallModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            ></div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl relative max-w-lg w-full z-10"
            >
              <button 
                onClick={() => setIsInstallModalOpen(false)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-950 to-blue-900 text-amber-400 flex items-center justify-center shadow-md">
                  <Download className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Install LumnySA Matric Hub</h3>
                  <p className="text-xs text-slate-500">Fast, offline-ready Grade 12 study on your phone or PC</p>
                </div>
              </div>

              {isInstalled ? (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-300">LumnySA is Already Installed!</h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">Launch it directly from your home screen or app launcher for offline access.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Platform Switcher */}
                  <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl">
                    <button
                      onClick={() => setActiveInstallTab('android')}
                      className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        activeInstallTab === 'android'
                          ? 'bg-white dark:bg-slate-800 text-blue-950 dark:text-amber-400 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Smartphone className="h-3.5 w-3.5" />
                      <span>Android</span>
                    </button>
                    <button
                      onClick={() => setActiveInstallTab('ios')}
                      className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        activeInstallTab === 'ios'
                          ? 'bg-white dark:bg-slate-800 text-blue-950 dark:text-amber-400 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Smartphone className="h-3.5 w-3.5" />
                      <span>iPhone / iPad</span>
                    </button>
                    <button
                      onClick={() => setActiveInstallTab('desktop')}
                      className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        activeInstallTab === 'desktop'
                          ? 'bg-white dark:bg-slate-800 text-blue-950 dark:text-amber-400 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Monitor className="h-3.5 w-3.5" />
                      <span>Chrome / PC</span>
                    </button>
                  </div>

                  {/* Android Instruction */}
                  {activeInstallTab === 'android' && (
                    <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
                      {isInstallable ? (
                        <button
                          onClick={handleNativeInstall}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer"
                        >
                          <Download className="h-4 w-4" />
                          <span>Tap to Install Instantly on Android</span>
                        </button>
                      ) : (
                        <ol className="list-decimal pl-4 space-y-1.5 text-slate-600 dark:text-slate-300">
                          <li>Tap the <strong>Chrome menu (three dots)</strong> at the top right.</li>
                          <li>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                          <li>Confirm by tapping <strong>Install</strong>.</li>
                        </ol>
                      )}
                    </div>
                  )}

                  {/* iOS Instruction */}
                  {activeInstallTab === 'ios' && (
                    <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
                      <ol className="list-decimal pl-4 space-y-2 text-slate-600 dark:text-slate-300">
                        <li>Tap the <strong>Share button</strong> in Safari (square with arrow).</li>
                        <li>Scroll down and tap <strong>"Add to Home Screen"</strong>.</li>
                        <li>Tap <strong>Add</strong> in the top-right corner.</li>
                      </ol>
                    </div>
                  )}

                  {/* Desktop Instruction */}
                  {activeInstallTab === 'desktop' && (
                    <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
                      <ol className="list-decimal pl-4 space-y-2 text-slate-600 dark:text-slate-300">
                        <li>Click the <strong>Install icon</strong> in the Chrome address bar.</li>
                        <li>Or open the Chrome menu (three dots) &gt; <strong>Save and share</strong> &gt; <strong>Install LumnySA</strong>.</li>
                      </ol>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation Bar (Tabs: Dashboard, Past Papers, Mzansi Tutor, Profile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-2 flex items-center justify-around shadow-lg">
        {/* Tab 1: Dashboard */}
        <button 
          onClick={() => setCurrentScreen('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            currentScreen === 'dashboard' 
              ? 'text-blue-900 dark:text-amber-400 font-black' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Home className="h-4 w-4" />
          <span className="text-[10px]">Dashboard</span>
        </button>

        {/* Tab 2: Past Papers */}
        <button 
          onClick={() => setCurrentScreen('past_papers')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            currentScreen === 'past_papers' 
              ? 'text-blue-900 dark:text-amber-400 font-black' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span className="text-[10px]">Past Papers</span>
        </button>

        {/* Tab 3: Mzansi Tutor */}
        <button 
          onClick={() => setCurrentScreen('ai_tutor')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            currentScreen === 'ai_tutor' 
              ? 'text-blue-900 dark:text-amber-400 font-black' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Bot className="h-4 w-4" />
          <span className="text-[10px]">Mzansi Tutor</span>
        </button>

        {/* Profile / Login */}
        <button 
          onClick={() => setAuthModalType(currentLearner ? 'profile' : 'login')}
          className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer text-slate-400 hover:text-slate-600"
        >
          <User className="h-4 w-4" />
          <span className="text-[10px]">{currentLearner ? 'Profile' : 'Login'}</span>
        </button>
      </nav>

      {/* Dedicated Learner Auth & Account Management Modal */}
      <AnimatePresence>
        {authModalType !== 'none' && (
          <LearnerAuthModal
            modalType={authModalType}
            onClose={() => setAuthModalType('none')}
            onSwitchType={setAuthModalType}
            currentProfile={currentLearner}
            onProfileUpdated={(updated) => setCurrentLearner(updated)}
            onNotify={showToast}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
