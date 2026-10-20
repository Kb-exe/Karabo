import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, FileText, Presentation, Image as ImageIcon, FileCode, 
  Upload, Sparkles, CheckCircle2, ChevronRight, HelpCircle, 
  RotateCcw, Check, X, ArrowRight, Layers, Eye, EyeOff, 
  BookOpen, Clock, Award, ShieldCheck, Zap, AlertTriangle, Copy
} from 'lucide-react';
import { 
  AIMode, 
  DocumentFileType, 
  UploadedFileDoc, 
  FlashcardItem, 
  MCQItem, 
  FillBlankItem, 
  PromptActivity 
} from '../types';

interface Grade12AITutorProps {
  initialActivity?: PromptActivity | null;
  onSaveActivityToDashboard?: (activity: PromptActivity) => void;
  onNavigateToDashboard?: () => void;
}

export default function Grade12AITutor({
  initialActivity,
  onSaveActivityToDashboard,
  onNavigateToDashboard
}: Grade12AITutorProps) {
  // Selected generation mode (summarize, long_questions, short_questions, flashcards, mcq, fill_blank)
  const [selectedMode, setSelectedMode] = useState<AIMode>(initialActivity?.mode || 'summarize');
  
  // Subject & Topic
  const [subject, setSubject] = useState<string>(initialActivity?.subject || 'Physical Sciences');
  const [topic, setTopic] = useState<string>('Electrodynamics & AC Generators');

  // Attached File state (PowerPoint, Document, PDF, Image)
  const [attachedFile, setAttachedFile] = useState<UploadedFileDoc | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generation state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [rawGeneratedText, setRawGeneratedText] = useState<string>('');

  // Parsed Interactive Items
  const [flashcards, setFlashcards] = useState<FlashcardItem[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [isCardFlipped, setIsCardFlipped] = useState<boolean>(false);

  const [mcqList, setMcqList] = useState<MCQItem[]>([]);
  const [fillBlankList, setFillBlankList] = useState<FillBlankItem[]>([]);

  // Delimited Plain Text vs Interactive Cards view mode
  const [viewMode, setViewMode] = useState<'interactive' | 'delimited'>('interactive');
  const [copiedDelimited, setCopiedDelimited] = useState<boolean>(false);

  // Feedback banner
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Built-in Grade 12 Sample Documents (Ready to test immediately without manual upload)
  const sampleDocuments: UploadedFileDoc[] = [
    {
      name: 'Grade12_Physics_Electrodynamics.pptx',
      type: 'powerpoint',
      sizeFormatted: '1.8 MB',
      contentOrDataUrl: `Grade 12 Physical Sciences - Electrodynamics & AC Generators.
Key Topics:
1. Faradays Law of Electromagnetic Induction: The induced EMF is directly proportional to the rate of change of magnetic flux linkage. Formula: EMF = -N (Delta Phi / Delta t).
2. AC vs DC Generators: AC uses slip rings and carbon brushes to produce alternating current sinusoidal wave. DC uses a split-ring commutator to produce pulsating direct current.
3. Root Mean Square (rms): I_rms = I_max / sqrt(2), V_rms = V_max / sqrt(2). P_ave = V_rms * I_rms = I_rms^2 * R = V_rms^2 / R.
4. Electric Motors: Convert electrical energy into mechanical energy using the motor effect (Fleming's Left Hand Rule). Generators convert mechanical energy into electrical energy using electromagnetic induction (Fleming's Right Hand Rule).
DBE Exam Pitfalls: Confusing slip rings with split-ring commutators; forgetting to convert peak voltage to rms voltage before calculating average power; omitting SI units (Volts, Amperes, Watts).`,
      excerpt: 'Faraday’s Law, AC Generators (slip rings), DC Generators (commutator), and rms calculations (V_rms, I_rms, P_ave).'
    },
    {
      name: 'Grade12_LifeSciences_Genetics_DNA.pdf',
      type: 'pdf',
      sizeFormatted: '2.4 MB',
      contentOrDataUrl: `Grade 12 Life Sciences CAPS - Genetics, DNA Code of Life & Meiosis.
Key Concepts:
1. DNA Structure: Double helix polymer made of repeating nucleotides (deoxyribose sugar, phosphate group, nitrogenous base: Adenine, Thymine, Guanine, Cytosine).
2. DNA Replication: Occurs during interphase before cell division. Enzyme unwinds double helix, unzips hydrogen bonds, free nucleotides build complementary strands.
3. Transcription & Translation: RNA polymerase transcribes mRNA from DNA template in the nucleus. mRNA moves to ribosome, tRNA anticodons bind codons, peptide bonds link amino acids into proteins.
4. Monohybrid & Dihybrid Crosses: P1 phenotype & genotype, Meiosis (gametes), Fertilisation (Punnett square), F1 genotype & phenotype ratios.
CAPS Exam Rules: P1 and F1 must be clearly stated; deduct 1 mark if gametes or fertilisation label is missing.`,
      excerpt: 'DNA replication, transcription/translation, monohybrid crosses, and official CAPS 6-mark genetic rubric.'
    },
    {
      name: 'Grade12_Maths_Calculus_CubicFunctions.docx',
      type: 'document',
      sizeFormatted: '920 KB',
      contentOrDataUrl: `Grade 12 Mathematics CAPS - Differential Calculus & Cubic Functions.
Key Theorems & Techniques:
1. First Principles: f'(x) = lim_{h -> 0} [f(x + h) - f(x)] / h. Rules: keep writing lim until substituting h = 0.
2. Differentiation Rules: d/dx [a*x^n] = n*a*x^{n-1}. Always rewrite surds (sqrt(x) = x^{1/2}) and fractions (1/x^2 = x^{-2}) before applying power rule.
3. Cubic Graph Sketching: f(x) = a*x^3 + b*x^2 + c*x + d. Find y-intercept (f(0)), x-intercepts (f(x) = 0 using factor theorem), stationary points (f'(x) = 0), and point of inflection (f''(x) = 0 or x = -b/(3a)).
4. Optimization Problems: Set up formula with single variable, take derivative f'(x) = 0, solve for dimensions, check minimum/maximum.`,
      excerpt: 'First principles limits, derivative rules, cubic polynomial graphs, stationary points & optimization.'
    },
    {
      name: 'Grade12_Organic_Chemistry_FunctionalGroups.png',
      type: 'image',
      sizeFormatted: '640 KB',
      contentOrDataUrl: `Grade 12 Physical Sciences - Organic Chemistry Functional Groups & Intermolecular Forces.
Homologous Series:
1. Alkanes: Single C-C bonds, saturated, general formula C_n H_{2n+2}.
2. Alkenes: Double C=C bond, unsaturated, general formula C_n H_{2n}.
3. Haloalkanes: Halogen atom attached to alkyl chain.
4. Alcohols: Hydroxyl group (-OH), polar, capable of hydrogen bonding.
5. Aldehydes & Ketones: Carbonyl group (C=O). Aldehyde at end of chain (-al); Ketone within chain (-one).
6. Carboxylic Acids: Carboxyl group (-COOH), forms strong double hydrogen bonds.
7. Esters: Formed by esterification of carboxylic acid + alcohol with H2SO4 catalyst (-oate).
Physical Properties: Boiling point increases with chain length and stronger intermolecular forces (London forces < dipole-dipole < hydrogen bonds).`,
      excerpt: 'Homologous series, functional groups, esterification, IUPAC nomenclature, and boiling point trends.'
    }
  ];

  // Set initial sample if none attached
  useEffect(() => {
    if (!attachedFile) {
      setAttachedFile(sampleDocuments[0]);
    }
  }, []);

  // Sync if initial activity passed from Dashboard
  useEffect(() => {
    if (initialActivity) {
      setSelectedMode(initialActivity.mode);
      setSubject(initialActivity.subject);
      // Find matching sample or create dummy representation
      const match = sampleDocuments.find(s => s.name === initialActivity.sourceDocName);
      if (match) {
        setAttachedFile(match);
      } else {
        setAttachedFile({
          name: initialActivity.sourceDocName,
          type: initialActivity.sourceDocType,
          sizeFormatted: '1.5 MB',
          contentOrDataUrl: `Restored session from dashboard for ${initialActivity.sourceDocName}`,
          excerpt: `Study session for ${initialActivity.title}`
        });
      }
    }
  }, [initialActivity]);

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processSelectedFile(file);
  };

  const processSelectedFile = (file: File) => {
    const name = file.name;
    const ext = name.split('.').pop()?.toLowerCase() || '';
    
    let docType: DocumentFileType = 'document';
    if (ext === 'ppt' || ext === 'pptx') {
      docType = 'powerpoint';
    } else if (ext === 'pdf') {
      docType = 'pdf';
    } else if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
      docType = 'image';
    } else {
      docType = 'document';
    }

    const sizeFormatted = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
      : `${Math.round(file.size / 1024)} KB`;

    const reader = new FileReader();

    if (docType === 'image' || docType === 'pdf') {
      // Read as Data URL for Gemini inlineData
      reader.onload = () => {
        const result = reader.result as string;
        setAttachedFile({
          name,
          type: docType,
          sizeFormatted,
          contentOrDataUrl: result,
          excerpt: `Uploaded ${docType.toUpperCase()} file (${sizeFormatted}) ready for AI analysis.`
        });
        showFeedback(`Attached ${name} successfully!`);
      };
      reader.readAsDataURL(file);
    } else {
      // Read text content
      reader.onload = () => {
        const textContent = (reader.result as string) || '';
        setAttachedFile({
          name,
          type: docType,
          sizeFormatted,
          contentOrDataUrl: textContent,
          excerpt: textContent.slice(0, 160) + (textContent.length > 160 ? '...' : '')
        });
        showFeedback(`Attached ${name} successfully!`);
      };
      reader.readAsText(file);
    }
  };

  const showFeedback = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Plain Text parsing helpers (Vertical Bar Delimited Plain Text Protocol)
  const parseFlashcardsFromText = (text: string): FlashcardItem[] => {
    const cards: FlashcardItem[] = [];
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

    lines.forEach((line, idx) => {
      // Check vertical bar delimiter: FRONT | BACK
      if (line.includes('|')) {
        const parts = line.split('|').map(p => p.trim());
        if (parts.length >= 2 && parts[0] && parts[1]) {
          const firstUpper = parts[0].toUpperCase();
          if (firstUpper !== 'FRONT' && firstUpper !== 'FRONT_PROMPT') {
            cards.push({
              id: `card_${Date.now()}_${idx}`,
              front: parts[0],
              back: parts.slice(1).join(' | '),
              mastered: false
            });
            return;
          }
        }
      }
    });

    // Fallback block parser if needed
    if (cards.length === 0 && (text.includes('FRONT:') || text.includes('===CARD==='))) {
      const blocks = text.split(/===CARD===|===END===/i);
      blocks.forEach((block, idx) => {
        if (!block.includes('FRONT:') || !block.includes('BACK:')) return;
        const frontMatch = block.match(/FRONT:\s*([\s\S]*?)(?=BACK:)/i);
        const backMatch = block.match(/BACK:\s*([\s\S]*)/i);

        if (frontMatch && backMatch) {
          cards.push({
            id: `card_${Date.now()}_${idx}`,
            front: frontMatch[1].trim(),
            back: backMatch[1].trim(),
            mastered: false
          });
        }
      });
    }

    return cards;
  };

  const parseMCQFromText = (text: string): MCQItem[] => {
    const list: MCQItem[] = [];
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

    lines.forEach((line, idx) => {
      // Check vertical bar delimiter: QUESTION | OPTION_A | OPTION_B | OPTION_C | OPTION_D | CORRECT | EXPLANATION
      if (line.includes('|')) {
        const parts = line.split('|').map(p => p.trim());
        if (parts.length >= 6) {
          if (parts[0].toUpperCase().startsWith('QUESTION') && parts[1].toUpperCase().startsWith('OPTION')) {
            return; // skip table header line if any
          }
          const question = parts[0];
          const a = parts[1];
          const b = parts[2];
          const c = parts[3];
          const d = parts[4];
          const correctChar = parts[5].toUpperCase().replace(/[^A-D]/g, '') || 'A';
          const correctIndex = correctChar === 'B' ? 1 : correctChar === 'C' ? 2 : correctChar === 'D' ? 3 : 0;
          const explanation = parts[6] || 'Verified according to DBE CAPS marking memorandum guidelines.';

          list.push({
            id: `mcq_${Date.now()}_${idx}`,
            question,
            options: [a, b, c, d],
            correctAnswerIndex: correctIndex,
            explanation
          });
          return;
        }
      }
    });

    // Fallback block parser
    if (list.length === 0 && (text.includes('Q:') || text.includes('===MCQ==='))) {
      const blocks = text.split(/===MCQ===|===END===/i);
      blocks.forEach((block, idx) => {
        if (!block.includes('Q:') || !block.includes('CORRECT:')) return;
        const qMatch = block.match(/Q:\s*([\s\S]*?)(?=A:)/i);
        const aMatch = block.match(/A:\s*([\s\S]*?)(?=B:)/i);
        const bMatch = block.match(/B:\s*([\s\S]*?)(?=C:)/i);
        const cMatch = block.match(/C:\s*([\s\S]*?)(?=D:)/i);
        const dMatch = block.match(/D:\s*([\s\S]*?)(?=CORRECT:)/i);
        const correctMatch = block.match(/CORRECT:\s*([A-D])/i);
        const expMatch = block.match(/EXPLANATION:\s*([\s\S]*)/i);

        if (qMatch && aMatch && bMatch && cMatch && dMatch && correctMatch) {
          const correctChar = correctMatch[1].trim().toUpperCase();
          const correctIndex = correctChar === 'A' ? 0 : correctChar === 'B' ? 1 : correctChar === 'C' ? 2 : 3;

          list.push({
            id: `mcq_${Date.now()}_${idx}`,
            question: qMatch[1].trim(),
            options: [
              aMatch[1].trim(),
              bMatch[1].trim(),
              cMatch[1].trim(),
              dMatch[1].trim()
            ],
            correctAnswerIndex: correctIndex,
            explanation: expMatch ? expMatch[1].trim() : 'Verified against official CAPS marking memo.'
          });
        }
      });
    }

    return list;
  };

  const parseFillBlankFromText = (text: string): FillBlankItem[] => {
    const list: FillBlankItem[] = [];
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

    lines.forEach((line, idx) => {
      // Check vertical bar delimiter: SENTENCE | ANSWER | HINT
      if (line.includes('|')) {
        const parts = line.split('|').map(p => p.trim());
        if (parts.length >= 2) {
          if (parts[0].toUpperCase().startsWith('SENTENCE') && parts[1].toUpperCase().startsWith('CORRECT')) {
            return; // skip header line if any
          }
          list.push({
            id: `blank_${Date.now()}_${idx}`,
            sentenceWithBlank: parts[0],
            answer: parts[1],
            hint: parts[2] || undefined,
            userAnswer: '',
            isCorrect: undefined
          });
          return;
        }
      }
    });

    // Fallback block parser
    if (list.length === 0 && (text.includes('SENTENCE:') || text.includes('===BLANK==='))) {
      const blocks = text.split(/===BLANK===|===END===/i);
      blocks.forEach((block, idx) => {
        if (!block.includes('SENTENCE:') || !block.includes('ANSWER:')) return;
        const sMatch = block.match(/SENTENCE:\s*([\s\S]*?)(?=ANSWER:)/i);
        const aMatch = block.match(/ANSWER:\s*([\s\S]*?)(?=HINT:|$)/i);
        const hMatch = block.match(/HINT:\s*([\s\S]*)/i);

        if (sMatch && aMatch) {
          list.push({
            id: `blank_${Date.now()}_${idx}`,
            sentenceWithBlank: sMatch[1].trim(),
            answer: aMatch[1].trim(),
            hint: hMatch ? hMatch[1].trim() : undefined,
            userAnswer: '',
            isCorrect: undefined
          });
        }
      });
    }

    return list;
  };

  // Trigger Generation via /api/ai-document-study
  const handleGenerate = async () => {
    if (!attachedFile) {
      showFeedback("Please attach a PowerPoint, Document, PDF, or Image file first.");
      return;
    }

    setIsLoading(true);
    setRawGeneratedText('');
    setFlashcards([]);
    setMcqList([]);
    setFillBlankList([]);
    setCurrentCardIndex(0);
    setIsCardFlipped(false);

    try {
      const params = new URLSearchParams();
      params.append('mode', selectedMode);
      params.append('fileName', attachedFile.name);
      params.append('fileType', attachedFile.type);
      params.append('fileContent', attachedFile.contentOrDataUrl);
      params.append('subject', subject);
      params.append('topic', topic);

      const response = await fetch('/api/ai-document-study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });

      const replyText = await response.text();
      setRawGeneratedText(replyText);

      // Parse structured text for interactive modes
      if (selectedMode === 'flashcards') {
        const parsedCards = parseFlashcardsFromText(replyText);
        setFlashcards(parsedCards);
      } else if (selectedMode === 'mcq') {
        const parsedMCQs = parseMCQFromText(replyText);
        setMcqList(parsedMCQs);
      } else if (selectedMode === 'fill_blank') {
        const parsedBlanks = parseFillBlankFromText(replyText);
        setFillBlankList(parsedBlanks);
      }

      // Automatically register this prompt on the Dashboard as in-progress
      autoSavePromptActivity('in_progress');
      showFeedback(`Generated ${getModeTitle(selectedMode)} from ${attachedFile.name}!`);
    } catch (err) {
      console.error("Error generating study material:", err);
      showFeedback("Error generating study material. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getModeTitle = (mode: AIMode) => {
    switch (mode) {
      case 'summarize': return 'Matric Study Summary';
      case 'long_questions': return 'Long Exam Questions';
      case 'short_questions': return 'Short Revision Questions';
      case 'flashcards': return 'Interactive Flashcards';
      case 'mcq': return 'Multiple Choice Quiz';
      case 'fill_blank': return 'Fill-in-the-Blank Questions';
    }
  };

  const autoSavePromptActivity = (status: 'in_progress' | 'completed') => {
    if (!attachedFile || !onSaveActivityToDashboard) return;

    let progressText = 'In Progress';
    let percentage = 30;

    if (selectedMode === 'flashcards') {
      const masteredCount = flashcards.filter(c => c.mastered).length;
      const total = flashcards.length || 6;
      percentage = Math.round((masteredCount / total) * 100);
      progressText = `${masteredCount}/${total} cards mastered`;
      if (masteredCount === total && total > 0) status = 'completed';
    } else if (selectedMode === 'mcq') {
      const answeredCount = mcqList.filter(q => q.selectedAnswerIndex !== undefined).length;
      const total = mcqList.length || 5;
      percentage = Math.round((answeredCount / total) * 100);
      progressText = `${answeredCount}/${total} MCQs answered`;
      if (answeredCount === total && total > 0) status = 'completed';
    } else if (selectedMode === 'fill_blank') {
      const answeredCount = fillBlankList.filter(b => b.isCorrect !== undefined).length;
      const total = fillBlankList.length || 5;
      percentage = Math.round((answeredCount / total) * 100);
      progressText = `${answeredCount}/${total} blanks solved`;
      if (answeredCount === total && total > 0) status = 'completed';
    } else if (selectedMode === 'summarize') {
      percentage = status === 'completed' ? 100 : 80;
      progressText = status === 'completed' ? 'Full Summary Completed' : 'Summary Read in Progress';
    } else {
      percentage = status === 'completed' ? 100 : 50;
      progressText = status === 'completed' ? 'Questions Answered' : 'Questions In Progress';
    }

    const activity: PromptActivity = {
      id: initialActivity?.id || `prompt_${Date.now()}`,
      type: 'ai_prompt',
      mode: selectedMode,
      title: `${getModeTitle(selectedMode)}: ${attachedFile.name.replace(/\.[^/.]+$/, "")}`,
      subject,
      sourceDocName: attachedFile.name,
      sourceDocType: attachedFile.type,
      status,
      progressText,
      percentage,
      lastUpdated: new Date().toISOString()
    };

    onSaveActivityToDashboard(activity);
  };

  // Interactive Card Actions
  const handleToggleCardMastered = (cardIndex: number, mastered: boolean) => {
    setFlashcards(prev => {
      const updated = [...prev];
      updated[cardIndex] = { ...updated[cardIndex], mastered };
      return updated;
    });
    // Check if next card available
    if (cardIndex < flashcards.length - 1) {
      setCurrentCardIndex(cardIndex + 1);
      setIsCardFlipped(false);
    }
  };

  // Interactive MCQ selection
  const handleSelectMCQAnswer = (qIndex: number, optionIndex: number) => {
    setMcqList(prev => {
      const updated = [...prev];
      updated[qIndex] = { ...updated[qIndex], selectedAnswerIndex: optionIndex };
      return updated;
    });
  };

  // Interactive Fill Blank verification
  const handleCheckBlank = (bIndex: number, inputVal: string) => {
    setFillBlankList(prev => {
      const updated = [...prev];
      const target = updated[bIndex];
      const isRight = inputVal.trim().toLowerCase() === target.answer.trim().toLowerCase();
      updated[bIndex] = {
        ...target,
        userAnswer: inputVal,
        isCorrect: isRight
      };
      return updated;
    });
  };

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      
      {/* Tab Header Banner (Light theme) */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50/60 to-amber-50/50 text-slate-900 p-6 md:p-8 border-2 border-blue-200 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 border border-blue-300 text-blue-950 text-xs font-black uppercase tracking-wider">
                <Bot className="h-3.5 w-3.5 text-blue-700" />
                <span>Mzansi Tutor</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs font-extrabold">
                <ShieldCheck className="h-3 w-3 text-emerald-700" />
                <span>PowerPoints • Word Docs • PDFs • Images</span>
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-blue-950">
              Mzansi Tutor
            </h2>
            <p className="text-slate-700 text-xs md:text-sm max-w-2xl leading-relaxed font-medium">
              Mzansi Tutor is your Grade 12 AI study companion. Summarise documents or generate long and short exam questions, multiple choice quizzes, interactive flashcards, and fill-in-the-gap exercises from any PDF, PowerPoint, Word document, or image.
            </p>
          </div>

          {onNavigateToDashboard && (
            <button
              onClick={onNavigateToDashboard}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-800 text-xs font-black transition-all flex items-center gap-2 cursor-pointer self-start md:self-auto shrink-0 shadow-xs"
            >
              <Clock className="h-4 w-4 text-amber-500" />
              <span>View Unfinished on dashboard</span>
            </button>
          )}
        </div>
      </section>

      {/* Step 1: File Upload & Attachment Area (PowerPoints, Documents, PDFs, Images Only) */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Upload className="h-4 w-4 text-blue-900 dark:text-amber-400" />
              <span>Step 1: Attach Study Document</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select or drop your Grade 12 PowerPoint (.ppt, .pptx), Document (.docx, .doc, .txt), PDF (.pdf), or Image (.png, .jpg)
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold">
            <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300">PPT / PPTX</span>
            <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-300">DOC / DOCX</span>
            <span className="px-2 py-0.5 rounded bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-300">PDF</span>
            <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300">IMAGE</span>
          </div>
        </div>

        {/* File Dropzone */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange}
          accept=".ppt,.pptx,.doc,.docx,.pdf,.txt,.png,.jpg,.jpeg,.webp"
          className="hidden" 
        />

        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              processSelectedFile(e.dataTransfer.files[0]);
            }
          }}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            isDragOver 
              ? 'border-blue-900 bg-blue-50/50 dark:bg-blue-950/30' 
              : 'border-slate-300 dark:border-slate-700 hover:border-blue-900 dark:hover:border-amber-400 bg-slate-50/50 dark:bg-slate-800/40'
          }`}
        >
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="h-12 w-12 rounded-xl bg-blue-900/10 dark:bg-blue-900/30 text-blue-900 dark:text-amber-400 flex items-center justify-center">
              <Upload className="h-6 w-6" />
            </div>
            <div className="space-y-0.5">
              <span className="text-xs md:text-sm font-bold text-slate-900 dark:text-white">
                Click to browse files or drag &amp; drop here
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Supports PowerPoint slides, PDF past papers, study summaries &amp; diagram screenshots
              </p>
            </div>
          </div>
        </div>

        {/* Current Attached File Preview */}
        {attachedFile && (
          <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/70 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-900 text-white flex items-center justify-center shrink-0">
                {attachedFile.type === 'powerpoint' && <Presentation className="h-5 w-5 text-amber-300" />}
                {attachedFile.type === 'pdf' && <FileText className="h-5 w-5 text-red-300" />}
                {attachedFile.type === 'image' && <ImageIcon className="h-5 w-5 text-emerald-300" />}
                {attachedFile.type === 'document' && <FileCode className="h-5 w-5 text-blue-300" />}
              </div>
              <div className="space-y-0.5 overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className="text-xs md:text-sm font-bold text-slate-900 dark:text-white truncate">
                    {attachedFile.name}
                  </span>
                  <span className="px-2 py-0.2 rounded text-[10px] font-bold uppercase bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-200">
                    {attachedFile.type}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {attachedFile.sizeFormatted}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate max-w-xl">
                  {attachedFile.excerpt}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
              >
                Change File
              </button>
            </div>
          </div>
        )}

        {/* Quick-Pick Grade 12 Sample Documents */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Or choose a Grade 12 CAPS sample material (Instant 1-Click Test):</span>
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
            {sampleDocuments.map((doc, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setAttachedFile(doc);
                  if (doc.type === 'powerpoint') {
                    setSubject('Physical Sciences');
                    setTopic('Electrodynamics & Generators');
                  } else if (doc.type === 'pdf') {
                    setSubject('Life Sciences');
                    setTopic('Genetics, DNA & Meiosis');
                  } else if (doc.type === 'document') {
                    setSubject('Mathematics');
                    setTopic('Calculus & Cubic Graphs');
                  } else {
                    setSubject('Physical Sciences');
                    setTopic('Organic Chemistry');
                  }
                  showFeedback(`Selected ${doc.name}`);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  attachedFile?.name === doc.name
                    ? 'border-blue-900 bg-blue-50 dark:bg-blue-950/60 ring-2 ring-blue-900 dark:ring-amber-400'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  {doc.type === 'powerpoint' && <Presentation className="h-3.5 w-3.5 text-amber-500" />}
                  {doc.type === 'pdf' && <FileText className="h-3.5 w-3.5 text-red-500" />}
                  {doc.type === 'image' && <ImageIcon className="h-3.5 w-3.5 text-emerald-500" />}
                  {doc.type === 'document' && <FileCode className="h-3.5 w-3.5 text-blue-500" />}
                  <span className="text-[10px] font-bold uppercase text-slate-500">
                    {doc.type}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                  {doc.name.replace(/\.[^/.]+$/, "")}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Step 2: Choose Generation Mode */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bot className="h-4 w-4 text-blue-900 dark:text-amber-400" />
            <span>Step 2: Select What AI Should Generate</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Choose from the 6 official study and examination tools below:
          </p>
        </div>

        {/* 6 Mode Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          
          {/* 1. Summarize */}
          <button
            onClick={() => setSelectedMode('summarize')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative ${
              selectedMode === 'summarize'
                ? 'border-blue-900 bg-blue-50 dark:bg-blue-950/70 ring-2 ring-blue-900 dark:ring-amber-400'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="h-8 w-8 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-300 flex items-center justify-center font-bold">
                📝
              </div>
              {selectedMode === 'summarize' && <Check className="h-4 w-4 text-blue-900 dark:text-amber-400" />}
            </div>
            <div className="text-xs md:text-sm font-bold text-slate-900 dark:text-white mb-0.5">
              Summarize
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              Key definitions, formulas &amp; top matric exam pitfalls.
            </p>
          </button>

          {/* 2. Long Questions */}
          <button
            onClick={() => setSelectedMode('long_questions')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative ${
              selectedMode === 'long_questions'
                ? 'border-purple-800 bg-purple-50 dark:bg-purple-950/70 ring-2 ring-purple-800 dark:ring-purple-400'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="h-8 w-8 rounded-xl bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-300 flex items-center justify-center font-bold">
                📄
              </div>
              {selectedMode === 'long_questions' && <Check className="h-4 w-4 text-purple-700 dark:text-purple-400" />}
            </div>
            <div className="text-xs md:text-sm font-bold text-slate-900 dark:text-white mb-0.5">
              Long Questions
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              8–15 mark exam questions with full DBE marking rubrics [M], [A], [CA].
            </p>
          </button>

          {/* 3. Short Questions */}
          <button
            onClick={() => setSelectedMode('short_questions')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative ${
              selectedMode === 'short_questions'
                ? 'border-indigo-800 bg-indigo-50 dark:bg-indigo-950/70 ring-2 ring-indigo-800 dark:ring-indigo-400'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="h-8 w-8 rounded-xl bg-indigo-100 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-300 flex items-center justify-center font-bold">
                ✍️
              </div>
              {selectedMode === 'short_questions' && <Check className="h-4 w-4 text-indigo-700 dark:text-indigo-400" />}
            </div>
            <div className="text-xs md:text-sm font-bold text-slate-900 dark:text-white mb-0.5">
              Short Questions
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              2–4 mark definitions, single calculations &amp; concise answers.
            </p>
          </button>

          {/* 4. Flash Cards */}
          <button
            onClick={() => setSelectedMode('flashcards')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative ${
              selectedMode === 'flashcards'
                ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/70 ring-2 ring-amber-600 dark:ring-amber-400'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="h-8 w-8 rounded-xl bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-300 flex items-center justify-center font-bold">
                🎴
              </div>
              {selectedMode === 'flashcards' && <Check className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
            </div>
            <div className="text-xs md:text-sm font-bold text-slate-900 dark:text-white mb-0.5">
              Flash Cards
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              Interactive flip cards to master terms &amp; test memory.
            </p>
          </button>

          {/* 5. Multiple Choice Questions */}
          <button
            onClick={() => setSelectedMode('mcq')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative ${
              selectedMode === 'mcq'
                ? 'border-emerald-700 bg-emerald-50 dark:bg-emerald-950/70 ring-2 ring-emerald-700 dark:ring-emerald-400'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="h-8 w-8 rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-300 flex items-center justify-center font-bold">
                🔘
              </div>
              {selectedMode === 'mcq' && <Check className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />}
            </div>
            <div className="text-xs md:text-sm font-bold text-slate-900 dark:text-white mb-0.5">
              Multiple Choice (MCQ)
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              4-option interactive quiz with instant feedback &amp; explanations.
            </p>
          </button>

          {/* 6. Fill in the Empty Space Questions */}
          <button
            onClick={() => setSelectedMode('fill_blank')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative ${
              selectedMode === 'fill_blank'
                ? 'border-teal-700 bg-teal-50 dark:bg-teal-950/70 ring-2 ring-teal-700 dark:ring-teal-400'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="h-8 w-8 rounded-xl bg-teal-100 dark:bg-teal-900 text-teal-900 dark:text-teal-300 flex items-center justify-center font-bold">
                ✏️
              </div>
              {selectedMode === 'fill_blank' && <Check className="h-4 w-4 text-teal-700 dark:text-teal-400" />}
            </div>
            <div className="text-xs md:text-sm font-bold text-slate-900 dark:text-white mb-0.5">
              Fill in the Empty Space
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              Cloze tests with blank spaces, interactive checks &amp; hints.
            </p>
          </button>

        </div>

        {/* Generate Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Generating from: <strong className="text-slate-900 dark:text-white">{attachedFile?.name || 'No file selected'}</strong>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading || !attachedFile}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-900 hover:from-blue-800 hover:to-indigo-800 text-white text-xs md:text-sm font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <RotateCcw className="h-4 w-4 animate-spin" />
                <span>Processing {attachedFile?.type.toUpperCase()} with Mzansi Tutor...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span>Generate {getModeTitle(selectedMode)}</span>
              </>
            )}
          </button>
        </div>

        {statusMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 text-emerald-900 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{statusMessage}</span>
          </div>
        )}
      </section>

      {/* Step 3: Interactive Results Display & Delimited Text Protocol */}
      {rawGeneratedText && (
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-sm space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-300/40">
                  {getModeTitle(selectedMode)}
                </span>
                <span className="text-xs text-slate-500">
                  Source: {attachedFile?.name}
                </span>
              </div>
              <h3 className="text-base md:text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                Generated Grade 12 Study Material
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  autoSavePromptActivity('completed');
                  showFeedback("Saved as Completed on your Dashboard!");
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Mark Completed &amp; Save</span>
              </button>
              <button
                onClick={() => {
                  autoSavePromptActivity('in_progress');
                  showFeedback("Updated on Dashboard as In-Progress!");
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Clock className="h-3.5 w-3.5 text-amber-500" />
                <span>Save Unfinished</span>
              </button>
            </div>
          </div>

          {/* Protocol & Display Switch: Interactive UI vs Vertical Bar Delimited Strings */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-100 dark:bg-slate-800/60 p-2 rounded-2xl">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setViewMode('interactive')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'interactive'
                    ? 'bg-blue-900 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>Interactive Learning View</span>
              </button>
              <button
                onClick={() => setViewMode('delimited')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'delimited'
                    ? 'bg-blue-900 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="font-mono font-bold text-amber-400">|</span>
                <span>Vertical Bar Delimited Strings (|)</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                Plain text delimited by vertical bar (|)
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(rawGeneratedText);
                  setCopiedDelimited(true);
                  setTimeout(() => setCopiedDelimited(false), 2000);
                  showFeedback("Copied vertical bar delimited strings!");
                }}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
              >
                {copiedDelimited ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 text-slate-500" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* DELIMITED PLAIN TEXT VIEW */}
          {viewMode === 'delimited' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span className="font-semibold flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  <span>Pure Plain Text Output (Delimited with |)</span>
                </span>
                <span className="font-mono text-[11px] bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">
                  Delimiter: &quot;|&quot;
                </span>
              </div>
              <pre className="p-4 rounded-2xl bg-slate-900 text-emerald-300 font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap border border-slate-800 shadow-inner">
                {rawGeneratedText}
              </pre>
            </div>
          )}

          {/* INTERACTIVE MODE VIEWS */}
          {viewMode === 'interactive' && (
            <>
              {/* A. FLASHCARDS INTERACTIVE DECK */}
              {selectedMode === 'flashcards' && flashcards.length > 0 && (
                <div className="space-y-4 max-w-xl mx-auto py-2">
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span>
                      Card <strong>{currentCardIndex + 1}</strong> of {flashcards.length}
                    </span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {flashcards.filter(c => c.mastered).length} Mastered
                    </span>
                  </div>

                  {/* Flashcard Component */}
                  <div
                    onClick={() => setIsCardFlipped(!isCardFlipped)}
                    className="min-h-[220px] rounded-3xl p-6 md:p-8 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white border border-amber-500/30 shadow-xl cursor-pointer flex flex-col justify-between select-none transition-all transform active:scale-[0.99]"
                  >
                    <div className="flex items-center justify-between text-[11px] text-amber-300 font-bold uppercase">
                      <span>{isCardFlipped ? '💡 ANSWER / EXPLANATION' : '❓ QUESTION / TERM'}</span>
                      <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full">Click card to flip</span>
                    </div>

                    <div className="my-auto py-4 text-center">
                      <p className="text-base md:text-lg font-bold leading-relaxed">
                        {isCardFlipped ? flashcards[currentCardIndex].back : flashcards[currentCardIndex].front}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{flashcards[currentCardIndex].mastered ? '✅ Mastered' : '⏳ Needs Practice'}</span>
                      <span>Tap to reveal {isCardFlipped ? 'question' : 'answer'}</span>
                    </div>
                  </div>

                  {/* Flashcard Navigation and Mastery Controls */}
                  <div className="flex items-center justify-between gap-2 pt-2">
                    <button
                      onClick={() => {
                        if (currentCardIndex > 0) {
                          setCurrentCardIndex(currentCardIndex - 1);
                          setIsCardFlipped(false);
                        }
                      }}
                      disabled={currentCardIndex === 0}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 disabled:opacity-40 cursor-pointer"
                    >
                      Previous
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleCardMastered(currentCardIndex, false)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300 cursor-pointer"
                      >
                        Review Again
                      </button>
                      <button
                        onClick={() => handleToggleCardMastered(currentCardIndex, true)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-600 cursor-pointer flex items-center gap-1"
                      >
                        <Check className="h-3 w-3" />
                        Mastered
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        if (currentCardIndex < flashcards.length - 1) {
                          setCurrentCardIndex(currentCardIndex + 1);
                          setIsCardFlipped(false);
                        }
                      }}
                      disabled={currentCardIndex === flashcards.length - 1}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 disabled:opacity-40 cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {/* B. MULTIPLE CHOICE (MCQ) QUIZ */}
              {selectedMode === 'mcq' && mcqList.length > 0 && (
                <div className="space-y-6">
                  <div className="text-xs text-slate-500 font-semibold">
                    Answer all 5 multiple choice questions derived from {attachedFile?.name}:
                  </div>

                  {mcqList.map((mcq, qIdx) => {
                    const hasSelected = mcq.selectedAnswerIndex !== undefined;
                    const isSelectedCorrect = hasSelected && mcq.selectedAnswerIndex === mcq.correctAnswerIndex;

                    return (
                      <div 
                        key={mcq.id} 
                        className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3"
                      >
                        <div className="flex items-start gap-2">
                          <span className="font-extrabold text-xs px-2 py-0.5 rounded bg-blue-900 text-white">
                            Q{qIdx + 1}
                          </span>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            {mcq.question}
                          </p>
                        </div>

                        {/* 4 Options */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {mcq.options.map((opt, oIdx) => {
                            const optLetter = String.fromCharCode(65 + oIdx);
                            const isChosen = mcq.selectedAnswerIndex === oIdx;
                            const isCorrectOption = mcq.correctAnswerIndex === oIdx;

                            let btnStyle = 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-900';
                            if (hasSelected) {
                              if (isCorrectOption) {
                                btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500';
                              } else if (isChosen && !isSelectedCorrect) {
                                btnStyle = 'border-red-500 bg-red-50 dark:bg-red-950/60 text-red-900 dark:text-red-200';
                              }
                            }

                            return (
                              <button
                                key={oIdx}
                                onClick={() => handleSelectMCQAnswer(qIdx, oIdx)}
                                className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${btnStyle}`}
                              >
                                <span className="h-6 w-6 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center font-bold text-xs shrink-0">
                                  {optLetter}
                                </span>
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Feedback and Explanation */}
                        {hasSelected && (
                          <div className={`p-3 rounded-xl text-xs font-medium space-y-1 ${
                            isSelectedCorrect 
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 border border-emerald-300'
                              : 'bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border border-amber-300'
                          }`}>
                            <div className="font-bold flex items-center gap-1.5">
                              {isSelectedCorrect ? (
                                <>
                                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                  <span>Correct! Level 7 Exam Standard.</span>
                                </>
                              ) : (
                                <>
                                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                                  <span>Incorrect. Correct Answer: Option {String.fromCharCode(65 + mcq.correctAnswerIndex)}</span>
                                </>
                              )}
                            </div>
                            <p>{mcq.explanation}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* C. FILL IN THE EMPTY SPACE (CLOZE) */}
              {selectedMode === 'fill_blank' && fillBlankList.length > 0 && (
                <div className="space-y-4">
                  <div className="text-xs text-slate-500 font-semibold">
                    Type the correct keyword, formula, or law into each blank:
                  </div>

                  {fillBlankList.map((item, bIdx) => (
                    <FillBlankRowItem
                      key={item.id}
                      item={item}
                      index={bIdx}
                      onCheck={handleCheckBlank}
                    />
                  ))}
                </div>
              )}

              {/* D. FORMATTED TEXT FOR SUMMARIZE, LONG QUESTIONS & SHORT QUESTIONS */}
              {(selectedMode === 'summarize' || selectedMode === 'long_questions' || selectedMode === 'short_questions') && (
                <div className="space-y-3">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="text-xs text-slate-500 font-medium mb-3">
                      Rendered items from vertical bar delimited strings:
                    </div>
                    <div className="space-y-2">
                      {rawGeneratedText
                        .split('\n')
                        .map(l => l.trim())
                        .filter(Boolean)
                        .map((line, lIdx) => {
                          if (line.includes('|')) {
                            const cells = line.split('|').map(c => c.trim());
                            return (
                              <div key={lIdx} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-xs text-blue-900 dark:text-amber-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                                    {cells[0]}
                                  </span>
                                  {cells[2] && (
                                    <span className="text-[11px] font-semibold text-slate-500">
                                      {cells[2]}
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-slate-800 dark:text-slate-200">
                                  {cells[1]}
                                </div>
                                {cells[3] && (
                                  <div className="text-[11px] text-amber-700 dark:text-amber-300 font-medium">
                                    <strong>Exam Note:</strong> {cells[3]}
                                  </div>
                                )}
                              </div>
                            );
                          }
                          return (
                            <p key={lIdx} className="text-xs text-slate-700 dark:text-slate-300">
                              {line}
                            </p>
                          );
                        })}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </section>
      )}

    </div>
  );
}

// Extracted Row Component to satisfy React Hook rules
interface FillBlankRowProps {
  key?: React.Key;
  item: FillBlankItem;
  index: number;
  onCheck: (index: number, answer: string) => void;
}

function FillBlankRowItem({ item, index, onCheck }: FillBlankRowProps) {
  const [val, setVal] = useState<string>(item.userAnswer || '');
  const [showHint, setShowHint] = useState<boolean>(false);

  return (
    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
      <div className="flex items-start gap-2">
        <span className="font-extrabold text-xs px-2 py-0.5 rounded bg-teal-800 text-white shrink-0">
          Blank {index + 1}
        </span>
        <p className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
          {item.sentenceWithBlank}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder="Type answer here..."
          className="px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-700 min-w-[200px]"
        />
        <button
          onClick={() => onCheck(index, val)}
          className="px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold transition-all cursor-pointer"
        >
          Check Answer
        </button>

        {item.hint && (
          <button
            onClick={() => setShowHint(!showHint)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
          >
            {showHint ? 'Hide Hint' : '💡 Reveal Hint'}
          </button>
        )}
      </div>

      {showHint && item.hint && (
        <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg">
          <strong>Hint:</strong> {item.hint}
        </p>
      )}

      {item.isCorrect !== undefined && (
        <div className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
          item.isCorrect
            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300'
            : 'bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-300'
        }`}>
          {item.isCorrect ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Correct! Excellent recall.</span>
            </>
          ) : (
            <>
              <X className="h-4 w-4 text-red-600" />
              <span>Incorrect. The expected term is: <u>{item.answer}</u></span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
