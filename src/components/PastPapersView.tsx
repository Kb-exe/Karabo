import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, CheckCircle2, ChevronRight, Sparkles, Bot, 
  HelpCircle, Eye, EyeOff, BookOpen, AlertTriangle, ArrowRight, 
  Check, Send, RotateCcw, Award, Lightbulb, Search, PlusCircle, X,
  Bookmark, BookmarkCheck, GraduationCap
} from 'lucide-react';
import { PastPaper, PastPaperQuestion, PaperActivity, PaperSourceType } from '../types';
import { GRADE_12_PAST_PAPERS, GRADE_12_SUBJECTS } from '../data/grade12Data';
import { auth, addLearnerBookmark, LearnerProfile } from '../firebase';

interface PastPapersViewProps {
  initialSubjectId?: string;
  initialPaperId?: string;
  initialQuestionNumber?: string;
  currentLearner?: LearnerProfile | null;
  onOpenAITutorWithQuestion?: (question: string, subject: string) => void;
  onTrackPaperActivity?: (activity: PaperActivity) => void;
}

export default function PastPapersView({ 
  initialSubjectId, 
  initialPaperId,
  initialQuestionNumber,
  currentLearner,
  onOpenAITutorWithQuestion,
  onTrackPaperActivity 
}: PastPapersViewProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(initialSubjectId || 'maths');
  const [selectedPaperId, setSelectedPaperId] = useState<string>(initialPaperId || 'maths-2024-p1');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'national' | 'my_school' | 'provincial_other'>('all');
  const [showMemoForQuestion, setShowMemoForQuestion] = useState<{ [qId: string]: boolean }>({});
  
  // Custom uploaded papers state
  const [customSchoolPapers, setCustomSchoolPapers] = useState<PastPaper[]>([]);
  const [isUploadPaperModalOpen, setIsUploadPaperModalOpen] = useState(false);
  const [newPaperSchool, setNewPaperSchool] = useState(currentLearner?.schoolName || 'Soweto Secondary Public School');
  const [newPaperTitle, setNewPaperTitle] = useState('');
  const [newPaperYear, setNewPaperYear] = useState(2025);
  const [newPaperSession, setNewPaperSession] = useState('Term 3 Prelim Exam');
  const [newPaperNumber, setNewPaperNumber] = useState<'Paper 1' | 'Paper 2' | 'Paper 3'>('Paper 1');
  const [newPaperQuestionText, setNewPaperQuestionText] = useState('');
  const [newPaperMemo, setNewPaperMemo] = useState('');
  const [newPaperMarks, setNewPaperMarks] = useState(10);
  
  // Interactive AI solution states per question (Text based protocol)
  const [loadingSolutionFor, setLoadingSolutionFor] = useState<string | null>(null);
  const [solutions, setSolutions] = useState<{ [qId: string]: string }>({});
  const [studentAttempts, setStudentAttempts] = useState<{ [qId: string]: string }>({});
  const [evaluatingStudentFor, setEvaluatingStudentFor] = useState<string | null>(null);
  const [savedBookmarks, setSavedBookmarks] = useState<{ [qId: string]: boolean }>({});

  // Custom question solver modal
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customQuestionText, setCustomQuestionText] = useState('');
  const [customSubject, setCustomSubject] = useState('Grade 12 Mathematics');
  const [customMarks, setCustomMarks] = useState(5);
  const [customSolution, setCustomSolution] = useState<string | null>(null);
  const [isSolvingCustom, setIsSolvingCustom] = useState(false);

  // Sync if initialPaperId changes
  useEffect(() => {
    if (initialPaperId) {
      setSelectedPaperId(initialPaperId);
      const found = [...customSchoolPapers, ...GRADE_12_PAST_PAPERS].find(p => p.id === initialPaperId);
      if (found) {
        setSelectedSubjectId(found.subjectId);
      }
    }
  }, [initialPaperId]);

  // Combined and filtered papers
  const allPapers = [...customSchoolPapers, ...GRADE_12_PAST_PAPERS];
  const subjectPapers = allPapers.filter(p => p.subjectId === selectedSubjectId);
  const availablePapers = subjectPapers.filter(p => {
    if (sourceFilter === 'national') return p.sourceType === 'national' || !p.sourceType;
    if (sourceFilter === 'my_school') return p.sourceType === 'my_school';
    if (sourceFilter === 'provincial_other') return p.sourceType === 'provincial_other';
    return true;
  });

  const activePaper = availablePapers.find(p => p.id === selectedPaperId) || availablePapers[0] || subjectPapers[0] || allPapers[0];

  // Track activity to dashboard
  useEffect(() => {
    if (!onTrackPaperActivity || !activePaper) return;
    const completedCount = activePaper.questions.filter(q => 
      showMemoForQuestion[q.id] || solutions[q.id] || studentAttempts[q.id]
    ).length;
    const totalCount = activePaper.questions.length;
    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    onTrackPaperActivity({
      id: `act_${activePaper.id}`,
      type: 'past_paper',
      paperId: activePaper.id,
      subjectId: activePaper.subjectId,
      subjectName: activePaper.subjectName,
      paperTitle: `${activePaper.subjectName} ${activePaper.paperNumber} - ${activePaper.session} (${activePaper.year})`,
      totalQuestions: totalCount,
      completedQuestions: completedCount,
      percentage,
      status: percentage >= 100 ? 'completed' : 'in_progress',
      lastUpdated: new Date().toISOString(),
      timeSpentMinutes: 15,
      lastQuestionNumber: initialQuestionNumber
    });
  }, [activePaper.id, showMemoForQuestion, solutions, studentAttempts]);

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    const firstPaper = GRADE_12_PAST_PAPERS.find(p => p.subjectId === subjectId);
    if (firstPaper) {
      setSelectedPaperId(firstPaper.id);
    }
  };

  const toggleMemo = (qId: string) => {
    setShowMemoForQuestion(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  // Solve question with AI via URLSearchParams
  const handleSolveWithAI = async (q: PastPaperQuestion, studentAnswer?: string) => {
    if (studentAnswer) {
      setEvaluatingStudentFor(q.id);
    } else {
      setLoadingSolutionFor(q.id);
    }

    try {
      const params = new URLSearchParams();
      params.append('questionText', q.text);
      params.append('subject', activePaper.subjectName);
      params.append('paper', activePaper.paperNumber);
      params.append('marks', q.marks.toString());
      if (studentAnswer) {
        params.append('studentAnswer', studentAnswer);
      }

      const response = await fetch('/api/solve-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });

      const solutionText = await response.text();
      setSolutions(prev => ({
        ...prev,
        [q.id]: solutionText
      }));
    } catch (err) {
      console.error("Error solving question:", err);
    } finally {
      setLoadingSolutionFor(null);
      setEvaluatingStudentFor(null);
    }
  };

  const handleSolveCustom = async () => {
    if (!customQuestionText.trim()) return;
    setIsSolvingCustom(true);
    setCustomSolution(null);

    try {
      const params = new URLSearchParams();
      params.append('questionText', customQuestionText);
      params.append('subject', customSubject);
      params.append('paper', 'Paper 1 / Paper 2');
      params.append('marks', customMarks.toString());

      const response = await fetch('/api/solve-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });

      const solutionText = await response.text();
      setCustomSolution(solutionText);
    } catch (err) {
      console.error("Custom solve error:", err);
    } finally {
      setIsSolvingCustom(false);
    }
  };

  // Submit / Upload School Past Paper
  const handleCreateSchoolPaper = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPaperQuestionText.trim()) return;

    const newPaperId = `custom-school-${Date.now()}`;
    const targetSubject = GRADE_12_SUBJECTS.find(s => s.id === selectedSubjectId);
    const newPaper: PastPaper = {
      id: newPaperId,
      subjectId: selectedSubjectId,
      subjectName: targetSubject?.name || 'Grade 12 Subject',
      year: Number(newPaperYear) || 2025,
      session: newPaperSession || `${newPaperSchool} Internal Examination`,
      paperNumber: newPaperNumber,
      totalMarks: 150,
      durationMinutes: 180,
      curriculum: 'CAPS / DBE',
      sourceType: 'my_school',
      schoolOrProvinceName: newPaperSchool,
      questions: [
        {
          id: `custom-q1-${Date.now()}`,
          questionNumber: 'Question 1.1',
          topic: newPaperTitle || 'School Exam Practice',
          text: newPaperQuestionText,
          marks: Number(newPaperMarks) || 10,
          officialMemo: newPaperMemo || 'Marking guidelines according to DBE standards. Use Mzansi tutor the ai to generate full breakdown.',
          hint: `Official internal paper from ${newPaperSchool}.`
        }
      ]
    };

    setCustomSchoolPapers(prev => [newPaper, ...prev]);
    setSelectedPaperId(newPaperId);
    setSourceFilter('my_school');
    setIsUploadPaperModalOpen(false);
    setNewPaperQuestionText('');
    setNewPaperMemo('');
    setNewPaperTitle('');
  };

  // Save bookmark to Firestore if user logged in
  const handleBookmarkQuestion = async (q: PastPaperQuestion) => {
    const user = auth.currentUser;
    if (user) {
      try {
        await addLearnerBookmark(user.uid, {
          id: `bm_${q.id}_${Date.now()}`,
          userId: user.uid,
          subjectId: selectedSubjectId,
          paperTitle: `${activePaper.subjectName} ${activePaper.paperNumber} (${activePaper.year})`,
          questionNumber: q.questionNumber,
          questionText: q.text
        });
        setSavedBookmarks(prev => ({ ...prev, [q.id]: true }));
      } catch (err) {
        console.warn("Could not save bookmark to cloud:", err);
        setSavedBookmarks(prev => ({ ...prev, [q.id]: true }));
      }
    } else {
      setSavedBookmarks(prev => ({ ...prev, [q.id]: !prev[q.id] }));
    }
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header & Controls - Educational Oxford Navy Palette */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300/40">
                Grade 12 NSC Past Papers
              </span>
              <span className="text-xs text-slate-500 font-medium">• Official CAPS Syllabus</span>
            </div>
            <h2 className="text-2xl font-black text-blue-950 dark:text-blue-100">
              Exam Papers &amp; Marking Memorandums
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Work through official DBE national exam questions, your own public school past papers, or other schools' trial papers with Mzansi Tutor.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setIsUploadPaperModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              <span>+ Add School Past Paper</span>
            </button>
            <button
              onClick={() => setIsCustomModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span>Solve Any Question</span>
            </button>
          </div>
        </div>

        {/* Paper Source Switcher (Government, My School, Other Schools) */}
        <div className="mb-4 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1.5 px-1">
            Filter Past Papers Source:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <button
              onClick={() => setSourceFilter('all')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                sourceFilter === 'all'
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All Papers ({subjectPapers.length})
            </button>
            <button
              onClick={() => setSourceFilter('national')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1 ${
                sourceFilter === 'national'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>🏛️ National (DBE)</span>
            </button>
            <button
              onClick={() => setSourceFilter('my_school')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1 ${
                sourceFilter === 'my_school'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>🏫 My School</span>
            </button>
            <button
              onClick={() => setSourceFilter('provincial_other')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1 ${
                sourceFilter === 'provincial_other'
                  ? 'bg-indigo-700 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>🌐 Other Schools</span>
            </button>
          </div>
        </div>

        {/* Recommended Subjects For Learner (from account creation) vs Browse All */}
        <div className="space-y-3">
          {currentLearner?.selectedSubjects && currentLearner.selectedSubjects.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-blue-500/10 to-indigo-500/10 border-2 border-amber-400/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-950 dark:text-amber-300 flex items-center gap-1.5 uppercase tracking-wide">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span>Recommended For You (Your Grade 12 Subjects):</span>
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                  {currentLearner.selectedSubjects.length} Registered
                </span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {currentLearner.selectedSubjects.map((subId) => {
                  const subObj = GRADE_12_SUBJECTS.find(s => s.id === subId);
                  if (!subObj) return null;
                  const isSelected = selectedSubjectId === subObj.id;
                  return (
                    <button
                      key={subObj.id}
                      onClick={() => handleSubjectChange(subObj.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-black shrink-0 transition-all cursor-pointer flex items-center gap-1.5 border ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm scale-102 ring-2 ring-amber-300'
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-amber-300/40 hover:bg-amber-50'
                      }`}
                    >
                      <span>⭐</span>
                      <span>{subObj.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* All South African Grade 12 Subjects */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Browse All Grade 12 Subjects in South Africa ({GRADE_12_SUBJECTS.length} CAPS Subjects)
              </span>
              <span className="text-[10px] text-slate-500 font-semibold">
                National Senior Certificate (NSC) &amp; Provincial Trials
              </span>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {GRADE_12_SUBJECTS.map((sub) => {
                const isSelected = selectedSubjectId === sub.id;
                const isLearnerSubject = currentLearner?.selectedSubjects?.includes(sub.id);
                return (
                  <button
                    key={sub.id}
                    onClick={() => handleSubjectChange(sub.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-700 shadow-sm font-black'
                        : isLearnerSubject
                        ? 'bg-amber-50 dark:bg-slate-800 text-slate-900 dark:text-amber-300 border-amber-300 hover:bg-amber-100'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isLearnerSubject && <span className="text-[10px]">⭐</span>}
                    <span>{sub.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Papers available for this subject */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Available Papers for {GRADE_12_SUBJECTS.find(s => s.id === selectedSubjectId)?.name}
            </span>
            <span className="text-[10px] font-semibold text-slate-500">
              {availablePapers.length} paper{availablePapers.length !== 1 ? 's' : ''} available
            </span>
          </div>

          {availablePapers.length === 0 ? (
            <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center space-y-2">
              <p className="text-xs text-slate-600 font-medium">
                No past papers found in this filter category for {GRADE_12_SUBJECTS.find(s => s.id === selectedSubjectId)?.name}.
              </p>
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setSourceFilter('all')}
                  className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-900 text-xs font-bold cursor-pointer"
                >
                  View All Papers
                </button>
                <button
                  onClick={() => setIsUploadPaperModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-900 text-xs font-bold cursor-pointer"
                >
                  + Add Your School's Paper
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {availablePapers.map((paper) => {
                const isSelected = selectedPaperId === paper.id;
                const sourceTag = paper.sourceType === 'my_school' 
                  ? '🏫 My School' 
                  : paper.sourceType === 'provincial_other' 
                  ? '🌐 Other Public School' 
                  : '🏛️ National DBE';

                return (
                  <button
                    key={paper.id}
                    onClick={() => setSelectedPaperId(paper.id)}
                    className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2.5 cursor-pointer border ${
                      isSelected
                        ? 'bg-blue-600 border-blue-700 text-white shadow-xs font-bold ring-2 ring-blue-300'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-black ${
                      isSelected 
                        ? 'bg-white/20 text-white' 
                        : paper.sourceType === 'my_school' 
                        ? 'bg-emerald-100 text-emerald-900' 
                        : paper.sourceType === 'provincial_other'
                        ? 'bg-indigo-100 text-indigo-900'
                        : 'bg-amber-100 text-amber-900'
                    }`}>
                      {sourceTag}
                    </span>
                    <span>{paper.year} {paper.session} ({paper.paperNumber})</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Active Paper Details Card */}
      {activePaper && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
            <div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                {activePaper.curriculum} • {activePaper.session}
              </span>
              <h3 className="text-xl font-bold text-blue-950 dark:text-blue-100 mt-0.5">
                {activePaper.subjectName} {activePaper.paperNumber} ({activePaper.year})
              </h3>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-semibold">
              <div className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                Total: <strong className="text-slate-900 dark:text-slate-100">{activePaper.totalMarks} Marks</strong>
              </div>
              <div className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                Time: <strong className="text-slate-900 dark:text-slate-100">{activePaper.durationMinutes / 60} Hours</strong>
              </div>
            </div>
          </div>

          {/* Questions Stream */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
            {activePaper.questions.map((q) => {
              const isMemoVisible = !!showMemoForQuestion[q.id];
              const isAiSolving = loadingSolutionFor === q.id;
              const isAiEvaluating = evaluatingStudentFor === q.id;
              const aiSolutionText = solutions[q.id];
              const studentAnswer = studentAttempts[q.id] || '';
              const isBookmarked = !!savedBookmarks[q.id];

              return (
                <div key={q.id} className="py-6 space-y-4">
                  {/* Question Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-amber-400 font-bold text-xs">
                        {q.questionNumber}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Topic: <strong className="text-slate-800 dark:text-slate-200">{q.topic}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
                        [{q.marks} Marks]
                      </span>

                      {/* Bookmark button */}
                      <button
                        onClick={() => handleBookmarkQuestion(q)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          isBookmarked 
                            ? 'bg-amber-100 dark:bg-amber-950 border-amber-400 text-amber-700 dark:text-amber-300' 
                            : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600'
                        }`}
                        title={isBookmarked ? 'Bookmarked' : 'Bookmark Question'}
                      >
                        {isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                      </button>
                      
                      {/* Toggle Official Memo */}
                      <button
                        onClick={() => toggleMemo(q.id)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        {isMemoVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        <span>{isMemoVisible ? 'Hide Memo' : 'Official Memo'}</span>
                      </button>

                      {/* Solve with AI button */}
                      <button
                        onClick={() => handleSolveWithAI(q)}
                        disabled={isAiSolving}
                        className="px-3 py-1.5 rounded-lg bg-blue-950 hover:bg-blue-900 active:scale-95 text-amber-400 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50 border border-amber-400/30"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>{isAiSolving ? 'AI Solving...' : 'Solve with AI'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Question Content */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-mono text-xs md:text-sm whitespace-pre-wrap leading-relaxed">
                    {q.text}
                  </div>

                  {/* Official DBE Memo Collapsible */}
                  <AnimatePresence>
                    {isMemoVisible && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-500/30 text-xs space-y-2">
                          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Official DBE Marking Guideline &amp; Allocation:</span>
                          </div>
                          <div className="font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                            {q.officialMemo}
                          </div>
                          {q.hint && (
                            <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800 text-[11px] text-amber-800 dark:text-amber-300 font-sans flex items-center gap-1.5">
                              <Lightbulb className="h-3.5 w-3.5 shrink-0" />
                              <span>{q.hint}</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Interactive Self-Assessment: Try your answer */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5 text-blue-900 dark:text-amber-400" />
                        Try &amp; Self-Check Your Working
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Type your final answer or working to test yourself against the memo
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={studentAnswer}
                        onChange={(e) => setStudentAttempts(prev => ({ ...prev, [q.id]: e.target.value }))}
                        placeholder="e.g. x = 5, or v = 28.73 m/s, or your full step-by-step working..."
                        className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900 font-mono"
                      />
                      <button
                        onClick={() => handleSolveWithAI(q, studentAnswer)}
                        disabled={!studentAnswer.trim() || isAiEvaluating}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>{isAiEvaluating ? 'Grading...' : 'Grade with AI'}</span>
                      </button>
                    </div>
                  </div>

                  {/* AI Structured Solution Result */}
                  {aiSolutionText && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-blue-950 text-amber-400 rounded-lg">
                            <Bot className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-blue-950 dark:text-blue-200">
                              Mzansi tutor the ai Step-by-Step Breakdown
                            </h4>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                              Methodology &amp; Mark Scheme
                            </span>
                          </div>
                        </div>

                        {onOpenAITutorWithQuestion && (
                          <button
                            onClick={() => onOpenAITutorWithQuestion(
                              `Please explain question ${q.questionNumber} (${q.topic}) from Grade 12 ${activePaper.subjectName} in deeper detail: "${q.text}"`,
                              activePaper.subjectName
                            )}
                            className="text-[11px] font-bold text-blue-900 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <span>Chat with Mzansi tutor the ai about this</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        )}
                      </div>

                      {/* Formatted Solution Text with Vertical Bar Delimited Protocol */}
                      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-blue-100 dark:border-blue-900/50">
                        <SolutionTextRenderer text={aiSolutionText} />
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Solve Any Custom Past Paper Question */}
      <AnimatePresence>
        {isCustomModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              onClick={() => setIsCustomModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            ></div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsCustomModalOpen(false)}
                className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-blue-950 text-amber-400 rounded-xl border border-amber-400/30">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-blue-950 dark:text-blue-100">
                    Grade 12 Past Paper Question Solver
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Paste any question from your prelim, trial, or past exam papers for step-by-step CAPS marking
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Subject
                    </label>
                    <select
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                    >
                      <option value="Grade 12 Mathematics">Grade 12 Mathematics</option>
                      <option value="Grade 12 Physical Sciences">Grade 12 Physical Sciences</option>
                      <option value="Grade 12 Life Sciences">Grade 12 Life Sciences</option>
                      <option value="Grade 12 English">Grade 12 English</option>
                      <option value="Grade 12 Accounting">Grade 12 Accounting</option>
                      <option value="Grade 12 Business Studies">Grade 12 Business Studies</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Marks Allocation
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={25}
                      value={customMarks}
                      onChange={(e) => setCustomMarks(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Paste Question Text
                  </label>
                  <textarea
                    rows={4}
                    value={customQuestionText}
                    onChange={(e) => setCustomQuestionText(e.target.value)}
                    placeholder="e.g. Determine the derivative of f(x) = 3x² - 5x using first principles. Or: A 5kg crate on a rough 30° incline..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-200 font-mono placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900"
                  ></textarea>
                </div>

                <button
                  onClick={handleSolveCustom}
                  disabled={!customQuestionText.trim() || isSolvingCustom}
                  className="w-full py-3 bg-gradient-to-r from-blue-950 to-blue-900 hover:from-blue-900 hover:to-blue-800 text-amber-300 rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer border border-amber-400/30"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{isSolvingCustom ? 'Generating Model Solution...' : 'Solve with Mzansi tutor the ai'}</span>
                </button>

                {/* Custom Solution Render with Vertical Bar Delimited Protocol */}
                {customSolution && (
                  <div className="mt-4 p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-3">
                    <h4 className="font-bold text-xs text-blue-950 dark:text-blue-200">
                      Step-by-Step Model Solution &amp; Marking Breakdown
                    </h4>

                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                      <SolutionTextRenderer text={customSolution} />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Upload School Past Paper Modal */}
        {isUploadPaperModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-900">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      Add / Upload School Past Paper
                    </h3>
                    <p className="text-xs text-slate-500">
                      Upload your school's exam questions to practice and solve with Mzansi tutor the ai.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsUploadPaperModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSchoolPaper} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Public School Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newPaperSchool}
                      onChange={(e) => setNewPaperSchool(e.target.value)}
                      placeholder="e.g. Soweto Secondary Public School"
                      className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Exam Session &amp; Year
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newPaperSession}
                        onChange={(e) => setNewPaperSession(e.target.value)}
                        placeholder="e.g. September Trial Prelim"
                        className="flex-1 px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                      />
                      <input
                        type="number"
                        value={newPaperYear}
                        onChange={(e) => setNewPaperYear(Number(e.target.value))}
                        className="w-20 px-2 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Paper Number
                    </label>
                    <select
                      value={newPaperNumber}
                      onChange={(e) => setNewPaperNumber(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                    >
                      <option value="Paper 1">Paper 1</option>
                      <option value="Paper 2">Paper 2</option>
                      <option value="Paper 3">Paper 3</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Question Topic / Title
                    </label>
                    <input
                      type="text"
                      value={newPaperTitle}
                      onChange={(e) => setNewPaperTitle(e.target.value)}
                      placeholder="e.g. Calculus &amp; Cubic Functions"
                      className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Exam Question Text <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-1.5 text-xs">
                      <span>Marks:</span>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={newPaperMarks}
                        onChange={(e) => setNewPaperMarks(Number(e.target.value))}
                        className="w-14 px-2 py-0.5 rounded text-xs border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center font-bold"
                      />
                    </div>
                  </div>
                  <textarea
                    required
                    rows={4}
                    value={newPaperQuestionText}
                    onChange={(e) => setNewPaperQuestionText(e.target.value)}
                    placeholder="Paste or type the exam question from your public school paper here..."
                    className="w-full p-3 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Official Marking Memorandum / Guidelines (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={newPaperMemo}
                    onChange={(e) => setNewPaperMemo(e.target.value)}
                    placeholder="Optional memo answers. If left blank, Mzansi tutor the ai will generate the full marking memo for you."
                    className="w-full p-3 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Add Paper to Practice Repository</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsUploadPaperModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer"
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

// Renderer for Vertical Bar Delimited Solution Strings
function SolutionTextRenderer({ text }: { text: string }) {
  const [showRaw, setShowRaw] = useState(false);
  const [copied, setCopied] = useState(false);
  const hasDelimiter = text.includes('|');

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[11px] pb-1 border-b border-slate-100 dark:border-slate-800">
        <span className="text-slate-500 font-medium">
          {hasDelimiter ? 'Protocol: Plain text separated by vertical bar (|)' : 'Standard Output'}
        </span>
        <div className="flex items-center gap-2">
          {hasDelimiter && (
            <button
              onClick={() => setShowRaw(!showRaw)}
              className="text-blue-900 dark:text-amber-400 font-semibold hover:underline cursor-pointer"
            >
              {showRaw ? 'Show Formatted View' : 'Show Raw Vertical Bar Strings (|)'}
            </button>
          )}
          <button
            onClick={() => {
              navigator.clipboard.writeText(text);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="text-slate-500 hover:text-slate-800 dark:hover:text-white font-medium cursor-pointer"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {showRaw || !hasDelimiter ? (
        <pre className="p-3 bg-slate-900 text-emerald-300 rounded-xl font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap">
          {text}
        </pre>
      ) : (
        <div className="space-y-2 pt-1">
          {text.split('\n').map((line, idx) => {
            const clean = line.trim();
            if (!clean) return null;
            if (clean.includes('|')) {
              const [head, ...rest] = clean.split('|').map(s => s.trim());
              return (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-900 text-white">
                    {head.replace(/_/g, ' ')}
                  </span>
                  <div className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans pl-1">
                    {rest.join(' — ')}
                  </div>
                </div>
              );
            }
            return (
              <p key={idx} className="text-xs text-slate-800 dark:text-slate-200">
                {clean}
              </p>
            );
          })}
        </div>
      )}
    </div>
  );
}
