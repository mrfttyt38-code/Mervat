import React from 'react';
import { X, Brain, Scale, Shield, Sparkles, CheckCircle2, Cpu, BookOpen, MessageSquare } from 'lucide-react';

interface MindCognitiveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MindCognitiveModal: React.FC<MindCognitiveModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Brain className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                الهيكلية الإدراكية لـ "العقل المستقل" (Autonomous Legal Mind)
              </h3>
              <p className="text-xs text-slate-400">
                كيف يعالج المحاور اللغوي القضايا ويفكك النزاعات القانونية
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cognitive Layers */}
        <div className="space-y-4 text-xs">
          {/* Layer 1 */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 font-bold text-amber-400 mb-1.5">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-xs">
                1
              </span>
              <span>الطبقة الأولى: التكييف القانوني المستقل (Autonomous Legal Qualification)</span>
            </div>
            <p className="text-slate-300 leading-relaxed pr-7">
              لا يقتصر العقل على الإجابة السطحية؛ بل يفرز الوقائع ويستبعد الحشو، ويحدد التكييف الدقيق: هل هو إخلال عقدي أم مسؤولية تقصيرية؟ جناية أم جنحة؟ تصرف مدني أم إداري؟
            </p>
          </div>

          {/* Layer 2 */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 font-bold text-blue-400 mb-1.5">
              <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-xs">
                2
              </span>
              <span>الطبقة الثانية: الاستدعاء التشريعي والقضائي (Statutory & Precedent Grounding)</span>
            </div>
            <p className="text-slate-300 leading-relaxed pr-7">
              يربط الواقعة المكيفة بالنصوص القانونية الآمرة والمكملة وفقاً للنظام القضائي المختار (مصر، السعودية، الإمارات، الأنظمة المقارنة)، ومبادئ محاكم النقض والتمييز المستقرة.
            </p>
          </div>

          {/* Layer 3 */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 font-bold text-emerald-400 mb-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xs">
                3
              </span>
              <span>الطبقة الثالثة: المحاور اللغوي الطبيعي (Natural Dialectic & Legal Rhetoric)</span>
            </div>
            <p className="text-slate-300 leading-relaxed pr-7">
              يصوغ الاستشارة بأسلوب حواري طبيعي فصيح، يتكيف حسب النبرة المطلوبة (لغة مبسطة واضحة للمواطن، أو لغة فقهية وقضائية رصينة للمحامين والقضاة، أو لغة هجومية ودفاعية للتقاضي).
            </p>
          </div>

          {/* Layer 4 */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 font-bold text-purple-400 mb-1.5">
              <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center text-xs">
                4
              </span>
              <span>الطبقة الرابعة: استخلاص الحلول العملية والدفوع (Actionable Remedies & Pleas)</span>
            </div>
            <p className="text-slate-300 leading-relaxed pr-7">
              يقدم خطوات تنفيذية ملموسة: مواعيد الطعن، مدد التقادم، إنذارات رسمية مطلوبة، وصيغ الدفوع الشكلية والموضوعية.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            فهمت، العودة للمحاورة القانونية
          </button>
        </div>
      </div>
    </div>
  );
};
