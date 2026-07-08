import React from "react";
import { useApp } from "../context/AppContext";
import { translations } from "../lib/translations";
import { 
  GraduationCap, 
  Award, 
  BookOpen, 
  AlertOctagon, 
  CheckCircle2, 
  BarChart4 
} from "lucide-react";

export const StudentAcademic: React.FC = () => {
  const { lang, currentUser, students } = useApp();
  const t = translations[lang];

  const studentUsername = currentUser?.username || "siswa";
  const studentProfile = students[studentUsername];

  if (!studentProfile) {
    return <div className="text-center p-8 text-[#8C90AC]">{t.common.noData}</div>;
  }

  const grades = studentProfile.grades || [];

  // Calculate metrics
  const avgGrade = grades.length > 0 ? (grades.reduce((sum, g) => sum + g.grade, 0) / grades.length).toFixed(1) : "0.0";
  const highestGrade = grades.length > 0 ? Math.max(...grades.map(g => g.grade)) : 0;
  
  // Subjects that need attention (status load or overload)
  const attentionSubjects = grades.filter(g => g.stressStatus === "load" || g.stressStatus === "overload");

  // Custom SVG Bar Chart of grades per subject
  const renderGradesBarChart = () => {
    if (grades.length === 0) return null;
    const height = 180;
    const width = 500;
    const padding = 24;
    const barWidth = 32;
    const spacing = 18;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        {/* Draw background grid */}
        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#33374F" strokeWidth="0.5" strokeDasharray="3" />
        <line x1={padding} y1={height/2} x2={width - padding} y2={height/2} stroke="#33374F" strokeWidth="0.5" strokeDasharray="3" />
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#33374F" strokeWidth="1" />

        {/* Draw bars */}
        {grades.map((item, idx) => {
          const barHeight = ((item.grade) / 100) * (height - padding * 2);
          const x = padding + idx * (barWidth + spacing) + spacing;
          const y = height - padding - barHeight;

          // Determine color by stress level
          let color = "#00D9A0"; // optimal
          if (item.stressStatus === "load") color = "#F5B450";
          else if (item.stressStatus === "overload") color = "#F2545B";

          const subjectName = lang === "id" ? item.subjectNameId : item.subjectNameEn;
          const truncatedName = subjectName.length > 8 ? subjectName.substring(0, 7) + ".." : subjectName;

          return (
            <g key={idx} className="group/bar cursor-pointer">
              {/* Bar background */}
              <rect x={x} y={padding} width={barWidth} height={height - padding * 2} fill="#12142A" rx="4" />
              
              {/* Active filled bar */}
              <rect x={x} y={y} width={barWidth} height={barHeight} fill={color} rx="4" className="transition-all duration-300 group-hover/bar:brightness-110" />

              {/* Value label */}
              <text x={x + barWidth/2} y={y - 6} fill="white" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                {item.grade}
              </text>

              {/* Axis label */}
              <text x={x + barWidth/2} y={height - 8} fill="#8C90AC" fontSize="9" fontWeight="medium" textAnchor="middle" fontFamily="sans-serif">
                {truncatedName}
              </text>

              {/* Custom tooltip */}
              <g className="opacity-0 group-hover/bar:opacity-100 transition-opacity duration-200 pointer-events-none">
                <rect x={x - 20} y={padding - 20} width="72" height="32" rx="4" fill="#1E2240" stroke="#33374F" strokeWidth="1" />
                <text x={x + 16} y={padding - 10} fill="white" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                  {subjectName}
                </text>
                <text x={x + 16} y={padding + 2} fill={color} fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                  Status: {item.stressStatus.toUpperCase()}
                </text>
              </g>
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight font-sans flex items-center gap-2">
          <GraduationCap className="w-6.5 h-6.5 text-[#00D9A0]" />
          {t.academic.title}
        </h2>
        <p className="text-sm text-[#8C90AC] mt-1">{t.academic.subtitle}</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* GPA/Average */}
        <div className="glass-panel rounded-2xl p-6 flex items-center gap-4">
          <div className="p-3.5 bg-[#00D9A0]/10 rounded-xl text-[#00D9A0]">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-semibold text-[#8C90AC] uppercase tracking-wider font-mono">{t.academic.averageGrade}</span>
            <div className="text-3xl font-extrabold text-white mt-1 font-display">{avgGrade}</div>
          </div>
        </div>

        {/* Highest Grade */}
        <div className="glass-panel rounded-2xl p-6 flex items-center gap-4">
          <div className="p-3.5 bg-[#3FA9E0]/10 rounded-xl text-[#3FA9E0]">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-semibold text-[#8C90AC] uppercase tracking-wider font-mono">{t.academic.highestGrade}</span>
            <div className="text-3xl font-extrabold text-white mt-1 font-display">{highestGrade}</div>
          </div>
        </div>

        {/* Cognitive Load Rating */}
        <div className="glass-panel rounded-2xl p-6 flex items-center gap-4">
          <div className="p-3.5 bg-[#F5B450]/10 rounded-xl text-[#F5B450]">
            <BarChart4 className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-semibold text-[#8C90AC] uppercase tracking-wider font-mono">{t.academic.focusStatus}</span>
            <div className="text-sm font-bold text-white mt-1 font-sans flex items-center gap-1.5">
              {attentionSubjects.length > 0 ? (
                <span className="text-[#F5B450] flex items-center gap-1">
                  <AlertOctagon className="w-4 h-4" />
                  {attentionSubjects.length} {lang === "id" ? "Mapel Tertekan" : "Subjects Alerted"}
                </span>
              ) : (
                <span className="text-[#00D9A0] flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  {lang === "id" ? "Fokus Kognitif Optimal" : "All Focus Optimal"}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subjects list & scores (2 columns) */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#33374F]/50 pb-4">
            <h3 className="text-sm font-bold text-white font-display tracking-wide">
              {t.academic.subjectList}
            </h3>
            <span className="px-2.5 py-1 bg-[#1E2240]/60 border border-[#33374F]/50 rounded-lg text-[10px] text-[#8C90AC] font-mono">
              {t.academic.semester} 1 (Ganjil)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#8C90AC] font-sans">
              <thead>
                <tr className="border-b border-[#33374F]/30 text-[#8C90AC] font-mono text-[10px] uppercase tracking-wider">
                  <th className="pb-3">{lang === "id" ? "Mata Pelajaran" : "Subject"}</th>
                  <th className="pb-3 text-center">{lang === "id" ? "Nilai Akhir" : "Grade Score"}</th>
                  <th className="pb-3 text-right">{lang === "id" ? "Beban Kognitif Grahita" : "Cognitive Stress Load"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#33374F]/20">
                {grades.map((g, idx) => {
                  let badgeColor = "bg-[#00D9A0]/10 text-[#00D9A0] border-[#00D9A0]/20";
                  let statusText = t.status.optimal;

                  if (g.stressStatus === "load") {
                    badgeColor = "bg-[#F5B450]/10 text-[#F5B450] border-[#F5B450]/20";
                    statusText = t.status.load;
                  } else if (g.stressStatus === "overload") {
                    badgeColor = "bg-[#F2545B]/10 text-[#F2545B] border-[#F2545B]/20";
                    statusText = t.status.overload;
                  }

                  return (
                    <tr key={idx} className="hover:bg-[#1E2240]/40 transition-colors">
                      <td className="py-3.5 font-semibold text-white">
                        {lang === "id" ? g.subjectNameId : g.subjectNameEn}
                      </td>
                      <td className="py-3.5 text-center font-mono text-white font-bold">
                        {g.grade}
                      </td>
                      <td className="py-3.5 text-right">
                        <span className={`px-2.5 py-0.5 border rounded-full text-[10px] font-mono font-semibold uppercase ${badgeColor}`}>
                          {statusText}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Subjects needing attention right bar */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white font-display tracking-wide flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-[#F5B450]" />
              {t.academic.attentionNeeded}
            </h3>
            <span className="text-[11px] text-[#8C90AC] block leading-relaxed">
              {t.academic.attentionNeededDesc}
            </span>
          </div>

          <div className="flex-grow space-y-3 my-4 overflow-y-auto max-h-56 pr-1">
            {attentionSubjects.length === 0 ? (
              <div className="text-center py-8 text-[#8C90AC] text-xs flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-[#00D9A0]" />
                <span>{lang === "id" ? "Bagus! Semua mata pelajaran stabil kognitif." : "Great! All subjects are cognitively stable."}</span>
              </div>
            ) : (
              attentionSubjects.map((sub, i) => {
                const isOverload = sub.stressStatus === "overload";
                return (
                  <div key={i} className={`p-3 bg-[#12142A]/60 border rounded-xl flex items-center justify-between transition-all hover:bg-[#1E2240] ${isOverload ? "border-[#F2545B]/30" : "border-[#F5B450]/30"}`}>
                    <div>
                      <h4 className="text-xs font-bold text-white">
                        {lang === "id" ? sub.subjectNameId : sub.subjectNameEn}
                      </h4>
                      <span className="text-[10px] font-mono text-[#8C90AC]">
                        {lang === "id" ? `Kategori Nilai: ${sub.grade}` : `Grade Rating: ${sub.grade}`}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] font-semibold border rounded-full uppercase font-mono ${
                      isOverload ? "bg-[#F2545B]/10 text-[#F2545B] border-[#F2545B]/15" : "bg-[#F5B450]/10 text-[#F5B450] border-[#F5B450]/15"
                    }`}>
                      {isOverload ? t.status.overload : t.status.load}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          <div className="border-t border-[#33374F]/50 pt-3 text-[10px] text-[#8C90AC] font-mono text-center">
            {lang === "id" ? "Sync dengan Grahita Band" : "Synced with Grahita Band telemetry"}
          </div>
        </div>
      </div>

      {/* Visual grade chart display */}
      <div className="glass-panel rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white font-display tracking-wide mb-4">
          {t.academic.gradeReport} (Visual Matrix)
        </h3>
        <div className="h-48 flex items-center justify-center">
          {renderGradesBarChart()}
        </div>
      </div>
    </div>
  );
};
