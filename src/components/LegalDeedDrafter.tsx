import React, { useState } from 'react';
import {
  FileEdit,
  Gavel,
  Copy,
  Check,
  Printer,
  Sparkles,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { Jurisdiction } from '../types/legal';

interface LegalDeedDrafterProps {
  jurisdiction: Jurisdiction;
}

export const LegalDeedDrafter: React.FC<LegalDeedDrafterProps> = ({ jurisdiction }) => {
  const [deedType, setDeedType] = useState('صحيفة افتتاح دعوى قضائية (مطالبة بتعويض وفسخ)');
  const [clientDetails, setClientDetails] = useState('السيد/ أحمد محمود (بصفته المشتري / الدائن)');
  const [opponentDetails, setOpponentDetails] = useState('شركة التطوير العقاري الحديثة (بصفتها البائع / المدين)');
  const [caseFacts, setCaseFacts] = useState(
    'بتاريخ 15/01/2024 تم التعاقد على شراء وحدة سكنية مع سداد 50% من القيمة، على أن يتم التسليم النهائي بتاريخ 01/01/2025. ورغم فوات الموعد بأكثر من عام وامتناع الشركة عن التسليم أو إثبات الجدية وتوقف الأعمال، مع توجيه إنذار رسمي دون جدوى.'
  );
  const [claims, setClaims] = useState(
    'أولاً: الحكم بفسخ عقد البيع المؤرخ 15/01/2024. ثانياً: إلزام المدعى عليها برد كافة المبالغ المسددة وفوائدها القانونية مع التعويض الجابر للأضرار المادية والمعنوية.'
  );

  const [isDrafting, setIsDrafting] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quick preset templates
  const applyPreset = (type: string, client: string, opponent: string, facts: string, reqs: string) => {
    setDeedType(type);
    setClientDetails(client);
    setOpponentDetails(opponent);
    setCaseFacts(facts);
    setClaims(reqs);
  };

  const handleGenerate = async () => {
    if (!caseFacts.trim()) return;

    setIsDrafting(true);
    setError(null);
    setGeneratedDraft(null);

    try {
      const response = await fetch('/api/legal-mind/draft-deed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deedType,
          clientDetails,
          opponentDetails,
          caseFacts,
          claims,
          jurisdiction,
        }),
      });

      if (!response.ok) {
        throw new Error(`خطأ في استجابة الخادم: ${response.statusText}`);
      }

      const data = await response.json();
      setGeneratedDraft(data.draft || 'لم يتم استلام صياغة.');
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'حدث خطأ أثناء الصياغة القانونية');
    } finally {
      setIsDrafting(false);
    }
  };

  const handleCopy = () => {
    if (!generatedDraft) return;
    navigator.clipboard.writeText(generatedDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    if (!generatedDraft) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html dir="rtl" lang="ar">
        <head>
          <title>${deedType} - صياغة العقل المستقل</title>
          <style>
            body { font-family: 'Amiri', 'Traditional Arabic', serif; padding: 50px; color: #020617; line-height: 2; font-size: 16px; }
            .deed-header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 30px; }
            .deed-title { font-size: 22px; font-weight: bold; margin-bottom: 5px; }
            .content { white-space: pre-wrap; text-align: justify; }
            .footer { margin-top: 50px; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="deed-header">
            <div class="deed-title">${deedType}</div>
            <div style="font-size: 13px; color: #475569;">الاختصاص القضائي: ${jurisdiction}</div>
          </div>
          <div class="content">${generatedDraft}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-4 py-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold mb-1">
              <FileEdit className="w-5 h-5 text-amber-400" />
              <span>مُولّد المذكرات والدعاوى والصيغ القضائية</span>
            </div>
            <h2 className="text-xl font-bold text-white">
              صياغة قانونية رفيعة للدعاوى والإنذارات ومذكرات الدفاع
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              يدمج العقل المستقل أصول المرافعات وفن الصياغة القضائية (الديباجة، سرد الوقائع بتسلسل زمني، التأصيل والمواد، والدفوع والطلبات الختامية الجازمة).
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400">نماذج فورية:</span>
          <button
            onClick={() =>
              applyPreset(
                'صحيفة افتتاح دعوى قضائية (مطالبة بتعويض وفسخ)',
                'السيد/ أحمد محمود (المشتري)',
                'شركة التطوير العقاري (البائع)',
                'التعاقد على شراء وحدة وسداد المبالغ وتأخر المطور أكثر من عام دون تسليم أو مبرر قانوني.',
                'الحكم بفسخ العقد وإلزام الشركة برد الثمن كاملاً والتعويض الجابر للضرر.'
              )
            }
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            دعوى فسخ وتعويض
          </button>
          <button
            onClick={() =>
              applyPreset(
                'إنذار رسمي على يد محضر بسداد مديونية تجارية',
                'شركة النور للتجارة (المنذر / الدائن)',
                'مؤسسة الأفق للتوريدات (المنذر إليها / المدين)',
                'توريد بضائع بموجب فواتير وسندات استلام معتمدة بمبلغ 250,000 ريال/جنيه، والمماطلة في السداد رغم حلول الأجل.',
                'التنبيه والإنذار بسرعة سداد أصل الدين خلال 7 أيام وإلا سيتم اتخاذ إجراءات أمر الأداء والشكوى الجنائية.'
              )
            }
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            إنذار رسمي بالسداد
          </button>
          <button
            onClick={() =>
              applyPreset(
                'مذكرة بدفاع المدعى عليه (الدفع بالتقادم وانتفاء الخطأ)',
                'شركة المقاولات المتحدة (المدعى عليها)',
                'مالك المشروع (المدعي)',
                'دعوى تعويض عن عيوب في التشطيب بعد مرور خمس سنوات على استلام المشروع الاستلام الابتدائي والنهائي دون أي تحفظات.',
                'الدفع بسقوط الدعوى بالتقادم، والدفع بانتفاء ركن الخطأ والضرر وعلاقة السببية.'
              )
            }
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            مذكرة دفاع ودفوع
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Settings Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                نوع المحرر القانوني المطلوب:
              </label>
              <select
                value={deedType}
                onChange={(e) => setDeedType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              >
                <option value="صحيفة افتتاح دعوى قضائية (مطالبة بتعويض وفسخ)">
                  صحيفة افتتاح دعوى قضائية
                </option>
                <option value="إنذار رسمي على يد محضر بسداد مديونية تجارية">
                  إنذار رسمي على يد محضر
                </option>
                <option value="مذكرة بدفاع المدعى عليه (الدفع بالتقادم وانتفاء الخطأ)">
                  مذكرة دفاع ودفوع قضائية
                </option>
                <option value="عقد اتفاق وشراكة تجارية متوازن ومانع للنزاع">
                  عقد اتفاق وشراكة تجارية
                </option>
                <option value="تظلم إداري من قرار جهة الإدارة">
                  تظلم إداري من قرار رسمي
                </option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  الطرف الأول (الطالب / المدعي):
                </label>
                <input
                  type="text"
                  value={clientDetails}
                  onChange={(e) => setClientDetails(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  الطرف الثاني (المدعى عليه):
                </label>
                <input
                  type="text"
                  value={opponentDetails}
                  onChange={(e) => setOpponentDetails(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                سرد الوقائع وتفاصيل النزاع:
              </label>
              <textarea
                value={caseFacts}
                onChange={(e) => setCaseFacts(e.target.value)}
                rows={5}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 leading-relaxed"
                placeholder="اكتب تفاصيل الواقعة والتواريخ والاتفاقات..."
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                الطلبات الختامية والدعاوى المراد جزمها:
              </label>
              <textarea
                value={claims}
                onChange={(e) => setClaims(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 leading-relaxed"
                placeholder="مثال: الحكم بـ..."
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isDrafting || !caseFacts.trim()}
              className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {isDrafting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>جاري الصياغة والتأصيل القضائي...</span>
                </>
              ) : (
                <>
                  <Gavel className="w-4 h-4" />
                  <span>توليد المحرر القضائي الكامل</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output Screen */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex-1 flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Gavel className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  المحرر القانوني المحكم
                </h3>
              </div>

              {generatedDraft && (
                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>طباعة</span>
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex-1 overflow-y-auto">
              {generatedDraft ? (
                <div className="prose prose-invert max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans bg-slate-950/70 p-5 rounded-xl border border-slate-800/80 font-amiri">
                  {generatedDraft}
                </div>
              ) : isDrafting ? (
                <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full border-4 border-amber-500/20 border-t-amber-400 animate-spin" />
                  <div className="text-sm font-semibold text-slate-200">
                    يقوم العقل المستقل بتركيب الصيغة القضائية...
                  </div>
                  <div className="text-xs text-slate-400 max-w-md">
                    صياغة الديباجة وتطبيق تسلسل الوقائع المنطقي وتضمين الأسانيد التشريعية والطلبات الجازمة.
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-20 text-center text-slate-500 space-y-3">
                  <FileEdit className="w-12 h-12 text-slate-700" />
                  <div className="text-sm font-medium text-slate-400">
                    لم يتم توليد أي محرر بعد
                  </div>
                  <p className="text-xs text-slate-500 max-w-md">
                    حدد نوع المحرر وأدخل الوقائع والطلبات في الحقول المقابلة واضغط "توليد المحرر القضائي الكامل".
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
