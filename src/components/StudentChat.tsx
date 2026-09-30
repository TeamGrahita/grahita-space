import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { translations } from "../lib/translations";
import { Send, Sparkles, AlertTriangle, User, MessageSquareHeart } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "graphite";
  text: string;
  timestamp: string;
}

export const StudentChat: React.FC = () => {
  const { lang, currentUser } = useApp();
  const t = translations[lang];

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "graphite",
      text: lang === "id" 
        ? `Halo ${currentUser?.fullName || "Siswa"}! Saya Graphite, asisten AI pelatih kognitif personalmu. Ada keluhan stres akademis atau ingin tips meningkatkan HRV & konsentrasi belajar hari ini?`
        : `Hello ${currentUser?.fullName || "Student"}! I am Graphite, your personal cognitive AI advisor. Do you have any academic stress concerns or want quick tips to raise your HRV & study focus today?`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Seed prompt suggestion chips
  const suggestionChips = lang === "id" ? [
    "Bagaimana cara menaikkan HRV malam hari?",
    "Beri tips menenangkan detak jantung saat ujian fisika.",
    "Bantu atasi pusing akibat begadang semalam.",
    "Apa arti status Overload pada Grahita Band?"
  ] : [
    "How do I increase my HRV overnight?",
    "Give me tips to calm my heart rate during a math quiz.",
    "Help me overcome study fatigue from last night.",
    "What does Overload status mean on the Grahita Band?"
  ];

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toISOString()
    };

    // Prior turns for context; skip the local welcome greeting so the conversation starts with the user
    const history = messages
      .filter(m => m.id !== "welcome")
      .map(m => ({ sender: m.sender, text: m.text }));

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    try {
      // API call to our server-side Express endpoint `/api/chat`
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          lang,
          history
        })
      });

      // The API returns a friendly fallback text even on server errors, so use it when present
      const data = await response.json().catch(() => null);
      const replyText = data?.response || data?.reply;
      if (!replyText) {
        throw new Error("API server-side error");
      }

      const graphiteMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: "graphite",
        text: replyText,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, graphiteMsg]);
    } catch (err) {
      const errorMsg: Message = {
        id: `msg-err-${Date.now()}`,
        sender: "graphite",
        text: lang === "id" 
          ? "Maaf, sistem AI sedang padat kognitif. Silakan periksa koneksi internet atau coba beberapa saat lagi!" 
          : "Apologies, the AI is experiencing high cognitive load. Please check your connection or try again momentarily!",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight font-sans flex items-center gap-2">
          <Sparkles className="w-6.5 h-6.5 text-[#00D9A0] animate-pulse" />
          {t.chat.title}
        </h2>
        <p className="text-sm text-[#8C90AC] mt-1">{t.chat.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat window panel (3 columns) */}
        <div className="lg:col-span-3 bg-[#161A33]/90 backdrop-blur-md border border-[#33374F]/50 rounded-2xl p-4 md:p-6 shadow-md flex flex-col h-[520px] justify-between">
          
          {/* Scrollable chat log */}
          <div className="flex-grow overflow-y-auto space-y-4 pr-1 mb-4">
            {messages.map((msg) => {
              const isGraphite = msg.sender === "graphite";
              return (
                <div key={msg.id} className={`flex ${isGraphite ? "justify-start" : "justify-end"} items-start gap-2.5`}>
                  {isGraphite && (
                    <div className="p-1.5 bg-[#00D9A0]/10 rounded-lg text-[#00D9A0] flex-shrink-0 border border-[#00D9A0]/20 mt-1">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div className="space-y-1 max-w-[80%]">
                    <div className={`p-3.5 rounded-2xl text-xs md:text-sm leading-relaxed ${
                      isGraphite 
                        ? "bg-[#1E2240] text-white rounded-tl-none border border-[#33374F]/40" 
                        : "bg-[#00D9A0] text-[#00281C] font-semibold rounded-tr-none"
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                    
                    <span className="text-[9px] font-mono text-[#8C90AC] block text-right">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {!isGraphite && (
                    <div className="p-1.5 bg-[#3FA9E0]/10 rounded-lg text-[#3FA9E0] flex-shrink-0 border border-[#3FA9E0]/20 mt-1">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {isTyping && (
              <div className="flex justify-start items-center gap-2.5">
                <div className="p-1.5 bg-[#00D9A0]/10 rounded-lg text-[#00D9A0] border border-[#00D9A0]/20">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="bg-[#1E2240] text-xs text-[#8C90AC] font-mono rounded-xl px-4 py-2 flex items-center gap-1">
                  Graphite typing
                  <span className="animate-bounce">.</span>
                  <span className="animate-bounce delay-100">.</span>
                  <span className="animate-bounce delay-200">.</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick reply suggestion chips */}
          {messages.length === 1 && (
            <div className="pb-3 flex flex-wrap gap-2">
              {suggestionChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(chip)}
                  className="px-3 py-1.5 bg-[#12142A]/80 hover:bg-[#1E2240] border border-[#33374F] hover:border-[#00D9A0]/30 text-[10px] md:text-xs text-[#8C90AC] hover:text-white rounded-lg transition-all text-left cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Send Input Bar */}
          <form onSubmit={handleFormSubmit} className="flex gap-2.5 pt-3 border-t border-[#33374F]/40">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t.chat.inputPlaceholder}
              disabled={isTyping}
              className="flex-grow px-4 py-3 bg-[#12142A] border border-[#33374F]/80 focus:border-[#00D9A0] text-sm text-white rounded-xl placeholder-[#8C90AC]/50 outline-none transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isTyping || !inputText.trim()}
              className="px-5 bg-[#00D9A0] hover:bg-[#00E6A8] text-[#00281C] font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:hover:bg-[#00D9A0] cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">{t.chat.sendButton}</span>
            </button>
          </form>
        </div>

        {/* Disclaimer sidebar (1 column) */}
        <div className="bg-[#161A33]/90 backdrop-blur-md border border-[#33374F]/50 rounded-2xl p-5 shadow-md flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-[#8C90AC] uppercase tracking-wider font-mono">
              Graphite Protocol
            </h3>
            <p className="text-xs text-[#8C90AC] leading-relaxed">
              {lang === "id" 
                ? "Graphite dilatih khusus dengan panduan bio-psikologis klinis untuk mendeteksi stres akademis siswa."
                : "Graphite is trained using clinical bio-psychological frameworks to assess student stress factors."}
            </p>
          </div>

          <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-red-400">
              <AlertTriangle className="w-4 h-4" />
              <span>Medical Disclaimer</span>
            </div>
            <p className="text-[10px] text-red-100/70 leading-relaxed text-justify">
              {t.chat.disclaimer}
            </p>
          </div>

          <div className="p-3 bg-[#1E2240] rounded-xl text-[10px] text-[#8C90AC] leading-relaxed text-center">
            {lang === "id" ? "Terintegrasi AI Generatif Gemini" : "Powered by Google Gemini AI"}
          </div>
        </div>
      </div>
    </div>
  );
};
