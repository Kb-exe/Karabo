export type ScreenType = 'dashboard' | 'past_papers' | 'ai_tutor' | 'admin';

export type AuthModalType = 
  | 'none' 
  | 'login' 
  | 'register' 
  | 'forgot_password' 
  | 'change_password' 
  | 'otp_verify' 
  | 'sms_otp' 
  | 'profile' 
  | 'delete_account'
  | 'banned_notice';

export interface PasswordRulesValidation {
  isValid: boolean;
  hasMinLength: boolean; // >= 15 characters
  hasUppercase: boolean; // >= 1 uppercase letter
  hasNumber: boolean;    // >= 1 number
  hasSpecialChar: boolean; // >= 1 special character
  errors: string[];
}

export function validateGrade12Password(password: string): PasswordRulesValidation {
  const hasMinLength = password.length >= 15;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);

  const errors: string[] = [];
  if (!hasMinLength) errors.push('Password must be at least 15 characters');
  if (!hasUppercase) errors.push('Password must contain at least one uppercase letter (A-Z)');
  if (!hasNumber) errors.push('Password must contain at least one number (0-9)');
  if (!hasSpecialChar) errors.push('Password must contain at least one special character (!@#$%^&*...)');

  return {
    isValid: hasMinLength && hasUppercase && hasNumber && hasSpecialChar,
    hasMinLength,
    hasUppercase,
    hasNumber,
    hasSpecialChar,
    errors
  };
}

export type ActivityType = 'past_paper' | 'ai_prompt';
export type ActivityStatus = 'in_progress' | 'completed';

export interface PaperActivity {
  id: string;
  userId?: string;
  type: 'past_paper';
  paperId: string;
  subjectId: string;
  subjectName: string;
  paperTitle: string;
  totalQuestions: number;
  completedQuestions: number;
  percentage: number;
  status: ActivityStatus;
  lastUpdated: string;
  timeSpentMinutes: number;
  lastQuestionId?: string;
  lastQuestionNumber?: string;
}

export type AIMode = 
  | 'summarize' 
  | 'long_questions' 
  | 'short_questions' 
  | 'flashcards' 
  | 'mcq' 
  | 'fill_blank';

export type DocumentFileType = 'powerpoint' | 'document' | 'pdf' | 'image';

export interface PromptActivity {
  id: string;
  userId?: string;
  type: 'ai_prompt';
  mode: AIMode;
  title: string;
  subject: string;
  sourceDocName: string;
  sourceDocType: DocumentFileType;
  status: ActivityStatus;
  progressText: string;
  percentage: number;
  lastUpdated: string;
  summaryExcerpt?: string;
}

export type LearnerActivity = PaperActivity | PromptActivity;

export interface UploadedFileDoc {
  name: string;
  type: DocumentFileType;
  sizeFormatted: string;
  contentOrDataUrl: string;
  mimeType?: string;
  excerpt: string;
}

export interface FlashcardItem {
  id: string;
  front: string;
  back: string;
  mastered: boolean;
}

export interface MCQItem {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  selectedAnswerIndex?: number;
}

export interface FillBlankItem {
  id: string;
  sentenceWithBlank: string;
  answer: string;
  userAnswer?: string;
  isCorrect?: boolean;
  hint?: string;
}

export interface QuestionItem {
  id: string;
  questionNumber: string;
  marks: number;
  questionText: string;
  solution: string;
  markingRubric: string;
}

export interface Grade12Subject {
  id: string;
  name: string;
  category?: string;
  papers: string[];
  iconName: string;
  examDate?: string;
  targetPercent?: number;
  currentMastery?: number;
  pastPapersCount?: number;
  description?: string;
}

export type PaperSourceType = 'national' | 'provincial_other' | 'my_school';

export interface PastPaperQuestion {
  id: string;
  questionNumber: string;
  topic: string;
  text: string;
  marks: number;
  officialMemo: string;
  hint?: string;
}

export interface PastPaper {
  id: string;
  subjectId: string;
  subjectName: string;
  year: number;
  session: string;
  paperNumber: 'Paper 1' | 'Paper 2' | 'Paper 3';
  totalMarks: number;
  durationMinutes: number;
  curriculum: 'CAPS / DBE';
  sourceType?: PaperSourceType;
  schoolOrProvinceName?: string;
  questions: PastPaperQuestion[];
}

export interface Message {
  sender: 'ai' | 'user';
  text: string;
  step?: string;
  timestamp: string;
  suggestedAction?: string;
}

export interface QuestionSolution {
  solutionSteps: Array<{
    step: number;
    description: string;
    working: string;
    marks: string;
  }>;
  finalAnswer: string;
  markingGuidelines: string;
  commonMistakes: string;
  examinerTip: string;
  studentEvaluation?: string | null;
}
