import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Activity, Radio, Wifi, WifiOff, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { translations } from "../lib/translations";

export const GrahitaSimulator: React.FC = () => {
  const { currentUser, students, pushSimulatedBiometrics, toggleBandConnection, lang } = useApp();
  const [isOpen, setIsOpen] = useState(true);

  // Determine active student to simulate
  let targetStudentUsername = "siswa";
  if (currentUser) {
    if (currentUser.role === "siswa") {
      targetStudentUsername = currentUser.username;
    } else if (currentUser.role === "orang_tua" && currentUser.linkedChildUsername) {
      targetStudentUsername = currentUser.linkedChildUsername;
    }
  }

  const studentProfile = students[targetStudentUsername];
  if (!studentProfile) return null;

  const history = studentProfile.biometricsHistory || [];
  const currentReading = history[history.length - 1];
  const t = translations[lang];

  // Presets
  const applyPreset = (type: "optimal" | "load" | "overload") => {
    if (type === "optimal") {
      pushSimulatedBiometrics(targetStudentUsername, 72, 78, "optimal");
    } else if (type === "load") {
      pushSimulatedBiometrics(targetStudentUsername, 92, 45, "load");
    } else if (type === "overload") {
      pushSimulatedBiometrics(targetStudentUsername, 112, 24, "overload");
    }
  };

  const handleBpmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const bpm = parseInt(e.target.value);
    const hrv = currentReading ? currentReading.hrv : 55;
    let status: "optimal" | "load" | "overload" = "optimal";
    if (bpm > 100 || hrv < 35) status = "overload";
    else if (bpm > 85 || hrv < 50) status = "load";
    pushSimulatedBiometrics(targetStudentUsername, bpm, hrv, status);
  };

  const handleHrvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hrv = parseInt(e.target.value);
    const bpm = currentReading ? currentReading.bpm : 75;
    let status: "optimal" | "load" | "overload" = "optimal";
    if (bpm > 100 || hrv < 35) status = "overload";
    else if (bpm > 85 || hrv < 50) status = "load";
    pushSimulatedBiometrics(targetStudentUsername, bpm, hrv, status);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full glass-panel rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] overflow-hidden transition-all duration-300">
      {/* Header */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between p-4 bg-white/5 border-b border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${studentProfile.isConnected ? "bg-[#00D9A0]" : "bg-red-400"}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${studentProfile.isConnected ? "bg-[#00D9A0]" : "bg-red-500"}`}></span>
          </span>
          <Activity className="w-4 h-4 text-[#00D9A0]" />
          <h4 className="text-sm font-semibold text-white font-display tracking-wide">
            Grahita Band Hardware Simulator
          </h4>
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4 text-[#8C90AC]" /> : <ChevronUp className="w-4 h-4 text-[#8C90AC]" />}
      </div>

      {/* Body */}
      {isOpen && (
        <div className="p-4 space-y-4">
          {/* Target Student Info */}
          <div className="flex items-center justify-between bg-white/5 px-3 py-2 rounded-xl text-xs text-[#8C90AC] border border-white/5">
            <span>Simulating: <strong className="text-white">{studentProfile.fullName}</strong></span>
            <span className="flex items-center gap-1">
              {studentProfile.isConnected ? (
                <Wifi className="w-3.5 h-3.5 text-[#00D9A0]" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-red-400" />
              )}
              {studentProfile.isConnected ? t.common.connected : t.common.disconnected}
            </span>
          </div>

          {/* Connection Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#8C90AC]">Band Radio Connection</span>
            <button
              onClick={() => toggleBandConnection(targetStudentUsername, !studentProfile.isConnected)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 cursor-pointer ${
                studentProfile.isConnected 
                  ? "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20" 
                  : "bg-[#00D9A0]/10 text-[#00D9A0] border border-[#00D9A0]/20 hover:bg-[#00D9A0]/20"
              }`}
            >
              {studentProfile.isConnected ? t.common.disconnectDevice : t.common.connectDevice}
            </button>
          </div>

          {studentProfile.isConnected && currentReading && (
            <>
              {/* Sliders */}
              <div className="space-y-3">
                {/* BPM Slider */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#8C90AC]">Heart Rate (BPM)</span>
                    <span className="font-semibold text-white font-mono">{currentReading.bpm} BPM</span>
                  </div>
                  <input
                    type="range"
                    min="55"
                    max="135"
                    value={currentReading.bpm}
                    onChange={handleBpmChange}
                    className="w-full h-1.5 bg-[#12142A] rounded-lg appearance-none cursor-pointer accent-[#00D9A0]"
                  />
                </div>

                {/* HRV Slider */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#8C90AC]">HRV (ms)</span>
                    <span className="font-semibold text-white font-mono">{currentReading.hrv} ms</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="105"
                    value={currentReading.hrv}
                    onChange={handleHrvChange}
                    className="w-full h-1.5 bg-[#12142A] rounded-lg appearance-none cursor-pointer accent-[#00D9A0]"
                  />
                </div>
              </div>

              {/* Stress Presets */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-wider text-[#8C90AC] block font-semibold">Stress Presets</span>
                <div className="grid grid-cols-3 gap-2">
                  {/* Optimal */}
                  <button
                    onClick={() => applyPreset("optimal")}
                    className="py-1 px-2 text-[10px] bg-[#00D9A0]/10 text-[#00D9A0] border border-[#00D9A0]/20 rounded-lg font-medium hover:bg-[#00D9A0]/20 transition-all text-center cursor-pointer"
                  >
                    Optimal
                  </button>
                  {/* Load */}
                  <button
                    onClick={() => applyPreset("load")}
                    className="py-1 px-2 text-[10px] bg-[#F5B450]/10 text-[#F5B450] border border-[#F5B450]/20 rounded-lg font-medium hover:bg-[#F5B450]/20 transition-all text-center cursor-pointer"
                  >
                    Alert / Load
                  </button>
                  {/* Overload */}
                  <button
                    onClick={() => applyPreset("overload")}
                    className="py-1 px-2 text-[10px] bg-[#F2545B]/10 text-[#F2545B] border border-[#F2545B]/20 rounded-lg font-medium hover:bg-[#F2545B]/20 transition-all text-center cursor-pointer"
                  >
                    Overload
                  </button>
                </div>
              </div>
            </>
          )}

          {!studentProfile.isConnected && (
            <div className="text-center p-4 bg-[#12142A]/60 rounded-xl border border-dashed border-[#33374F]">
              <p className="text-xs text-[#8C90AC]">
                Grahita Band is offline. The dashboard will show a placeholder/offline state. Re-connect to start transmitting.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
