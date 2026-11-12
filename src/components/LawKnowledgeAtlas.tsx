import React, { useState } from 'react';
import {
  Scale,
  BookOpen,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  Info,
  ChevronLeft,
  CheckCircle2,
} from 'lucide-react';
import { LEGAL_MAXIMS, LAW_BRANCHES } from '../data/legalTaxonomy';
import { LawBranch } from '../types/legal';

interface LawKnowledgeAtlasProps {
  onSelectBranch: (branch: LawBranch) => void;
  onConsultMaxim: (query: string) => void;
}

export const LawKnowledgeAtlas: React.FC<LawKnowledgeAtlasProps> = ({
  onSelectBranch,
  onConsultMaxim,
}) => {
  const [activeTab, setActiveTab] = useState<'branches' | 'maxims'>('branches');
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);

  return (
    <div className="max-w-6xl mx-auto w-full px-4 py-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold mb-1">
              <Layers className="w-5 h-5 text-amber-400" />
              <span>شجرة القانون العام والقواعد الكلية</span>
            </div>
            <h2 className="text-xl font-bold text-white">
              أطلس المعرفة القانونية والهيكلية الفقهية المنظمة
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              تصفح فروع القانون العام والخاص والمبادئ الكبرى الحاكمة لفض النزاعات وتفسير النصوص التشريعية.
            </p>
          </div>

          {/* Tab selector */}
          <div className="flex items-center bg-slate-950 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('branches')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'branches'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              فروع وتصنيفات القانون
            </button>
            <button
              onClick={() => setActiveTab('maxims')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'maxims'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              القواعد القانونية والفقهية الكبرى
            </button>
          </div>
        </div>
      </div>

      {/* Branches View */}
      {activeTab === 'branches' && (
        <div className="space-y-6">
          {/* General Law vs Private Law Big Split explanation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Public Law */}
            <div className="bg-gradient-to-br from-amber-950/20 to-slate-900 border border-amber-500/20 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-base mb-2">
                <Shield className="w-5 h-5 text-amber-400" />
                <span>القانون العام (Public Law)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                مجموعة القواعد القانونية التي تنظم العلاقات التي تكون الدولة طرفاً فيها بصفتها صاحبة سيادة وسلطان عام. يهدف لتحقيق الصالح العام والنظام والأمن.
              </p>
              <div className="space-y-2">
                <div className="text-xs font-semibold text-amber-300">الفروع الرئيسية:</div>
                <ul className="text-xs text-slate-400 space-y-1 pr-2">
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>القانون الدستوري (نظام الحكم، السلطات، والحريات العامة)</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>القانون الإداري وقضاء مجلس الدولة (نشاط الإدارة، والقرارات والعقود الإدارية)</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>القانون الجنائي والعقوبات (حماية المجتمع، الجرائم، والعقوبات)</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>القانون المالي والضريبي (الموازنة العامة للدولة والموارد)</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>القانون الدولي العام (العلاقات بين الدول والمنظمات الدولية)</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Private Law */}
            <div className="bg-gradient-to-br from-blue-950/20 to-slate-900 border border-blue-500/20 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-base mb-2">
                <Scale className="w-5 h-5 text-blue-400" />
                <span>القانون الخاص (Private Law)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                مجموعة القواعد التي تنظم العلاقات بين الأفراد أو بينهم وبين الدولة حين تتصرف كشخص عادي دون سيادة. يركز على حماية الحقوق والمصالح الذاتية.
              </p>
              <div className="space-y-2">
                <div className="text-xs font-semibold text-blue-300">الفروع الرئيسية:</div>
                <ul className="text-xs text-slate-400 space-y-1 pr-2">
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    <span>القانون المدني والشريعة العامة (أم القوانين، العقود والالتزامات والملكية)</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    <span>القانون التجاري والشركات (الأعمال التجارية، الأوراق المالية، والشركات)</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    <span>قانون العمل والتأمينات (علاقات العمل التبعية وحماية الأجراء)</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    <span>قانون المرافعات المدنية والتجارية (إجراءات التقاضي والدفوع والتنفيذ)</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    <span>القانون الدولي الخاص (تنازع القوانين والاختصاص القضائي الدولي)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Interactive Branch Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {LAW_BRANCHES.map((b) => (
              <div
                key={b.id}
                className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-xl p-4 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-400 group-hover:underline">
                      {b.label}
                    </span>
                    <Scale className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {b.summary}
                  </p>
                </div>

                <button
                  onClick={() => onSelectBranch(b.id)}
                  className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 text-xs font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>استشارة في هذا الفرع</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legal Maxims View */}
      {activeTab === 'maxims' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {LEGAL_MAXIMS.map((maxim, idx) => (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 hover:border-amber-500/30 rounded-2xl p-5 flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {maxim.branch}
                  </span>
                  {maxim.latin && (
                    <span className="text-[10px] text-slate-500 font-mono italic">
                      {maxim.latin}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white mb-2 leading-snug">
                  "{maxim.arabic}"
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {maxim.meaning}
                </p>

                <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80 mb-4">
                  <span className="text-[11px] text-slate-400 block font-semibold mb-0.5">
                    مجال التطبيق القضائي:
                  </span>
                  <span className="text-xs text-slate-300">
                    {maxim.application}
                  </span>
                </div>
              </div>

              <button
                onClick={() =>
                  onConsultMaxim(
                    `أريد فهم أبعاد القاعدة القانونية الكبرى: "${maxim.arabic}"، وكيف يتم توظيفها كدفع جوهري أمام المحكمة أو في تفسير العقود والنزاعات؟`
                  )
                }
                className="w-full py-2 bg-slate-800/90 hover:bg-amber-500 hover:text-slate-950 text-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>محاورة العقل المستقل حول هذه القاعدة</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
