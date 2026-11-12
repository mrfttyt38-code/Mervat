import React, { useRef, useState } from 'react';
import {
  Paperclip,
  Image as ImageIcon,
  FileText,
  Table,
  X,
  FileCode,
  Sparkles,
  BookMarked,
  ShieldAlert,
  Mic,
  MicOff,
  Trash2,
  Send,
  Info,
} from 'lucide-react';
import { LegalAttachment } from '../types/legal';

interface ChatAttachmentToolbarProps {
  attachments: LegalAttachment[];
  onAddAttachments: (newAttachments: LegalAttachment[]) => void;
  onRemoveAttachment: (attachmentId: string) => void;
  onClearAttachments: () => void;
  onInsertClauseSnippet: (snippetText: string) => void;
  isRecording: boolean;
  onToggleRecording: () => void;
  isLoading: boolean;
  onClearText: () => void;
  hasText: boolean;
}

export const ChatAttachmentToolbar: React.FC<ChatAttachmentToolbarProps> = ({
  attachments,
  onAddAttachments,
  onRemoveAttachment,
  onClearAttachments,
  onInsertClauseSnippet,
  isRecording,
  onToggleRecording,
  isLoading,
  onClearText,
  hasText,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const sheetInputRef = useRef<HTMLInputElement>(null);
  const [isClauseMenuOpen, setIsClauseMenuOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Quick legal clause snippets
  const LEGAL_CLAUSE_SNIPPETS = [
    {
      title: 'بند الشرط الجزائي والتعويض الاتفاقي',
      text: 'بند: "في حال إخلال أي من الطرفين بأي من التزاماته التعاقدية، يلتزم الطرف المخل بأداء تعويض اتفاقي نهائي وغير خاضع للرقابة القضائية قدره [المبلغ] دون حاجة لإنذار أو إثبات الضرر."',
    },
    {
      title: 'بند عدم المنافسة وسرية المعلومات (NDA)',
      text: 'بند: "يتعهد الطرف الثاني بعدم مزاولة أي نشاط مماثل أو تقديم خدمات لأي جهة منافسة، والامتناع التام عن إفشاء أسرار العمل وقوائم العملاء لمدة [سنتين] من تاريخ إنهاء التعاقد، في نطاق دولة [الدولة]."',
    },
    {
      title: 'بند القوة القاهرة والظروف الطارئة',
      text: 'بند: "لا يُعتبر أي من الطرفين مخلاً بالتزاماته إذا كان التأخير أو الامتناع ناتجاً عن قوة قاهرة أو حادث فجائي لا يد له فيه ولا يمكن توقعه أو دفعه، ويلتزم بإخطار الطرف الآخر كتابةً خلال 48 ساعة."',
    },
    {
      title: 'بند الاختصاص القضائي وفض النزاعات',
      text: 'بند: "تختص محاكم [المدينة/الدولة] دون غيرها بالفصل في أي نزاع ينشأ عن تفسير أو تنفيذ هذا العقد، وتسري على موضوع النزاع أحكام القوانين النافذة في [الدولة]."',
    },
    {
      title: 'إقرار استلام ومخالصة إبراء ذمة',
      text: 'مخالصة: "أقر أنا الموقع أدناه باستلامي لكافة مستحقاتي العمالية والمالية والتعويضات المقررة نظاماً حتى تاريخه، وبذلك أبرئ ذمة الشركة من أي حق أو مطالبة سابقة أو لاحقة."',
    },
  ];

  // Helper to categorize file by extension / mime
  const getFileCategory = (file: File): 'pdf' | 'word' | 'image' | 'sheet' | 'text' | 'other' => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (ext === 'pdf' || file.type === 'application/pdf') return 'pdf';
    if (['doc', 'docx', 'rtf', 'odt'].includes(ext)) return 'word';
    if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp'].includes(ext) || file.type.startsWith('image/')) return 'image';
    if (['csv', 'xlsx', 'xls', 'tsv'].includes(ext)) return 'sheet';
    if (['txt', 'md', 'json'].includes(ext) || file.type.startsWith('text/')) return 'text';
    return 'other';
  };

  // Convert File to LegalAttachment with Base64 & text preview
  const processFiles = async (files: FileList | File[]) => {
    const newAttachments: LegalAttachment[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const category = getFileCategory(file);
      const id = `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      // Read file based on type
      if (category === 'image' || category === 'pdf') {
        const base64 = await readFileAsBase64(file);
        newAttachments.push({
          id,
          name: file.name,
          size: file.size,
          category,
          mimeType: file.type || (category === 'pdf' ? 'application/pdf' : 'image/jpeg'),
          data: base64,
          textPreview: `[مستند ${category === 'pdf' ? 'PDF' : 'صورة'} مرفق: ${file.name} - الحجم: ${(file.size / 1024).toFixed(1)} ك.ب]`,
        });
      } else if (category === 'text' || category === 'sheet') {
        const textContent = await readFileAsText(file);
        newAttachments.push({
          id,
          name: file.name,
          size: file.size,
          category,
          mimeType: file.type || 'text/plain',
          textPreview: textContent.slice(0, 15000), // generous slice for legal contracts
        });
      } else {
        // Word or other binary documents
        // Try reading as text snippet or base64
        try {
          const textContent = await readFileAsText(file);
          newAttachments.push({
            id,
            name: file.name,
            size: file.size,
            category,
            mimeType: file.type || 'application/octet-stream',
            textPreview: textContent.slice(0, 15000),
          });
        } catch {
          const base64 = await readFileAsBase64(file);
          newAttachments.push({
            id,
            name: file.name,
            size: file.size,
            category,
            mimeType: file.type || 'application/octet-stream',
            data: base64,
            textPreview: `[محرر قانوني مرفق: ${file.name}]`,
          });
        }
      }
    }

    if (newAttachments.length > 0) {
      onAddAttachments(newAttachments);
    }
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsText(file);
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'pdf':
        return { label: 'PDF', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40', icon: FileText };
      case 'word':
        return { label: 'وورد', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40', icon: FileText };
      case 'image':
        return { label: 'صورة', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40', icon: ImageIcon };
      case 'sheet':
        return { label: 'جدول', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', icon: Table };
      default:
        return { label: 'مستند', color: 'bg-slate-700/40 text-slate-300 border-slate-600', icon: Paperclip };
    }
  };

  return (
    <div className="w-full space-y-2">
      {/* Hidden file inputs for various legal document categories */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.txt,.rtf,.odt,.png,.jpg,.jpeg,.webp,.csv,.xlsx,.xls"
        className="hidden"
        onChange={handleFileInputChange}
      />
      <input
        ref={imageInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleFileInputChange}
      />
      <input
        ref={sheetInputRef}
        type="file"
        multiple
        accept=".csv,.xlsx,.xls"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Tray of Attached Files (If any attached) */}
      {attachments.length > 0 && (
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 flex flex-wrap items-center gap-2 animate-fadeIn">
          <div className="text-[11px] text-slate-400 font-semibold px-1 flex items-center gap-1">
            <Paperclip className="w-3 h-3 text-amber-400" />
            <span>المستندات المرفقة ({attachments.length}):</span>
          </div>

          {attachments.map((att) => {
            const badge = getCategoryBadge(att.category);
            const Icon = badge.icon;
            const isImage = att.category === 'image' && att.data;

            return (
              <div
                key={att.id}
                className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-lg py-1 px-2.5 text-xs text-slate-200 shadow-sm group hover:border-amber-500/40 transition-colors"
              >
                {/* Image thumbnail or category icon */}
                {isImage ? (
                  <img
                    src={att.data}
                    alt={att.name}
                    className="w-5 h-5 rounded object-cover border border-slate-700"
                  />
                ) : (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold border ${badge.color}`}>
                    {badge.label}
                  </span>
                )}

                <div className="flex flex-col max-w-[130px] sm:max-w-[180px]">
                  <span className="truncate font-medium text-slate-200 text-[11px]" title={att.name}>
                    {att.name}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">
                    {formatFileSize(att.size)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveAttachment(att.id)}
                  className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                  title="حذف المستند المرفق"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}

          <button
            type="button"
            onClick={onClearAttachments}
            className="text-[10px] text-slate-500 hover:text-rose-400 px-2 py-1 rounded transition-colors mr-auto"
            title="تفريغ كافة المرفقات"
          >
            مسح الكل
          </button>
        </div>
      )}

      {/* Main Interactive Toolbar Below the Input */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        
        {/* Left Action Buttons: Universal Attachment, Photos, Sheets, Legal Snippets */}
        <div className="flex items-center flex-wrap gap-1 sm:gap-1.5">
          
          {/* Universal Document Attachment Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 hover:border-amber-500/50 transition-colors cursor-pointer"
            title="إرفاق أي نوع مستند قانوني (PDF, Word, صور, جداول, نصوص)"
          >
            <Paperclip className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-medium">إرفاق مستند</span>
          </button>

          {/* Photo / Scanned Deed Attachment Button */}
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/80 transition-colors cursor-pointer"
            title="إرفاق صورة محرر ضوئي / شيك / إيصال أمانة / بطاقة (PNG, JPG)"
          >
            <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">صورة محرر</span>
          </button>

          {/* Spreadsheet / Claims Calculation Attachment Button */}
          <button
            type="button"
            onClick={() => sheetInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/80 transition-colors cursor-pointer"
            title="إرفاق جدول حسابات مطالبات أو مستحقات عمالية (CSV, Excel)"
          >
            <Table className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">جدول مطالبات</span>
          </button>

          {/* Quick Legal Clause Snippets Dropdown Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsClauseMenuOpen(!isClauseMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/80 transition-colors cursor-pointer"
              title="إدراج صياغة بند عقدي أو واقعة نموذجية جاهزة"
            >
              <BookMarked className="w-3.5 h-3.5 text-blue-400" />
              <span>إدراج بند عقدي</span>
            </button>

            {/* Dropdown Menu of Snippets */}
            {isClauseMenuOpen && (
              <div className="absolute bottom-full right-0 mb-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-fadeIn space-y-1">
                <div className="flex items-center justify-between pb-1.5 px-2 border-b border-slate-800 text-[11px] text-slate-400 font-semibold">
                  <span>بنود وصيغ قانونية سريعة:</span>
                  <button
                    onClick={() => setIsClauseMenuOpen(false)}
                    className="text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1 py-1">
                  {LEGAL_CLAUSE_SNIPPETS.map((snippet, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        onInsertClauseSnippet(snippet.text);
                        setIsClauseMenuOpen(false);
                      }}
                      className="w-full text-right p-2 rounded-lg hover:bg-slate-800 text-xs transition-colors flex flex-col group cursor-pointer"
                    >
                      <span className="font-semibold text-amber-400 group-hover:underline">
                        {snippet.title}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate mt-0.5">
                        {snippet.text}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Clear Text button if text exists */}
          {hasText && (
            <button
              type="button"
              onClick={onClearText}
              className="px-2 py-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
              title="مسح نص السؤال الحالي"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right Info: Supported File Formats Indicator */}
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 hidden md:flex">
          <Info className="w-3 h-3 text-slate-400" />
          <span>يدعم: PDF · Word · صور المحررات · جداول CSV</span>
        </div>

      </div>
    </div>
  );
};
