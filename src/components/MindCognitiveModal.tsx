import React from 'react';
import { X, Brain, Volume2, MessageCircle, Check } from 'lucide-react';
import { PersonaMode, VoiceTone } from '../types/legal';

interface MindCognitiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  personaMode: PersonaMode;
  setPersonaMode: (p: PersonaMode) => void;
  voiceTone: VoiceTone;
  setVoiceTone: (v: VoiceTone) => void;
}

export const MindCognitiveModal: React.FC<MindCognitiveModalProps> = ({
  isOpen,
  onClose,
  personaMode,
  setPersonaMode,
  voiceTone,
  setVoiceTone,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Brain className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                الهيكلية الإدراكية وإعدادات "العقل المستقل"
              </h3>
              <p className="text-xs text-slate-400">
                تخصيص نمط المحاورة، النبرة الصوتية، وطبقات التحليل العلمي والقضائي الشامل
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Interactive Settings Section inside Modal */}
        <div className="mb-5 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="text-xs font-bold text-amber-400 flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            <span>ضبط نمط الشخصية (PersonaMode) ونبرة الصوت</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              {
                id: 'natural' as PersonaMode,
                title: 'النمط الطبيعي (Natural Persona)',
                desc: 'حوار مرن وتلقائي وذكي بدون قوالب جامدة',
              },
              {
                id: 'friendly' as PersonaMode,
                title: 'محاور مبسط وسلس',
                desc: 'تبسيط المفاهيم القانونية بأمثلة واضحة',
              },
              {
                id: 'authoritative' as PersonaMode,
                title: 'مستشار قضائي',
                desc: 'أسلوب استشاري رصين وأحكام عليا',
              },
              {
                id: 'advocate' as PersonaMode,
                title: 'محامٍ مدافع',
                desc: 'تركيز على الدفوع وكشف ثغرات الخصم',
              },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setPersonaMode(mode.id)}
                className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex items-start justify-between gap-2 ${
                  personaMode === mode.id
                    ? 'bg-emerald-950/30 border-emerald-500/60 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">{mode.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{mode.desc}</div>
                </div>
                {personaMode === mode.id && (
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                )}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800">
            <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              <span>نبرة الصوت والخطاب (Voice Tone):</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'formal' as VoiceTone, title: 'رسمية', desc: 'لغة قضائية وقورة' },
                { id: 'friendly' as VoiceTone, title: 'ودية', desc: 'حوار دافئ وطبيعي' },
                { id: 'technical' as VoiceTone, title: 'تقنية', desc: 'مصطلحات نظامية دقيقة' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setVoiceTone(t.id)}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    voiceTone === t.id
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs">{t.title}</div>
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

        {/* Cognitive Layers */}
        <div className="space-y-3 text-xs">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="font-bold text-amber-400 mb-1">
              01. الاستدلال العلمي والكمي والبرمجي (Polymathic Synthesis)
            </div>
            <p className="text-slate-300 leading-relaxed">
              يستوعب مسائل الفيزياء والرياضيات والهندسة والبرمجة والذكاء الاصطناعي والطب والاقتصاد والفلسفة، ويقدم البراهين والمعادلات والأكواد القابلة للتنفيذ بمنهجية علمية دقيقة.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="font-bold text-blue-400 mb-1">
              02. التكييف القانوني والاستدعاء التشريعي (Autonomous Legal Grounding)
            </div>
            <p className="text-slate-300 leading-relaxed">
              يفرز الوقائع القانونية ويحدد التوصيف الدقيق ويربطها بالنصوص القانونية الآمرة والمكملة وفقاً للنظام القضائي المختار ومبادئ المحاكم العليا.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="font-bold text-emerald-400 mb-1">
              03. المحاور اللغوي الطبيعي (Natural Dialectic)
            </div>
            <p className="text-slate-300 leading-relaxed">
              يتخاطب بأسلوب طبيعي مرن وتلقائي يتكيف مع النبرة الصوتية المختارة (رسمية، ودية، أو تقنية) وسياق الموضوع دون جمود.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            حفظ الإعدادات والعودة للمحاورة
          </button>
        </div>
      </div>
    </div>
  );
};
