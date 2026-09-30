import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { translations } from "../lib/translations";
import { 
  Heart, 
  Activity, 
  AlertTriangle, 
  Sparkles, 
  Play, 
  Pause, 
  X, 
  CheckCircle, 
  HelpCircle,
  WifiOff
} from "lucide-react";

export const StudentHealth: React.FC = () => {
  const { lang, currentUser, students } = useApp();
  const t = translations[lang];

  const studentUsername = currentUser?.username || "siswa";
  const studentProfile = students[studentUsername];

  const [breathingActive, setBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<"inhale" | "hold" | "exhale" | "ready">("ready");
  const [breathTimer, setBreathTimer] = useState(0);

  // Handle breathing 4-7-8 timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (breathingActive) {
      setBreathPhase("inhale");
      setBreathTimer(4);
      
      let secondsLeft = 4;
      let phase: "inhale" | "hold" | "exhale" = "inhale";

      interval = setInterval(() => {
        secondsLeft--;
        if (secondsLeft <= 0) {
          if (phase === "inhale") {
            phase = "hold";
            secondsLeft = 7;
          } else if (phase === "hold") {
            phase = "exhale";
            secondsLeft = 8;
          } else if (phase === "exhale") {
            phase = "inhale";
            secondsLeft = 4;
          }
          setBreathPhase(phase);
        }
        setBreathTimer(secondsLeft);
      }, 1000);
    } else {
      setBreathPhase("ready");
      setBreathTimer(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [breathingActive]);

  if (!studentProfile) {
    return <div className="text-center p-8 text-[#8C90AC]">{t.common.noData}</div>;
  }

  const isConnected = studentProfile.isConnected;
  const history = studentProfile.biometricsHistory || [];
  const currentReading = history[history.length - 1];

  // Helper to generate mini sparklines inline inside biometric cards
  const renderMiniSparkline = (data: typeof history, key: "bpm" | "hrv", color: string) => {
    if (data.length < 2) return null;
    const vals = data.slice(-8).map(d => d[key]);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const range = max - min || 1;
    const points = vals.map((v, i) => {
      const x = (i / (vals.length - 1)) * 60;
      const y = 20 - ((v - min) / range) * 16;
      return `${x},${y}`;
    }).join(" ");

    return (
      <svg className="w-16 h-6 overflow-visible" viewBox="0 0 60 20">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  // Helper to generate coordinates for SVG line charts
  const renderLineChart = (data: typeof history, key: "bpm" | "hrv", color: string, minVal: number, maxVal: number) => {
    if (data.length < 2) return null;
    const width = 500;
    const height = 150;
    const padding = 20;

    const recent = data.slice(-10);
    const points = recent.map((item, idx) => {
      const x = padding + (idx * (width - padding * 2)) / (recent.length - 1);
      const val = item[key];
      // Normalize y to fit height
      const y = height - padding - ((val - minVal) / (maxVal - minVal)) * (height - padding * 2);
      return { x, y, val, date: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) };
    });

    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathD += ` L ${points[i].x} ${points[i].y}`;
    }

    // Gradient path definition
    const fillPathD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        
        {/* Grid lines */}
        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#33374F" strokeWidth="0.5" strokeDasharray="3" />
        <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#33374F" strokeWidth="0.5" strokeDasharray="3" />
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#33374F" strokeWidth="1" />

        {/* Shaded Area */}
        <path d={fillPathD} fill={`url(#grad-${key})`} />

        {/* Main Line */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Plot points */}
        {points.map((pt, i) => (
          <g key={i} className="group/dot cursor-pointer">
            <circle cx={pt.x} cy={pt.y} r="4" fill="#0B0D1F" stroke={color} strokeWidth="2" className="transition-all duration-200 hover:r-6 hover:fill-white" />
            
            {/* Tooltip on hover */}
            <g className="opacity-0 group-hover/dot:opacity-100 transition-opacity duration-200 pointer-events-none">
              <rect x={pt.x - 35} y={pt.y - 32} width="70" height="22" rx="4" fill="#1E2240" stroke="#33374F" strokeWidth="1" />
              <text x={pt.x} y={pt.y - 17} fill="white" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                {pt.val} {key === "bpm" ? "BPM" : "ms"}
              </text>
            </g>
          </g>
        ))}
      </svg>
    );
  };

  // Monthly Bar Chart using 4 static weeks
  const renderMonthlyStressChart = () => {
    const weeks = [
      { week: "Week 1", hrv: 68, stress: "optimal", color: "#00D9A0" },
      { week: "Week 2", hrv: 52, stress: "load", color: "#F5B450" },
      { week: "Week 3", hrv: 34, stress: "overload", color: "#F2545B" },
      { week: "Week 4", hrv: 72, stress: "optimal", color: "#00D9A0" },
    ];

    return (
      <div className="flex justify-around items-end h-32 pt-4">
        {weeks.map((w, i) => {
          const heightPercent = `${(w.hrv / 100) * 100}%`;
          return (
            <div key={i} className="flex flex-col items-center w-12 group">
              <span className="text-[10px] font-mono text-[#8C90AC] mb-1 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                {w.hrv} ms
              </span>
              <div 
                className="w-8 rounded-t-lg transition-all duration-500 hover:brightness-110 shadow-[0_-4px_12px_rgba(0,0,0,0.15)] relative"
                style={{
                  height: `${w.hrv}%`,
                  backgroundColor: w.color,
                  boxShadow: `0 0 10px ${w.color}20`
                }}
              />
              <span className="text-[10px] font-medium text-white mt-2">{lang === "id" ? `Mgg ${i+1}` : `Wk ${i+1}`}</span>
            </div>
          );
        })}
      </div>
    );
  };

  // Determine current stress level properties
  const stressStatus = currentReading ? currentReading.status : "optimal";
  const bpmValue = currentReading ? currentReading.bpm : 0;
  const hrvValue = currentReading ? currentReading.hrv : 0;

  let statusBg = "bg-[#00D9A0]/10 border-[#00D9A0]/20 text-[#00D9A0]";
  let statusText = t.status.optimal;
  let statusColorCode = "#00D9A0";
  let statusDesc = t.status.optimalDesc;

  if (stressStatus === "load") {
    statusBg = "bg-[#F5B450]/10 border-[#F5B450]/20 text-[#F5B450]";
    statusText = t.status.load;
    statusColorCode = "#F5B450";
    statusDesc = t.status.loadDesc;
  } else if (stressStatus === "overload") {
    statusBg = "bg-[#F2545B]/10 border-[#F2545B]/20 text-[#F2545B]";
    statusText = t.status.overload;
    statusColorCode = "#F2545B";
    statusDesc = t.status.overloadDesc;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header and status info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight font-sans flex items-center gap-2">
            <Activity className="w-6.5 h-6.5 text-[#00D9A0]" />
            {t.health.title}
          </h2>
          <p className="text-sm text-[#8C90AC] mt-1">{t.health.subtitle}</p>
        </div>

        {isConnected && currentReading && (
          <div className={`px-4 py-2 border rounded-full text-sm font-semibold flex items-center gap-2 font-sans ${statusBg} shadow-[0_0_16px_rgba(0,0,0,0.15)]`}>
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75`} style={{ backgroundColor: statusColorCode }} />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: statusColorCode }} />
            </span>
            {t.common.status}: <strong className="uppercase">{statusText}</strong>
          </div>
        )}
      </div>

      {/* Disconnected state */}
      {!isConnected ? (
        <div className="bg-[#161A33]/90 border border-dashed border-[#F2545B]/30 rounded-3xl p-8 text-center flex flex-col items-center justify-center max-w-xl mx-auto space-y-4 shadow-[0_8px_32px_rgba(0,0,0,0.3)] my-12">
          <div className="p-4 bg-[#F2545B]/10 rounded-full border border-[#F2545B]/20 text-[#F2545B] animate-pulse">
            <WifiOff className="w-12 h-12" />
          </div>
          <h3 className="text-xl font-bold text-white font-sans">{t.health.waitingForData}</h3>
          <p className="text-sm text-[#8C90AC] leading-relaxed">
            {t.health.waitingForDataDesc}
          </p>
        </div>
      ) : (
        <>
          {/* Overload Alert Banner */}
          {stressStatus === "overload" && (
            <div className="bg-[#F2545B]/15 border border-[#F2545B]/30 text-white rounded-2xl p-4 md:p-5 flex items-start gap-4 shadow-[0_0_24px_rgba(242,84,91,0.12)] animate-pulse">
              <div className="p-2 bg-[#F2545B]/20 rounded-xl text-[#F2545B]">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-[#F2545B] font-mono tracking-wider uppercase flex items-center gap-1.5">
                  {t.common.actionRequired}: {t.status.overload}
                </h4>
                <p className="text-sm text-[#E2E5FF] leading-relaxed">
                  {statusDesc}
                </p>
              </div>
            </div>
          )}

          {/* Biometrics real-time cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Heart Rate BPM */}
            <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute right-4 top-4 flex items-center gap-3">
                {/* Mini sparkline */}
                {renderMiniSparkline(history, "bpm", "#F2545B")}
                {/* Status pill top-right */}
                <span className={`px-2.5 py-1 text-[10px] font-extrabold font-mono uppercase tracking-wide rounded-full ${
                  stressStatus === "optimal" ? "bg-[#00D9A0] text-[#00281C]" :
                  stressStatus === "load" ? "bg-[#F5B450] text-[#00281C]" :
                  "bg-[#F2545B] text-white"
                }`}>
                  {stressStatus === "optimal" ? "Optimal" : stressStatus === "load" ? "Load" : "Overload"}
                </span>
              </div>
              <span className="text-xs font-semibold text-[#8C90AC] uppercase tracking-wider font-mono">
                {t.health.bpmCard}
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-4xl md:text-5xl font-extrabold text-white font-display tracking-tight">
                  {bpmValue}
                </span>
                <span className="text-sm font-semibold text-[#8C90AC]">BPM</span>
              </div>
              <p className="text-xs text-[#8C90AC] mt-3 leading-relaxed">
                {t.health.bpmDesc}
              </p>
            </div>

            {/* Heart Variability HRV */}
            <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute right-4 top-4 flex items-center gap-3">
                {/* Mini sparkline */}
                {renderMiniSparkline(history, "hrv", "#00D9A0")}
                {/* Status pill top-right */}
                <span className={`px-2.5 py-1 text-[10px] font-extrabold font-mono uppercase tracking-wide rounded-full ${
                  stressStatus === "optimal" ? "bg-[#00D9A0] text-[#00281C]" :
                  stressStatus === "load" ? "bg-[#F5B450] text-[#00281C]" :
                  "bg-[#F2545B] text-white"
                }`}>
                  {stressStatus === "optimal" ? "Optimal" : stressStatus === "load" ? "Load" : "Overload"}
                </span>
              </div>
              <span className="text-xs font-semibold text-[#8C90AC] uppercase tracking-wider font-mono">
                {t.health.hrvCard}
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-4xl md:text-5xl font-extrabold text-white font-display tracking-tight">
                  {hrvValue}
                </span>
                <span className="text-sm font-semibold text-[#8C90AC]">ms</span>
              </div>
              <p className="text-xs text-[#8C90AC] mt-3 leading-relaxed">
                {t.health.hrvDesc}
              </p>
            </div>
          </div>

          {/* Charts section (Trend and Monthly evaluation) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live biometrics trend line chart (2/3 columns on desktop) */}
            <div className="lg:col-span-2 glass-panel rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white font-display tracking-wide">
                  {t.health.combinedTrend}
                </h3>
                <span className="text-[11px] text-[#8C90AC] mt-0.5 block">
                  {lang === "id" ? "Memvisualisasikan 10 pembacaan detak jantung terakhir secara dinamis." : "Visualizing the 10 most recent heart-rhythm streams."}
                </span>
              </div>

              {/* Chart container */}
              <div className="h-44 flex items-center justify-center my-4">
                {renderLineChart(history, "bpm", "#00D9A0", 50, 140)}
              </div>

              {/* Chart legend */}
              <div className="flex items-center gap-4 text-[11px] font-mono text-[#8C90AC]">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-[#00D9A0] rounded-full inline-block" />
                  <span>{t.health.bpmLabel}</span>
                </div>
              </div>
            </div>

            {/* Monthly stress-evaluation chart */}
            <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white font-display tracking-wide">
                  {t.health.monthlyStressTitle}
                </h3>
                <span className="text-[11px] text-[#8C90AC] mt-0.5 block">
                  {t.health.monthlyStressDesc}
                </span>
              </div>

              {renderMonthlyStressChart()}

              <div className="border-t border-[#33374F]/50 pt-2.5 mt-3 flex justify-between text-[10px] text-[#8C90AC] font-mono">
                <span>{lang === "id" ? "Evaluasi Juni 2026" : "Evaluation June 2026"}</span>
                <span className="text-[#00D9A0] font-semibold">Resilience Good</span>
              </div>
            </div>
          </div>

          {/* Educational Intervention guide */}
          <div className="glass-panel rounded-2xl p-6 relative">
            <div className="flex items-center gap-3 border-b border-[#33374F]/50 pb-4">
              <div className="p-2 bg-[#00D9A0]/10 rounded-xl text-[#00D9A0]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-display">{t.health.eduGuideTitle}</h3>
                <p className="text-xs text-[#8C90AC]">{t.health.eduGuideSubtitle}</p>
              </div>
            </div>

            {/* Guide recommendations items */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {/* 4-7-8 Breathing exercise */}
              <div className={`p-4 bg-[#12142A]/50 border border-[#33374F]/40 rounded-xl flex flex-col justify-between space-y-4 transition-all hover:border-[#00D9A0]/30 ${stressStatus === "overload" ? "ring-1 ring-[#F2545B]/40 bg-[#F2545B]/5" : ""}`}>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-[#00D9A0]/10 text-[#00D9A0] border border-[#00D9A0]/15 rounded-md text-[10px] font-mono uppercase tracking-wide">
                      {lang === "id" ? "Rileks Kognitif" : "Cognitive Calm"}
                    </span>
                    {stressStatus === "overload" && (
                      <span className="text-[10px] text-[#F2545B] font-semibold font-mono uppercase animate-pulse">Critical</span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1">Pernapasan 4-7-8</h4>
                  <p className="text-xs text-[#8C90AC] leading-relaxed">
                    {lang === "id" ? "Tarik napas 4 dtk, tahan 7 dtk, buang perlahan 8 dtk. Menurunkan BPM stres berlebih dalam 2 menit." : "Inhale 4s, hold 7s, exhale 8s. Proven biophysiological feedback to drop BPM stress peaks."}
                  </p>
                </div>
                {/* 64px Stress-Response Breath Button with breathingPulse */}
                <button
                  onClick={() => setBreathingActive(true)}
                  className="w-full h-16 bg-[#00D9A0] text-[#00281C] hover:bg-[#00E6A8] rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_4px_16px_rgba(0,217,160,0.25)] pulse-button cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  {t.health.breathingCta}
                </button>
              </div>

              {/* Stretching recommendation */}
              <div className="p-4 bg-[#12142A]/50 border border-[#33374F]/40 rounded-xl flex flex-col justify-between space-y-4 transition-all hover:border-[#3FA9E0]/30">
                <div className="space-y-1">
                  <span className="px-2 py-0.5 bg-[#3FA9E0]/10 text-[#3FA9E0] border border-[#3FA9E0]/15 rounded-md text-[10px] font-mono uppercase tracking-wide">
                    {lang === "id" ? "Rilis Ketegangan" : "Physical Release"}
                  </span>
                  <h4 className="text-sm font-bold text-white mt-1">Peregangan 3 Menit</h4>
                  <p className="text-xs text-[#8C90AC] leading-relaxed">
                    {lang === "id" ? "Putar bahu, regangkan otot leher, dan berdiri sejenak. Mengembalikan aliran oksigen segar ke korteks otak." : "Roll shoulders, stretch your neck muscles, and stand up. Re-oxygenates your cerebral blood flow."}
                  </p>
                </div>
                {/* 1px 20% opacity white border button */}
                <button
                  onClick={() => alert(lang === "id" ? "Yuk berdiri sejenak, putar kepala ke kiri & kanan, lalu tarik nafas dalam-dalam selama 3 menit!" : "Stand up, gently rotate your neck side-to-side, and breathe deeply for 3 minutes!")}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 text-white border border-white/20 hover:border-white/30 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
                >
                  {t.health.stretchCta}
                </button>
              </div>

              {/* Rest reminder */}
              <div className="p-4 bg-[#12142A]/50 border border-[#33374F]/40 rounded-xl flex flex-col justify-between space-y-4 transition-all hover:border-[#F5B450]/30">
                <div className="space-y-1">
                  <span className="px-2 py-0.5 bg-[#F5B450]/10 text-[#F5B450] border border-[#F5B450]/15 rounded-md text-[10px] font-mono uppercase tracking-wide">
                    {lang === "id" ? "Istirahat Layar" : "Visual Rest"}
                  </span>
                  <h4 className="text-sm font-bold text-white mt-1">Matikan Layar (Digital Detox)</h4>
                  <p className="text-xs text-[#8C90AC] leading-relaxed">
                    {lang === "id" ? "Jauhkan layar HP/laptop selama 5 menit. Membantu memulihkan memori kerja otak yang lelah belajar." : "Look away from laptop and phone screens for 5 minutes. Gives crucial downtime for working memory."}
                  </p>
                </div>
                {/* 1px 20% opacity white border button */}
                <button
                  onClick={() => alert(lang === "id" ? "Pengingat diaktifkan! Silakan tutup layar ini selama 5 menit untuk istirahat mata kognitif." : "Reminder set! Please look away from this screen for 5 minutes of cognitive rest.")}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 text-white border border-white/20 hover:border-white/30 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
                >
                  {t.health.breakCta}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Interactive 4-7-8 Breathing Overlay Portal */}
      {breathingActive && (
        <div className="fixed inset-0 z-50 bg-[#070810]/95 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="max-w-md w-full bg-[#161A33] border border-[#33374F] rounded-3xl p-6 md:p-8 text-center space-y-8 relative overflow-hidden shadow-[0_0_50px_rgba(0,217,160,0.15)]">
            {/* Close button */}
            <button
              onClick={() => setBreathingActive(false)}
              className="absolute top-4 right-4 p-2 bg-[#12142A] hover:bg-red-500/10 hover:text-red-400 text-[#8C90AC] rounded-xl transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Badge */}
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-[#00D9A0]/10 border border-[#00D9A0]/20 text-[#00D9A0] rounded-full text-xs font-mono uppercase tracking-wider font-semibold">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              Grahita Breathe Control
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white font-sans">
                {lang === "id" ? "Terapi Bernapas 4-7-8" : "4-7-8 Breathing Therapy"}
              </h3>
              <p className="text-xs text-[#8C90AC] max-w-xs mx-auto">
                {lang === "id" ? "Ikuti ritme bulatan untuk menenangkan kognitif dan detak jantung Anda." : "Follow the expanding circle to reset your cognitive stress and heart beat."}
              </p>
            </div>

            {/* Dynamic expanding circle based on phase */}
            <div className="flex justify-center items-center h-48 relative">
              {/* Outer pulsing ring */}
              <div 
                className={`absolute rounded-full border border-[#00D9A0]/20 transition-all duration-1000 ${
                  breathPhase === "inhale" ? "w-44 h-44 scale-110 opacity-30 bg-[#00D9A0]/5" :
                  breathPhase === "hold" ? "w-44 h-44 scale-100 opacity-60 bg-[#F5B450]/10" :
                  "w-20 h-20 scale-90 opacity-10 bg-[#F2545B]/5"
                }`}
              />

              {/* Main circle */}
              <div 
                className={`rounded-full flex flex-col justify-center items-center text-center transition-all duration-[4000ms] ease-in-out ${
                  breathPhase === "inhale" ? "w-40 h-40 bg-gradient-to-br from-[#00D9A0] to-[#3FA9E0] text-[#00281C] duration-[4000ms]" :
                  breathPhase === "hold" ? "w-44 h-44 bg-gradient-to-br from-[#F5B450] to-[#E2E5FF] text-[#00281C] duration-[7000ms]" :
                  "w-24 h-24 bg-[#F2545B] text-white duration-[8000ms]"
                } shadow-[0_0_32px_rgba(0,0,0,0.4)]`}
              >
                <span className="text-sm font-bold uppercase tracking-wider font-mono">
                  {breathPhase === "inhale" ? (lang === "id" ? "Tarik Napas" : "Breathe In") :
                   breathPhase === "hold" ? (lang === "id" ? "Tahan" : "Hold Breath") :
                   (lang === "id" ? "Hembuskan" : "Exhale")}
                </span>
                <span className="text-3xl font-extrabold font-mono mt-1">{breathTimer}s</span>
              </div>
            </div>

            {/* Instruction block */}
            <div className="p-4 bg-[#12142A] rounded-xl border border-[#33374F]/40 text-sm">
              <p className="text-[#8C90AC] leading-relaxed">
                {breathPhase === "inhale" && (lang === "id" ? "Tarik napas perlahan melalui hidung selama 4 detik..." : "Breathe in deeply through your nose for 4 seconds...")}
                {breathPhase === "hold" && (lang === "id" ? "Tahan napas Anda, rasakan oksigen mengisi paru-paru..." : "Hold your breath, let the fresh oxygen stabilize...")}
                {breathPhase === "exhale" && (lang === "id" ? "Hembuskan perlahan lewat mulut dengan santai selama 8 detik..." : "Exhale fully through your mouth with a calm whoosh...")}
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setBreathingActive(false)}
                className="px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl font-bold text-xs cursor-pointer"
              >
                {lang === "id" ? "Selesaikan Sesi" : "Finish Session"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
