import React from "react";
import { useApp } from "../context/AppContext";
import { translations } from "../lib/translations";
import { 
  Heart, 
  Activity, 
  GraduationCap, 
  UserSquare2, 
  Sparkles, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle2,
  CalendarDays,
  Clock
} from "lucide-react";

export const ParentDashboard: React.FC = () => {
  const { lang, currentUser, students } = useApp();
  const t = translations[lang];

  // Retrieve child profile (defaults to "siswa" - Rian Aditya)
  const childUsername = currentUser?.linkedChildUsername || "siswa";
  const childProfile = students[childUsername];

  if (!childProfile) {
    return (
      <div className="text-center p-12 bg-[#161A33]/90 border border-[#33374F]/50 rounded-2xl text-[#8C90AC]">
        {lang === "id" ? "Profil anak Anda tidak ditemukan." : "Your child's profile was not found."}
      </div>
    );
  }

  const history = childProfile.biometricsHistory || [];
  const grades = childProfile.grades || [];
  const latestBiometric = history[history.length - 1];
  const isConnected = childProfile.isConnected;

  const bpmValue = latestBiometric ? latestBiometric.bpm : 0;
  const hrvValue = latestBiometric ? latestBiometric.hrv : 0;
  const stressStatus = latestBiometric ? latestBiometric.status : "optimal";

  // System advice recommendations matching student advice logic
  const getSystemAdvice = () => {
    if (bpmValue > 100 || hrvValue < 35 || stressStatus === "overload") {
      return {
        titleId: "Dukungan Relaksasi & Istirahat (Penting)",
        titleEn: "Relaxation Support Needed (Critical)",
        descId: "Anak Anda sedang menunjukkan tingkat kelelahan kognitif atau ketegangan tinggi. Dorong dia untuk mengambil waktu istirahat yang cukup malam ini dan batasi screen time belajarnya sebelum tidur.",
        descEn: "Your child is exhibiting high cognitive tension or academic exhaustion. Encourage them to take substantial breaks tonight and regulate their screen study duration."
      };
    }
    return {
      titleId: "Status Kognitif Stabil & Terfokus (Sehat)",
      titleEn: "Stable & Focused Cognitive Status (Healthy)",
      descId: "Anak Anda terpantau sangat stabil dan terfokus kognitif. Kondisi emosi dan fisiknya ideal untuk belajar mandiri secara efisien. Tetap pertahankan iklim komunikasi keluarga yang positif.",
      descEn: "Your child's metrics indicate stable and focused stress resilience. Their biometric levels are ideal for productive learning. Maintain positive family conversations."
    };
  };

  const adviceObj = getSystemAdvice();
  const latestCounselorNotes = childProfile.counselorNotes || [];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight font-sans flex items-center gap-2">
            <UserSquare2 className="w-6.5 h-6.5 text-[#00D9A0]" />
            {lang === "id" ? `Dasbor Wali Murid (Anak: ${childProfile.fullName})` : `Parent Monitoring Hub (Child: ${childProfile.fullName})`}
          </h2>
          <p className="text-sm text-[#8C90AC] mt-1">
            {lang === "id" ? "Portal pantauan biometrik, performa studi, dan pesan saran dari Guru BK sekolah." : "Portal for monitoring your child's physiological metrics, school grades, and counseling logs."}
          </p>
        </div>

        {isConnected && latestBiometric && (
          <div className={`px-4 py-1.5 border rounded-full text-xs font-semibold flex items-center gap-1.5 font-sans capitalize ${
            stressStatus === "optimal" ? "bg-[#00D9A0]/10 border-[#00D9A0]/20 text-[#00D9A0]" :
            stressStatus === "load" ? "bg-[#F5B450]/10 border-[#F5B450]/20 text-[#F5B450]" :
            "bg-[#F2545B]/10 border-[#F2545B]/20 text-[#F2545B]"
          }`}>
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                stressStatus === "optimal" ? "bg-[#00D9A0]" : stressStatus === "load" ? "bg-[#F5B450]" : "bg-[#F2545B]"
              }`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                stressStatus === "optimal" ? "bg-[#00D9A0]" : stressStatus === "load" ? "bg-[#F5B450]" : "bg-[#F2545B]"
              }`} />
            </span>
            {t.common.status}: {stressStatus}
          </div>
        )}
      </div>

      {/* Child Real-time Biometrics Stream */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Child BPM Card */}
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute right-4 top-4 text-[#F2545B]">
            <Heart className={`w-5 h-5 ${stressStatus === "overload" ? "animate-ping" : "animate-pulse"}`} />
          </div>
          <span className="text-xs font-semibold text-[#8C90AC] uppercase tracking-wider font-mono">
            Child Heart Rate (BPM)
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl md:text-5xl font-extrabold text-white font-display tracking-tight">
              {isConnected ? bpmValue : "—"}
            </span>
            <span className="text-sm font-semibold text-[#8C90AC]">BPM</span>
          </div>
          <span className="text-[11px] text-[#8C90AC] block mt-3 font-mono">
            {isConnected ? "Live telemetry active" : "Band offline - waiting for data"}
          </span>
        </div>

        {/* Child HRV Card */}
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute right-4 top-4 text-[#3FA9E0]">
            <Activity className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-[#8C90AC] uppercase tracking-wider font-mono">
            Child HRV (Variabilitas Detak Jantung)
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl md:text-5xl font-extrabold text-white font-display tracking-tight">
              {isConnected ? hrvValue : "—"}
            </span>
            <span className="text-sm font-semibold text-[#8C90AC]">ms</span>
          </div>
          <span className="text-[11px] text-[#8C90AC] block mt-3 font-mono">
            {isConnected ? (hrvValue > 55 ? "Optimal Resilience" : "Tension detected") : "Reconnect band"}
          </span>
        </div>

        {/* Child Quick Academic GPA Summary */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between col-span-1 md:col-span-2 lg:col-span-1">
          <div>
            <span className="text-xs font-semibold text-[#8C90AC] uppercase tracking-wider font-mono">
              Child School Grade Average
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl md:text-5xl font-extrabold text-white font-display tracking-tight">
                {grades.length > 0 ? (grades.reduce((sum, g) => sum + g.grade, 0) / grades.length).toFixed(1) : "-"}
              </span>
              <span className="text-sm font-semibold text-[#8C90AC]">/ 100</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#00D9A0] font-mono mt-3">
            <GraduationCap className="w-4 h-4" />
            <span>Passed 6 Core Subject exams</span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Academic grades scorecard table (2 columns) */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-5 space-y-4">
          <div className="border-b border-[#33374F]/40 pb-3">
            <h3 className="text-sm font-bold text-white font-display">
              {lang === "id" ? "Evaluasi Akademik Semester 1" : "Academic Evaluation Report (Term 1)"}
            </h3>
            <p className="text-xs text-[#8C90AC] mt-0.5">
              {lang === "id" ? "Beban kognitif stres per mata pelajaran diukur melalui Grahita Band." : "Child's physiological stress metrics per subject measured during study sessions."}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#8C90AC]">
              <thead>
                <tr className="border-b border-[#33374F]/30 text-[10px] uppercase font-mono tracking-wider">
                  <th className="pb-2">{lang === "id" ? "Mata Pelajaran" : "Subject"}</th>
                  <th className="pb-2 text-center">{lang === "id" ? "Nilai Akhir" : "Grade Score"}</th>
                  <th className="pb-2 text-right">{lang === "id" ? "Beban Stres Belajar" : "Study Stress Load"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#33374F]/20">
                {grades.map((g, idx) => (
                  <tr key={idx} className="hover:bg-[#1E2240]/40 transition-colors">
                    <td className="py-3 font-semibold text-white">
                      {lang === "id" ? g.subjectNameId : g.subjectNameEn}
                    </td>
                    <td className="py-3 text-center font-mono text-white font-bold">
                      {g.grade}
                    </td>
                    <td className="py-3 text-right">
                      <span className={`px-2 py-0.5 border rounded-full text-[9px] font-mono font-bold uppercase ${
                        g.stressStatus === "optimal" ? "bg-[#00D9A0]/10 text-[#00D9A0] border-[#00D9A0]/20" :
                        g.stressStatus === "load" ? "bg-[#F5B450]/10 text-[#F5B450] border-[#F5B450]/20" :
                        "bg-[#F2545B]/10 text-[#F2545B] border-[#F2545B]/20"
                      }`}>
                        {g.stressStatus === "optimal" ? t.status.optimal : g.stressStatus === "load" ? t.status.load : t.status.overload}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System & Counselor Recommendations (1 column) */}
        <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white font-display">
              {lang === "id" ? "Saran Dukungan Rumah" : "Home Wellness Guidance"}
            </h3>
            <span className="text-[11px] text-[#8C90AC] block leading-relaxed">
              Auto-generated insights from your child's physiological data and questionnaire answers.
            </span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4 my-2 space-y-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#00D9A0] animate-pulse" />
              {lang === "id" ? adviceObj.titleId : adviceObj.titleEn}
            </h4>
            <p className="text-xs text-[#8C90AC] leading-relaxed text-justify">
              {lang === "id" ? adviceObj.descId : adviceObj.descEn}
            </p>
          </div>

          {/* Alert flag */}
          {stressStatus === "overload" && (
            <div className="p-3 bg-[#F2545B]/10 border border-[#F2545B]/20 text-[#F2545B] rounded-xl flex items-start gap-2 text-[10px] leading-relaxed">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Warning:</strong> High study pressure detected on your child's Grahita Band. Ensure they get sufficient rest and avoid late-night study burnout.
              </span>
            </div>
          )}

          <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-[10px] text-[#8C90AC] leading-relaxed text-center">
            {lang === "id" ? "Diperbarui waktu nyata" : "Real-time parenting feedback"}
          </div>
        </div>

      </div>

      {/* Counseling written by Counselor BK (Guru BK) Solutions */}
      <div className="glass-panel rounded-2xl p-5">
        <div className="border-b border-[#33374F]/50 pb-3">
          <h3 className="text-sm font-bold text-white font-display flex items-center gap-1.5">
            <UserSquare2 className="w-4.5 h-4.5 text-[#00D9A0]" />
            Official School Counseling solutions note (Ibu Indah, S.Psi)
          </h3>
          <p className="text-xs text-[#8C90AC] mt-0.5">
            Suggestions submitted by the school psychologist based on biometric telemetry history.
          </p>
        </div>

        <div className="divide-y divide-[#33374F]/30 max-h-80 overflow-y-auto pr-1">
          {latestCounselorNotes.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#8C90AC] italic">
              {lang === "id" ? "Belum ada catatan bimbingan konseling dari Guru BK sekolah." : "No counselor intervention logs published yet."}
            </div>
          ) : (
            latestCounselorNotes.map((note, idx) => (
              <div key={idx} className="py-3.5 space-y-1.5 first:pt-2.5 last:pb-2">
                <div className="flex justify-between items-center text-xs text-[#8C90AC]">
                  <span className="font-bold text-white flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-[#00D9A0] rounded-full" />
                    {note.counselorName} <span className="text-[9px] bg-[#00D9A0]/10 text-[#00D9A0] px-1 rounded ml-1 font-mono uppercase">Advisor</span>
                  </span>
                  <span className="font-mono text-[11px]">
                    {new Date(note.timestamp).toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
                {/* Free text written by counselor displayed exactly as entered */}
                <p className="text-xs text-[#E2E5FF] leading-relaxed whitespace-pre-wrap pl-2.5 border-l-2 border-[#33374F]">
                  {note.text}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
