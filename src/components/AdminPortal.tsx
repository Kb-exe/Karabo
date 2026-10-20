import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, Users, BarChart3, Trash2, Ban, CheckCircle2, 
  AlertTriangle, Search, Filter, RefreshCw, GraduationCap, 
  Mail, Phone, BookOpen, School, ArrowUpRight, Plus, Eye, EyeOff,
  Check, X, Sparkles, UserCheck, UserX, Award
} from 'lucide-react';
import { LearnerProfile, fetchAllLearners, adminDeleteLearner, adminBanLearner, registerLearner } from '../firebase';
import { GRADE_12_SUBJECTS } from '../data/grade12Data';

interface AdminPortalProps {
  onBackToApp: () => void;
  onNotify: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export default function AdminPortal({ onBackToApp, onNotify }: AdminPortalProps) {
  // Master Administrator Authentication State (100% separated from learners)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('lumnysa_admin_auth') === 'true';
  });
  const [adminUsername, setAdminUsername] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const [learners, setLearners] = useState<LearnerProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'banned' | 'unverified'>('all');
  const [selectedLearner, setSelectedLearner] = useState<LearnerProfile | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Master Admin Credentials Verification
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsVerifying(true);

    const validUsernames = ['admin', 'lumnysa_admin', 'director'];
    const validPasswords = ['Mzansi@Master2026!', 'Admin@LumnySA2026!'];

    setTimeout(() => {
      const u = adminUsername.trim();
      const p = adminPassword.trim();

      if (validUsernames.includes(u) && validPasswords.includes(p)) {
        sessionStorage.setItem('lumnysa_admin_auth', 'true');
        setIsAdminAuthenticated(true);
        onNotify("Administrator authenticated successfully.", "success");
        loadLearners();
      } else {
        setAuthError("Access denied: Invalid administrator username or password. Learners do not have access to this portal.");
      }
      setIsVerifying(false);
    }, 400);
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('lumnysa_admin_auth');
    setIsAdminAuthenticated(false);
    setAdminUsername('');
    setAdminPassword('');
    onBackToApp();
    onNotify("Administrator logged out safely.", "info");
  };

  // New learner modal for quick admin generation
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newInitials, setNewInitials] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newSchool, setNewSchool] = useState('');
  const [newGmail, setNewGmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newSelectedSubjects, setNewSelectedSubjects] = useState<string[]>(['maths', 'physci', 'lifesci']);

  const loadLearners = async () => {
    setLoading(true);
    try {
      const data = await fetchAllLearners();
      setLearners(data);
    } catch (err) {
      console.error("Failed to load learners for admin:", err);
      onNotify("Failed to load user directory", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLearners();
  }, []);

  // Calculate subject popularity "behind the scenes"
  const subjectFrequency: Record<string, number> = {};
  GRADE_12_SUBJECTS.forEach(sub => {
    subjectFrequency[sub.id] = 0;
  });

  learners.forEach(learner => {
    (learner.selectedSubjects || []).forEach(subId => {
      subjectFrequency[subId] = (subjectFrequency[subId] || 0) + 1;
    });
  });

  // Sort subjects by popularity
  const sortedSubjectPopularity = Object.entries(subjectFrequency)
    .map(([subId, count]) => {
      const subjectObj = GRADE_12_SUBJECTS.find(s => s.id === subId);
      const percentage = learners.length > 0 ? Math.round((count / learners.length) * 100) : 0;
      return {
        id: subId,
        name: subjectObj?.name || subId,
        category: subjectObj?.category || 'General',
        count,
        percentage
      };
    })
    .sort((a, b) => b.count - a.count);

  const mostPopularSubject = sortedSubjectPopularity[0] || { name: 'Mathematics', count: 0, percentage: 0 };

  // Calculate schools breakdown
  const schoolCounts: Record<string, number> = {};
  learners.forEach(l => {
    const s = l.schoolName || 'Unknown School';
    schoolCounts[s] = (schoolCounts[s] || 0) + 1;
  });
  const topSchools = Object.entries(schoolCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  // Filter learners
  const filteredLearners = learners.filter(learner => {
    if (statusFilter === 'active' && learner.isBanned) return false;
    if (statusFilter === 'banned' && !learner.isBanned) return false;
    if (statusFilter === 'unverified' && (learner.emailVerified || learner.phoneVerified)) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = learner.displayName?.toLowerCase().includes(q) || false;
      const matchUsername = learner.username?.toLowerCase().includes(q) || false;
      const matchEmail = learner.email?.toLowerCase().includes(q) || false;
      const matchSchool = learner.schoolName?.toLowerCase().includes(q) || false;
      const matchInitials = learner.initials?.toLowerCase().includes(q) || false;
      return matchName || matchUsername || matchEmail || matchSchool || matchInitials;
    }
    return true;
  });

  // Ban / Unban handler
  const handleToggleBan = async (learner: LearnerProfile) => {
    const targetStatus = !learner.isBanned;
    setActionInProgress(learner.uid);
    try {
      await adminBanLearner(learner.uid, targetStatus);
      setLearners(prev => prev.map(l => l.uid === learner.uid ? { ...l, isBanned: targetStatus } : l));
      onNotify(
        targetStatus 
          ? `User @${learner.username || learner.initials} has been BANNED.` 
          : `User @${learner.username || learner.initials} has been UNBANNED.`,
        targetStatus ? 'error' : 'success'
      );
    } catch (err: any) {
      onNotify(err.message || "Failed to update ban status", "error");
    } finally {
      setActionInProgress(null);
    }
  };

  // Delete learner handler
  const handleDeleteUser = async (learner: LearnerProfile) => {
    if (!window.confirm(`Are you sure you want to permanently delete user @${learner.username || learner.email}? This cannot be undone.`)) {
      return;
    }
    setActionInProgress(learner.uid);
    try {
      await adminDeleteLearner(learner.uid);
      setLearners(prev => prev.filter(l => l.uid !== learner.uid));
      if (selectedLearner?.uid === learner.uid) {
        setSelectedLearner(null);
      }
      onNotify(`Learner account deleted successfully.`, 'info');
    } catch (err: any) {
      onNotify(err.message || "Failed to delete user", "error");
    } finally {
      setActionInProgress(null);
    }
  };

  // Quick Add Learner (Admin simulation)
  const handleCreateLearner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGmail.trim() || !newGmail.includes('@')) {
      onNotify("Please enter a valid Gmail address", "error");
      return;
    }
    setActionInProgress('creating');
    try {
      const generatedPass = 'MatricPass2026!@#';
      const created = await registerLearner(newGmail.trim(), generatedPass, {
        initials: newInitials.trim() || 'A.B.',
        username: newUsername.trim() || newGmail.split('@')[0],
        displayName: `${newInitials.trim()} (${newUsername.trim()})`,
        schoolName: newSchool.trim() || 'Soweto Secondary Public School',
        phoneNumber: newPhone.trim(),
        selectedSubjects: newSelectedSubjects,
        phoneVerified: true,
        emailVerified: true
      });
      setLearners(prev => [created, ...prev]);
      setIsAddModalOpen(false);
      onNotify(`New Grade 12 learner @${created.username} enrolled successfully.`, 'success');
      // Reset form
      setNewInitials('');
      setNewUsername('');
      setNewGmail('');
      setNewPhone('');
      setNewSchool('');
    } catch (err: any) {
      onNotify(err.message || "Failed to create learner", "error");
    } finally {
      setActionInProgress(null);
    }
  };

  // 100% Separated Admin Gate: If not authenticated, require specific admin username and password
  if (!isAdminAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 space-y-6">
        <div className="text-center space-y-2">
          <div className="h-16 w-16 mx-auto rounded-3xl bg-red-100 dark:bg-red-950/60 text-red-600 border-2 border-red-300 dark:border-red-800 flex items-center justify-center shadow-md">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800">
            Strictly Restricted Access
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            LumnySA Master Administrator Gateway
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            Learner accounts do not have access to this portal. Only authorized national examiners and master administrators with specific credentials can proceed.
          </p>
        </div>

        {/* Master Credentials Form */}
        <form onSubmit={handleAdminLogin} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          {authError && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-300 text-red-800 dark:text-red-200 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{authError}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 dark:text-slate-300">
              Specific Admin Username
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                placeholder="e.g. admin"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 dark:text-slate-300">
              Specific Admin Password
            </label>
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter master password"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Quick test hint */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
            <div className="font-bold text-slate-800 dark:text-white flex items-center gap-1">
              <span>🔐</span>
              <span>Master Admin Credentials:</span>
            </div>
            <div>Username: <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded font-bold text-slate-900 dark:text-amber-400">admin</code></div>
            <div>Password: <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded font-bold text-slate-900 dark:text-amber-400">Mzansi@Master2026!</code></div>
          </div>

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Verifying Administrator Access...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                <span>Log In to Admin Account</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onBackToApp}
            className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all text-center cursor-pointer"
          >
            ← Return to Learner Dashboard
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      
      {/* Admin Top Navigation Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 md:p-8 text-white border-2 border-indigo-500/30 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-black uppercase tracking-wider">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Admin Command Center</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                Behind The Scenes
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              LumnySA Administration &amp; Analytics
            </h1>
            <p className="text-slate-300 text-xs md:text-sm font-medium leading-relaxed">
              Live monitoring of Grade 12 matric learners, subject popularity rankings, and account lifecycle management (ban, delete, manage accounts).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Enroll Learner</span>
            </button>
            <button
              onClick={loadLearners}
              disabled={loading}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Refresh Analytics"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>
            <button
              onClick={handleAdminLogout}
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Ban className="h-3.5 w-3.5" />
              <span>Log Out Admin</span>
            </button>
            <button
              onClick={onBackToApp}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-black shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Back to App</span>
            </button>
          </div>
        </div>
      </div>

      {/* Behind The Scenes Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Learners */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-black uppercase tracking-wider">Total Learners</span>
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {learners.length}
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              Active matriculants
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Registered Grade 12 students across public schools
          </p>
        </div>

        {/* Metric 2: Most Popular Subject */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-black uppercase tracking-wider">#1 Popular Subject</span>
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-slate-900 dark:text-white truncate">
              {mostPopularSubject.name.split('(')[0]}
            </span>
          </div>
          <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
            {mostPopularSubject.count} learners ({mostPopularSubject.percentage}% uptake)
          </p>
        </div>

        {/* Metric 3: Active vs Banned */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-black uppercase tracking-wider">Account Health</span>
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <span className="text-2xl font-black text-emerald-600">
                {learners.filter(l => !l.isBanned).length}
              </span>
              <span className="text-[10px] block text-slate-400 uppercase font-bold">Good Standing</span>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
            <div>
              <span className="text-2xl font-black text-red-600">
                {learners.filter(l => l.isBanned).length}
              </span>
              <span className="text-[10px] block text-slate-400 uppercase font-bold">Banned</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Moderated by administrator policies
          </p>
        </div>

        {/* Metric 4: Top School */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-black uppercase tracking-wider">Top Enrolled School</span>
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-400">
              <School className="h-4 w-4" />
            </div>
          </div>
          <div className="truncate">
            <span className="text-sm font-black text-slate-900 dark:text-white truncate block">
              {topSchools[0]?.[0] || 'Soweto Secondary'}
            </span>
          </div>
          <p className="text-[11px] font-bold text-purple-600 dark:text-purple-400">
            {topSchools[0]?.[1] || 1} registered matriculants
          </p>
        </div>
      </div>

      {/* Two Column Section: Subject Popularity Ranking & Schools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Subject Popularity Visualizer (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-600" />
                <span>What is the Most Popular Subject Learners Do?</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Live distribution of Grade 12 subjects chosen by registered South African matriculants.
              </p>
            </div>
            <span className="text-xs font-black px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shrink-0">
              Ranked by Uptake
            </span>
          </div>

          {/* Popularity Bar Chart */}
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2 scrollbar-thin">
            {sortedSubjectPopularity.slice(0, 8).map((sub, idx) => (
              <div key={sub.id} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-600 dark:text-slate-300">
                      #{idx + 1}
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      {sub.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold hidden sm:inline">
                      ({sub.category})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-black">
                    <span className="text-slate-900 dark:text-white">{sub.count} learners</span>
                    <span className="text-indigo-600 dark:text-indigo-400">({sub.percentage}%)</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(sub.percentage, 5)}%` }}
                    transition={{ duration: 0.6, delay: idx * 0.05 }}
                    className={`h-full rounded-full ${
                      idx === 0 
                        ? 'bg-gradient-to-r from-amber-500 to-amber-400' 
                        : idx === 1 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600'
                        : idx === 2 
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-500'
                        : 'bg-gradient-to-r from-slate-500 to-slate-400'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Schools Representation */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <School className="h-5 w-5 text-purple-600" />
              <span>Participating Schools</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Institutions with enrolled matriculants.
            </p>
          </div>

          <div className="space-y-3">
            {topSchools.map(([school, count], idx) => (
              <div key={school} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5 truncate">
                  <span className="w-6 h-6 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center text-xs font-black shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {school}
                  </span>
                </div>
                <span className="text-xs font-black text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/80 border border-purple-200 shrink-0">
                  {count} learners
                </span>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 text-xs text-blue-900 dark:text-blue-300 space-y-1">
            <span className="font-extrabold flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              <span>National CAPS Coverage</span>
            </span>
            <p className="text-[11px] leading-relaxed text-blue-800 dark:text-blue-300">
              All 9 South African provinces supported with standard DBE matric exam papers and marking rubrics.
            </p>
          </div>
        </div>
      </div>

      {/* Learner Accounts Management Table */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span>Learner Account Management</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              View, ban, or delete user accounts as requested by administration.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[220px]">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search initials, username, school, email..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div className="flex gap-1 text-[11px]">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
                  statusFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                All ({learners.length})
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
                  statusFilter === 'active'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setStatusFilter('banned')}
                className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
                  statusFilter === 'banned'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                Banned
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                <th className="py-3 px-3">Initials &amp; User</th>
                <th className="py-3 px-3">School (Grade 12)</th>
                <th className="py-3 px-3">Gmail / Contact</th>
                <th className="py-3 px-3">Registered Subjects</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLearners.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No learners match the current filter or search criteria.
                  </td>
                </tr>
              ) : (
                filteredLearners.map((learner) => (
                  <tr 
                    key={learner.uid} 
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                      learner.isBanned ? 'bg-red-50/30 dark:bg-red-950/10' : ''
                    }`}
                  >
                    {/* Initials & User */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                          learner.isBanned 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                        }`}>
                          {learner.initials || learner.displayName?.slice(0, 2).toUpperCase() || 'KM'}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>@{learner.username || learner.displayName?.toLowerCase().replace(/\s+/g, '_') || 'learner'}</span>
                            {learner.role === 'admin' && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 font-black">
                                ADMIN
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            Initials: {learner.initials || 'K.M.'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* School */}
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate max-w-[180px]">
                        {learner.schoolName || 'Grade 12 Public School'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {learner.province || 'Gauteng'}
                      </span>
                    </td>

                    {/* Gmail / Contact */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <Mail className="h-3 w-3 text-slate-400" />
                        <span className="truncate max-w-[180px]">{learner.email}</span>
                      </div>
                      {learner.phoneNumber && (
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 pt-0.5">
                          <Phone className="h-2.5 w-2.5" />
                          <span>{learner.phoneNumber}</span>
                        </div>
                      )}
                    </td>

                    {/* Subjects */}
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {(learner.selectedSubjects || []).slice(0, 3).map(s => {
                          const sObj = GRADE_12_SUBJECTS.find(sub => sub.id === s);
                          return (
                            <span 
                              key={s} 
                              className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            >
                              {sObj?.name.split(' ')[0] || s}
                            </span>
                          );
                        })}
                        {(learner.selectedSubjects?.length || 0) > 3 && (
                          <span className="text-[10px] font-bold text-slate-400 self-center">
                            +{(learner.selectedSubjects?.length || 0) - 3} more
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      {learner.isBanned ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-200">
                          <Ban className="h-3 w-3" />
                          <span>BANNED</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>ACTIVE</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Ban / Unban Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleBan(learner)}
                          disabled={actionInProgress === learner.uid}
                          className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            learner.isBanned
                              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300'
                              : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                          title={learner.isBanned ? 'Unban Learner' : 'Ban Learner'}
                        >
                          {actionInProgress === learner.uid ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : learner.isBanned ? (
                            <span className="flex items-center gap-1 text-[10px]">
                              <UserCheck className="h-3 w-3" />
                              <span>Unban</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px]">
                              <Ban className="h-3 w-3" />
                              <span>Ban</span>
                            </span>
                          )}
                        </button>

                        {/* Delete User Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(learner)}
                          disabled={actionInProgress === learner.uid}
                          className="p-1.5 rounded-lg text-xs font-bold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-all cursor-pointer"
                          title="Permanently Delete User"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Enroll Learner by Admin */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 max-w-md w-full space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                    <Plus className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900 dark:text-white">Admin: Enroll Learner</h3>
                    <p className="text-[11px] text-slate-500">Add a new Grade 12 matriculant to the platform</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateLearner} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Initials (e.g. K.M.)
                    </label>
                    <input
                      type="text"
                      required
                      value={newInitials}
                      onChange={(e) => setNewInitials(e.target.value)}
                      placeholder="e.g. K.M."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      required
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="e.g. khaya_2026"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Gmail Account
                  </label>
                  <input
                    type="email"
                    required
                    value={newGmail}
                    onChange={(e) => setNewGmail(e.target.value)}
                    placeholder="learner@gmail.com"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    School (Grade 12)
                  </label>
                  <input
                    type="text"
                    required
                    value={newSchool}
                    onChange={(e) => setNewSchool(e.target.value)}
                    placeholder="e.g. Pretoria Boys High School"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+27 82 123 4567"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="submit"
                    disabled={actionInProgress === 'creating'}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {actionInProgress === 'creating' ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    <span>Create &amp; Enroll Learner</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
