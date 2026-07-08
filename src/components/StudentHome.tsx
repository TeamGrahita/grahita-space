import React from "react";
import { useApp } from "../context/AppContext";
import { translations } from "../lib/translations";
import { 
  Instagram, 
  Youtube, 
  Mail, 
  HeartPulse, 
  GraduationCap, 
  MessageSquare, 
  ClipboardCheck, 
  BookOpen, 
  CalendarDays,
  Users,
  Activity
} from "lucide-react";

interface StudentHomeProps {
  setActiveTab: (tab: string) => void;
}

export const StudentHome: React.FC<StudentHomeProps> = ({ setActiveTab }) => {
  const { lang, currentUser } = useApp();
  const t = translations[lang];

  // custom tiktok icon
  const TikTokIcon = () => (
    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.74-3.94-1.74-.22-.2-.42-.43-.61-.67-.02 3.12-.01 6.24-.02 9.35-.07 2.16-.94 4.31-2.69 5.54-1.89 1.36-4.49 1.72-6.72 1.01-2.45-.74-4.51-2.73-5.06-5.24-.69-2.97.45-6.23 2.92-7.85 1.51-.99 3.39-1.29 5.14-.92v4.09c-.93-.24-1.95-.08-2.73.5-.89.63-1.39 1.74-1.25 2.83.1 1.05.86 1.99 1.89 2.21 1.01.25 2.15-.17 2.65-1.07.24-.4.32-.88.31-1.35-.01-5.11-.01-10.22-.01-15.33z"/>
    </svg>
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="glass-panel-heavy rounded-3xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-12 -translate-y-12">
          <Activity className="w-64 h-64 text-[#00D9A0]" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <span className="px-3 py-1 bg-[#00D9A0]/10 border border-[#00D9A0]/20 text-[#00D9A0] rounded-full text-[10px] font-mono tracking-wider uppercase font-semibold">
            {t.appName} Companion
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold font-display text-white mt-4 leading-tight tracking-tight">
            {lang === "id" ? `Halo, ${currentUser?.fullName || "Siswa"}!` : `Hello, ${currentUser?.fullName || "Student"}!`}
          </h2>
          <p className="text-[#8C90AC] text-sm md:text-base mt-2.5 leading-relaxed font-sans">
            {t.home.subtitle}
          </p>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div>
        <h3 className="text-base font-bold text-white tracking-tight font-display mb-4 flex items-center gap-2">
          <span className="w-1.5 h-4.5 bg-[#00D9A0] rounded-full"></span>
          {t.home.quickLinks}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Health biometrics */}
          <button
            onClick={() => setActiveTab("health")}
            className="group text-left p-6 glass-panel rounded-2xl flex gap-4 cursor-pointer"
          >
            <div className="p-3 bg-[#00D9A0]/10 rounded-xl text-[#00D9A0] group-hover:bg-[#00D9A0] group-hover:text-[#00281C] transition-all duration-300">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-[#00D9A0] font-display transition-colors">{t.health.title}</h4>
              <p className="text-xs text-[#8C90AC] mt-1.5 leading-relaxed">
                {lang === "id" ? "Pantau BPM, HRV harian, dan panduan edukasi stres kognitif." : "Monitor heart rate, daily HRV, and cognitive stress guide."}
              </p>
            </div>
          </button>

          {/* Academic progress */}
          <button
            onClick={() => setActiveTab("academic")}
            className="group text-left p-6 glass-panel rounded-2xl flex gap-4 cursor-pointer"
          >
            <div className="p-3 bg-[#00D9A0]/10 rounded-xl text-[#00D9A0] group-hover:bg-[#00D9A0] group-hover:text-[#00281C] transition-all duration-300">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-[#00D9A0] font-display transition-colors">{t.academic.title}</h4>
              <p className="text-xs text-[#8C90AC] mt-1.5 leading-relaxed">
                {lang === "id" ? "Evaluasi kognitif mata pelajaran, rata-rata nilai semester." : "Evaluate subject stress loads and semester grades."}
              </p>
            </div>
          </button>

          {/* Self-care & Counseling */}
          <button
            onClick={() => setActiveTab("advice")}
            className="group text-left p-6 glass-panel rounded-2xl flex gap-4 cursor-pointer"
          >
            <div className="p-3 bg-[#00D9A0]/10 rounded-xl text-[#00D9A0] group-hover:bg-[#00D9A0] group-hover:text-[#00281C] transition-all duration-300">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-[#00D9A0] font-display transition-colors">{t.advice.title}</h4>
              <p className="text-xs text-[#8C90AC] mt-1.5 leading-relaxed">
                {lang === "id" ? "Validasi emosi harian, saran kognitif AI, dan masukan bimbingan Guru BK." : "Emotional validations, AI recommendations, and BK Counselor notes."}
              </p>
            </div>
          </button>

          {/* Chat assistant */}
          <button
            onClick={() => setActiveTab("chat")}
            className="group text-left p-6 glass-panel rounded-2xl flex gap-4 cursor-pointer"
          >
            <div className="p-3 bg-[#00D9A0]/10 rounded-xl text-[#00D9A0] group-hover:bg-[#00D9A0] group-hover:text-[#00281C] transition-all duration-300">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-[#00D9A0] font-display transition-colors">{t.chat.title}</h4>
              <p className="text-xs text-[#8C90AC] mt-1.5 leading-relaxed">
                {lang === "id" ? "Konsultasi krisis 24/7 dengan Graphite AI seputar fokus & rileks." : "24/7 chat with Graphite AI about focus and exam coping tips."}
              </p>
            </div>
          </button>

          {/* Educational articles */}
          <button
            onClick={() => setActiveTab("articles")}
            className="group text-left p-6 glass-panel rounded-2xl flex gap-4 cursor-pointer"
          >
            <div className="p-3 bg-[#00D9A0]/10 rounded-xl text-[#00D9A0] group-hover:bg-[#00D9A0] group-hover:text-[#00281C] transition-all duration-300">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-[#00D9A0] font-display transition-colors">{t.articles.title}</h4>
              <p className="text-xs text-[#8C90AC] mt-1.5 leading-relaxed">
                {lang === "id" ? "Kumpulan jurnal sains kebiasaan sehat kognitif & tidur." : "Scientific publications on healthy sleep hygiene & mental wellness."}
              </p>
            </div>
          </button>

          {/* Consultation referrals */}
          <button
            onClick={() => setActiveTab("consultation")}
            className="group text-left p-6 glass-panel rounded-2xl flex gap-4 cursor-pointer"
          >
            <div className="p-3 bg-[#00D9A0]/10 rounded-xl text-[#00D9A0] group-hover:bg-[#00D9A0] group-hover:text-[#00281C] transition-all duration-300">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-[#00D9A0] font-display transition-colors">{t.consult.title}</h4>
              <p className="text-xs text-[#8C90AC] mt-1.5 leading-relaxed">
                {lang === "id" ? "Rujukan booking dengan psikolog/psikiater di luar sekolah." : "Schedule consulting with clinical psychologists outside school."}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* About Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
        {/* About */}
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="text-base font-bold text-white tracking-tight font-display mb-3 flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-[#00D9A0]" />
            {t.home.aboutTitle}
          </h3>
          <p className="text-sm text-[#8C90AC] leading-relaxed text-justify font-sans">
            {t.home.aboutDesc}
          </p>
        </div>

        {/* Team & Social Connect */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight font-display mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#00D9A0]" />
              {t.home.teamTitle}
            </h3>
            <p className="text-sm text-[#8C90AC] leading-relaxed text-justify mb-4 font-sans">
              {t.home.teamDesc}
            </p>
          </div>

          <div className="pt-4 border-t border-[#33374F]/50">
            <h4 className="text-xs font-semibold text-[#8C90AC] uppercase tracking-wider font-mono mb-3">{t.home.socialConnect}</h4>
            <div className="flex flex-wrap gap-2.5">
              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-[#282C4E]/40 hover:bg-[#00D9A0] hover:text-[#00281C] text-white border border-white/10 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all duration-200 cursor-pointer shadow-sm"
              >
                <Instagram className="w-4 h-4 text-[#3FA9E0]" />
                Instagram
              </a>

              {/* TikTok */}
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-[#282C4E]/40 hover:bg-[#00D9A0] hover:text-[#00281C] text-white border border-white/10 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all duration-200 cursor-pointer shadow-sm"
              >
                <TikTokIcon />
                TikTok
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-[#282C4E]/40 hover:bg-[#00D9A0] hover:text-[#00281C] text-white border border-white/10 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all duration-200 cursor-pointer shadow-sm"
              >
                <Youtube className="w-4 h-4 text-[#F2545B]" />
                YouTube
              </a>

              {/* Email */}
              <a
                href="mailto:team@grahita.space"
                className="px-4 py-2 bg-[#282C4E]/40 hover:bg-[#00D9A0] hover:text-[#00281C] text-white border border-white/10 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all duration-200 cursor-pointer shadow-sm"
              >
                <Mail className="w-4 h-4 text-[#00D9A0]" />
                Email
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
