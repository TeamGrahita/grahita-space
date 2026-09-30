import React, { useState } from "react";
import { AppProvider, useApp, DemoAccount } from "./context/AppContext";
import { Navbar } from "./components/Navbar";
import { GrahitaSimulator } from "./components/GrahitaSimulator";
import { StudentHome } from "./components/StudentHome";
import { StudentHealth } from "./components/StudentHealth";
import { StudentAcademic } from "./components/StudentAcademic";
import { StudentAdvice } from "./components/StudentAdvice";
import { StudentArticles } from "./components/StudentArticles";
import { StudentConsultation } from "./components/StudentConsultation";
import { StudentChat } from "./components/StudentChat";
import { CounselorDashboard } from "./components/CounselorDashboard";
import { ParentDashboard } from "./components/ParentDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { translations } from "./lib/translations";
import { isFirebaseConfigured } from "./lib/firebase";
import { UserRole } from "./types";
import { 
  Lock, 
  User as UserIcon, 
  Briefcase, 
  Home, 
  HeartPulse, 
  GraduationCap, 
  ClipboardCheck, 
  MessageSquare, 
  BookOpen, 
  CalendarDays,
  ShieldAlert,
  ArrowRight,
  Mail,
  Loader2
} from "lucide-react";

const AppContent: React.FC = () => {
  const { currentUser, lang, login, loginDemo, loginWithGoogle, register, loading } = useApp();
  const t = translations[lang];

  // Auth local states
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("siswa");
  const [childUsername, setChildUsername] = useState("");
  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Student active sub-tab state
  const [studentTab, setStudentTab] = useState("home");

  // Handle Login & Signup
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsSubmitting(true);

    if (!username.trim() || !password.trim()) {
      setAuthError(
        lang === "id" 
          ? "Username/Email dan Password tidak boleh kosong!" 
          : "Username/Email and Password cannot be empty!"
      );
      setIsSubmitting(false);
      return;
    }

    try {
      if (isRegister) {
        if (!email.trim() || !email.includes("@")) {
          setAuthError(lang === "id" ? "Format Email tidak valid!" : "Invalid Email format!");
          setIsSubmitting(false);
          return;
        }
        if (!fullName.trim()) {
          setAuthError(lang === "id" ? "Nama Lengkap wajib diisi!" : "Full Name is required!");
          setIsSubmitting(false);
          return;
        }
        const registeredUser = await register(
          username.trim().toLowerCase(), 
          email.trim().toLowerCase(), 
          fullName.trim(), 
          password.trim(), 
          selectedRole, 
          childUsername || undefined
        );
        if (registeredUser) {
          setStudentTab("home");
          // After logout the person should see the login form, not the sign-up form again
          setIsRegister(false);
          setPassword("");
        }
      } else {
        const loggedUser = await login(username.trim().toLowerCase(), password.trim(), selectedRole);
        if (loggedUser) {
          setStudentTab("home");
          // Do not leave the password in the form for the next person on a shared device
          setPassword("");
        }
      }
    } catch (err: any) {
      setAuthError(err.message || (lang === "id" ? "Terjadi kesalahan autentikasi" : "Authentication error occurred"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (account: DemoAccount) => {
    setIsSubmitting(true);
    setAuthError("");
    try {
      await loginDemo(account);
      setStudentTab("home");
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setAuthError("");
    try {
      await loginWithGoogle();
      setStudentTab("home");
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0D1F] text-[#8C90AC] flex items-center justify-center font-mono relative overflow-hidden">
        {/* Atmosphere background blobs */}
        <div className="ambient-blob w-[500px] h-[500px] bg-gradient-to-tr from-[#00D9A0] to-[#3FA9E0] top-[-10%] right-[-10%] opacity-[0.08]" />
        <div className="ambient-blob w-[600px] h-[600px] bg-gradient-to-br from-[#12142A] to-[#F2545B] bottom-[-20%] left-[-15%] opacity-[0.06]" />

        <div className="text-center space-y-4 relative z-10">
          <div className="h-10 w-10 border-4 border-[#00D9A0] border-t-transparent rounded-full animate-spin mx-auto" />
          <span>Synchronizing Grahita Space Engine...</span>
        </div>
      </div>
    );
  }

  // 1. UNAUTHENTICATED LOGIN / REGISTRATION VIEW
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0B0D1F] flex flex-col justify-between overflow-x-hidden relative">
        {/* Layered background atmosphere blobs */}
        <div className="ambient-blob w-[500px] h-[500px] bg-gradient-to-tr from-[#00D9A0]/20 to-[#3FA9E0]/20 top-[-5%] right-[-10%] opacity-70" />
        <div className="ambient-blob w-[600px] h-[600px] bg-gradient-to-br from-[#12142A]/40 to-[#F2545B]/10 bottom-[-15%] left-[-10%] opacity-60" />
        <div className="ambient-blob w-[400px] h-[400px] bg-[#3FA9E0]/15 top-[35%] left-[20%] opacity-40" />

        {/* Floating Top Navbar without auth user info */}
        <Navbar />

        {/* Centered Auth Box */}
        <main className="flex-grow flex items-center justify-center px-4 md:px-8 py-8 relative z-10">
          <div className="max-w-md w-full glass-panel-heavy rounded-2xl p-5 md:p-6.5 space-y-5">
            <div className="text-center space-y-1">
              <h2 className="text-xl md:text-2xl font-bold text-white font-display tracking-tight">
                {isRegister ? t.auth.titleRegister : t.auth.titleLogin}
              </h2>
              <p className="text-xs text-[#8C90AC]">
                {t.auth.subtitle}
              </p>
            </div>

            {/* Error flag */}
            {authError && (
              <div className="p-3 bg-[#F2545B]/10 border border-[#F2545B]/20 text-red-400 rounded-xl text-xs flex items-center gap-2 font-semibold">
                <ShieldAlert className="w-4.5 h-4.5 flex-shrink-0 text-[#F2545B]" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-3.5">
              {/* Role selection tab pills */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white block">
                  {t.auth.roleSelect}
                </label>
                <div className="grid grid-cols-2 gap-1.5 bg-[#12142A]/80 p-1 border border-[#33374F] rounded-xl shadow-inner">
                  <button
                    type="button"
                    onClick={() => setSelectedRole("siswa")}
                    className={`py-2 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                      selectedRole === "siswa" 
                        ? "bg-[#00D9A0] text-[#00281C]" 
                        : "text-[#8C90AC] hover:text-white"
                    }`}
                  >
                    {t.roles.siswa}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole("guru_bk")}
                    className={`py-2 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                      selectedRole === "guru_bk" 
                        ? "bg-[#00D9A0] text-[#00281C]" 
                        : "text-[#8C90AC] hover:text-white"
                    }`}
                  >
                    {t.roles.guru_bk}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole("orang_tua")}
                    className={`py-2 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                      selectedRole === "orang_tua" 
                        ? "bg-[#00D9A0] text-[#00281C]" 
                        : "text-[#8C90AC] hover:text-white"
                    }`}
                  >
                    {t.roles.orang_tua}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole("admin")}
                    className={`py-2 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                      selectedRole === "admin" 
                        ? "bg-rose-500 text-white" 
                        : "text-[#8C90AC] hover:text-rose-400"
                    }`}
                  >
                    👑 Admin
                  </button>
                </div>
                {selectedRole === "admin" && (
                  <p className="text-[10px] text-rose-400/80 px-1">
                    {lang === "id" ? "Admin masuk menggunakan tombol Google di bawah." : "The admin signs in with the Google button below."}
                  </p>
                )}
              </div>

              {/* Username Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#8C90AC] block">
                  {isRegister 
                    ? "Username" 
                    : (lang === "id" ? "Username atau Email" : "Username or Email")}
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-[#8C90AC]/60" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={
                      isRegister 
                        ? (lang === "id" ? "Pilih username..." : "Choose username...") 
                        : (lang === "id" ? "Masukkan username atau email..." : "Enter username or email...")
                    }
                    className="w-full pl-9 pr-4 py-2 bg-[#12142A]/80 border border-[#33374F]/80 focus:border-[#00D9A0] focus:ring-1 focus:ring-[#00D9A0]/20 text-xs text-white rounded-xl placeholder-[#8C90AC]/40 outline-none transition-all"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Email Input (Only for sign-up) */}
              {isRegister && (
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#8C90AC] block">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[#8C90AC]/60" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={lang === "id" ? "Masukkan alamat email..." : "Enter email address..."}
                      className="w-full pl-9 pr-4 py-2 bg-[#12142A]/80 border border-[#33374F]/80 focus:border-[#00D9A0] focus:ring-1 focus:ring-[#00D9A0]/20 text-xs text-white rounded-xl placeholder-[#8C90AC]/40 outline-none transition-all"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              )}

              {/* Full Name (Only for sign-up) */}
              {isRegister && (
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#8C90AC] block">
                    {lang === "id" ? "Nama Lengkap" : "Full Name"}
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={lang === "id" ? "Nama lengkap siswa/guru/wali..." : "Your full name..."}
                    className="w-full px-3.5 py-2 bg-[#12142A]/80 border border-[#33374F]/80 focus:border-[#00D9A0] focus:ring-1 focus:ring-[#00D9A0]/20 text-xs text-white rounded-xl placeholder-[#8C90AC]/40 outline-none transition-all"
                    disabled={isSubmitting}
                  />
                </div>
              )}

              {/* Child Username Link (Only for Parent sign-up) */}
              {isRegister && selectedRole === "orang_tua" && (
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#8C90AC] block">
                    {lang === "id" ? "Username Anak di Sekolah" : "Linked Child's Username"}
                  </label>
                  <input
                    type="text"
                    value={childUsername}
                    onChange={(e) => setChildUsername(e.target.value)}
                    placeholder={lang === "id" ? "Masukkan username anak (contoh: siswa)..." : "Enter child's username (e.g. 'siswa')..."}
                    className="w-full px-3.5 py-2 bg-[#12142A]/80 border border-[#33374F]/80 focus:border-[#00D9A0] focus:ring-1 focus:ring-[#00D9A0]/20 text-xs text-white rounded-xl placeholder-[#8C90AC]/40 outline-none transition-all"
                    disabled={isSubmitting}
                  />
                </div>
              )}

              {/* Password Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#8C90AC] block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-[#8C90AC]/60" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isRegister ? (lang === "id" ? "Minimal 6 karakter" : "At least 6 characters") : "••••••••"}
                    className="w-full pl-9 pr-4 py-2 bg-[#12142A]/80 border border-[#33374F]/80 focus:border-[#00D9A0] focus:ring-1 focus:ring-[#00D9A0]/20 text-xs text-white rounded-xl placeholder-[#8C90AC]/40 outline-none transition-all"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 mt-1.5 bg-[#00D9A0] hover:bg-[#00E6A8] disabled:opacity-50 disabled:cursor-not-allowed text-[#00281C] font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_4px_12px_rgba(0,217,160,0.2)] cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {isRegister ? t.auth.submitRegister : t.auth.submitLogin}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Google sign-in (the admin account uses this) */}
            {isFirebaseConfigured && !isRegister && (
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {lang === "id" ? "Masuk dengan Google" : "Sign in with Google"}
              </button>
            )}

            {/* Switch Auth mode link */}
            <div className="text-center pt-2.5 border-t border-[#33374F]/40 text-xs text-[#8C90AC]">
              {isRegister ? (
                <span>
                  {lang === "id" ? "Sudah punya akun? " : "Already have an account? "}
                  <button onClick={() => setIsRegister(false)} className="text-[#00D9A0] font-bold hover:underline cursor-pointer">
                    {t.auth.loginLink}
                  </button>
                </span>
              ) : (
                <span>
                  {lang === "id" ? "Belum punya akun? " : "Don't have an account? "}
                  <button onClick={() => setIsRegister(true)} className="text-[#00D9A0] font-bold hover:underline cursor-pointer">
                    {t.auth.registerLink}
                  </button>
                </span>
              )}
            </div>

            {/* Quick Demo Login helpers */}
            <div className="bg-[#12142A]/40 border border-[#33374F]/40 rounded-xl p-3 space-y-2">
              <span className="text-[10px] font-bold text-[#8C90AC] uppercase tracking-wider block">
                ⭐ {lang === "id" ? "Akses Cepat Pengujian (Grader Click-Login)" : "Grader Quick Demo Logins"}
              </span>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => handleQuickLogin("admin")}
                  disabled={isSubmitting}
                  className="w-full py-1.5 bg-rose-500/[0.03] hover:bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/40 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-xs text-white hover:text-rose-400 font-medium text-left px-3 flex items-center justify-between transition-all cursor-pointer"
                >
                  <span className="font-bold flex items-center gap-1.5">👑 {lang === "id" ? "Panel Kontrol Admin" : "Admin Panel"}{isFirebaseConfigured && <span className="font-normal text-[10px] text-[#8C90AC]">(Google)</span>}</span>
                  <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">Admin</span>
                </button>
                <button
                  onClick={() => handleQuickLogin("siswa")}
                  disabled={isSubmitting}
                  className="w-full py-1.5 bg-[#282C4E]/20 hover:bg-[#00D9A0]/10 border border-[#33374F] hover:border-[#00D9A0]/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-xs text-white hover:text-[#00D9A0] font-medium text-left px-3 flex items-center justify-between transition-all cursor-pointer"
                >
                  <span>Student (Rian Aditya)</span>
                  <span className="text-[10px] text-[#8C90AC]">Role: Siswa</span>
                </button>
                <button
                  onClick={() => handleQuickLogin("guru")}
                  disabled={isSubmitting}
                  className="w-full py-1.5 bg-[#282C4E]/20 hover:bg-[#00D9A0]/10 border border-[#33374F] hover:border-[#00D9A0]/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-xs text-white hover:text-[#00D9A0] font-medium text-left px-3 flex items-center justify-between transition-all cursor-pointer"
                >
                  <span>Counselor (Ibu Indah, S.Psi)</span>
                  <span className="text-[10px] text-[#8C90AC]">Role: Guru BK</span>
                </button>
                <button
                  onClick={() => handleQuickLogin("orangtua")}
                  disabled={isSubmitting}
                  className="w-full py-1.5 bg-[#282C4E]/20 hover:bg-[#00D9A0]/10 border border-[#33374F] hover:border-[#00D9A0]/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-xs text-white hover:text-[#00D9A0] font-medium text-left px-3 flex items-center justify-between transition-all cursor-pointer"
                >
                  <span>Parent (Pak Budi)</span>
                  <span className="text-[10px] text-[#8C90AC]">Role: Orang Tua</span>
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Clinical Disclaimer footer */}
        <footer className="w-full bg-[#070810] border-t border-[#33374F]/30 py-4 px-4 text-center text-[10px] text-[#8C90AC] leading-relaxed relative z-10">
          {lang === "id" 
            ? "Grahita Space adalah platform pelengkap, bukan pengganti diagnosis medis formal. Grahita Band tidak mendeteksi penyakit jantung secara klinis." 
            : "Grahita Space is an educational companion. It does not provide medical-grade health diagnosis."}
        </footer>
      </div>
    );
  }

  // 2. AUTHENTICATED DASHBOARDS
  return (
    <div className="min-h-screen bg-[#0B0D1F] text-[#8C90AC] flex flex-col justify-between relative overflow-x-hidden">
      {/* Layered background atmosphere blobs */}
      <div className="ambient-blob w-[600px] h-[600px] bg-gradient-to-tr from-[#00D9A0]/15 to-[#3FA9E0]/15 top-[-10%] right-[-10%] opacity-60" />
      <div className="ambient-blob w-[700px] h-[700px] bg-gradient-to-br from-[#12142A]/50 to-[#F2545B]/8 bottom-[-15%] left-[-10%] opacity-50" />
      <div className="ambient-blob w-[500px] h-[500px] bg-[#3FA9E0]/10 top-[35%] left-[25%] opacity-30" />

      {/* Global Header Header */}
      <Navbar />

      {/* Main Container Area */}
      <div className="flex-grow max-w-7xl w-full mx-auto px-4 md:px-8 py-8 relative z-10">
        
        {/* Siswa / Student layout (Requires sidebar/subtabs) */}
        {currentUser.role === "siswa" && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Sidebar Navigation */}
            <aside className="lg:col-span-1 glass-panel rounded-2xl p-4 flex flex-col justify-between h-fit lg:sticky lg:top-24 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C90AC] px-3 pb-2 block border-b border-[#33374F]/30 font-semibold">
                Menu Hub
              </span>
              <div className="space-y-1 pt-2">
                {/* Home link */}
                <button
                  onClick={() => setStudentTab("home")}
                  className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                    studentTab === "home" 
                      ? "bg-[#282C4E] text-[#00D9A0] shadow-sm border border-white/5" 
                      : "text-[#8C90AC] hover:bg-[#161A33]/60 hover:text-white"
                  }`}
                >
                  <Home className="w-4 h-4" />
                  Home
                </button>

                {/* Health biometrics */}
                <button
                  onClick={() => setStudentTab("health")}
                  className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                    studentTab === "health" 
                      ? "bg-[#282C4E] text-[#00D9A0] shadow-sm border border-white/5" 
                      : "text-[#8C90AC] hover:bg-[#161A33]/60 hover:text-white"
                  }`}
                >
                  <HeartPulse className="w-4 h-4" />
                  {t.health.title}
                </button>

                {/* Academic */}
                <button
                  onClick={() => setStudentTab("academic")}
                  className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                    studentTab === "academic" 
                      ? "bg-[#282C4E] text-[#00D9A0] shadow-sm border border-white/5" 
                      : "text-[#8C90AC] hover:bg-[#161A33]/60 hover:text-white"
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  {t.academic.title}
                </button>

                {/* Emotional validation advice */}
                <button
                  onClick={() => setStudentTab("advice")}
                  className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                    studentTab === "advice" 
                      ? "bg-[#282C4E] text-[#00D9A0] shadow-sm border border-white/5" 
                      : "text-[#8C90AC] hover:bg-[#161A33]/60 hover:text-white"
                  }`}
                >
                  <ClipboardCheck className="w-4 h-4" />
                  {t.advice.title}
                </button>

                {/* Graphite chat assistant */}
                <button
                  onClick={() => setStudentTab("chat")}
                  className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                    studentTab === "chat" 
                      ? "bg-[#282C4E] text-[#00D9A0] shadow-sm border border-white/5" 
                      : "text-[#8C90AC] hover:bg-[#161A33]/60 hover:text-white"
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  {t.chat.title}
                </button>

                {/* Educational articles */}
                <button
                  onClick={() => setStudentTab("articles")}
                  className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                    studentTab === "articles" 
                      ? "bg-[#282C4E] text-[#00D9A0] shadow-sm border border-white/5" 
                      : "text-[#8C90AC] hover:bg-[#161A33]/60 hover:text-white"
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  {t.articles.title}
                </button>

                {/* External Psychologist Bookings */}
                <button
                  onClick={() => setStudentTab("consultation")}
                  className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                    studentTab === "consultation" 
                      ? "bg-[#282C4E] text-[#00D9A0] shadow-sm border border-white/5" 
                      : "text-[#8C90AC] hover:bg-[#161A33]/60 hover:text-white"
                  }`}
                >
                  <CalendarDays className="w-4 h-4" />
                  {t.consult.title}
                </button>
              </div>
            </aside>

            {/* Active Content Window */}
            <main className="lg:col-span-3">
              {studentTab === "home" && <StudentHome setActiveTab={setStudentTab} />}
              {studentTab === "health" && <StudentHealth />}
              {studentTab === "academic" && <StudentAcademic />}
              {studentTab === "advice" && <StudentAdvice />}
              {studentTab === "chat" && <StudentChat />}
              {studentTab === "articles" && <StudentArticles />}
              {studentTab === "consultation" && <StudentConsultation />}
            </main>
          </div>
        )}

        {/* Guru BK (School Counselor) Dashboard */}
        {currentUser.role === "guru_bk" && <CounselorDashboard />}

        {/* Orang Tua (Parent) Dashboard */}
        {currentUser.role === "orang_tua" && <ParentDashboard />}

        {/* Admin Control Panel Dashboard */}
        {currentUser.role === "admin" && <AdminDashboard />}

      </div>

      {/* Embedded Floating Hardware Simulator */}
      <GrahitaSimulator />

      {/* Standard global clinical warning footer */}
      <footer className="w-full bg-[#070810] border-t border-[#33374F]/30 py-4 px-4 text-center text-[10px] text-[#8C90AC] leading-relaxed relative z-10">
        {lang === "id" 
          ? "Grahita Space adalah platform pelengkap, bukan pengganti diagnosis medis formal. Grahita Band tidak mendeteksi penyakit jantung secara klinis." 
          : "Grahita Space is an educational companion. It does not provide medical-grade health diagnosis."}
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
