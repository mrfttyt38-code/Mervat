import React, { useState, useRef, useEffect } from 'react';
import {
  Scale,
  Brain,
  Shield,
  ChevronDown,
  Sparkles,
  BookOpen,
  Flame,
  SlidersHorizontal,
  Volume2,
  MessageCircle,
  Check,
} from 'lucide-react';
import { Jurisdiction, LawBranch, PersonaMode, VoiceTone } from '../types/legal';
import { JURISDICTIONS, LAW_BRANCHES } from '../data/legalTaxonomy';

interface MindHeaderProps {
  jurisdiction: Jurisdiction;
  setJurisdiction: (j: Jurisdiction) => void;
  lawBranch: LawBranch;
  setLawBranch: (b: LawBranch) => void;
  personaMode: PersonaMode;
  setPersonaMode: (p: PersonaMode) => void;
  voiceTone: VoiceTone;
  setVoiceTone: (v: VoiceTone) => void;
  onOpenCognitiveModal: () => void;
}

export const MindHeader: React.FC<MindHeaderProps> = ({
  jurisdiction,
  setJurisdiction,
  lawBranch,
  setLawBranch,
  personaMode,
  setPersonaMode,
  voiceTone,
  setVoiceTone,
  onOpenCognitiveModal,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const voiceToneLabel =
    voiceTone === 'formal' ? 'رسمية' : voiceTone === 'technical' ? 'تقنية' : 'ودية';

  return (
    <header className="border-b border-slate-800 bg-[#0c101a]/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        {/* Top bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Brand & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
              <Scale className="w-6 h-6 text-slate-950" />
            </div>

            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2 whitespace-nowrap">
                <span>العقل المستقل</span>
                <span className="text-amber-400 text-sm font-normal">المحاور الموسوعي والقانوني الشامل</span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                <span>براعة في كل العلوم والمعارف · تكييف قانوني واستنباطي مستقل</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-400">
                  {personaMode === 'natural' ? 'النمط الطبيعي التام' : 'محاور لغوي بلغة الضاد'} · نبرة {voiceToneLabel}
                </span>
              </p>
            </div>
          </div>

          {/* Mind PersonaMode Switcher & Settings Dropdown */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Cognitive Architecture Button */}
            <button
              onClick={onOpenCognitiveModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              title="عرض الهيكلية الإدراكية وطريقة تفكير العقل المستقل"
            >
              <Brain className="w-3.5 h-3.5 text-amber-400" />
              <span>هيكلية العقل المستقل</span>
            </button>

            {/* Persona Mode Switcher */}
            <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-lg">
              <button
                onClick={() => setPersonaMode('natural')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  personaMode === 'natural'
                    ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="النمط الطبيعي التام: حوار مرن وتلقائي بدون قوالب جامدة"
              >
                <MessageCircle className="w-3 h-3" />
                <span>النمط الطبيعي</span>
              </button>

              <button
                onClick={() => setPersonaMode('friendly')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  personaMode === 'friendly'
                    ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="محاور مبسط وسلس"
              >
                <Sparkles className="w-3 h-3" />
                <span>مبسط</span>
              </button>

              <button
                onClick={() => setPersonaMode('authoritative')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  personaMode === 'authoritative'
                    ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="مستشار قضائي رصين وتأصيل متعمق"
              >
                <BookOpen className="w-3 h-3" />
                <span>مستشار قضائي</span>
              </button>

              <button
                onClick={() => setPersonaMode('advocate')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  personaMode === 'advocate'
                    ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="محامٍ مدافع واستراتيجية ثغرات ودفوع"
              >
                <Flame className="w-3 h-3" />
                <span>محامٍ مدافع</span>
              </button>
            </div>

            {/* Autonomous Mind Settings Menu (PersonaMode + Voice Tone) */}
            <div className="relative" ref={settingsRef}>
              <button
                onClick={() => setIsSettingsOpen((o) => !o)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  isSettingsOpen
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                }`}
                title="إعدادات العقل المستقل ونبرة الصوت"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>إعدادات العقل</span>
              </button>

              {isSettingsOpen && (
                <div className="absolute left-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-4 z-50 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <span className="font-bold text-white text-xs flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                      <span>قائمة إعدادات العقل المستقل</span>
                    </span>
                    <button
                      onClick={() => setIsSettingsOpen(false)}
                      className="text-[11px] text-slate-400 hover:text-white cursor-pointer"
                    >
                      إغلاق
                    </button>
                  </div>

                  {/* Natural Persona Toggle */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-semibold text-slate-300">
                      نمط الحوار والشخصية (PersonaMode)
                    </div>
                    <button
                      onClick={() =>
                        setPersonaMode(personaMode === 'natural' ? 'authoritative' : 'natural')
                      }
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-right transition-colors cursor-pointer ${
                        personaMode === 'natural'
                          ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs">تفعيل النمط الطبيعي (Natural Persona)</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          أسلوب حواري مرن وتلقائي بدون قوالب جامدة
                        </div>
                      </div>
                      <span
                        className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                          personaMode === 'natural'
                            ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                            : 'border-slate-600'
                        }`}
                      >
                        {personaMode === 'natural' && <Check className="w-3.5 h-3.5" />}
                      </span>
                    </button>
                  </div>

                  {/* Voice Tone Selector */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>اختيار نبرة الصوت والخطاب</span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'formal' as VoiceTone, label: 'رسمية', desc: 'وقورة ومُحكمة' },
                        { id: 'friendly' as VoiceTone, label: 'ودية', desc: 'مرنة وتلقائية' },
                        { id: 'technical' as VoiceTone, label: 'تقنية', desc: 'دقيقة وإجرائية' },
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setVoiceTone(t.id)}
                          className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                            voiceTone === t.id
                              ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-600'
                          }`}
                        >
                          <div className="text-xs">{t.label}</div>
                          <div
                            className={`text-[10px] mt-0.5 ${
                              voiceTone === t.id ? 'text-slate-900' : 'text-slate-500'
                            }`}
                          >
                            {t.desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sub-bar: Jurisdiction & Law Branch Selectors */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
          {/* Jurisdiction Dropdown */}
          <div className="flex items-center gap-2 flex-1">
            <span className="text-slate-400 shrink-0 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>النظام القضائي:</span>
            </span>
            <div className="relative flex-1 max-w-sm">
              <select
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value as Jurisdiction)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-colors appearance-none pr-7 pl-3"
              >
                {JURISDICTIONS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.flag} {item.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Law Branch Dropdown */}
          <div className="flex items-center gap-2 flex-1 justify-start md:justify-end">
            <span className="text-slate-400 shrink-0 flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-blue-400" />
              <span>المجال المعرفي / القانوني:</span>
            </span>
            <div className="relative flex-1 max-w-sm">
              <select
                value={lawBranch}
                onChange={(e) => setLawBranch(e.target.value as LawBranch)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-colors appearance-none pr-7 pl-3"
              >
                <optgroup label="المجالات الشاملة والعلوم والمعارف">
                  {LAW_BRANCHES.filter((b) => b.domain !== 'law').map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.label}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="فروع القانون والقضاء">
                  {LAW_BRANCHES.filter((b) => b.domain === 'law').map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.label}
                    </option>
                  ))}
                </optgroup>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
