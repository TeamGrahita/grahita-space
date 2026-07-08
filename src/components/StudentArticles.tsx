import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { articlesData } from "../lib/articlesData";
import { translations } from "../lib/translations";
import { BookOpen, Clock, ChevronRight, ArrowLeft, HeartPulse } from "lucide-react";
import { Article } from "../types";

export const StudentArticles: React.FC = () => {
  const { lang } = useApp();
  const t = translations[lang];
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  if (selectedArticle) {
    // Detailed Article View
    return (
      <div className="space-y-6 animate-fadeIn">
        {/* Back navigation */}
        <button
          onClick={() => setSelectedArticle(null)}
          className="flex items-center gap-2 text-xs font-bold text-[#00D9A0] hover:text-[#00E6A8] font-sans transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.common.back}
        </button>

        {/* Full Article Card */}
        <div className="bg-[#161A33]/90 backdrop-blur-md border border-[#33374F]/50 rounded-2xl overflow-hidden shadow-md">
          <div className="h-64 w-full relative">
            <img 
              src={selectedArticle.imageUrl} 
              alt="Article Cover" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#161A33] via-transparent to-transparent" />
            
            {/* Category tag */}
            <span className="absolute bottom-4 left-6 px-3 py-1 bg-[#00D9A0] text-[#00281C] text-xs font-extrabold uppercase rounded-full font-mono shadow-md">
              {lang === "id" ? selectedArticle.categoryId : selectedArticle.categoryEn}
            </span>
          </div>

          <div className="p-6 md:p-8 space-y-4">
            <div className="flex items-center gap-4 text-xs font-mono text-[#8C90AC]">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {selectedArticle.readTime} Read
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[#00D9A0]">
                <HeartPulse className="w-3.5 h-3.5" />
                Verified Clinical Science
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold text-white font-sans tracking-tight leading-tight">
              {lang === "id" ? selectedArticle.titleId : selectedArticle.titleEn}
            </h2>

            {/* Main content body */}
            <p className="text-sm text-[#E2E5FF] leading-relaxed text-justify whitespace-pre-wrap font-sans pt-3 border-t border-[#33374F]/40">
              {lang === "id" ? selectedArticle.contentId : selectedArticle.contentEn}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight font-sans flex items-center gap-2">
          <BookOpen className="w-6.5 h-6.5 text-[#00D9A0]" />
          {t.articles.title}
        </h2>
        <p className="text-sm text-[#8C90AC] mt-1">{t.articles.subtitle}</p>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articlesData.map((art) => (
          <div 
            key={art.id}
            className="bg-[#161A33]/90 backdrop-blur-md border border-[#33374F]/50 rounded-2xl overflow-hidden shadow-md flex flex-col justify-between group hover:border-[#00D9A0]/20 transition-all duration-300"
          >
            {/* Cover image */}
            <div className="h-44 w-full relative overflow-hidden">
              <img 
                src={art.imageUrl} 
                alt="article image" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-3 left-4 px-2 py-0.5 bg-[#0B0D1F]/80 backdrop-blur-md border border-[#33374F]/50 text-[#00D9A0] text-[10px] font-mono font-bold rounded-md">
                {lang === "id" ? art.categoryId : art.categoryEn}
              </span>
            </div>

            {/* Content info */}
            <div className="p-5 space-y-3 flex-grow flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-[10px] font-mono text-[#8C90AC]">
                  <Clock className="w-3 h-3" />
                  {art.readTime}
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-[#00D9A0] transition-colors leading-snug">
                  {lang === "id" ? art.titleId : art.titleEn}
                </h3>
                <p className="text-xs text-[#8C90AC] leading-relaxed line-clamp-2">
                  {lang === "id" ? art.excerptId : art.excerptEn}
                </p>
              </div>

              <div className="pt-4 border-t border-[#33374F]/20">
                <button
                  onClick={() => setSelectedArticle(art)}
                  className="text-xs font-bold text-[#00D9A0] hover:text-[#00E6A8] flex items-center gap-1.5 font-sans transition-all cursor-pointer"
                >
                  {t.articles.readMore}
                  <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
