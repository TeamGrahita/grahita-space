import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { translations } from "../lib/translations";
import { StudentProfile, SubjectGrade } from "../types";
import { 
  Users, 
  Search, 
  Activity, 
  GraduationCap, 
  ClipboardCheck, 
  Send, 
  CheckCircle, 
  ChevronRight, 
  BookOpen, 
  Clock, 
  AlertTriangle 
} from "lucide-react";

export const CounselorDashboard: React.FC = () => {
  const { lang, students, addCounselorAdvice } = useApp();
  const t = translations[lang];

  const studentList = Object.values(students) as StudentProfile[];
  const [selectedUsername, setSelectedUsername] = useState<string>("siswa");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestionText, setSuggestionText] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Filter student roster
  const filteredStudents = studentList.filter(s => 
    s.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeStudent = students[selectedUsername];
  const activeGrades = activeStudent?.grades || [];
  const activeHistory = activeStudent?.biometricsHistory || [];
  const activeQuestionnaires = activeStudent?.questionnaires || [];

  const handleSendSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestionText.trim()) return;
    addCounselorAdvice(selectedUsername, suggestionText);
    setSuggestionText("");
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Helper to draw a stacked bar rank of subjects from worst/stressful to best/optimal
  const renderSubjectRankChart = (grades: SubjectGrade[]) => {
    // Sort grades in order: Overload first, then Load, then Optimal
    const sortedGrades = [...grades].sort((a, b) => {
      const scoreMap = { overload: 3, load: 2, optimal: 1 };
      return scoreMap[b.stressStatus] - scoreMap[a.stressStatus];
    });

    return (
      <div className="space-y-3.5 pt-2">
        {sortedGrades.map((g, idx) => {
          let barBg = "bg-[#F2545B]";
          let stressText = t.status.overload;
          let percentage = "w-[92%]";

          if (g.stressStatus === "load") {
            barBg = "bg-[#F5B450]";
            stressText = t.status.load;
            percentage = "w-[65%]";
          } else if (g.stressStatus === "optimal") {
            barBg = "bg-[#00D9A0]";
            stressText = t.status.optimal;
            percentage = "w-[30%]";
          }

          return (
            <div key={idx} className="space-y-1 group">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-white group-hover:text-[#00D9A0] transition-colors">
                  {lang === "id" ? g.subjectNameId : g.subjectNameEn}
                </span>
                <span className="font-mono text-[#8C90AC] text-[11px]">
                  Score: {g.grade} • <strong className="uppercase" style={{ color: g.stressStatus === "overload" ? "#F2545B" : g.stressStatus === "load" ? "#F5B450" : "#00D9A0" }}>{stressText}</strong>
                </span>
              </div>
              <div className="h-2 bg-[#12142A] rounded-full overflow-hidden w-full">
                <div 
                  className={`h-full ${barBg} rounded-full transition-all duration-500`}
                  style={{ width: g.stressStatus === "overload" ? "95%" : g.stressStatus === "load" ? "65%" : "30%" }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Counselor Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight font-sans flex items-center gap-2">
          <Users className="w-6.5 h-6.5 text-[#00D9A0]" />
          Counselor & BK Advisor Panel
        </h2>
        <p className="text-sm text-[#8C90AC] mt-1">
          {lang === "id" 
            ? "Roster integrasi biometrik stres kognitif siswa Grahita Band, pemantauan riwayat kuesioner, dan input saran intervensi akademik." 
            : "Roster integrating Grahita Band stress biometrics, emotional validation questionnaire archives, and counselor solutions feedback."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Student Roster listing */}
        <div className="glass-panel-heavy rounded-2xl p-4 md:p-5 space-y-4">
          <div className="space-y-1 border-b border-[#33374F]/40 pb-3">
            <h3 className="text-sm font-bold text-white font-display">
              {lang === "id" ? "Roster Siswa Terbimbing" : "Assigned Student Roster"}
            </h3>
            <span className="text-[11px] text-[#8C90AC] block">
              {lang === "id" ? "Pilih siswa untuk mengakses dasbor biometrik terperinci." : "Select a student to access detailed real-time physiological metrics."}
            </span>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#8C90AC]/70" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === "id" ? "Cari nama siswa..." : "Search student names..."}
              className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 focus:border-[#00D9A0] text-xs text-white rounded-xl placeholder-[#8C90AC]/50 outline-none transition-all"
            />
          </div>

          {/* Roster list */}
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {filteredStudents.map((student) => {
              const isActive = student.username === selectedUsername;
              const history = student.biometricsHistory || [];
              const latestReading = history[history.length - 1];
              const status = latestReading ? latestReading.status : "optimal";

              let statusColor = "bg-[#00D9A0]";
              let statusLabel = t.status.optimal;

              if (status === "load") {
                statusColor = "bg-[#F5B450]";
                statusLabel = t.status.load;
              } else if (status === "overload") {
                statusColor = "bg-[#F2545B]";
                statusLabel = t.status.overload;
              }

              return (
                <button
                  key={student.username}
                  onClick={() => setSelectedUsername(student.username)}
                  className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all duration-200 cursor-pointer ${
                    isActive 
                      ? "bg-white/10 border-[#00D9A0]/40 shadow-[0_0_12px_rgba(0,217,160,0.06)]" 
                      : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
                  }`}
                >
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white block font-sans">{student.fullName}</h4>
                    <span className="text-[10px] text-[#8C90AC] font-mono block">@{student.username}</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {/* Live biometrics tiny status info */}
                    {student.isConnected && latestReading ? (
                      <span className="text-[10px] font-mono text-[#8C90AC]">
                        {latestReading.bpm} BPM
                      </span>
                    ) : (
                      <span className="text-[9px] text-[#8C90AC]/60 font-mono italic">Offline</span>
                    )}

                    {/* Stress traffic indicator circle badge */}
                    <span 
                      title={statusLabel}
                      className={`h-2.5 w-2.5 rounded-full inline-block ${statusColor} ${status === "overload" ? "animate-pulse" : ""}`} 
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Middle and Right columns: Selected Student details (2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          {activeStudent ? (
            <>
              {/* Student Header Summary Card */}
              <div className="glass-panel rounded-2xl p-5 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-mono text-[#8C90AC] tracking-wider uppercase">Active Diagnostic</span>
                  <h3 className="text-xl font-bold text-white font-display">{activeStudent.fullName}</h3>
                  <div className="flex gap-4 items-center mt-1 text-xs text-[#8C90AC]">
                    <span>Grades Avg: <strong className="text-white">{activeGrades.length > 0 ? (activeGrades.reduce((sum, g) => sum + g.grade, 0) / activeGrades.length).toFixed(1) : "-"}</strong></span>
                    <span>•</span>
                    <span>Grahita Band: <strong className={activeStudent.isConnected ? "text-[#00D9A0]" : "text-[#8C90AC]"}>{activeStudent.isConnected ? "CONNECTED" : "OFFLINE"}</strong></span>
                  </div>
                </div>

                {activeStudent.isConnected && activeHistory.length > 0 && (
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3">
                    <div className="text-center">
                      <span className="text-[9px] text-[#8C90AC] uppercase font-mono block">BPM</span>
                      <strong className="text-lg text-white font-mono">{activeHistory[activeHistory.length - 1].bpm}</strong>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="text-center">
                      <span className="text-[9px] text-[#8C90AC] uppercase font-mono block">HRV</span>
                      <strong className="text-lg text-white font-mono">{activeHistory[activeHistory.length - 1].hrv}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Subject Stress Ranking Card */}
              <div className="glass-panel rounded-2xl p-5">
                <h4 className="text-xs font-semibold text-[#8C90AC] uppercase tracking-wider font-mono mb-2 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-[#00D9A0]" />
                  Cognitive Stress Load Subject Ranking
                </h4>
                <p className="text-[11px] text-[#8C90AC] leading-relaxed mb-4">
                  {lang === "id" 
                    ? "Mengurutkan mata pelajaran siswa dari yang paling membebani kognitif (Overload) hingga yang paling fokus/stabil (Optimal)." 
                    : "Ranking the student's subjects from the highest cognitive overload level down to the most focused/optimal."}
                </p>
                {renderSubjectRankChart(activeGrades)}
              </div>

              {/* Questionnaire History and Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Questionnaire history log */}
                <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between">
                  <h4 className="text-xs font-semibold text-[#8C90AC] uppercase tracking-wider font-mono mb-3.5 flex items-center gap-1.5">
                    <ClipboardCheck className="w-4 h-4 text-[#00D9A0]" />
                    Emotional Questionnaire Answers
                  </h4>

                  <div className="flex-grow space-y-3 overflow-y-auto max-h-56 pr-1">
                    {activeQuestionnaires.length === 0 ? (
                      <div className="text-center py-10 text-xs text-[#8C90AC] italic">
                        {lang === "id" ? "Siswa belum mengisi kuesioner akhir-akhir ini." : "No questionnaire submissions logged recently."}
                      </div>
                    ) : (
                      activeQuestionnaires.map((q, idx) => {
                        const moodEmoji = q.emojiScore <= 2 ? "😭" : q.emojiScore <= 4 ? "😞" : q.emojiScore <= 6 ? "😐" : q.emojiScore <= 8 ? "🙂" : "😊";
                        return (
                          <div key={idx} className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1.5 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-white flex items-center gap-1">
                                <span className="text-base">{moodEmoji}</span> Score: {q.emojiScore}/10
                              </span>
                              <span className="text-[10px] font-mono text-[#8C90AC]">
                                {new Date(q.timestamp).toLocaleDateString([], { day: "numeric", month: "short" })}
                              </span>
                            </div>
                            {/* Student's answer must display exactly as entered, so no auto translation of written notes */}
                            {q.notes && (
                              <p className="text-xs text-[#E2E5FF] bg-[#161A33]/50 p-2 rounded-lg italic border border-[#33374F]/40">
                                "{q.notes}"
                              </p>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Solution counseling submission form */}
                <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-[#8C90AC] uppercase tracking-wider font-mono mb-1 flex items-center gap-1.5">
                      <Send className="w-4 h-4 text-[#00D9A0]" />
                      Submit Intervention Notes
                    </h4>
                    <span className="text-[10px] text-[#8C90AC] block leading-relaxed mb-3">
                      Write solution advice that appears immediately on student & parent hub.
                    </span>
                  </div>

                  <form onSubmit={handleSendSuggestion} className="space-y-3.5">
                    <textarea
                      value={suggestionText}
                      onChange={(e) => setSuggestionText(e.target.value)}
                      placeholder={lang === "id" ? "Tuliskan saran penanganan relaksasi atau jadwal bimbingan belajar untuk siswa ini..." : "Type custom advice notes or relaxation interventions for this student..."}
                      className="w-full h-24 px-3 py-2 bg-[#12142A]/60 border border-white/10 focus:border-[#00D9A0] text-xs text-white rounded-xl placeholder-[#8C90AC]/50 outline-none transition-all"
                    />

                    {showSuccess && (
                      <div className="p-2.5 bg-[#00D9A0]/10 border border-[#00D9A0]/20 text-[#00D9A0] rounded-xl text-xs font-semibold flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                        <span>Suggestion sent successfully!</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={!suggestionText.trim()}
                      className="w-full py-2.5 bg-[#00D9A0] text-[#00281C] hover:bg-[#00E6A8] rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Send Recommendation
                    </button>
                  </form>
                </div>

              </div>
            </>
          ) : (
            <div className="text-center py-20 glass-panel rounded-2xl p-6 text-[#8C90AC]">
              Please select a student from the left roster.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
