import React from 'react';
import { Scale, Brain, Shield, ChevronDown, Sparkles, BookOpen, UserCheck, Flame } from 'lucide-react';
import { Jurisdiction, LawBranch, PersonaMode } from '../types/legal';
import { JURISDICTIONS, LAW_BRANCHES } from '../data/legalTaxonomy';

interface MindHeaderProps {
  jurisdiction: Jurisdiction;
  setJurisdiction: (j: Jurisdiction) => void;
  lawBranch: LawBranch;
  setLawBranch: (b: LawBranch) => void;
  personaMode: PersonaMode;
  setPersonaMode: (p: PersonaMode) => void;
  onOpenCognitiveModal: () => void;
}

export const MindHeader: React.FC<MindHeaderProps> = ({
  jurisdiction,
  setJurisdiction,
  lawBranch,
  setLawBranch,
  personaMode,
  setPersonaMode,
  onOpenCognitiveModal,
}) => {
  return (
    <header className="border-b border-slate-800 bg-[#0c101a]/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        {/* Top bar with identity and autonomous mind metrics */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Brand & Mind Status */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20 mind-glow">
                <Scale className="w-6 h-6 text-slate-950" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-950 rounded-full flex items-center justify-center" title="العقل الإدراكي متصل ونشط">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span>العقل المستقل</span>
                  <span className="text-amber-400 text-sm font-normal">المحاور القانوني الذكي</span>
                </h1>
                <span className="hidden sm:inline-block text-xs bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                <span>تفكير استنباطي وتكييف قضائي مستقل</span>
                <span className="text-slate-600">·</span>
                <span className="text-emerald-400">محاور لغوي طبيعي بلغة الضاد</span>
              </p>
            </div>
          </div>

          {/* Quick Mind Controls & Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            
            {/* Cognitive Architecture Explainer Button */}
            <button
              onClick={onOpenCognitiveModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 transition-colors cursor-pointer"
              title="عرض الهيكلية الإدراكية وطريقة تفكير العقل المستقل"
            >
              <Brain className="w-3.5 h-3.5 text-amber-400" />
              <span>هيكلية العقل المستقل</span>
            </button>

            {/* Persona Mode Switcher */}
            <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-lg">
              <button
                onClick={() => setPersonaMode('friendly')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
                  personaMode === 'friendly'
                    ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="محاور طبيعي سلس ومبسط للمواطنين ورجال الأعمال"
              >
                <Sparkles className="w-3 h-3" />
                <span>محاور طبيعي</span>
              </button>

              <button
                onClick={() => setPersonaMode('authoritative')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
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
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
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
              <span>الفرع التخصصي:</span>
            </span>
            <div className="relative flex-1 max-w-sm">
              <select
                value={lawBranch}
                onChange={(e) => setLawBranch(e.target.value as LawBranch)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-colors appearance-none pr-7 pl-3"
              >
                {LAW_BRANCHES.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5 pointer-events-none" />
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};
