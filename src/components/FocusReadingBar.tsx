import React from 'react';
import {
  Minimize2,
  ZoomIn,
  ZoomOut,
  Type,
  BookOpen,
  Palette,
  FileText,
  ListFilter,
  X,
} from 'lucide-react';

export type ReadingTheme = 'obsidian' | 'parchment' | 'pure-black';
export type ReadingFont = 'cairo' | 'amiri' | 'ibm';

interface FocusReadingBarProps {
  fontSize: number; // 14 to 22
  setFontSize: React.Dispatch<React.SetStateAction<number>>;
  readingTheme: ReadingTheme;
  setReadingTheme: (theme: ReadingTheme) => void;
  readingFont: ReadingFont;
  setReadingFont: (font: ReadingFont) => void;
  lineHeight: 'relaxed' | 'loose';
  setLineHeight: (lh: 'relaxed' | 'loose') => void;
  onExitFocusMode: () => void;
  isSingleMemoMode: boolean;
  onToggleSingleMemoMode?: () => void;
  currentMemoTitle?: string;
}

export const FocusReadingBar: React.FC<FocusReadingBarProps> = ({
  fontSize,
  setFontSize,
  readingTheme,
  setReadingTheme,
  readingFont,
  setReadingFont,
  lineHeight,
  setLineHeight,
  onExitFocusMode,
  isSingleMemoMode,
  onToggleSingleMemoMode,
  currentMemoTitle,
}) => {
  return (
    <div className="sticky top-0 z-50 border-b border-amber-500/20 bg-slate-950/90 backdrop-blur-md px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xl animate-fadeIn">
      {/* Left indicator & Title */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <BookOpen className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-amber-400 text-xs sm:text-sm">وضع القراءة المركزة</span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
              مساحة موسعة وخالية من المشتتات
            </span>
          </div>
          {currentMemoTitle && (
            <p className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md mt-0.5">
              {currentMemoTitle}
            </p>
          )}
        </div>
      </div>

      {/* Center Reading Customizers: Font Size, Font Family, Theme */}
      <div className="flex flex-wrap items-center gap-2">
        
        {/* Font Size Adjusters */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
          <button
            onClick={() => setFontSize((prev) => Math.max(13, prev - 1))}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
            title="تصغير حجم الخط (A-)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="px-2 text-slate-300 font-mono text-[11px] font-semibold">
            {fontSize}px
          </span>
          <button
            onClick={() => setFontSize((prev) => Math.min(24, prev + 1))}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
            title="تكبير حجم الخط (A+)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Font Family Selector */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
          <button
            onClick={() => setReadingFont('amiri')}
            className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
              readingFont === 'amiri'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
            title="خط الأميري القضائي التراثي"
          >
            الأميري
          </button>
          <button
            onClick={() => setReadingFont('cairo')}
            className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
              readingFont === 'cairo'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
            title="خط القاهرة العصري"
          >
            القاهرة
          </button>
          <button
            onClick={() => setReadingFont('ibm')}
            className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
              readingFont === 'ibm'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
            title="خط النسخ التقني"
          >
            النسخ
          </button>
        </div>

        {/* Theme Palette */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
          <button
            onClick={() => setReadingTheme('obsidian')}
            className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
              readingTheme === 'obsidian'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
            title="المظهر الداكن الرخامي"
          >
            داكن
          </button>
          <button
            onClick={() => setReadingTheme('parchment')}
            className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
              readingTheme === 'parchment'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
            title="ورق قضائي دافئ (Warm Sepia)"
          >
            ورق دافئ
          </button>
          <button
            onClick={() => setReadingTheme('pure-black')}
            className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
              readingTheme === 'pure-black'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
            title="أسود معتم OLED"
          >
            أسود فاحم
          </button>
        </div>

        {/* Line Height Toggle */}
        <button
          onClick={() => setLineHeight(lineHeight === 'relaxed' ? 'loose' : 'relaxed')}
          className={`px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
            lineHeight === 'loose'
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
          title="تبديل تباعد الأسطر (مريح / قياسي)"
        >
          تباعد: {lineHeight === 'loose' ? 'مريح واسع' : 'قياسي'}
        </button>

        {/* Mode toggle if single memo viewing */}
        {onToggleSingleMemoMode && (
          <button
            onClick={onToggleSingleMemoMode}
            className={`px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer flex items-center gap-1 ${
              isSingleMemoMode
                ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title={isSingleMemoMode ? 'عرض كامل الحوار' : 'عزل المذكرة فقط'}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{isSingleMemoMode ? 'كامل الحوار' : 'عزل المذكرة'}</span>
          </button>
        )}
      </div>

      {/* Exit Button */}
      <button
        onClick={onExitFocusMode}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all cursor-pointer shadow-md shadow-amber-500/20 shrink-0"
        title="إنهاء وضع القراءة المركزة والعودة للواجهة الكاملة (Esc)"
      >
        <Minimize2 className="w-3.5 h-3.5" />
        <span>إنهاء التركيز (Esc)</span>
      </button>
    </div>
  );
};
