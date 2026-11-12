import React, { useState } from 'react';
import {
  X,
  History,
  Plus,
  Trash2,
  Search,
  MessageSquare,
  Clock,
  Edit2,
  Check,
  Download,
  Upload,
  AlertTriangle,
  Scale,
} from 'lucide-react';
import { LegalChatSession } from '../types/legal';

interface SavedSessionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: LegalChatSession[];
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, newTitle: string) => void;
  onClearAllSessions: () => void;
}

export const SavedSessionsDrawer: React.FC<SavedSessionsDrawerProps> = ({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onRenameSession,
  onClearAllSessions,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredSessions = sessions.filter((s) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const matchesTitle = s.title.toLowerCase().includes(query);
    const matchesBranch = (s.lawBranch || '').toLowerCase().includes(query);
    const matchesMessages = s.messages.some((m) => m.content.toLowerCase().includes(query));
    return matchesTitle || matchesBranch || matchesMessages;
  });

  const handleStartRename = (session: LegalChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditingTitle(session.title);
  };

  const handleSaveRename = (sessionId: string, e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (editingTitle.trim()) {
      onRenameSession(sessionId, editingTitle.trim());
    }
    setEditingId(null);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sessions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `legal_mind_sessions_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs animate-fadeIn">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Container */}
      <div className="relative w-full max-w-md bg-[#0d121e] border-l border-slate-800 h-full flex flex-col shadow-2xl z-10 text-slate-200">
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <History className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">سجل المحادثات القانونية</h3>
              <p className="text-[11px] text-slate-400">
                محفوظة محلياً في متصفحك ({sessions.length} جلسة)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="إغلاق السجل"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick New Session Action Button */}
        <div className="p-3 border-b border-slate-800/80 bg-slate-950/40">
          <button
            onClick={() => {
              onNewSession();
              onClose();
            }}
            className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>بدء جلسة استشارية جديدة</span>
          </button>

          {/* Search Bar */}
          <div className="relative mt-2.5">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في عناوين ونصوص الاستشارات السابقة..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pr-9 pl-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredSessions.length > 0 ? (
            filteredSessions.map((session) => {
              const isActive = session.id === currentSessionId;
              const isEditing = editingId === session.id;
              const isConfirmingDelete = confirmDeleteId === session.id;

              return (
                <div
                  key={session.id}
                  onClick={() => {
                    if (!isEditing) {
                      onSelectSession(session.id);
                      onClose();
                    }
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer group relative ${
                    isActive
                      ? 'bg-amber-950/25 border-amber-500/40 shadow-sm'
                      : 'bg-slate-900/70 border-slate-800/90 hover:bg-slate-850 hover:border-slate-700'
                  }`}
                >
                  {/* Top line: Title or Edit Title form */}
                  <div className="flex items-start justify-between gap-2 mb-1">
                    {isEditing ? (
                      <form
                        onSubmit={(e) => handleSaveRename(session.id, e)}
                        className="flex items-center gap-1 flex-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className="flex-1 bg-slate-950 border border-amber-500/60 rounded px-2 py-1 text-xs text-white focus:outline-none"
                          autoFocus
                        />
                        <button
                          type="submit"
                          className="p-1 rounded bg-amber-500 text-slate-950 hover:bg-amber-400"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    ) : (
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <MessageSquare
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isActive ? 'text-amber-400' : 'text-slate-500'
                          }`}
                        />
                        <h4
                          className={`text-xs font-semibold truncate ${
                            isActive ? 'text-amber-300' : 'text-slate-200'
                          }`}
                        >
                          {session.title}
                        </h4>
                      </div>
                    )}

                    {/* Actions: Edit, Delete */}
                    {!isEditing && (
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                        <button
                          onClick={(e) => handleStartRename(session, e)}
                          className="p-1 text-slate-400 hover:text-amber-400 rounded hover:bg-slate-800 transition-colors"
                          title="تعديل عنوان الجلسة"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isConfirmingDelete) {
                              onDeleteSession(session.id);
                              setConfirmDeleteId(null);
                            } else {
                              setConfirmDeleteId(session.id);
                              setTimeout(() => setConfirmDeleteId(null), 3500);
                            }
                          }}
                          className={`p-1 rounded transition-colors ${
                            isConfirmingDelete
                              ? 'bg-rose-600 text-white animate-pulse'
                              : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
                          }`}
                          title={isConfirmingDelete ? 'تأكيد الحذف النهائي' : 'حذف المحادثة'}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Metadata line: Jurisdiction, Branch, Date */}
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 flex-wrap mt-1">
                    <span>{session.lawBranch || 'القانون العام'}</span>
                    <span aria-hidden="true">·</span>
                    <span>{session.messages?.length || 0} رسائل</span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 text-slate-500" />
                      <span>
                        {session.updatedAt
                          ? new Date(session.updatedAt).toLocaleDateString('ar-EG', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'مسبقاً'}
                      </span>
                    </span>
                  </div>

                  {isConfirmingDelete && (
                    <div className="mt-2 text-[10px] text-rose-400 bg-rose-950/40 border border-rose-800/40 rounded p-1 text-center">
                      اضغط على سلة المهملات مجدداً لتأكيد الحذف نهائياً
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <History className="w-10 h-10 mx-auto text-slate-700" />
              <div className="text-xs font-medium text-slate-400">
                {searchQuery ? 'لا توجد نتائج تطابق بحثك' : 'لا توجد جلسات سابقة محفوظة'}
              </div>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                كل استشارة قانونية تطرحها تُحفظ تلقائياً في متصفحك للرجوع إليها بأي وقت.
              </p>
            </div>
          )}
        </div>

        {/* Drawer Footer Tools */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs">
          <button
            onClick={handleExportJSON}
            disabled={sessions.length === 0}
            className="flex items-center gap-1.5 text-slate-400 hover:text-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="تنزيل نسخة احتياطية من كافة المحادثات كملف JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تصدير نسخة احتياطية</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('هل أنت متأكد من مسح كافة سجلات المحادثات المحفوظة في هذا المتصفح؟ لا يمكن التراجع.')) {
                onClearAllSessions();
              }
            }}
            disabled={sessions.length === 0}
            className="flex items-center gap-1 text-slate-500 hover:text-rose-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="مسح كافة المحادثات من المتصفح"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>مسح الكل</span>
          </button>
        </div>

      </div>
    </div>
  );
};
