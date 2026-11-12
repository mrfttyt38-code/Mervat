import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Printer,
  Trash2,
  Sparkles,
  Scale,
  Brain,
  ShieldCheck,
  RefreshCw,
  History,
  CheckCircle2,
} from 'lucide-react';
import { ChatMessage, Jurisdiction, LawBranch, PersonaMode, LegalChatSession } from '../types/legal';
import { QUICK_LEGAL_PROMPTS } from '../data/legalTaxonomy';
import {
  loadSavedSessions,
  saveAllSessions,
  createNewSession,
  deriveTitleFromMessage,
  deleteSavedSession,
  clearAllSavedSessions,
  getInitialWelcomeMessage,
} from '../utils/sessionStorage';
import { SavedSessionsDrawer } from './SavedSessionsDrawer';

interface ChatChamberProps {
  jurisdiction: Jurisdiction;
  lawBranch: LawBranch;
  personaMode: PersonaMode;
  onSelectBranch: (branch: LawBranch) => void;
  setJurisdiction?: (j: Jurisdiction) => void;
  setPersonaMode?: (p: PersonaMode) => void;
  injectedQuery?: string | null;
  onClearInjectedQuery?: () => void;
}

export const ChatChamber: React.FC<ChatChamberProps> = ({
  jurisdiction,
  lawBranch,
  personaMode,
  onSelectBranch,
  setJurisdiction,
  setPersonaMode,
  injectedQuery,
  onClearInjectedQuery,
}) => {
  // Saved Sessions State
  const [sessions, setSessions] = useState<LegalChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [autoSavedFlash, setAutoSavedFlash] = useState(false);

  // Chat conversation state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [thoughtPhase, setThoughtPhase] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 1. Initialize sessions from LocalStorage on mount
  useEffect(() => {
    const loaded = loadSavedSessions();
    if (loaded.length > 0) {
      setSessions(loaded);
      const active = loaded[0];
      setCurrentSessionId(active.id);
      setMessages(active.messages || []);
      if (active.jurisdiction && setJurisdiction) setJurisdiction(active.jurisdiction);
      if (active.lawBranch) onSelectBranch(active.lawBranch);
      if (active.personaMode && setPersonaMode) setPersonaMode(active.personaMode);
    } else {
      // Create first initial session
      const fresh = createNewSession(jurisdiction, lawBranch, personaMode);
      setSessions([fresh]);
      setCurrentSessionId(fresh.id);
      setMessages(fresh.messages);
    }
  }, []);

  // 2. Handle Injected Queries (from contract auditor or knowledge atlas)
  useEffect(() => {
    if (injectedQuery && injectedQuery.trim()) {
      setInput(injectedQuery);
      if (onClearInjectedQuery) {
        onClearInjectedQuery();
      }
    }
  }, [injectedQuery]);

  // 3. Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, thoughtPhase]);

  // 4. Persist messages to LocalStorage when updated
  const persistCurrentMessages = (updatedMsgs: ChatMessage[], firstUserPrompt?: string) => {
    if (!currentSessionId) return;

    setSessions((prevSessions) => {
      const idx = prevSessions.findIndex((s) => s.id === currentSessionId);
      if (idx === -1) return prevSessions;

      const current = prevSessions[idx];
      let newTitle = current.title;

      // If title is default or first user prompt exists, give meaningful title
      if ((newTitle === 'استشارة قانونية جديدة' || !newTitle) && firstUserPrompt) {
        newTitle = deriveTitleFromMessage(firstUserPrompt);
      }

      const updatedSession: LegalChatSession = {
        ...current,
        title: newTitle,
        messages: updatedMsgs,
        updatedAt: Date.now(),
        jurisdiction,
        lawBranch,
        personaMode,
      };

      const newSessionsList = [...prevSessions];
      newSessionsList[idx] = updatedSession;
      // Bring active session to top
      newSessionsList.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

      saveAllSessions(newSessionsList);
      return newSessionsList;
    });

    // Flash auto-saved indicator
    setAutoSavedFlash(true);
    setTimeout(() => setAutoSavedFlash(false), 2500);
  };

  // 5. Speech Recognition Setup (STT)
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'ar-SA';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('ميزة التعرف الصوتي غير مدعومة في متصفحك الحالي، يمكنك الكتابة مباشرة.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e) {
        setIsRecording(false);
      }
    }
  };

  // 6. Text to Speech (TTS)
  const speakText = (text: string, id: string) => {
    if (!('speechSynthesis' in window)) {
      alert('ميزة القراءة الصوتية غير مدعومة في متصفحك.');
      return;
    }

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();

    const cleanText = text
      .replace(/[#*`_~]/g, '')
      .replace(/\[.*?\]/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ar-SA';
    utterance.rate = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const arabicVoice = voices.find((v) => v.lang.startsWith('ar'));
    if (arabicVoice) {
      utterance.voice = arabicVoice;
    }

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const copyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const printOpinion = (msg: ChatMessage) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html dir="rtl" lang="ar">
        <head>
          <title>مذكرة رأي واستشارة قانونية - العقل المستقل</title>
          <style>
            body { font-family: 'Cairo', 'Traditional Arabic', serif; padding: 40px; color: #1e293b; line-height: 1.8; }
            .header { border-bottom: 2px solid #b45309; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; }
            .title { font-size: 24px; font-weight: bold; color: #78350f; }
            .meta { font-size: 13px; color: #64748b; margin-top: 5px; }
            .content { white-space: pre-wrap; font-size: 16px; }
            .disclaimer { margin-top: 40px; border-top: 1px solid #cbd5e1; padding-top: 15px; font-size: 12px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">العقل المستقل - المحاور القانوني الذكي</div>
              <div class="meta">النظام: ${msg.jurisdiction || jurisdiction} · الفرع: ${msg.lawBranch || lawBranch} · التاريخ: ${new Date().toLocaleDateString('ar-EG')}</div>
            </div>
            <div style="text-align: left; font-size: 13px; color: #78350f; font-weight: bold;">
              رأي استشاري وتحليلي
            </div>
          </div>
          <div class="content">${msg.content}</div>
          <div class="disclaimer">
            صدر هذا الرأي عن منظومة العقل المستقل والمحاور القانوني الذكي. الرأي موجه للدعم الاستراتيجي والتكييف الأولي ويخضع لتقدير قاضي الموضوع.
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  // 7. Session Management Handlers
  const handleStartNewSession = () => {
    window.speechSynthesis?.cancel();
    setSpeakingId(null);
    const fresh = createNewSession(jurisdiction, lawBranch, personaMode);
    setSessions((prev) => [fresh, ...prev]);
    setCurrentSessionId(fresh.id);
    setMessages(fresh.messages);
  };

  const handleSelectSession = (sessionId: string) => {
    window.speechSynthesis?.cancel();
    setSpeakingId(null);
    const target = sessions.find((s) => s.id === sessionId);
    if (!target) return;

    setCurrentSessionId(target.id);
    setMessages(target.messages || []);
    if (target.jurisdiction && setJurisdiction) setJurisdiction(target.jurisdiction);
    if (target.lawBranch) onSelectBranch(target.lawBranch);
    if (target.personaMode && setPersonaMode) setPersonaMode(target.personaMode);
  };

  const handleDeleteSession = (sessionId: string) => {
    const remaining = deleteSavedSession(sessionId);
    setSessions(remaining);

    if (currentSessionId === sessionId) {
      if (remaining.length > 0) {
        const next = remaining[0];
        setCurrentSessionId(next.id);
        setMessages(next.messages);
      } else {
        handleStartNewSession();
      }
    }
  };

  const handleRenameSession = (sessionId: string, newTitle: string) => {
    setSessions((prev) => {
      const updated = prev.map((s) => (s.id === sessionId ? { ...s, title: newTitle } : s));
      saveAllSessions(updated);
      return updated;
    });
  };

  const handleClearAllSessions = () => {
    clearAllSavedSessions();
    const fresh = createNewSession(jurisdiction, lawBranch, personaMode);
    setSessions([fresh]);
    setCurrentSessionId(fresh.id);
    setMessages(fresh.messages);
    setIsHistoryDrawerOpen(false);
  };

  // 8. Submit message and stream response from server
  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    // Save user message immediately to LocalStorage
    persistCurrentMessages(updatedMessages, textToSend.trim());

    // Dynamic thinking phase indicator simulation
    const phases = [
      'يقوم العقل المستقل بالتكييف القانوني الأولي للوقائع المطروحة...',
      'استدعاء النصوص التشريعية والقواعد الآمرة ذات الصلة...',
      'فحص السوابق القضائية ومبادئ محكمة النقض والتمييز...',
      'تركيب الحجة وصياغة المشورة باللسان القانوني الطبيعي...',
    ];
    let phaseIndex = 0;
    setThoughtPhase(phases[0]);
    const phaseInterval = setInterval(() => {
      phaseIndex = (phaseIndex + 1) % phases.length;
      setThoughtPhase(phases[phaseIndex]);
    }, 1800);

    const modelMsgId = `model-${Date.now()}`;
    const modelMessage: ChatMessage = {
      id: modelMsgId,
      role: 'model',
      content: '',
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      jurisdiction,
      lawBranch,
      personaMode,
      isStreaming: true,
    };

    const messagesWithPlaceholder = [...updatedMessages, modelMessage];
    setMessages(messagesWithPlaceholder);

    try {
      abortControllerRef.current = new AbortController();

      const response = await fetch('/api/legal-mind/chat-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          jurisdiction,
          lawBranch,
          personaMode,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`خطأ في الاتصال بالخادم: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      if (!reader) {
        throw new Error('فشل قراءة استجابة البث');
      }

      let accumulatedText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (!dataStr) continue;

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                accumulatedText += parsed.text;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === modelMsgId
                      ? { ...m, content: accumulatedText, isStreaming: true }
                      : m
                  )
                );
              }
              if (parsed.done) {
                const finalMessages = messagesWithPlaceholder.map((m) =>
                  m.id === modelMsgId ? { ...m, content: accumulatedText, isStreaming: false } : m
                );
                setMessages(finalMessages);
                // Save final complete stream to LocalStorage
                persistCurrentMessages(finalMessages);
              }
              if (parsed.error) {
                accumulatedText += `\n[ملاحظة: ${parsed.error}]`;
                const finalMessages = messagesWithPlaceholder.map((m) =>
                  m.id === modelMsgId ? { ...m, content: accumulatedText, isStreaming: false } : m
                );
                setMessages(finalMessages);
                persistCurrentMessages(finalMessages);
              }
            } catch (err) {
              // Ignore partial json chunk parsing
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Error during chat stream:', error);
      const fallbackText =
        'عذراً، حدث انقطاع أثناء استدعاء الرأي القانوني. يرجى إعادة المحاولة أو التحقق من الاتصال.';
      const finalMessages = messagesWithPlaceholder.map((m) =>
        m.id === modelMsgId
          ? {
              ...m,
              content: m.content || fallbackText,
              isStreaming: false,
            }
          : m
      );
      setMessages(finalMessages);
      persistCurrentMessages(finalMessages);
    } finally {
      clearInterval(phaseInterval);
      setThoughtPhase('');
      setIsLoading(false);
    }
  };

  const currentSession = sessions.find((s) => s.id === currentSessionId);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[600px] max-w-6xl mx-auto w-full relative">
      
      {/* Session Top Status Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        
        {/* Left items: Mind State, History Drawer Trigger */}
        <div className="flex items-center gap-3">
          {/* History Drawer Trigger Button */}
          <button
            onClick={() => setIsHistoryDrawerOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/80 hover:border-amber-500/50 transition-colors cursor-pointer"
            title="فتح سجل المحادثات القانونية السابقة المحفوظة في LocalStorage"
          >
            <History className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-medium">سجل المحادثات</span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded-full font-bold">
              {sessions.length}
            </span>
          </button>

          <span className="text-slate-700">|</span>

          {/* Current Session Title */}
          <div className="text-slate-300 font-medium truncate max-w-[200px] sm:max-w-xs" title={currentSession?.title}>
            <span>الجلسة: </span>
            <span className="text-amber-400">{currentSession?.title || 'استشارة قانونية'}</span>
          </div>

          {/* Auto-saved badge */}
          {autoSavedFlash && (
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 animate-fadeIn">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>حُفظ في المتصفح</span>
            </span>
          )}
        </div>

        {/* Right tools: Start New Session */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleStartNewSession}
            className="flex items-center gap-1 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60"
            title="بدء جلسة استشارية قانونية جديدة وحفظ السابقة"
          >
            <RefreshCw className="w-3 h-3 text-amber-400" />
            <span>استشارة جديدة</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.map((message) => {
          const isUser = message.role === 'user';
          const isSpeaking = speakingId === message.id;

          return (
            <div
              key={message.id}
              className={`flex flex-col ${isUser ? 'items-start' : 'items-end'}`}
            >
              <div
                className={`max-w-[92%] md:max-w-[85%] rounded-2xl p-4 sm:p-5 relative transition-all ${
                  isUser
                    ? 'bg-gradient-to-r from-blue-900/60 to-slate-900 border border-blue-700/40 text-slate-100 rounded-br-none shadow-md shadow-blue-950/30'
                    : 'bg-[#101625] border border-slate-800 text-slate-200 rounded-bl-none shadow-lg shadow-black/40'
                }`}
              >
                {/* Header of message */}
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800/80 text-xs">
                  <div className="flex items-center gap-2">
                    {isUser ? (
                      <span className="font-semibold text-blue-300">أنت (المستشير / صاحب الواقعة)</span>
                    ) : (
                      <div className="flex items-center gap-1.5 font-bold text-amber-400">
                        <Scale className="w-4 h-4 text-amber-400" />
                        <span>العقل المستقل</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          ({message.personaMode === 'friendly' ? 'محاور طبيعي' : message.personaMode === 'advocate' ? 'محامٍ مدافع' : 'مستشار قضائي'})
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-slate-500 text-[11px]">{message.timestamp}</span>
                </div>

                {/* Content body */}
                <div className="prose prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap font-sans">
                  {message.content}
                  {message.isStreaming && (
                    <span className="inline-block w-2 h-4 bg-amber-400 mr-1 animate-pulse" />
                  )}
                </div>

                {/* Footer Tools for Model Messages */}
                {!isUser && message.content && (
                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between flex-wrap gap-2 text-xs">
                    <div className="flex items-center gap-1 text-slate-400">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[11px]">تكييف وسند قانوني معتمد</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Read Aloud Voice Button */}
                      <button
                        onClick={() => speakText(message.content, message.id)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                          isSpeaking
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                        title={isSpeaking ? 'إيقاف الصوت' : 'استماع للمشورة بصوت طبيعي فصيح'}
                      >
                        {isSpeaking ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                            <span>إيقاف القراءة</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>استماع صوتي</span>
                          </>
                        )}
                      </button>

                      {/* Copy Button */}
                      <button
                        onClick={() => copyMessage(message.content, message.id)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                        title="نسخ المشورة"
                      >
                        {copiedId === message.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">تم النسخ</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>نسخ</span>
                          </>
                        )}
                      </button>

                      {/* Print Formal Memo */}
                      <button
                        onClick={() => printOpinion(message)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                        title="طباعة / تصدير كمذكرة استشارية رسمية"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>مذكرة رسمية</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Live Thinking Status Box */}
        {isLoading && thoughtPhase && (
          <div className="flex items-center justify-end">
            <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl px-4 py-3 text-xs text-amber-300 flex items-center gap-3 shadow-lg shadow-amber-950/20">
              <Brain className="w-5 h-5 text-amber-400 animate-spin" />
              <div className="flex flex-col">
                <span className="font-semibold text-white">العقل المستقل يفكر...</span>
                <span className="text-amber-300/80 text-[11px]">{thoughtPhase}</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Legal Questions */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 border-t border-slate-800/60 bg-slate-950/40">
          <div className="flex items-center gap-2 mb-2 text-xs text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>قضايا واستشارات قانونية جاهزة للبدء الفوري:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {QUICK_LEGAL_PROMPTS.slice(0, 3).map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  onSelectBranch(item.branch as LawBranch);
                  handleSend(item.prompt);
                }}
                className="text-right p-2.5 rounded-lg bg-slate-900/70 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-xs text-slate-300 hover:text-white transition-all group flex flex-col justify-between"
              >
                <div className="font-medium text-amber-400 mb-1 group-hover:underline">
                  {item.title}
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-2">
                  {item.prompt}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form Bar */}
      <div className="p-4 border-t border-slate-800 bg-[#0d121d]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center gap-2"
        >
          {/* Voice Input (Speech-To-Text) Button */}
          <button
            type="button"
            onClick={toggleRecording}
            className={`p-3 rounded-xl transition-all cursor-pointer ${
              isRecording
                ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
            }`}
            title={isRecording ? 'إيقاف التسجيل الصوتي' : 'تحدث بالصوت باللغة العربية'}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Input */}
          <div className="relative flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={2}
              placeholder="اطرح وقائع قضيتك، نزاعك، أو استشارتك القانونية هنا... (مثال: استفسار عن فسخ عقد أو شروط البطلان)"
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
            />
            {isRecording && (
              <span className="absolute left-3 top-3 text-xs text-rose-400 animate-pulse flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                جاري الاستماع لصوتك...
              </span>
            )}
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-3.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-amber-500/20 cursor-pointer"
            title="إرسال للعقل المستقل"
          >
            <Send className="w-5 h-5 rotate-180" />
          </button>
        </form>

        <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500 px-1">
          <span>يتم الحفظ التلقائي في LocalStorage بمتصفحك · استرجع أي جلسة من زر "سجل المحادثات"</span>
          <span className="text-amber-400/80">العقل المستقل يطبق أصول الفقه والقانون العام والمقارن</span>
        </div>
      </div>

      {/* Saved Sessions Drawer */}
      <SavedSessionsDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onNewSession={handleStartNewSession}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onClearAllSessions={handleClearAllSessions}
      />
    </div>
  );
};
