import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { translations } from "../lib/translations";
import { CalendarDays, UserCheck, Clock, BookmarkCheck, CheckCircle2, AlertCircle } from "lucide-react";

export const StudentConsultation: React.FC = () => {
  const { lang, currentUser, bookings, bookConsultation } = useApp();
  const t = translations[lang];

  // Only show the logged-in student's own bookings (notes may contain private complaints)
  const myBookings = bookings.filter(bk => bk.studentUsername === currentUser?.username);

  const [expert, setExpert] = useState("dr_aditya");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [success, setSuccess] = useState(false);

  // Seed list of external clinical psychologists
  const experts = [
    { id: "dr_aditya", name: "Dr. Aditya Pratama, M.Psi, Psikolog", specializationId: "Spesialis Stres Remaja & Kognitif", specializationEn: "Youth & Cognitive Stress Specialist" },
    { id: "dr_siti", name: "Dra. Siti Aminah, M.Psi", specializationId: "Psikoterapi Akademik & Kecemasan", specializationEn: "Academic Psychotherapy & Anxiety Specialist" },
    { id: "dr_rudi", name: "Rudi Hartono, S.Psi, Psi", specializationId: "Konseling Kebiasaan & Burnout", specializationEn: "Habit & Burnout Counseling" }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) {
      alert(lang === "id" ? "Mohon tentukan Tanggal dan Jam!" : "Please select Date and Time!");
      return;
    }
    const selectedExpert = experts.find(ex => ex.id === expert);
    bookConsultation(selectedExpert?.name || "Psikolog Grahita", date, time, notes);
    
    // Clear inputs
    setNotes("");
    setDate("");
    setTime("");
    setSuccess(true);
    setTimeout(() => setSuccess(false), 4000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight font-sans flex items-center gap-2">
          <CalendarDays className="w-6.5 h-6.5 text-[#00D9A0]" />
          {t.consult.title}
        </h2>
        <p className="text-sm text-[#8C90AC] mt-1">{t.consult.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Form Card */}
        <div className="bg-[#161A33]/90 backdrop-blur-md border border-[#33374F]/50 rounded-2xl p-6 shadow-md flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white font-sans tracking-wide">
              {t.consult.formTitle}
            </h3>
            <p className="text-xs text-[#8C90AC]">
              {t.consult.formDesc}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mt-5">
            {/* Expert selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white font-sans block">{t.consult.selectExpert}</label>
              <select
                value={expert}
                onChange={(e) => setExpert(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#12142A] border border-[#33374F]/80 focus:border-[#00D9A0] text-sm text-white rounded-xl outline-none transition-all cursor-pointer"
              >
                {experts.map(ex => (
                  <option key={ex.id} value={ex.id} className="bg-[#12142A] text-white">
                    {ex.name} ({lang === "id" ? ex.specializationId : ex.specializationEn})
                  </option>
                ))}
              </select>
            </div>

            {/* DateTime inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white block">{t.consult.selectDate}</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#12142A] border border-[#33374F]/80 focus:border-[#00D9A0] text-sm text-white rounded-xl outline-none transition-all cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white block">{t.consult.selectTime}</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#12142A] border border-[#33374F]/80 focus:border-[#00D9A0] text-sm text-white rounded-xl outline-none transition-all cursor-pointer"
                />
              </div>
            </div>

            {/* Note area */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white block">{t.consult.complaintNotes}</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t.consult.notesPlaceholder}
                className="w-full h-20 px-3.5 py-2.5 bg-[#12142A] border border-[#33374F]/80 focus:border-[#00D9A0] text-sm text-white rounded-xl placeholder-[#8C90AC]/50 outline-none transition-all"
              />
            </div>

            {success && (
              <div className="p-3 bg-[#00D9A0]/10 border border-[#00D9A0]/20 text-[#00D9A0] rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{t.consult.bookingSuccess}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-[#00D9A0] text-[#00281C] hover:bg-[#00E6A8] rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_4px_16px_rgba(0,217,160,0.15)] cursor-pointer"
            >
              {t.consult.submitBooking}
            </button>
          </form>
        </div>

        {/* Existing Bookings List Column */}
        <div className="bg-[#161A33]/90 backdrop-blur-md border border-[#33374F]/50 rounded-2xl p-6 shadow-md flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white font-sans tracking-wide">
              {t.consult.myBookingsTitle}
            </h3>
            <p className="text-xs text-[#8C90AC]">
              {t.consult.myBookingsDesc}
            </p>
          </div>

          <div className="flex-grow space-y-3 my-5 overflow-y-auto max-h-80 pr-1">
            {myBookings.length === 0 ? (
              <div className="text-center py-12 text-xs text-[#8C90AC] flex flex-col items-center justify-center gap-2 border border-dashed border-[#33374F] rounded-xl">
                <BookmarkCheck className="w-8 h-8 text-[#8C90AC]/40" />
                <span>{t.consult.noBookings}</span>
              </div>
            ) : (
              myBookings.map((bk) => (
                <div key={bk.id} className="p-3.5 bg-[#12142A] border border-[#33374F]/50 rounded-xl space-y-2 hover:border-[#00D9A0]/20 transition-all">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-white leading-tight">
                      {bk.expertName}
                    </span>
                    <span className="px-1.5 py-0.5 bg-[#00D9A0]/10 border border-[#00D9A0]/20 text-[#00D9A0] text-[9px] font-mono font-bold rounded uppercase">
                      Scheduled
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-[#8C90AC] font-mono">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="w-3.5 h-3.5 text-[#00D9A0]" />
                      {bk.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#00D9A0]" />
                      {bk.time}
                    </span>
                  </div>

                  {bk.notes && (
                    <p className="text-xs text-[#E2E5FF] bg-[#161A33] border-l border-[#33374F] pl-2 py-1 italic leading-relaxed">
                      "{bk.notes}"
                    </p>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Quick legal disclaimer note */}
          <div className="p-3 bg-[#1E2240]/60 border border-[#33374F]/30 rounded-xl text-[10px] text-[#8C90AC] leading-relaxed flex gap-2 items-start">
            <AlertCircle className="w-4 h-4 text-[#F5B450] flex-shrink-0 mt-0.5" />
            <span>
              {lang === "id" 
                ? "Layanan rujukan luar sekolah berbayar secara mandiri. Pihak sekolah (BK) hanya memfasilitasi integrasi rekam medis kognitif stres Grahita Band."
                : "External psychologist bookings are self-funded referral programs. Counselor BK only facilitates Grahita Band health record exports."}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
