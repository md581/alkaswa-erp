import React, { useState } from 'react';
import { useAuth, AuthenticatedUser } from '../contexts/AuthContext';
import { getApiUrl } from '../config/api';
import { RoleId } from '../types';
import { 
  Building2, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle,
  HelpCircle,
  Cpu,
  Activity,
  Database,
  Terminal
} from 'lucide-react';
import { COMPANY_PROFILE } from '../config/companyProfile';

interface LoginPageProps {
  lang: 'en' | 'bn';
  setLang: (lang: 'en' | 'bn') => void;
}

export default function LoginPage({ lang, setLang }: LoginPageProps) {
  const { login, register, resetPassword } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Registration State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState<RoleId>('CST');

  // Reset Password State
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Debug Trace State
  const [debugTraceData, setDebugTraceData] = useState<any>(null);
  const [isDebugRunning, setIsDebugRunning] = useState(false);

  const runE2ETrace = async () => {
    setIsDebugRunning(true);
    setStatusMsg(null);
    try {
      const res = await fetch(getApiUrl('/api/auth/debug-trace'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        setDebugTraceData(data);
        setStatusMsg({
          type: 'success',
          text: lang === 'en' 
            ? 'End-to-End trace executed successfully! View diagnostic logs below.' 
            : 'এন্ড-টু-এন্ড ট্রেস সফলভাবে সম্পন্ন হয়েছে! নিচে বিস্তারিত দেখুন।'
        });
      } else {
        setStatusMsg({
          type: 'error',
          text: 'Debug trace failed to execute. Backend endpoint is unavailable on this environment.'
        });
      }
    } catch (e: any) {
      console.error('Debug trace error:', e);
      setStatusMsg({
        type: 'error',
        text: 'Connection failed during debug trace execution.'
      });
    } finally {
      setIsDebugRunning(false);
    }
  };

  // Quick Demo Login configuration
  const demoUsers: Array<{ role: RoleId; labelEn: string; labelBn: string; email: string; color: string }> = [
    { role: 'FND', labelEn: 'Founder', labelBn: 'প্রতিষ্ঠাতা', email: 'founder@alkaswa.com', color: 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100' },
    { role: 'MD', labelEn: 'Managing Director', labelBn: 'ব্যবস্থাপনা পরিচালক', email: 'md@alkaswa.com', color: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' },
    { role: 'GM', labelEn: 'General Manager', labelBn: 'মহাব্যবস্থাপক', email: 'gm@alkaswa.com', color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' },
    { role: 'HRM', labelEn: 'HR Manager', labelBn: 'মানবসম্পদ ব্যবস্থাপক', email: 'hrm@alkaswa.com', color: 'bg-pink-50 border-pink-200 text-pink-700 hover:bg-pink-100' },
    { role: 'ACT', labelEn: 'Accounts Manager', labelBn: 'হিসাবরক্ষণ ব্যবস্থাপক', email: 'act@alkaswa.com', color: 'bg-violet-50 border-violet-200 text-violet-700 hover:bg-violet-100' },
    { role: 'SLM', labelEn: 'Sales Manager', labelBn: 'বিক্রয় ব্যবস্থাপক', email: 'slm@alkaswa.com', color: 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' },
    { role: 'LAM', labelEn: 'Land Acquisition', labelBn: 'ভূমি অধিগ্রহণ', email: 'lam@alkaswa.com', color: 'bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100' },
    { role: 'LGL', labelEn: 'Legal Manager', labelBn: 'আইন কর্মকর্তা', email: 'lgl@alkaswa.com', color: 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100' },
    { role: 'ENG', labelEn: 'Engineering Manager', labelBn: 'প্রকৌশল ব্যবস্থাপক', email: 'eng@alkaswa.com', color: 'bg-cyan-50 border-cyan-200 text-cyan-700 hover:bg-cyan-100' },
    { role: 'PRM', labelEn: 'Procurement', labelBn: 'ক্রয় ব্যবস্থাপক', email: 'prm@alkaswa.com', color: 'bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100' },
    { role: 'CST', labelEn: 'Customer', labelBn: 'গ্রাহক', email: 'customer@alkaswa.com', color: 'bg-emerald-50 border-emerald-100 text-emerald-800 hover:bg-emerald-100' },
    { role: 'LDO', labelEn: 'Land Owner', labelBn: 'জমির মালিক', email: 'landowner@alkaswa.com', color: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100' },
    { role: 'INV', labelEn: 'Investor', labelBn: 'বিনিয়োগকারী', email: 'investor@alkaswa.com', color: 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200' }
  ];

  const handleDemoLogin = async (demoEmail: string) => {
    setIsSubmitting(true);
    setStatusMsg(null);
    const result = await login(demoEmail, 'password123');
    setIsSubmitting(false);
    if (!result.success) {
      setStatusMsg({ type: 'error', text: result.error || 'Login failed' });
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setStatusMsg({ 
        type: 'error', 
        text: lang === 'en' ? 'Please fill in all fields' : 'সবগুলো ক্ষেত্র পূরণ করুন' 
      });
      return;
    }

    setIsSubmitting(true);
    setStatusMsg(null);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (!result.success) {
      setStatusMsg({ 
        type: 'error', 
        text: result.error || (lang === 'en' ? 'Authentication failed' : 'অথেন্টিকেশন ব্যর্থ হয়েছে') 
      });
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName || !phone) {
      setStatusMsg({ 
        type: 'error', 
        text: lang === 'en' ? 'Please fill in all required fields' : 'সবগুলো প্রয়োজনীয় ক্ষেত্র পূরণ করুন' 
      });
      return;
    }

    setIsSubmitting(true);
    setStatusMsg(null);
    const result = await register({ email, password, fullName, phone, role: selectedRole });
    setIsSubmitting(false);

    if (result.success) {
      setStatusMsg({ 
        type: 'success', 
        text: lang === 'en' ? 'Account registered successfully!' : 'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!' 
      });
    } else {
      setStatusMsg({ type: 'error', text: result.error || 'Registration failed' });
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail || !newPassword || !confirmPassword) {
      setStatusMsg({ 
        type: 'error', 
        text: lang === 'en' ? 'Please fill in all fields' : 'সবগুলো ক্ষেত্র পূরণ করুন' 
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatusMsg({ 
        type: 'error', 
        text: lang === 'en' ? 'Passwords do not match' : 'পাসওয়ার্ড দুটি মেলেনি' 
      });
      return;
    }

    setIsSubmitting(true);
    setStatusMsg(null);
    const result = await resetPassword(resetEmail, newPassword);
    setIsSubmitting(false);

    if (result.success) {
      setStatusMsg({ 
        type: 'success', 
        text: result.message || (lang === 'en' ? 'Password reset completed successfully' : 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে') 
      });
      setTimeout(() => {
        setActiveTab('login');
        setStatusMsg(null);
      }, 3000);
    } else {
      setStatusMsg({ type: 'error', text: result.error || 'Password reset failed' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Decorative corporate grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      {/* Language Toggle in Corner */}
      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold text-slate-300 transition-all cursor-pointer shadow-sm"
        >
          {lang === 'en' ? 'বাংলা সংস্করণ' : 'English Version'}
        </button>
      </div>

      {/* Main Enterprise Card */}
      <div className="w-full max-w-5xl mx-auto relative bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
          
          {/* Left Column: Branding, ERP Description, Logo & Live Monitor */}
          <div className="lg:col-span-5 bg-slate-950/40 p-6 md:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 overflow-hidden">
            <div className="space-y-6">
              {/* Corporate Logo & Branding */}
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500 text-slate-950 shadow-xl shadow-emerald-500/10 border border-emerald-400 shrink-0">
                  <Building2 className="w-8 h-8" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl font-black tracking-tight text-white font-display uppercase break-words leading-tight">
                    {lang === 'en' ? COMPANY_PROFILE.name : 'আল কাসওয়া হোল্ডিংস লিমিটেড'}
                  </h2>
                  <p className="mt-1 text-[10px] text-emerald-400 font-mono tracking-widest uppercase truncate">
                    {lang === 'en' ? 'Enterprise ERP Environment' : 'কর্পোরেট ইআরপি পরিবেশ'}
                  </p>
                </div>
              </div>

              {/* ERP Description */}
              <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                <div className="flex items-center gap-2 text-rose-400 font-bold tracking-wide uppercase text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
                  <span>{lang === 'en' ? 'Authorized Access Only' : 'শুধুমাত্র অনুমোদিত প্রবেশ'}</span>
                </div>
                <p className="text-slate-400 break-words">
                  {lang === 'en' 
                    ? 'Welcome to the Al Kaswa Unified ERP platform. This secure terminal connects and authorizes critical nodes for property management, engineering progress, land acquisition, corporate accounts, legal documentation, and stakeholder collaboration.' 
                    : 'আল কাসওয়া সমন্বিত ইআরপি প্ল্যাটফর্মে আপনাকে স্বাগতম। এই সুরক্ষিত টার্মিনালটি প্রপার্টি ম্যানেজমেন্ট, ইঞ্জিনিয়ারিং অগ্রগতি, ল্যান্ড রেকর্ড, কর্পোরেট অ্যাকাউন্ট, আইনি নথি এবং স্টেকহোল্ডার পোর্টালগুলির জন্য গুরুত্বপূর্ণ নোডগুলিকে সংযুক্ত এবং অনুমোদিত করে।'}
                </p>
              </div>
            </div>

            {/* Left Column Bottom: Live Connection Status & Live Input Watcher */}
            <div className="mt-8 pt-6 border-t border-slate-850 space-y-4">
              <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-850/80">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  {lang === 'en' ? 'Live Input Watcher' : 'লাইভ ইনপুট পর্যবেক্ষণ'}
                </h4>
                <div className="space-y-1.5 text-[10px] font-mono">
                  <div className="flex justify-between py-1 border-b border-slate-900/50 gap-2 overflow-hidden">
                    <span className="text-slate-500 shrink-0">{lang === 'en' ? 'Email:' : 'ইমেল:'}</span>
                    <span className="text-white text-right break-all truncate font-semibold">{email || (lang === 'en' ? '[None]' : '[কোনো ইনপুট নেই]')}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900/50 gap-2 overflow-hidden">
                    <span className="text-slate-500 shrink-0">{lang === 'en' ? 'User Node:' : 'ইউজার নোড:'}</span>
                    <span className={`font-semibold text-right ${email ? 'text-emerald-400' : 'text-slate-600'}`}>
                      {email ? (['founder@alkaswa.com', 'md@alkaswa.com', 'gm@alkaswa.com', 'hrm@alkaswa.com', 'act@alkaswa.com', 'slm@alkaswa.com', 'lam@alkaswa.com', 'lgl@alkaswa.com', 'eng@alkaswa.com', 'prm@alkaswa.com', 'customer@alkaswa.com', 'landowner@alkaswa.com', 'investor@alkaswa.com', 'debug@test.com'].includes(email.toLowerCase()) ? (lang === 'en' ? 'Found' : 'পাওয়া গেছে') : (lang === 'en' ? 'Unrecognized' : 'অজানা নোড')) : (lang === 'en' ? 'Waiting...' : 'অপেক্ষা করা হচ্ছে...')}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900/50 gap-2 overflow-hidden">
                    <span className="text-slate-500 shrink-0">{lang === 'en' ? 'Password:' : 'পাসওয়ার্ড:'}</span>
                    <span className="text-slate-400 text-right truncate">
                      {password ? '●●●●●●● (Typing...)' : (lang === 'en' ? 'Empty' : 'ফাঁকা')}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 shrink-0">{lang === 'en' ? 'Port:' : 'পোর্ট:'}</span>
                    <span className="text-emerald-400 text-right font-bold">3000 (Active)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Form Engine & Role Shortcuts */}
          <div className="lg:col-span-7 p-6 md:p-10 space-y-6 bg-slate-900 overflow-hidden flex flex-col justify-between">
            
            <div className="space-y-6">
              {/* Form Navigation Tabs */}
              <div className="flex border-b border-slate-800 pb-2 justify-between items-center gap-4">
                <div className="flex space-x-6">
                  <button
                    onClick={() => { setActiveTab('login'); setStatusMsg(null); }}
                    className={`pb-2 text-sm font-bold tracking-wide transition-colors relative cursor-pointer uppercase ${
                      activeTab === 'login' ? 'text-emerald-400 font-black' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {lang === 'en' ? 'Secure Login' : 'লগইন করুন'}
                    {activeTab === 'login' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />}
                  </button>

                  <button
                    onClick={() => { setActiveTab('register'); setStatusMsg(null); }}
                    className={`pb-2 text-sm font-bold tracking-wide transition-colors relative cursor-pointer uppercase ${
                      activeTab === 'register' ? 'text-emerald-400 font-black' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {lang === 'en' ? 'Register' : 'রেজিস্ট্রেশন'}
                    {activeTab === 'register' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />}
                  </button>
                </div>

                <button
                  onClick={() => { setActiveTab('reset'); setStatusMsg(null); }}
                  className={`pb-2 text-xs font-semibold transition-colors cursor-pointer uppercase ${
                    activeTab === 'reset' ? 'text-emerald-400 font-bold underline' : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  {lang === 'en' ? 'Reset Password' : 'পাসওয়ার্ড রিসেট'}
                </button>
              </div>

              {/* Status Indicator Banner */}
              {statusMsg && (
                <div className={`p-4 rounded-xl flex items-start gap-3 border ${
                  statusMsg.type === 'success' 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}>
                  {statusMsg.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  )}
                  <span className="text-xs font-semibold leading-relaxed break-words overflow-hidden">{statusMsg.text}</span>
                </div>
              )}

              {/* Login Form View */}
              {activeTab === 'login' && (
                <form className="space-y-4" onSubmit={handleLoginSubmit}>
                  <div className="w-full">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      {lang === 'en' ? 'Corporate Email Address' : 'কর্পোরেট ইমেল ঠিকানা'}
                    </label>
                    <div className="relative rounded-xl shadow-sm w-full">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs font-medium text-white placeholder-slate-600 transition-all outline-none"
                        placeholder="example@alkaswa.com"
                      />
                    </div>
                  </div>

                  <div className="w-full">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      {lang === 'en' ? 'Security Password' : 'নিরাপত্তা পাসওয়ার্ড'}
                    </label>
                    <div className="relative rounded-xl shadow-sm w-full">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs font-medium text-white placeholder-slate-600 transition-all outline-none"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 w-full">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex justify-center items-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20 active:scale-98 cursor-pointer border border-emerald-400"
                    >
                      {isSubmitting 
                        ? (lang === 'en' ? 'Verifying...' : 'যাচাই করা হচ্ছে...') 
                        : (lang === 'en' ? 'Authorize Session' : 'সেশন অনুমোদন করুন')
                      }
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}

              {/* Registration Form View */}
              {activeTab === 'register' && (
                <form className="space-y-4" onSubmit={handleRegisterSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="w-full">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        {lang === 'en' ? 'Full Name' : 'পূর্ণ নাম'}
                      </label>
                      <div className="relative rounded-xl shadow-sm w-full">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                          <User className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="block w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs text-white placeholder-slate-600 transition-all outline-none"
                          placeholder="e.g. Md. Ahmed"
                        />
                      </div>
                    </div>

                    <div className="w-full">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        {lang === 'en' ? 'Phone Number' : 'ফোন নম্বর'}
                      </label>
                      <div className="relative rounded-xl shadow-sm w-full">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                          <Phone className="w-4 h-4" />
                        </div>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="block w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs text-white placeholder-slate-600 transition-all outline-none"
                          placeholder="+8801700000000"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="w-full">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      {lang === 'en' ? 'Corporate Email' : 'কর্পোরেট ইমেল'}
                    </label>
                    <div className="relative rounded-xl shadow-sm w-full">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs text-white placeholder-slate-600 transition-all outline-none"
                        placeholder="example@alkaswa.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="w-full">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        {lang === 'en' ? 'Select Role Node' : 'রোল নোড নির্বাচন'}
                      </label>
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value as RoleId)}
                        className="block w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs text-white outline-none cursor-pointer"
                      >
                        <option value="CST">{lang === 'en' ? 'Customer (CST)' : 'গ্রাহক (CST)'}</option>
                        <option value="LDO">{lang === 'en' ? 'Land Owner (LDO)' : 'জমির মালিক (LDO)'}</option>
                        <option value="INV">{lang === 'en' ? 'Investor (INV)' : 'বিনিয়োগকারী (INV)'}</option>
                        <option value="SLM">{lang === 'en' ? 'Sales Manager (SLM)' : 'বিক্রয় ব্যবস্থাপক (SLM)'}</option>
                        <option value="ACT">{lang === 'en' ? 'Accounts Manager (ACT)' : 'হিসাবরক্ষণ ব্যবস্থাপক (ACT)'}</option>
                        <option value="HRM">{lang === 'en' ? 'HR Manager (HRM)' : 'মানবসম্পদ ব্যবস্থাপক (HRM)'}</option>
                      </select>
                    </div>

                    <div className="w-full">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        {lang === 'en' ? 'Define Password' : 'পাসওয়ার্ড নির্ধারণ'}
                      </label>
                      <div className="relative rounded-xl shadow-sm w-full">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="block w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs text-white placeholder-slate-600 transition-all outline-none"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 w-full">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex justify-center items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20 active:scale-98 cursor-pointer border border-emerald-400"
                    >
                      {isSubmitting ? (lang === 'en' ? 'Registering...' : 'রেজিস্ট্রেশন হচ্ছে...') : (lang === 'en' ? 'Initialize Node Account' : 'নতুন অ্যাকাউন্ট তৈরি করুন')}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}

              {/* Password Reset View */}
              {activeTab === 'reset' && (
                <form className="space-y-4" onSubmit={handleResetSubmit}>
                  <div className="w-full">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      {lang === 'en' ? 'Corporate Email' : 'নিবন্ধিত ইমেল'}
                    </label>
                    <div className="relative rounded-xl shadow-sm w-full">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs text-white placeholder-slate-600 transition-all outline-none"
                        placeholder="example@alkaswa.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="w-full">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        {lang === 'en' ? 'New Password' : 'নতুন পাসওয়ার্ড'}
                      </label>
                      <div className="relative rounded-xl shadow-sm w-full">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="block w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs text-white placeholder-slate-600 transition-all outline-none"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <div className="w-full">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        {lang === 'en' ? 'Confirm Password' : 'পাসওয়ার্ড নিশ্চিত করুন'}
                      </label>
                      <div className="relative rounded-xl shadow-sm w-full">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="block w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs text-white placeholder-slate-600 transition-all outline-none"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 w-full">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex justify-center items-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20 active:scale-98 cursor-pointer border border-emerald-400"
                    >
                      {isSubmitting ? (lang === 'en' ? 'Resetting...' : 'রিসেট হচ্ছে...') : (lang === 'en' ? 'Update Credentials' : 'পাসওয়ার্ড পরিবর্তন করুন')}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Role Shortcut Buttons - Built as beautiful responsive grid */}
            <div className="mt-8 pt-6 border-t border-slate-800/80">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2.5">
                <HelpCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{lang === 'en' ? 'Quick ERP Access Shortcuts' : 'সহজ ইআরপি অ্যাক্সেস শর্টকাট'}</span>
              </div>
              
              <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                {lang === 'en' 
                  ? 'Select any of the 13 authentic enterprise roles to instantly authorize and view custom security dashboards and modules.' 
                  : 'ইনস্ট্যান্ট অথরাইজেশন ও কাস্টম সিকিউরিটি ড্যাশবোর্ড দেখতে ১৩টি ইআরপি রোলের যেকোনো একটি সিলেক্ট করুন।'}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {demoUsers.map((user) => (
                  <button
                    key={user.role}
                    type="button"
                    onClick={() => handleDemoLogin(user.email)}
                    disabled={isSubmitting}
                    className={`px-3 py-2 border rounded-xl text-[10px] font-bold text-center transition-all cursor-pointer select-none truncate flex flex-col justify-center items-center gap-0.5 min-w-0 ${user.color}`}
                    title={`${user.labelEn} (${user.email})`}
                  >
                    <span className="block truncate w-full">{lang === 'en' ? user.labelEn : user.labelBn}</span>
                    <span className="text-[8px] font-mono block opacity-60">{user.role}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* System Diagnostics & Auth Trace (Collapsible to keep layout clean) */}
            <div className="mt-6 pt-6 border-t border-slate-800">
              <details className="group outline-none">
                <summary className="flex items-center justify-between cursor-pointer list-none select-none">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-emerald-400 transition-colors">
                    <Cpu className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{lang === 'en' ? 'System Diagnostics & Auth Trace' : 'সিস্টেম ডায়াগনস্টিকস ও অথ ট্রেস'}</span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono transition-transform duration-200 group-open:rotate-180">▼</span>
                </summary>
                
                <div className="mt-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] text-slate-500 font-mono">PHASE 29.8 STABILIZED TESTING</p>
                  </div>
                  <button
                    onClick={runE2ETrace}
                    disabled={isDebugRunning}
                    className="w-full flex justify-center items-center gap-2.5 px-4 py-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 disabled:border-slate-900 hover:bg-slate-900 text-slate-300 disabled:text-slate-600 text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-98 cursor-pointer"
                  >
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    {isDebugRunning 
                      ? (lang === 'en' ? 'Executing Trace Steps...' : 'ট্রেস রান হচ্ছে...') 
                      : (lang === 'en' ? 'Run End-to-End Auth Trace' : 'এন্ড-টু-এন্ড অথ ট্রেস রান করুন')}
                  </button>

                  {debugTraceData ? (
                    <div className="bg-slate-950/90 rounded-xl p-4 border border-slate-800 text-[11px] font-mono leading-relaxed max-h-[300px] overflow-y-auto space-y-4 custom-scrollbar">
                      
                      {/* Summary Metrics */}
                      <div>
                        <h4 className="text-[11px] font-black text-emerald-400 uppercase tracking-widest mb-2 pb-1 border-b border-slate-900 flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5" />
                          <span>SUMMARY TRACE METRICS</span>
                        </h4>
                        <div className="space-y-1.5 text-slate-300">
                          <div className="flex justify-between py-1 border-b border-slate-900/50 gap-2 overflow-hidden">
                            <span className="text-slate-500 shrink-0">Email:</span>
                            <span className="text-white font-semibold truncate text-right">{debugTraceData.step4_login_trace.incomingEmail}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-slate-900/50 gap-2 overflow-hidden">
                            <span className="text-slate-500 shrink-0">Normalized Email:</span>
                            <span className="text-white truncate text-right">{debugTraceData.step4_login_trace.normalizedEmail}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-slate-900/50 gap-2 overflow-hidden">
                            <span className="text-slate-500 shrink-0">Matched DB Email:</span>
                            <span className="text-emerald-400 font-semibold truncate text-right">{debugTraceData.step4_login_trace.matchedDatabaseEmail || "None"}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-slate-900/50 gap-2 overflow-hidden">
                            <span className="text-slate-500 shrink-0">User Found?</span>
                            <span className={debugTraceData.step4_login_trace.matchedDatabaseEmail ? 'text-emerald-400 font-bold text-right' : 'text-rose-400 font-bold text-right'}>
                              {debugTraceData.step4_login_trace.matchedDatabaseEmail ? 'Yes (হ্যাঁ)' : 'No (না)'}
                            </span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-slate-900/50 gap-2 overflow-hidden">
                            <span className="text-slate-500 shrink-0">Password Matched?</span>
                            <span className={debugTraceData.step4_login_trace.bcryptComparisonResult ? 'text-emerald-400 font-bold text-right' : 'text-rose-400 font-bold text-right'}>
                              {debugTraceData.step4_login_trace.bcryptComparisonResult ? 'Yes (হ্যাঁ)' : 'No (না)'}
                            </span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-slate-900/50 gap-2 overflow-hidden">
                            <span className="text-slate-500 shrink-0">Access Token Generated?</span>
                            <span className={debugTraceData.step4_login_trace.accessTokenGenerated ? 'text-emerald-400 font-bold text-right' : 'text-rose-400 font-bold text-right'}>
                              {debugTraceData.step4_login_trace.accessTokenGenerated ? 'Yes (হ্যাঁ)' : 'No (না)'}
                            </span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-slate-900/50 gap-2 overflow-hidden">
                            <span className="text-slate-500 shrink-0">Refresh Token Generated?</span>
                            <span className={debugTraceData.step4_login_trace.refreshTokenGenerated ? 'text-emerald-400 font-bold text-right' : 'text-rose-400 font-bold text-right'}>
                              {debugTraceData.step4_login_trace.refreshTokenGenerated ? 'Yes (হ্যাঁ)' : 'No (না)'}
                            </span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-slate-500 shrink-0">Final Login Result:</span>
                            <span className={debugTraceData.step4_login_trace.finalLoginResult === 'SUCCESS' ? 'text-emerald-400 font-black text-right' : 'text-rose-400 font-black text-right'}>
                              {debugTraceData.step4_login_trace.finalLoginResult}
                            </span>
                          </div>
                          {debugTraceData.step4_login_trace.exactFailureReason && (
                            <div className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-[10px] mt-1.5 break-words">
                              <strong>Reason:</strong> {debugTraceData.step4_login_trace.exactFailureReason}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Step-by-Step Execution Report */}
                      <div className="pt-2 border-t border-slate-900">
                        <h4 className="text-[11px] font-black text-emerald-400 uppercase tracking-widest mb-2 pb-1 border-b border-slate-900 flex items-center gap-1.5">
                          <Database className="w-3.5 h-3.5" />
                          <span>STEP-BY-STEP TRACE LOG</span>
                        </h4>
                        <div className="space-y-3.5 text-slate-300">
                          <div className="min-w-0">
                            <div className="text-emerald-400 font-bold mb-1">Step 1: Test User Registration</div>
                            <div className="text-[10px] text-slate-400">Generated User ID: <span className="text-white select-all break-all">{debugTraceData.step1_registration.generatedUserId}</span></div>
                            <div className="text-[10px] text-slate-400">Stored Email: <span className="text-white select-all break-all">{debugTraceData.step1_registration.storedEmail}</span></div>
                            <div className="text-[10px] text-slate-400">Password Hash Exists? <span className="text-white">{debugTraceData.step1_registration.passwordHashExists ? 'Yes' : 'No'}</span></div>
                            <div className="text-[10px] text-slate-400">Hashed Password: <span className="text-slate-500 break-all select-all">{debugTraceData.step1_registration.insertedUser.passwordHash}</span></div>
                          </div>

                          <div className="pt-2 border-t border-slate-900 min-w-0">
                            <div className="text-emerald-400 font-bold mb-1">Step 2: Immediate Write Verification</div>
                            <div className="text-[10px] text-slate-400">Physically Exists on Disk? <span className="text-white">{debugTraceData.step2_immediate_verification.physicallyExistsOnDisk ? 'Yes' : 'No'}</span></div>
                            <div className="text-[10px] text-slate-400">Exact Database Record in File:</div>
                            <pre className="text-[9px] bg-slate-950 p-2 rounded-lg border border-slate-900 text-slate-400 mt-1 overflow-x-auto whitespace-pre-wrap break-all select-all">
                              {JSON.stringify(debugTraceData.step2_immediate_verification.recordInFile, null, 2)}
                            </pre>
                          </div>

                          <div className="pt-2 border-t border-slate-900 min-w-0">
                            <div className="text-emerald-400 font-bold mb-1">Step 3: After Page Refresh Verification</div>
                            <div className="text-[10px] text-slate-400">Record Still Exists in File? <span className="text-white">{debugTraceData.step3_after_refresh_verification.recordInFile ? 'Yes' : 'No'}</span></div>
                            <pre className="text-[9px] bg-slate-950 p-2 rounded-lg border border-slate-900 text-slate-400 mt-1 overflow-x-auto whitespace-pre-wrap break-all select-all">
                              {JSON.stringify(debugTraceData.step3_after_refresh_verification.recordInFile, null, 2)}
                            </pre>
                          </div>

                          <div className="pt-2 border-t border-slate-900 min-w-0">
                            <div className="text-emerald-400 font-bold mb-1">Step 4: Server Persistence Verification</div>
                            <div className="text-[10px] text-slate-400">Absolute usersDb.json Path: <span className="text-white text-[9px] break-all select-all">{debugTraceData.step5_server_persistence.usersDbPath}</span></div>
                            <div className="text-[10px] text-slate-400">Absolute profilesDb.json Path: <span className="text-white text-[9px] break-all select-all">{debugTraceData.step5_server_persistence.profilesDbPath}</span></div>
                            <div className="text-[10px] text-slate-400">Current Process Directory: <span className="text-white text-[9px] break-all select-all">{debugTraceData.step5_server_persistence.cwd}</span></div>
                            <div className="text-[10px] text-slate-400 leading-normal">Environment Note: <span className="text-slate-400 leading-normal break-words">{debugTraceData.step5_server_persistence.multipleInstancesNote}</span></div>
                            <div className="text-[10px] text-slate-400">Process details: <span className="text-slate-500 break-words">{debugTraceData.step5_server_persistence.processInfo}</span></div>
                          </div>

                          <div className="pt-2 border-t border-slate-900 min-w-0">
                            <div className="text-emerald-400 font-bold mb-1">Step 5: Refresh Token Diagnostics</div>
                            <div className="text-[10px] text-slate-400">Storage Type: <span className="text-white">{debugTraceData.step6_refresh_token_system.storageLocation}</span></div>
                            <div className="text-[10px] text-slate-400">Survives Server Restart? <span className="text-rose-400 font-bold">{debugTraceData.step6_refresh_token_system.survivesRestart ? 'Yes' : 'No'}</span></div>
                            <div className="text-[10px] text-slate-400 leading-normal">Analysis: <span className="text-slate-400 break-words">{debugTraceData.step6_refresh_token_system.isSourceOfFailure}</span></div>
                          </div>
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-500 border border-dashed border-slate-800 rounded-xl bg-slate-950/30">
                      <p className="text-[11px] mb-1">{lang === 'en' ? 'No Trace Executed Yet' : 'ট্রেস এখনও রান করা হয়নি'}</p>
                      <p className="text-[9px] text-slate-600">{lang === 'en' ? 'Click the button above to run real-time auth trace' : 'বাটনে ক্লিক করে নিরাপত্তা পর্যবেক্ষণ রান করুন'}</p>
                    </div>
                  )}
                </div>
              </details>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

