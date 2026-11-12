import React, { useState } from 'react';
import {
  FileSearch,
  AlertTriangle,
  CheckCircle,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  FileText,
  Printer,
  MessageSquare,
} from 'lucide-react';
import { SAMPLE_CONTRACT_TEXT } from '../data/legalTaxonomy';
import { Jurisdiction } from '../types/legal';

interface ContractAuditorProps {
  jurisdiction: Jurisdiction;
  onSendToChat: (query: string) => void;
}

export const ContractAuditor: React.FC<ContractAuditorProps> = ({
  jurisdiction,
  onSendToChat,
}) => {
  const [contractText, setContractText] = useState(SAMPLE_CONTRACT_TEXT);
  const [focusType, setFocusType] = useState('مراجعة مخاطر شاملة وشروط إذعان');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAudit = async () => {
    if (!contractText.trim()) return;

    setIsAuditing(true);
    setError(null);
    setAuditResult(null);

    try {
      const response = await fetch('/api/legal-mind/audit-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentText: contractText,
          jurisdiction,
          focusType,
        }),
      });

      if (!response.ok) {
        throw new Error(`خطأ في معالجة التدقيق: ${response.statusText}`);
      }

      const data = await response.json();
      setAuditResult(data.analysis || 'لم يتم العثور على تحليل.');
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'حدث خطأ أثناء تدقيق العقد');
    } finally {
      setIsAuditing(false);
    }
  };

  const handleCopy = () => {
    if (!auditResult) return;
    navigator.clipboard.writeText(auditResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintAudit = () => {
    if (!auditResult) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html dir="rtl" lang="ar">
        <head>
          <title>تقرير تدقيق ومراجعة قانونية لعقد - العقل المستقل</title>
          <style>
            body { font-family: 'Cairo', 'Traditional Arabic', serif; padding: 40px; color: #0f172a; line-height: 1.8; }
            .header { border-bottom: 2px solid #b45309; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 22px; font-weight: bold; color: #78350f; }
            .content { white-space: pre-wrap; font-size: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">تقرير فحص وتدقيق العقد القانوني</div>
            <div style="font-size: 13px; color: #64748b; margin-top: 5px;">
              الاختصاص القضائي: ${jurisdiction} · التاريخ: ${new Date().toLocaleDateString('ar-EG')}
            </div>
          </div>
          <div class="content">${auditResult}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-4 py-6 space-y-6">
      {/* Intro Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold mb-1">
              <FileSearch className="w-5 h-5 text-amber-400" />
              <span>مختبر تدقيق العقود والوثائق المستقل</span>
            </div>
            <h2 className="text-xl font-bold text-white">
              الفحص التحليلي للبنود، كشف الثغرات، ومؤشر المخاطر القانونية
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              قم بلصق أي عقد اتفاق، شراكة، إيجار، أو عمل. يتولى العقل المستقل تشريح كل بند وتحديد شروط الإذعان المجحفة والبنود المفقودة وصياغة بدائل متوازنة تحمي مصالحك.
            </p>
          </div>

          {/* Quick Sample Button */}
          <button
            onClick={() => {
              setContractText(SAMPLE_CONTRACT_TEXT);
              setAuditResult(null);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs transition-colors cursor-pointer shrink-0"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>تحميل نموذج عقد به ثغرات للاختبار</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Contract Input Form */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>نص العقد أو الاتفاقية المراد فحصها:</span>
              </label>
              <span className="text-[11px] text-slate-500">
                {contractText.length} حرف
              </span>
            </div>

            <textarea
              value={contractText}
              onChange={(e) => setContractText(e.target.value)}
              rows={16}
              placeholder="الصق نص العقد هنا..."
              className="w-full flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono transition-colors resize-none leading-relaxed"
            />

            {/* Audit Options */}
            <div className="mt-4 pt-3 border-t border-slate-800 space-y-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">
                  محور التركيز والتدقيق:
                </label>
                <select
                  value={focusType}
                  onChange={(e) => setFocusType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="مراجعة مخاطر شاملة وشروط إذعان">
                    مراجعة مخاطر شاملة وشروط إذعان
                  </option>
                  <option value="فحص المسؤولية والشرط الجزائي والتعويضات">
                    فحص المسؤولية والشرط الجزائي والتعويضات
                  </option>
                  <option value="فحص الملكية الفكرية وبنود عدم المنافسة والسرية">
                    فحص الملكية الفكرية وبنود عدم المنافسة والسرية
                  </option>
                  <option value="فحص الاختصاص القضائي وشروط فض النزاعات والتحكيم">
                    فحص الاختصاص القضائي وشروط فض النزاعات والتحكيم
                  </option>
                </select>
              </div>

              <button
                onClick={handleAudit}
                disabled={isAuditing || !contractText.trim()}
                className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isAuditing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>العقل المستقل يفحص كل بند...</span>
                  </>
                ) : (
                  <>
                    <FileSearch className="w-4 h-4" />
                    <span>بدء التدقيق والتشريح القانوني للعقد</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Audit Results Display */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex-1 flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  تقرير الفحص والتدقيق القانوني
                </h3>
              </div>

              {auditResult && (
                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'تم النسخ' : 'نسخ التقرير'}</span>
                  </button>
                  <button
                    onClick={handlePrintAudit}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>طباعة</span>
                  </button>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Result Content */}
            <div className="flex-1 overflow-y-auto">
              {auditResult ? (
                <div className="space-y-4">
                  <div className="prose prose-invert max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                    {auditResult}
                  </div>

                  {/* Action: Send Findings into Live Chat Chamber */}
                  <div className="bg-gradient-to-r from-amber-950/30 to-slate-900 border border-amber-500/20 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-amber-300">
                        هل تريد مناقشة الثغرات في جلسة محاورة حية؟
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        انقل نتائج الفحص إلى المحاور القانوني لطلب استراتيجية تفاوض أو صياغة دفاع.
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        onSendToChat(
                          `أريد مناقشة الثغرات التي تم رصدها في فحص العقد التالي وصياغة بنود مضادة للتفاوض:\n${auditResult.slice(
                            0,
                            500
                          )}...`
                        )
                      }
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-semibold hover:bg-amber-400 transition-colors cursor-pointer shrink-0"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>فتح في المحاورة</span>
                    </button>
                  </div>
                </div>
              ) : isAuditing ? (
                <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-4 border-amber-500/20 border-t-amber-400 animate-spin" />
                  </div>
                  <div className="text-sm font-semibold text-slate-200">
                    يقوم العقل المستقل بتشريح بنود العقد...
                  </div>
                  <div className="text-xs text-slate-400 max-w-md">
                    مقارنة البنود بالنظام القضائي لـ ({jurisdiction})، رصد عدم التوازن العقدي، وفحص مدى قابلية الشروط للبطلان القضائي.
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-20 text-center text-slate-500 space-y-3">
                  <FileSearch className="w-12 h-12 text-slate-700" />
                  <div className="text-sm font-medium text-slate-400">
                    لم يتم تشغيل التدقيق بعد
                  </div>
                  <p className="text-xs text-slate-500 max-w-md">
                    ألصق العقد في الصندوق المقابل واضغط "بدء التدقيق" للحصول على تقرير مفصل حول الثغرات والشروط المجحفة والبنود البديلة.
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
