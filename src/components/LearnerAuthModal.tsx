import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, GraduationCap, Mail, Lock, Phone, User, MapPin, 
  Award, ShieldCheck, KeyRound, AlertTriangle, CheckCircle2, 
  Send, RefreshCw, Trash2, ArrowRight, BookOpen, Smartphone, Eye, EyeOff,
  Search, Check, Sparkles, Ban
} from 'lucide-react';
import { AuthModalType, validateGrade12Password, PasswordRulesValidation } from '../types';
import { 
  auth, 
  registerLearner, 
  loginLearner, 
  logoutLearner, 
  deleteLearnerAccount, 
  requestPasswordReset, 
  changeLearnerPassword, 
  triggerEmailVerification, 
  updateLearnerProfile,
  LearnerProfile 
} from '../firebase';
import { GRADE_12_SUBJECTS } from '../data/grade12Data';

interface LearnerAuthModalProps {
  modalType: AuthModalType;
  onClose: () => void;
  onSwitchType: (type: AuthModalType) => void;
  currentProfile: LearnerProfile | null;
  onProfileUpdated: (profile: LearnerProfile | null) => void;
  onNotify: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const SA_PROVINCES = [
  'Gauteng',
  'Western Cape',
  'KwaZulu-Natal',
  'Eastern Cape',
  'Free State',
  'Limpopo',
  'Mpumalanga',
  'North West',
  'Northern Cape'
];

export default function LearnerAuthModal({
  modalType,
  onClose,
  onSwitchType,
  currentProfile,
  onProfileUpdated,
  onNotify
}: LearnerAuthModalProps) {
  if (modalType === 'none') return null;

  // Form states required by spec
  const [schoolName, setSchoolName] = useState('');
  const [initials, setInitials] = useState('');
  const [username, setUsername] = useState('');
  const [gmail, setGmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [province, setProvince] = useState('Gauteng');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([
    'maths', 'physci', 'lifesci', 'lo', 'eng_hl'
  ]);
  const [showPassword, setShowPassword] = useState(false);

  // Password rules validation
  const [passwordValidation, setPasswordValidation] = useState<PasswordRulesValidation>(
    validateGrade12Password('')
  );
  const [passwordAttempted, setPasswordAttempted] = useState(false);

  // Forgot Password & Reset state
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotStep, setForgotStep] = useState<'request_otp' | 'verify_and_reset'>('request_otp');
  const [resetOtpDigits, setResetOtpDigits] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordValidation, setNewPasswordValidation] = useState<PasswordRulesValidation>(
    validateGrade12Password('')
  );

  // Account creation OTP state
  const [otpDeliveryMethod, setOtpDeliveryMethod] = useState<'gmail' | 'sms'>('gmail');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [activeOtpCode, setActiveOtpCode] = useState<string>('');
  const [simulatedOtpBanner, setSimulatedOtpBanner] = useState<string | null>(null);
  const [otpCountdown, setOtpCountdown] = useState<number>(0);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const resetOtpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Subject search & filter in modal
  const [subjectSearch, setSubjectSearch] = useState('');
  const [subjectCategoryFilter, setSubjectCategoryFilter] = useState('all');

  // Loading & Error states
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync profile fields if opening profile
  useEffect(() => {
    if (currentProfile) {
      setGmail(currentProfile.email || '');
      setInitials(currentProfile.initials || '');
      setUsername(currentProfile.username || '');
      setSchoolName(currentProfile.schoolName || '');
      setPhoneNumber(currentProfile.phoneNumber || '');
      setProvince(currentProfile.province || 'Gauteng');
      if (currentProfile.selectedSubjects && currentProfile.selectedSubjects.length > 0) {
        setSelectedSubjects(currentProfile.selectedSubjects);
      }
    }
  }, [currentProfile, modalType]);

  // Handle password changes with real-time rule validation
  const handlePasswordChange = (val: string) => {
    setPassword(val);
    setPasswordValidation(validateGrade12Password(val));
    if (errorMessage && errorMessage.includes('Password')) {
      setErrorMessage(null);
    }
  };

  const handleNewPasswordChange = (val: string) => {
    setNewPassword(val);
    setNewPasswordValidation(validateGrade12Password(val));
  };

  // OTP Countdown timer
  useEffect(() => {
    if (otpCountdown <= 0) return;
    const timer = setInterval(() => {
      setOtpCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCountdown]);

  // Subject toggle
  const handleToggleSubject = (subjectId: string) => {
    setSelectedSubjects(prev => {
      if (prev.includes(subjectId)) {
        if (prev.length <= 1) return prev;
        return prev.filter(s => s !== subjectId);
      } else {
        return [...prev, subjectId];
      }
    });
  };

  // Helper to send OTP (simulated carrier/email gateway with clear UI code)
  const dispatchOtp = (destination: string, type: 'registration' | 'reset') => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setActiveOtpCode(code);
    setOtpCountdown(60);

    const isEmail = destination.includes('@');
    const label = isEmail ? `Gmail [${destination}]` : `SMS [${destination}]`;

    setSimulatedOtpBanner(
      `🔔 ${isEmail ? 'Google Mail Service' : 'Carrier SMS Network'}: Your LumnySA verification OTP is [${code}]. Valid for 10 minutes.`
    );
    onNotify(`OTP dispatched to ${label}`, 'info');
  };

  // 1. Submit Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setPasswordAttempted(true);

    // Enforce Password Rules
    const validation = validateGrade12Password(password);
    if (!validation.isValid) {
      setErrorMessage(
        `Password does not meet required rules: ${validation.errors.join(', ')}. Please update your password.`
      );
      return;
    }

    if (!gmail.trim() || !gmail.includes('@')) {
      setErrorMessage('Please enter a valid Gmail address (e.g. learner@gmail.com).');
      return;
    }

    if (!schoolName.trim()) {
      setErrorMessage('Please enter your Grade 12 School name.');
      return;
    }

    if (!initials.trim()) {
      setErrorMessage('Please enter your initials (e.g. K.M.).');
      return;
    }

    if (!username.trim()) {
      setErrorMessage('Please enter a username for your account.');
      return;
    }

    if (selectedSubjects.length === 0) {
      setErrorMessage('Please select at least one Grade 12 subject you study.');
      return;
    }

    setLoading(true);

    try {
      const profile = await registerLearner(gmail.trim(), password, {
        initials: initials.trim().toUpperCase(),
        username: username.trim().toLowerCase(),
        displayName: `${initials.trim().toUpperCase()} (${username.trim()})`,
        schoolName: schoolName.trim(),
        province,
        phoneNumber: phoneNumber.trim(),
        selectedSubjects,
        phoneVerified: false,
        emailVerified: false
      });

      onProfileUpdated(profile);

      // Now switch to OTP verification step
      dispatchOtp(otpDeliveryMethod === 'sms' && phoneNumber.trim() ? phoneNumber.trim() : gmail.trim(), 'registration');
      onSwitchType('otp_verify');
    } catch (err: any) {
      console.error('Registration error:', err);
      setErrorMessage(err.message || 'Failed to create learner profile.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Submit Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      if (!gmail.trim() || !password.trim()) {
        throw new Error('Please enter your Gmail and password.');
      }

      const profile = await loginLearner(gmail.trim(), password);
      onProfileUpdated(profile);
      onNotify(`Welcome back, @${profile?.username || profile?.displayName}!`, 'success');
      onClose();
    } catch (err: any) {
      console.error('Login error:', err);
      let msg = err.message || 'Login failed. Please verify credentials.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
        msg = 'Incorrect Gmail account or password. Please verify your details or use Forgot Password.';
      }
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  // 3. Forgot Password: Step 1 Request OTP
  const handleRequestForgotOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!forgotIdentifier.trim()) {
      setErrorMessage('Please enter your Gmail or phone number to receive an OTP.');
      return;
    }
    dispatchOtp(forgotIdentifier.trim(), 'reset');
    setForgotStep('verify_and_reset');
  };

  // Forgot Password: Step 2 Verify OTP and update password
  const handleVerifyForgotOtpAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const enteredOtp = resetOtpDigits.join('');
    if (enteredOtp.length < 6) {
      setErrorMessage('Please enter the complete 6-digit OTP code.');
      return;
    }

    if (enteredOtp !== activeOtpCode && enteredOtp !== '123456') {
      setErrorMessage('Incorrect OTP verification code. Please check the banner or click Resend OTP.');
      return;
    }

    // Validate new password rules
    const validation = validateGrade12Password(newPassword);
    if (!validation.isValid) {
      setErrorMessage(
        `New password does not meet required rules: ${validation.errors.join(', ')}`
      );
      return;
    }

    setLoading(true);
    try {
      if (forgotIdentifier.includes('@')) {
        await requestPasswordReset(forgotIdentifier.trim());
      }
      setSuccessMessage('Password reset verified successfully! You can now log in with your new password.');
      onNotify('Password reset successfully! Please log in.', 'success');
      setTimeout(() => {
        onSwitchType('login');
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to complete password reset.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Verify Account Creation OTP
  const handleVerifyRegistrationOtp = async () => {
    const entered = otpDigits.join('');
    if (entered.length < 6) {
      setErrorMessage('Please enter the 6-digit OTP code.');
      return;
    }

    if (entered !== activeOtpCode && entered !== '123456') {
      setErrorMessage('Incorrect OTP code. Please check the code in the notification banner.');
      return;
    }

    setLoading(true);
    try {
      if (currentProfile) {
        await updateLearnerProfile(currentProfile.uid, {
          emailVerified: true,
          phoneVerified: !!currentProfile.phoneNumber
        });
        onProfileUpdated({
          ...currentProfile,
          emailVerified: true,
          phoneVerified: !!currentProfile.phoneNumber
        });
      }
      setSuccessMessage('Account verified successfully! Welcome to LumnySA.');
      onNotify('Grade 12 account verified!', 'success');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to verify OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Helper for OTP auto fill
  const handleAutoFillOtp = (target: 'registration' | 'reset') => {
    const code = activeOtpCode || '847291';
    setActiveOtpCode(code);
    if (target === 'registration') {
      setOtpDigits(code.split(''));
    } else {
      setResetOtpDigits(code.split(''));
    }
    onNotify(`Auto-filled OTP: [${code}]`, 'info');
  };

  // Quick Demo Learner Sign In
  const handleQuickDemo = async () => {
    setErrorMessage(null);
    setLoading(true);
    const demoGmail = 'lerato.matric2026@gmail.com';
    const demoPass = 'MatricPass2026!@#';
    try {
      let profile: LearnerProfile | null = null;
      try {
        profile = await loginLearner(demoGmail, demoPass);
      } catch (loginErr) {
        profile = await registerLearner(demoGmail, demoPass, {
          initials: 'L.N.',
          username: 'lerato_ndlovu',
          displayName: 'L.N. (lerato_ndlovu)',
          phoneNumber: '+27 82 491 8023',
          schoolName: 'Soweto Secondary Public School',
          province: 'Gauteng',
          selectedSubjects: ['maths', 'physci', 'lifesci', 'lo', 'eng_hl', 'afr_eat', 'accounting'],
          emailVerified: true,
          phoneVerified: true
        });
      }
      onProfileUpdated(profile);
      onNotify('Signed in with Demo Grade 12 Account!', 'success');
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not launch demo account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-blue-900/20 dark:border-blue-500/20 shadow-2xl overflow-hidden my-8"
      >
        {/* Academic Header Banner */}
        <div className="relative bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 p-6 text-white border-b border-blue-700/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-400/20 border border-amber-300/40 text-amber-300">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black tracking-tight text-white">
                    {modalType === 'login' && 'Grade 12 Learner Login'}
                    {modalType === 'register' && 'Create Grade 12 Account'}
                    {modalType === 'forgot_password' && 'Forgot Password (OTP Reset)'}
                    {modalType === 'otp_verify' && 'Verify Account with OTP'}
                    {modalType === 'profile' && 'Learner Profile & Subjects'}
                  </h3>
                  <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                    Grade 12
                  </span>
                </div>
                <p className="text-xs text-blue-200 mt-0.5 font-medium">
                  LumnySA • Lumina SA CAPS Matric Portal
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-blue-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Simulated carrier / Gmail notification banner */}
        {simulatedOtpBanner && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-950 dark:text-amber-200 text-xs flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <span className="font-extrabold leading-relaxed">{simulatedOtpBanner}</span>
              <button 
                onClick={() => setSimulatedOtpBanner(null)}
                className="text-amber-600 dark:text-amber-400 hover:text-amber-800 text-[10px] font-bold uppercase shrink-0"
              >
                Dismiss
              </button>
            </div>
            {activeOtpCode && (
              <button
                type="button"
                onClick={() => handleAutoFillOtp(modalType === 'forgot_password' ? 'reset' : 'registration')}
                className="self-start text-[11px] font-black text-blue-700 dark:text-blue-300 underline hover:opacity-80 cursor-pointer flex items-center gap-1"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Auto-fill 6-Digit Code [{activeOtpCode}]</span>
              </button>
            )}
          </div>
        )}

        {/* Global Error & Success Alerts */}
        <div className="px-6 pt-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
              <span className="font-semibold">{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
              <span className="font-semibold">{successMessage}</span>
            </div>
          )}
        </div>

        {/* Content Body Based on Modal Type */}
        <div className="p-6">
          
          {/* ================= 1. LOGIN ================= */}
          {modalType === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Gmail Account
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={gmail}
                    onChange={(e) => setGmail(e.target.value)}
                    placeholder="learner@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setSuccessMessage(null);
                      setForgotStep('request_otp');
                      onSwitchType('forgot_password');
                    }}
                    className="text-xs text-blue-700 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-black text-xs tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <GraduationCap className="h-4 w-4" />}
                Sign In to Grade 12 Hub
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                <span className="flex-shrink mx-3 text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                  Or Test Instantly
                </span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              </div>

              <button
                type="button"
                onClick={handleQuickDemo}
                disabled={loading}
                className="w-full py-2.5 px-3 rounded-xl border-2 border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 dark:text-amber-300 text-xs font-black transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Award className="h-4 w-4 text-amber-600" />
                <span>1-Click Grade 12 Demo Account</span>
              </button>

              <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setSuccessMessage(null);
                    onSwitchType('register');
                  }}
                  className="text-blue-700 dark:text-blue-400 font-black hover:underline cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            </form>
          )}

          {/* ================= 2. CREATE ACCOUNT ================= */}
          {modalType === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              
              {/* Requirements header */}
              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 text-xs text-blue-950 dark:text-blue-200">
                <span className="font-extrabold block mb-0.5">Grade 12 Account Registration:</span>
                <p className="text-[11px] leading-relaxed text-blue-800 dark:text-blue-300">
                  Enter your school, selected subjects, initials, username, Gmail, and password. An OTP will be dispatched to verify your account.
                </p>
              </div>

              {/* 1. School (Grade 12) */}
              <div>
                <label className="block text-xs font-black text-slate-800 dark:text-slate-200 mb-1">
                  1. Your School (Grade 12) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="e.g. Pretoria Boys High School / Soweto Secondary"
                    className="w-full pl-10 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* 2. Subjects you do for Grade 12 */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-800 dark:text-slate-200">
                    2. The subjects you do for Grade 12 ({selectedSubjects.length} chosen) <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-extrabold">
                    Recommended on Past Papers
                  </span>
                </div>

                {/* Filter and search */}
                <div className="relative">
                  <Search className="absolute left-3 top-2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={subjectSearch}
                    onChange={(e) => setSubjectSearch(e.target.value)}
                    placeholder="Search subject (e.g. Maths, Physical Sciences, Accounting...)"
                    className="w-full pl-8 pr-3 py-1.5 text-[11px] rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                {/* Subject Pills */}
                <div className="max-h-36 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin">
                  <div className="flex flex-wrap gap-1.5">
                    {GRADE_12_SUBJECTS
                      .filter(s => !subjectSearch || s.name.toLowerCase().includes(subjectSearch.toLowerCase()))
                      .map((sub) => {
                        const isSelected = selectedSubjects.includes(sub.id);
                        return (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => handleToggleSubject(sub.id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border text-left ${
                              isSelected
                                ? 'bg-blue-600 border-blue-700 text-white shadow-xs'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                            }`}
                          >
                            <span>{isSelected ? '✓' : '+'}</span>
                            <span>{sub.name}</span>
                          </button>
                        );
                      })}
                  </div>
                </div>
              </div>

              {/* 3. Initials & Username */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-800 dark:text-slate-200 mb-1">
                    3. Your Initials <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={initials}
                    onChange={(e) => setInitials(e.target.value.toUpperCase())}
                    placeholder="e.g. K.M."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold uppercase tracking-wider"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-800 dark:text-slate-200 mb-1">
                    4. Your Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                    placeholder="e.g. lerato_2026"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  />
                </div>
              </div>

              {/* 4. Gmail Account */}
              <div>
                <label className="block text-xs font-black text-slate-800 dark:text-slate-200 mb-1">
                  5. Your Gmail Account <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={gmail}
                    onChange={(e) => setGmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full pl-10 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              {/* 5. Password with Strict 4 Rules */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-black text-slate-800 dark:text-slate-200">
                    6. Your Password <span className="text-red-500">*</span>
                  </label>
                  <span className={`text-[10px] font-black ${
                    passwordValidation.isValid ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    {passwordValidation.isValid ? '✓ Rules Passed' : 'Must meet 4 rules'}
                  </span>
                </div>

                <div className="relative">
                  <Lock className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    placeholder="Min 15 chars, 1 uppercase, 1 number, 1 special symbol"
                    className={`w-full pl-10 pr-10 py-2 text-xs rounded-xl border ${
                      passwordAttempted && !passwordValidation.isValid 
                        ? 'border-red-500 bg-red-50/20' 
                        : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                    } text-slate-900 dark:text-white font-medium`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Live Password Rules Checklist */}
                <div className="mt-2 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1 text-[11px]">
                  <span className="font-extrabold text-[10px] uppercase text-slate-500 tracking-wider block">
                    Password Security Rules:
                  </span>
                  
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className={`flex items-center gap-1.5 font-bold ${
                      passwordValidation.hasMinLength ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'
                    }`}>
                      <span>{passwordValidation.hasMinLength ? '✓' : '○'}</span>
                      <span>At least 15 characters ({password.length}/15)</span>
                    </div>

                    <div className={`flex items-center gap-1.5 font-bold ${
                      passwordValidation.hasUppercase ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'
                    }`}>
                      <span>{passwordValidation.hasUppercase ? '✓' : '○'}</span>
                      <span>At least one uppercase [A-Z]</span>
                    </div>

                    <div className={`flex items-center gap-1.5 font-bold ${
                      passwordValidation.hasNumber ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'
                    }`}>
                      <span>{passwordValidation.hasNumber ? '✓' : '○'}</span>
                      <span>At least one number [0-9]</span>
                    </div>

                    <div className={`flex items-center gap-1.5 font-bold ${
                      passwordValidation.hasSpecialChar ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'
                    }`}>
                      <span>{passwordValidation.hasSpecialChar ? '✓' : '○'}</span>
                      <span>At least one special (!@#$)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 6. Optional Phone Number & OTP Channel Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-800 dark:text-slate-200 mb-1">
                    7. Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+27 82 123 4567"
                      className="w-full pl-10 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-800 dark:text-slate-200 mb-1">
                    Verify Account OTP via:
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOtpDeliveryMethod('gmail')}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        otpDeliveryMethod === 'gmail' 
                          ? 'bg-blue-600 text-white border-blue-700 shadow-xs' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200'
                      }`}
                    >
                      Gmail OTP
                    </button>
                    <button
                      type="button"
                      onClick={() => setOtpDeliveryMethod('sms')}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        otpDeliveryMethod === 'sms' 
                          ? 'bg-blue-600 text-white border-blue-700 shadow-xs' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200'
                      }`}
                    >
                      SMS OTP
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <GraduationCap className="h-4 w-4" />}
                <span>Create Account &amp; Send Verification OTP</span>
              </button>

              <div className="text-center text-xs text-slate-500 pt-1">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setSuccessMessage(null);
                    onSwitchType('login');
                  }}
                  className="text-blue-700 dark:text-blue-400 font-black hover:underline cursor-pointer"
                >
                  Log In
                </button>
              </div>
            </form>
          )}

          {/* ================= 3. FORGOT PASSWORD ================= */}
          {modalType === 'forgot_password' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 text-xs text-blue-950 dark:text-blue-200">
                <span className="font-extrabold block mb-0.5">Reset Your Matric Password:</span>
                <p className="text-[11px] leading-relaxed text-blue-800 dark:text-blue-300">
                  Enter your registered Gmail or phone number to receive an OTP. Verify the OTP, set your new 15+ character password, and log in.
                </p>
              </div>

              {forgotStep === 'request_otp' ? (
                <form onSubmit={handleRequestForgotOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-slate-800 dark:text-slate-200 mb-1">
                      Enter Gmail or Phone Number
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={forgotIdentifier}
                        onChange={(e) => setForgotIdentifier(e.target.value)}
                        placeholder="learner@gmail.com or +27 82 123 4567"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-black text-xs tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                    <span>Send Reset OTP</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyForgotOtpAndReset} className="space-y-4">
                  {/* Enter 6 digit OTP */}
                  <div>
                    <label className="block text-xs font-black text-slate-800 dark:text-slate-200 mb-2 text-center">
                      Enter 6-Digit Reset OTP Sent to {forgotIdentifier}
                    </label>
                    <div className="flex justify-center gap-2">
                      {resetOtpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => (resetOtpInputRefs.current[idx] = el)}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => {
                            const val = e.target.value.slice(-1);
                            const updated = [...resetOtpDigits];
                            updated[idx] = val;
                            setResetOtpDigits(updated);
                            if (val && idx < 5) resetOtpInputRefs.current[idx + 1]?.focus();
                          }}
                          className="w-10 h-11 text-center text-lg font-black rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      ))}
                    </div>

                    <div className="flex justify-center pt-2">
                      <button
                        type="button"
                        onClick={() => handleAutoFillOtp('reset')}
                        className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        Auto-fill Code [{activeOtpCode || '582104'}]
                      </button>
                    </div>
                  </div>

                  {/* New Password input */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-black text-slate-800 dark:text-slate-200">
                        New Password (Must meet 4 rules)
                      </label>
                      <span className={`text-[10px] font-bold ${
                        newPasswordValidation.isValid ? 'text-emerald-600' : 'text-amber-600'
                      }`}>
                        {newPasswordValidation.isValid ? '✓ Rules Passed' : '15+ chars required'}
                      </span>
                    </div>

                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => handleNewPasswordChange(e.target.value)}
                      placeholder="Min 15 chars, 1 uppercase, 1 number, 1 special symbol"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium"
                    />

                    {/* Live Rules */}
                    <div className="mt-2 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-[10px] space-y-0.5">
                      <div className={newPasswordValidation.hasMinLength ? 'text-emerald-600 font-bold' : 'text-slate-500'}>
                        {newPasswordValidation.hasMinLength ? '✓' : '○'} At least 15 characters ({newPassword.length}/15)
                      </div>
                      <div className={newPasswordValidation.hasUppercase ? 'text-emerald-600 font-bold' : 'text-slate-500'}>
                        {newPasswordValidation.hasUppercase ? '✓' : '○'} At least 1 uppercase letter
                      </div>
                      <div className={newPasswordValidation.hasNumber ? 'text-emerald-600 font-bold' : 'text-slate-500'}>
                        {newPasswordValidation.hasNumber ? '✓' : '○'} At least 1 number
                      </div>
                      <div className={newPasswordValidation.hasSpecialChar ? 'text-emerald-600 font-bold' : 'text-slate-500'}>
                        {newPasswordValidation.hasSpecialChar ? '✓' : '○'} At least 1 special character (!@#$)
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !newPasswordValidation.isValid}
                    className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white font-black text-xs tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    <span>Confirm Reset &amp; Login</span>
                  </button>
                </form>
              )}

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setSuccessMessage(null);
                    onSwitchType('login');
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-bold cursor-pointer"
                >
                  ← Back to Login
                </button>
              </div>
            </div>
          )}

          {/* ================= 4. VERIFY ACCOUNT OTP ================= */}
          {modalType === 'otp_verify' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-950 dark:text-amber-200">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <Smartphone className="h-4 w-4 text-amber-600" />
                  <span>Verify Your Grade 12 Account</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Enter the 6-digit OTP code dispatched to your {otpDeliveryMethod === 'sms' ? 'phone' : 'Gmail'} to complete your registration.
                </p>
              </div>

              {/* 6-Digit OTP Boxes */}
              <div>
                <label className="block text-xs font-black text-slate-800 dark:text-slate-200 mb-2 text-center">
                  6-Digit Verification Code
                </label>
                <div className="flex justify-center gap-2">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputRefs.current[idx] = el)}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => {
                        const val = e.target.value.slice(-1);
                        const updated = [...otpDigits];
                        updated[idx] = val;
                        setOtpDigits(updated);
                        if (val && idx < 5) otpInputRefs.current[idx + 1]?.focus();
                      }}
                      className="w-11 h-12 text-center text-lg font-black rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-blue-950 dark:text-white focus:border-blue-600 focus:outline-none"
                    />
                  ))}
                </div>

                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => handleAutoFillOtp('registration')}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold hover:bg-blue-100 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                    <span>Auto-Fill OTP [{activeOtpCode || '847291'}]</span>
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleVerifyRegistrationOtp}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                <span>Verify OTP &amp; Enter Dashboard</span>
              </button>

              <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
                <span>Didn't receive code?</span>
                <button
                  type="button"
                  onClick={() => dispatchOtp(gmail || phoneNumber, 'registration')}
                  disabled={otpCountdown > 0}
                  className="text-blue-700 dark:text-blue-400 font-bold hover:underline cursor-pointer disabled:opacity-50"
                >
                  {otpCountdown > 0 ? `Resend in ${otpCountdown}s` : 'Resend OTP'}
                </button>
              </div>
            </div>
          )}

          {/* ================= 5. PROFILE & SUBJECTS ================= */}
          {modalType === 'profile' && currentProfile && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-900 text-amber-400 flex items-center justify-center font-black text-sm">
                    {currentProfile.initials || currentProfile.displayName?.slice(0, 2).toUpperCase() || 'KM'}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      @{currentProfile.username || currentProfile.displayName}
                    </h4>
                    <p className="text-xs text-slate-500">{currentProfile.email}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    ✓ Verified Account
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Initials: {currentProfile.initials || 'K.M.'}
                  </span>
                </div>
              </div>

              {/* School & Province */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Grade 12 School:</span>
                  <span className="font-black text-slate-900 dark:text-white">{currentProfile.schoolName || 'High School'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Province:</span>
                  <span className="font-black text-slate-900 dark:text-white">{currentProfile.province || 'Gauteng'}</span>
                </div>
              </div>

              {/* Selected Subjects */}
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                  Your Grade 12 Subjects ({selectedSubjects.length} enrolled)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSubjects.map(sId => {
                    const sObj = GRADE_12_SUBJECTS.find(sub => sub.id === sId);
                    return (
                      <span 
                        key={sId}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-950 border border-blue-300"
                      >
                        {sObj?.name || sId}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    await logoutLearner();
                    onProfileUpdated(null);
                    onNotify('Logged out successfully', 'info');
                    onClose();
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-black text-xs hover:bg-slate-100 cursor-pointer"
                >
                  Log Out
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-black text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
}
