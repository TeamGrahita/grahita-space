import React from "react";
import { useApp } from "../context/AppContext";
import { LogOut, HeartPulse } from "lucide-react";
import { translations } from "../lib/translations";

export const Navbar: React.FC = () => {
  const { currentUser, lang, setLanguage, logout } = useApp();
  const t = translations[lang];

  // Helper to extract user initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <nav className="w-full glass-navbar sticky top-0 z-40 px-6 md:px-12 py-3.5 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.15)]">
      {/* Brand logo */}
      <div className="flex items-center gap-3">
        <div className="p-1.5 bg-[#00D9A0]/10 rounded-lg border border-[#00D9A0]/20 shadow-[0_0_12px_rgba(0,217,160,0.15)]">
          <HeartPulse className="w-6 h-6 text-[#00D9A0]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight font-display leading-none flex items-center gap-1.5">
            Grahita<span className="text-[#00D9A0]">Space</span>
          </h1>
          <span className="text-[10px] font-sans text-[#8C90AC] tracking-wider uppercase font-semibold">help better understand students</span>
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-5">
        {/* Language switcher */}
        <div className="flex items-center bg-[#12142A]/60 border border-[#33374F] rounded-full p-1 shadow-inner">
          <button
            onClick={() => setLanguage("id")}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 ${
              lang === "id"
                ? "bg-[#00D9A0] text-[#00281C] shadow-sm font-bold"
                : "text-[#8C90AC] hover:text-white"
            }`}
          >
            ID
          </button>
          <button
            onClick={() => setLanguage("en")}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 ${
              lang === "en"
                ? "bg-[#00D9A0] text-[#00281C] shadow-sm font-bold"
                : "text-[#8C90AC] hover:text-white"
            }`}
          >
            EN
          </button>
        </div>

        {currentUser && (
          <div className="flex items-center gap-4">
            {/* User details & Glass Avatar chip */}
            <div className="flex items-center gap-3 pl-4 border-l border-[#33374F]">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-semibold text-white leading-tight font-sans">
                  {currentUser.fullName}
                </span>
                <span className="text-[10px] text-[#8C90AC] font-mono capitalize tracking-wide">
                  {t.roles[currentUser.role]}
                </span>
              </div>

              {/* Glass avatar chip */}
              <div className="w-9 h-9 rounded-full bg-[#282C4E]/40 border border-white/20 flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.3)] backdrop-blur-md">
                <span className="text-xs font-extrabold text-white tracking-tight font-display">
                  {getInitials(currentUser.fullName)}
                </span>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={logout}
              title={t.common.logout}
              className="p-2 bg-[#282C4E]/40 hover:bg-[#F2545B]/15 hover:text-[#F2545B] hover:border-[#F2545B]/30 border border-white/10 text-[#8C90AC] rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center shadow-sm"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};
