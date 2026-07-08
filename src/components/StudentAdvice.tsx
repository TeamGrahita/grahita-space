import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { translations } from "../lib/translations";
import { 
  ClipboardCheck, 
  UserSquare2, 
  MessageSquareHeart, 
  Compass, 
  Sparkles, 
  CheckCircle,
  HelpCircle,
  ChevronRight,
  Send
} from "lucide-react";

export const StudentAdvice: React.FC = () => {
  const { lang, currentUser, students, submitQuestionnaire } = useApp();
  const t = translations[lang];

  const studentUsername = currentUser?.username || "siswa";
  const studentProfile = students[studentUsername];

  const [emojiVal, setEmojiVal] = useState(6);
  const [textVal, setTextVal] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  if (!studentProfile) {
    return <div className="text-center p-8 text-[#8C90AC]">{t.common.noData}</div>;
  }

  // Determine Emoji and Mood label
  const getMoodFeedback = (score: number) => {
    if (score <= 2) return { emoji: "😭", labelId: "Sangat Tertekan", labelEn: "Extremely Distressed", color: "#F2545B" };
    if (score <= 4) return { emoji: "😞", labelId: "Lelah / Cemas", labelEn: "Fatigued / Anxious", color: "#F5B450" };
    if (score <= 6) return { emoji: "😐", labelId: "Biasa Saja / Stabil", labelEn: "Neutral / Stable", color: "#8C90AC" };
    if (score <= 8) return { emoji: "🙂", labelId: "Tenang & Riang", labelEn: "Calm & Pleasant", color: "#00D9A0" };
    return { emoji: "😊", labelId: "Sangat Tenang & Bahagia", labelEn: "Very Peaceful & Happy", color: "#00D9A0" };
  };

  const moodInfo = getMoodFeedback(emojiVal);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitQuestionnaire(emojiVal, textVal);
    setTextVal("");
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 4000);
  };

  // Generate tactical advice based on latest HRV reading + questionnaire input
  const history = studentProfile.biometricsHistory || [];
  const latestBiometric = history[history.length - 1];
  const hrvValue = latestBiometric ? latestBiometric.hrv : 60;
  const bpmValue = latestBiometric ? latestBiometric.bpm : 72;

  const getSystemRecommendation = () => {
    // 1. High physical stress (overload)
    if (bpmValue > 100 || hrvValue < 35 || emojiVal <= 4) {
      return {
        titleId: "Intervensi Pemulihan Amigdala (Mendesak)",
        titleEn: "Amygdala Recovery Protocol (Urgent)",
        recId: "Sistem saraf otonom Anda menunjukkan tanda overload kognitif yang tinggi. Direkomendasikan melakukan latihan pernapasan kotak (box breathing) atau meditasi 4-7-8 selama 5 menit. Matikan seluruh layar monitor, minum segelas air hangat, dan hubungi Guru BK Ibu Indah untuk berkonsultasi.",
        recEn: "Your autonomic nervous system indicates high cognitive overload. Perform box breathing or 4-7-8 meditation for 5 minutes. Close your screens, drink warm water, and visit the Guru BK room to converse with Counselor Ibu Indah."
      };
    }
    // 2. Alert/Load level
    if (bpmValue > 85 || hrvValue < 50 || emojiVal <= 6) {
      return {
        titleId: "Restorasi Kognitif Ringan (Siaga)",
        titleEn: "Light Cognitive Restoration (Alert)",
        recId: "Anda berada dalam level ketegangan kognitif menengah. Sempatkan jeda peregangan fisik selama 3 menit. Pejamkan mata Anda dan dengarkan musik ambient berfrekuensi 432Hz untuk meningkatkan hrv Anda secara bertahap.",
        recEn: "You are experiencing moderate cognitive tension. Dedicate 3 minutes for gentle body stretches. Close your eyes and play 432Hz calming ambient music to gradually restore your heart-rate variability."
      };
    }
    // 3. Optimal / peaceful
    return {
      titleId: "Pemeliharaan Status Fokus Kognitif (Optimal)",
      titleEn: "Cognitive Focus Maintenance (Optimal)",
      recId: "Luar biasa! Tingkat energi kognitif dan biometrik Anda dalam kondisi prima. Manfaatkan kesiapan kognitif ini untuk fokus mempelajari topik-topik sulit secara efektif. Pertahankan ritme ini dengan istirahat teratur.",
      recEn: "Outstanding! Your cognitive resilience and biometrics are in prime condition. Leverage this high cognitive readiness to absorb complex materials efficiently. Maintain this rhythm with timely mini-breaks."
    };
  };

  const sysRec = getSystemRecommendation();
  const latestNotes = studentProfile.counselorNotes || [];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight font-sans flex items-center gap-2">
          <ClipboardCheck className="w-6.5 h-6.5 text-[#00D9A0]" />
          {t.advice.title}
        </h2>
        <p className="text-sm text-[#8C90AC] mt-1">{t.advice.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Questionnaire Form */}
        <div className="bg-[#161A33]/90 backdrop-blur-md border border-[#33374F]/50 rounded-2xl p-6 shadow-md flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white font-sans tracking-wide flex items-center gap-1.5">
              <ClipboardCheck className="w-4 h-4 text-[#00D9A0]" />
              {t.advice.questionnaireTitle}
            </h3>
            <p className="text-xs text-[#8C90AC] leading-relaxed">
              {t.advice.questionnaireDesc}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            {/* Emoji display slider */}
            <div className="bg-[#12142A]/80 p-4 border border-[#33374F]/40 rounded-xl flex flex-col items-center space-y-3 text-center">
              <span className="text-5xl animate-bounce" style={{ animationDuration: "3s" }}>{moodInfo.emoji}</span>
              <div>
                <span className="text-xs text-[#8C90AC] font-mono tracking-wider uppercase block">{t.advice.emojiSliderLabel}</span>
                <span className="text-sm font-bold text-white block mt-0.5" style={{ color: moodInfo.color }}>
                  {lang === "id" ? moodInfo.labelId : moodInfo.labelEn} (Scale {emojiVal})
                </span>
              </div>

              <input
                type="range"
                min="1"
                max="10"
                value={emojiVal}
                onChange={(e) => setEmojiVal(parseInt(e.target.value))}
                className="w-full h-2 bg-[#1E2240] rounded-lg appearance-none cursor-pointer accent-[#00D9A0] pt-1"
              />
            </div>

            {/* Free Text Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white font-sans block">{t.advice.freeTextLabel}</label>
              <textarea
                value={textVal}
                onChange={(e) => setTextVal(e.target.value)}
                placeholder={t.advice.freeTextPlaceholder}
                className="w-full h-20 px-3.5 py-2.5 bg-[#12142A] border border-[#33374F]/80 focus:border-[#00D9A0] text-sm text-white rounded-xl placeholder-[#8C90AC]/50 outline-none transition-all focus:shadow-[0_0_12px_rgba(0,217,160,0.12)]"
              />
            </div>

            {/* Success message banner */}
            {showSuccess && (
              <div className="p-3 bg-[#00D9A0]/10 border border-[#00D9A0]/20 text-[#00D9A0] rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>{t.advice.evaluationSuccess}</span>
              </div>
            )}

            {/* Action submit button */}
            <button
              type="submit"
              className="w-full py-3 bg-[#00D9A0] text-[#00281C] hover:bg-[#00E6A8] rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_4px_16px_rgba(0,217,160,0.15)] cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              {t.advice.submitEvaluation}
            </button>
          </form>
        </div>

        {/* AI & Biometric Generated Advice (Right Column) */}
        <div className="bg-[#161A33]/90 backdrop-blur-md border border-[#33374F]/50 rounded-2xl p-6 shadow-md flex flex-col justify-between">
          <div className="space-y-2">
            <span className="px-2.5 py-1 bg-[#00D9A0]/10 border border-[#00D9A0]/20 text-[#00D9A0] rounded-lg text-[10px] font-mono tracking-wider uppercase font-semibold">
              Grahita Smart AI
            </span>
            <h3 className="text-sm font-bold text-white font-sans tracking-wide">
              {t.advice.sysGenTitle}
            </h3>
            <p className="text-xs text-[#8C90AC] leading-relaxed">
              {t.advice.sysGenDesc}
            </p>
          </div>

          <div className="bg-[#12142A]/80 border border-[#33374F]/50 rounded-xl p-5 my-5 space-y-3">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00D9A0] animate-pulse" />
              {lang === "id" ? sysRec.titleId : sysRec.titleEn}
            </h4>
            <p className="text-xs text-[#8C90AC] leading-relaxed text-justify">
              {lang === "id" ? sysRec.recId : sysRec.recEn}
            </p>
          </div>

          {/* Quick instructions indicator */}
          <div className="p-3.5 bg-[#3FA9E0]/10 border border-[#3FA9E0]/15 rounded-xl flex items-start gap-2.5">
            <Compass className="w-4 h-4 text-[#3FA9E0] mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-[#E2E5FF] leading-relaxed">
              {lang === "id" 
                ? "Saran diperbarui otomatis saat data Grahita Band mengalami fluktuasi biometrik kognitif stres." 
                : "Suggestions auto-recalculate as your Grahita Band registers physical cognitive load variations."}
            </p>
          </div>
        </div>
      </div>

      {/* Solutions / Suggestion written by counselor (Guru BK) */}
      <div className="bg-[#161A33]/90 backdrop-blur-md border border-[#33374F]/50 rounded-2xl p-6 shadow-md">
        <div className="border-b border-[#33374F]/50 pb-4">
          <h3 className="text-base font-bold text-white font-sans flex items-center gap-2">
            <UserSquare2 className="w-5 h-5 text-[#00D9A0]" />
            {t.advice.counselorTitle}
          </h3>
          <p className="text-xs text-[#8C90AC] mt-0.5">{t.advice.counselorDesc}</p>
        </div>

        <div className="divide-y divide-[#33374F]/30 max-h-96 overflow-y-auto pr-1">
          {latestNotes.length === 0 ? (
            <div className="text-center py-10 text-xs text-[#8C90AC] flex flex-col items-center gap-2">
              <MessageSquareHeart className="w-8 h-8 text-[#8C90AC]/50" />
              <span>{t.advice.noCounselorAdvice}</span>
            </div>
          ) : (
            latestNotes.map((note, idx) => (
              <div key={idx} className="py-4 space-y-2 first:pt-3 last:pb-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[#00D9A0] rounded-full inline-block" />
                    {note.counselorName} <span className="text-[10px] bg-[#00D9A0]/10 text-[#00D9A0] px-1.5 py-0.5 rounded ml-1.5 font-mono">{t.advice.counselorLabel}</span>
                  </span>
                  <span className="font-mono text-[#8C90AC]">
                    {new Date(note.timestamp).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                {/* Note body. Free text written by Guru BK should display exactly as entered, so no automatic translation */}
                <p className="text-xs text-[#E2E5FF] leading-relaxed whitespace-pre-wrap pl-3 border-l-2 border-[#33374F]">
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
