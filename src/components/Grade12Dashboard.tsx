import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, FileText, Bot, Award, Clock, ArrowRight, 
  Sparkles, CheckCircle2, ChevronRight, AlertCircle, 
  Check, Play, RotateCcw, Trash2, Filter, Layers, 
  FileCode, Presentation, Image as ImageIcon, BookOpen, 
  Search, ShieldCheck
} from 'lucide-react';
import { 
  ScreenType, 
  LearnerActivity, 
  PaperActivity, 
  PromptActivity,
  AIMode,
  DocumentFileType 
} from '../types';
import { LearnerProfile } from '../firebase';
import { GRADE_12_SUBJECTS } from '../data/grade12Data';

interface Grade12DashboardProps {
  onNavigate: (screen: ScreenType) => void;
  activities: LearnerActivity[];
  currentLearner?: LearnerProfile | null;
  onSelectPaperToResume?: (paperId: string, questionNumber?: string) => void;
  onResumeAIPrompt?: (promptActivity: PromptActivity) => void;
  onUpdateActivityStatus?: (activityId: string, status: 'in_progress' | 'completed', percentage?: number) => void;
  onDeleteActivity?: (activityId: string) => void;
  onStartNewPaper?: () => void;
  onStartNewAIPrompt?: () => void;
}

export default function Grade12Dashboard({
  onNavigate,
  activities,
  currentLearner,
  onSelectPaperToResume,
  onResumeAIPrompt,
  onUpdateActivityStatus,
  onDeleteActivity,
  onStartNewPaper,
  onStartNewAIPrompt
}: Grade12DashboardProps) {
  const [filterType, setFilterType] = useState<'all' | 'unfinished' | 'completed' | 'papers' | 'prompts'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Counts for summary metrics
  const totalCount = activities.length;
  const unfinishedCount = activities.filter(a => a.status === 'in_progress').length;
  const completedCount = activities.filter(a => a.status === 'completed').length;
  const papersCount = activities.filter(a => a.type === 'past_paper').length;
  const promptsCount = activities.filter(a => a.type === 'ai_prompt').length;

  // Filtered list
  const filteredActivities = activities.filter(activity => {
    // Type/status filter
    if (filterType === 'unfinished' && activity.status !== 'in_progress') return false;
    if (filterType === 'completed' && activity.status !== 'completed') return false;
    if (filterType === 'papers' && activity.type !== 'past_paper') return false;
    if (filterType === 'prompts' && activity.type !== 'ai_prompt') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (activity.type === 'past_paper') {
        const paper = activity as PaperActivity;
        return paper.paperTitle.toLowerCase().includes(q) || paper.subjectName.toLowerCase().includes(q);
      } else {
        const prompt = activity as PromptActivity;
        return prompt.title.toLowerCase().includes(q) || 
               prompt.sourceDocName.toLowerCase().includes(q) || 
               prompt.subject.toLowerCase().includes(q);
      }
    }
    return true;
  });

  const getDocTypeIcon = (type: DocumentFileType) => {
    switch (type) {
      case 'powerpoint': return <Presentation className="h-4 w-4 text-amber-500" />;
      case 'pdf': return <FileText className="h-4 w-4 text-red-500" />;
      case 'image': return <ImageIcon className="h-4 w-4 text-emerald-500" />;
      case 'document': return <FileCode className="h-4 w-4 text-blue-500" />;
      default: return <FileText className="h-4 w-4 text-blue-500" />;
    }
  };

  const getModeBadge = (mode: AIMode) => {
    switch (mode) {
      case 'summarize':
        return { label: 'Study Summary', color: 'bg-blue-100 text-blue-900 dark:bg-blue-950/80 dark:text-blue-300 border-blue-300' };
      case 'long_questions':
        return { label: 'Long Exam Questions', color: 'bg-purple-100 text-purple-900 dark:bg-purple-950/80 dark:text-purple-300 border-purple-300' };
      case 'short_questions':
        return { label: 'Short Questions', color: 'bg-indigo-100 text-indigo-900 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-300' };
      case 'flashcards':
        return { label: 'Flashcards', color: 'bg-amber-100 text-amber-950 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300' };
      case 'mcq':
        return { label: 'Multiple Choice (MCQ)', color: 'bg-emerald-100 text-emerald-950 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300' };
      case 'fill_blank':
        return { label: 'Fill in the Blank', color: 'bg-teal-100 text-teal-950 dark:bg-teal-950/80 dark:text-teal-300 border-teal-300' };
      default:
        return { label: 'AI Study Prompt', color: 'bg-blue-100 text-blue-900 border-blue-300' };
    }
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* If activities is empty (brand new learner / fresh get started) */}
      {totalCount === 0 ? (
        <div className="space-y-6">
          {/* Welcome Header Card */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50/70 to-amber-50/60 p-6 md:p-8 border-2 border-blue-200 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 border border-blue-300 text-blue-900 text-xs font-black uppercase tracking-wider">
                    <GraduationCap className="h-3.5 w-3.5 text-blue-700" />
                    <span>Public School Matric Revision</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-extrabold">
                    <ShieldCheck className="h-3 w-3 text-emerald-700" />
                    <span>100% Free Platform</span>
                  </span>
                </div>

                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-blue-950">
                  Welcome to Your Grade 12 Dashboard!
                </h2>
                <p className="text-slate-700 text-xs md:text-sm leading-relaxed font-medium">
                  {currentLearner?.displayName ? `Learner: ${currentLearner.displayName}` : 'Grade 12 Learner'} • {currentLearner?.schoolName || 'Public High School'} ({currentLearner?.province || 'South Africa'}).
                  Everything on this platform is completely free for South African public school matriculants.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
                <button
                  onClick={() => onNavigate('past_papers')}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText className="h-4 w-4" />
                  <span>Start Past Papers</span>
                </button>
                <button
                  onClick={() => onNavigate('ai_tutor')}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Bot className="h-4 w-4" />
                  <span>Ask Mzansi Tutor</span>
                </button>
              </div>
            </div>
          </section>

          {/* Pristine Empty State Card */}
          <section className="bg-white rounded-3xl border-2 border-slate-200 p-8 md:p-12 text-center space-y-5 shadow-xs">
            <div className="h-20 w-20 mx-auto rounded-3xl bg-blue-50 border-2 border-blue-200 flex items-center justify-center text-blue-600 shadow-inner">
              <Sparkles className="h-10 w-10 text-blue-600" />
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                Pristine Account • Everything is Free
              </span>
              <h3 className="text-xl md:text-2xl font-black text-slate-900">
                Your Dashboard is Clean &amp; Ready
              </h3>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-medium">
                There is nothing on this page yet because you haven't used <strong>Mzansi Tutor</strong> or practiced past exam papers yet. Everything is fine and completely free!
                As soon as you practice a question or generate study materials, your active and completed sessions will appear here automatically.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <button
                onClick={() => onNavigate('past_papers')}
                className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <FileText className="h-4 w-4" />
                <span>Explore Past Papers (National, My School &amp; Other Schools)</span>
              </button>
              <button
                onClick={() => onNavigate('ai_tutor')}
                className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-extrabold shadow-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Bot className="h-4 w-4 text-blue-950" />
                <span>Open Mzansi Tutor (Upload Documents)</span>
              </button>
            </div>
          </section>

          {/* Your Selected Subjects Hub (7 to 10 Subjects) */}
          <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-blue-950 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <span>Your Registered Matric Subjects ({currentLearner?.selectedSubjects?.length || 7} Subjects)</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Tap any subject to view government past papers, school papers, or AI exam preparation.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-900 border border-blue-200">
                CAPS Syllabus
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {(currentLearner?.selectedSubjects && currentLearner.selectedSubjects.length > 0 
                ? currentLearner.selectedSubjects 
                : ['eng_hl', 'afr_eat', 'lo', 'maths', 'physci', 'lifesci', 'geography']
              ).map((subId) => {
                const subObj = GRADE_12_SUBJECTS.find(s => s.id === subId);
                const subName = subObj?.name || subId;
                const category = subObj?.category || 'Subject';
                return (
                  <div 
                    key={subId}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all flex items-center justify-between gap-3 group"
                  >
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 block">
                        {category}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                        {subName}
                      </h4>
                    </div>
                    <button
                      onClick={() => onNavigate('past_papers')}
                      className="px-2.5 py-1 rounded-xl bg-blue-50 group-hover:bg-blue-600 group-hover:text-white text-blue-900 text-[11px] font-bold transition-all shrink-0 cursor-pointer"
                    >
                      View Papers →
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      ) : (
        <>
          {/* Grade 12 Public School Revision Dashboard Header (Light Theme) */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50/60 to-amber-50/50 text-slate-900 p-6 md:p-8 border-2 border-blue-200 shadow-sm">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 border border-blue-300 text-blue-900 text-xs font-black uppercase tracking-wider">
                    <GraduationCap className="h-3.5 w-3.5 text-blue-700" />
                    <span>Public School Matric Revision</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-extrabold">
                    <ShieldCheck className="h-3 w-3 text-emerald-700" />
                    <span>Active Study Sessions</span>
                  </span>
                </div>

                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-blue-950">
                  Papers &amp; Study Prompts In Progress
                </h2>
                <p className="text-slate-700 text-xs md:text-sm leading-relaxed font-medium">
                  Exclusively tracking the official DBE past papers and Mzansi Tutor study prompts you have worked on or left unfinished.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      if (onStartNewPaper) onStartNewPaper();
                      else onNavigate('past_papers');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Start / Practice Past Paper</span>
                  </button>
                  <button
                    onClick={() => {
                      if (onStartNewAIPrompt) onStartNewAIPrompt();
                      else onNavigate('ai_tutor');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black shadow-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                  >
                    <Bot className="h-4 w-4" />
                    <span>Practice with Mzansi Tutor</span>
                  </button>
                </div>
              </div>

              {/* Metric Status Grid (Light, clean, high-contrast) */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3 bg-white border-2 border-slate-200 rounded-2xl p-4 shrink-0 shadow-xs">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                  <div className="text-2xl font-black text-amber-900">{unfinishedCount}</div>
                  <div className="text-[11px] font-extrabold text-amber-800">⏳ Unfinished</div>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
                  <div className="text-2xl font-black text-emerald-900">{completedCount}</div>
                  <div className="text-[11px] font-extrabold text-emerald-800">✅ Completed</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                  <div className="text-2xl font-black text-blue-900">{papersCount}</div>
                  <div className="text-[11px] font-extrabold text-blue-800">📄 Past Papers</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-center">
                  <div className="text-2xl font-black text-purple-900">{promptsCount}</div>
                  <div className="text-[11px] font-extrabold text-purple-800">🤖 Mzansi Tutor</div>
                </div>
              </div>
            </div>
          </section>

      {/* Filter Tabs & Search Controls */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Quick Filter Pill Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                filterType === 'all'
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setFilterType('unfinished')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                filterType === 'unfinished'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300/40'
              }`}
            >
              <span>⏳ Unfinished</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20">{unfinishedCount}</span>
            </button>
            <button
              onClick={() => setFilterType('completed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                filterType === 'completed'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40'
              }`}
            >
              <span>✅ Completed</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20">{completedCount}</span>
            </button>
            <button
              onClick={() => setFilterType('papers')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                filterType === 'papers'
                  ? 'bg-blue-800 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span>📄 Past Papers</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700">{papersCount}</span>
            </button>
            <button
              onClick={() => setFilterType('prompts')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                filterType === 'prompts'
                  ? 'bg-indigo-800 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span>🤖 Mzansi Tutor</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700">{promptsCount}</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative min-w-[220px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search paper or prompt..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
          </div>
        </div>
      </section>

      {/* Main Activities Feed - Papers & Prompts Only */}
      <section className="space-y-4">
        {filteredActivities.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center space-y-4 shadow-sm">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock className="h-8 w-8" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No {filterType !== 'all' ? `${filterType} ` : ''}papers or prompts found
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Start working on an official Grade 12 past exam paper or attach a PowerPoint / PDF in the Mzansi Tutor tab to track your revision progress here.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('past_papers')}
                className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <FileText className="h-4 w-4" />
                Go to Past Papers
              </button>
              <button
                onClick={() => onNavigate('ai_tutor')}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-blue-950 text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <Bot className="h-4 w-4" />
                Open Mzansi Tutor
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {filteredActivities.map((act) => {
                const isPaper = act.type === 'past_paper';
                const isUnfinished = act.status === 'in_progress';

                if (isPaper) {
                  const paperAct = act as PaperActivity;
                  return (
                    <motion.div
                      key={paperAct.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`relative rounded-2xl p-5 border transition-all ${
                        isUnfinished
                          ? 'bg-amber-50/40 dark:bg-slate-900 border-amber-300/80 dark:border-amber-500/40 shadow-sm'
                          : 'bg-white dark:bg-slate-900 border-emerald-300/80 dark:border-emerald-600/40'
                      }`}
                    >
                      {/* Top Row: Type & Status Badge */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            <FileText className="h-3 w-3 text-blue-900 dark:text-blue-400" />
                            <span>Grade 12 Past Paper</span>
                          </span>
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            {paperAct.subjectName}
                          </span>
                        </div>

                        {/* Status Badge */}
                        {isUnfinished ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300">
                            <Clock className="h-3 w-3 text-amber-600 animate-pulse" />
                            <span>Unfinished</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 border border-emerald-300">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            <span>Completed</span>
                          </span>
                        )}
                      </div>

                      {/* Paper Title */}
                      <h4 className="text-sm md:text-base font-bold text-slate-900 dark:text-white mb-2 line-clamp-1">
                        {paperAct.paperTitle}
                      </h4>

                      {/* Progress Information */}
                      <div className="space-y-1.5 mb-4">
                        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                          <span>
                            Questions: <strong className="text-slate-900 dark:text-white">{paperAct.completedQuestions} of {paperAct.totalQuestions}</strong>
                          </span>
                          <span className="font-bold text-blue-900 dark:text-amber-400">
                            {paperAct.percentage}% Complete
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              isUnfinished 
                                ? 'bg-gradient-to-r from-amber-500 to-amber-600' 
                                : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(5, paperAct.percentage))}%` }}
                          />
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400">
                          Last active: {new Date(paperAct.lastUpdated).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>

                        <div className="flex items-center gap-2">
                          {onUpdateActivityStatus && (
                            <button
                              onClick={() => onUpdateActivityStatus(
                                paperAct.id, 
                                isUnfinished ? 'completed' : 'in_progress',
                                isUnfinished ? 100 : Math.round((paperAct.completedQuestions / paperAct.totalQuestions) * 100)
                              )}
                              title={isUnfinished ? "Mark as Finished" : "Mark as In-Progress"}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {onDeleteActivity && (
                            <button
                              onClick={() => onDeleteActivity(paperAct.id)}
                              title="Delete from dashboard"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => {
                              if (onSelectPaperToResume) {
                                onSelectPaperToResume(paperAct.paperId, paperAct.lastQuestionNumber);
                              } else {
                                onNavigate('past_papers');
                              }
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                              isUnfinished
                                ? 'bg-amber-500 hover:bg-amber-600 text-blue-950'
                                : 'bg-blue-900 hover:bg-blue-800 text-white'
                            }`}
                          >
                            <Play className="h-3 w-3 fill-current" />
                            <span>{isUnfinished ? 'Resume Paper' : 'Review Memo'}</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                } else {
                  // AI Prompt Activity Card
                  const promptAct = act as PromptActivity;
                  const modeBadge = getModeBadge(promptAct.mode);

                  return (
                    <motion.div
                      key={promptAct.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`relative rounded-2xl p-5 border transition-all ${
                        isUnfinished
                          ? 'bg-amber-50/40 dark:bg-slate-900 border-amber-300/80 dark:border-amber-500/40 shadow-sm'
                          : 'bg-white dark:bg-slate-900 border-emerald-300/80 dark:border-emerald-600/40'
                      }`}
                    >
                      {/* Top Row: AI Mode & Status */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${modeBadge.color}`}>
                            <Bot className="h-3 w-3" />
                            <span>{modeBadge.label}</span>
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            {getDocTypeIcon(promptAct.sourceDocType)}
                            <span className="truncate max-w-[130px]">{promptAct.sourceDocName}</span>
                          </span>
                        </div>

                        {/* Status Badge */}
                        {isUnfinished ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300">
                            <Clock className="h-3 w-3 text-amber-600 animate-pulse" />
                            <span>Unfinished</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 border border-emerald-300">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            <span>Completed</span>
                          </span>
                        )}
                      </div>

                      {/* Prompt Title */}
                      <h4 className="text-sm md:text-base font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">
                        {promptAct.title}
                      </h4>

                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-1">
                        Subject: <strong>{promptAct.subject}</strong> • {promptAct.progressText}
                      </p>

                      {/* Progress Bar */}
                      <div className="space-y-1.5 mb-4">
                        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                          <span>Status: {promptAct.progressText}</span>
                          <span className="font-bold text-amber-600 dark:text-amber-400">
                            {promptAct.percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              isUnfinished 
                                ? 'bg-gradient-to-r from-amber-500 to-amber-600' 
                                : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(5, promptAct.percentage))}%` }}
                          />
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400">
                          Last active: {new Date(promptAct.lastUpdated).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>

                        <div className="flex items-center gap-2">
                          {onUpdateActivityStatus && (
                            <button
                              onClick={() => onUpdateActivityStatus(
                                promptAct.id, 
                                isUnfinished ? 'completed' : 'in_progress',
                                isUnfinished ? 100 : 50
                              )}
                              title={isUnfinished ? "Mark as Finished" : "Mark as In-Progress"}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {onDeleteActivity && (
                            <button
                              onClick={() => onDeleteActivity(promptAct.id)}
                              title="Delete from dashboard"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => {
                              if (onResumeAIPrompt) {
                                onResumeAIPrompt(promptAct);
                              } else {
                                onNavigate('ai_tutor');
                              }
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                              isUnfinished
                                ? 'bg-amber-500 hover:bg-amber-600 text-blue-950'
                                : 'bg-blue-900 hover:bg-blue-800 text-white'
                            }`}
                          >
                            <Play className="h-3 w-3 fill-current" />
                            <span>{isUnfinished ? 'Resume Study Prompt' : 'Review Prompt'}</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                }
              })}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* Grade 12 Quick Action Footer Bar */}
      <section className="rounded-2xl p-4 bg-blue-950/10 dark:bg-blue-950/30 border border-blue-900/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
          <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
          <span>
            Working on a new topic? Pick an official DBE past paper or generate new questions by attaching a document in the AI tab.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate('past_papers')}
            className="px-3 py-1.5 rounded-xl bg-blue-900 text-white hover:bg-blue-800 text-xs font-bold transition-all cursor-pointer"
          >
            All Past Papers
          </button>
          <button
            onClick={() => onNavigate('ai_tutor')}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-blue-950 text-xs font-bold transition-all cursor-pointer"
          >
            Open AI Study Hub
          </button>
        </div>
      </section>
        </>
      )}

    </div>
  );
}
