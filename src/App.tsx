import React, { useState } from 'react';
import {
  MessageSquare,
  FileSearch,
  FileEdit,
  Layers,
  Scale,
  Brain,
  Shield,
  BookOpen,
} from 'lucide-react';
import { Jurisdiction, LawBranch, PersonaMode } from './types/legal';
import { MindHeader } from './components/MindHeader';
import { ChatChamber } from './components/ChatChamber';
import { ContractAuditor } from './components/ContractAuditor';
import { LegalDeedDrafter } from './components/LegalDeedDrafter';
import { LawKnowledgeAtlas } from './components/LawKnowledgeAtlas';
import { MindCognitiveModal } from './components/MindCognitiveModal';

type ActiveTab = 'chamber' | 'auditor' | 'drafter' | 'atlas';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('chamber');
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>('عام ومقارن');
  const [lawBranch, setLawBranch] = useState<LawBranch>('القانون العام والشامل');
  const [personaMode, setPersonaMode] = useState<PersonaMode>('authoritative');
  const [isCognitiveModalOpen, setIsCognitiveModalOpen] = useState(false);

  // Cross-component communication state (e.g. transfer query from auditor or atlas to chat)
  const [injectedChatQuery, setInjectedChatQuery] = useState<string | null>(null);

  const handleSelectBranch = (branch: LawBranch) => {
    setLawBranch(branch);
    setActiveTab('chamber');
  };

  const handleSendToChat = (query: string) => {
    setInjectedChatQuery(query);
    setActiveTab('chamber');
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans legal-pattern-bg">
      {/* Top Mind Header */}
      <MindHeader
        jurisdiction={jurisdiction}
        setJurisdiction={setJurisdiction}
        lawBranch={lawBranch}
        setLawBranch={setLawBranch}
        personaMode={personaMode}
        setPersonaMode={setPersonaMode}
        onOpenCognitiveModal={() => setIsCognitiveModalOpen(true)}
      />

      {/* Main Navigation Tabs */}
      <nav className="border-b border-slate-800/80 bg-[#0c101b]/90 sticky top-[95px] lg:top-[85px] z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 no-scrollbar">
            
            <button
              onClick={() => setActiveTab('chamber')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                activeTab === 'chamber'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>المحاور القانوني الحي (صوت وكتابة)</span>
            </button>

            <button
              onClick={() => setActiveTab('auditor')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                activeTab === 'auditor'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileSearch className="w-4 h-4" />
              <span>فاحص ومدقق العقود المستقل</span>
            </button>

            <button
              onClick={() => setActiveTab('drafter')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                activeTab === 'drafter'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileEdit className="w-4 h-4" />
              <span>صانع المذكرات والدعاوى القضائية</span>
            </button>

            <button
              onClick={() => setActiveTab('atlas')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                activeTab === 'atlas'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>شجرة القانون العام والقواعد الكبرى</span>
            </button>

          </div>
        </div>
      </nav>

      {/* Main Content Body */}
      <main className="flex-1 flex flex-col">
        {activeTab === 'chamber' && (
          <ChatChamber
            jurisdiction={jurisdiction}
            lawBranch={lawBranch}
            personaMode={personaMode}
            onSelectBranch={handleSelectBranch}
            setJurisdiction={setJurisdiction}
            setPersonaMode={setPersonaMode}
            injectedQuery={injectedChatQuery}
            onClearInjectedQuery={() => setInjectedChatQuery(null)}
          />
        )}

        {activeTab === 'auditor' && (
          <ContractAuditor
            jurisdiction={jurisdiction}
            onSendToChat={handleSendToChat}
          />
        )}

        {activeTab === 'drafter' && (
          <LegalDeedDrafter jurisdiction={jurisdiction} />
        )}

        {activeTab === 'atlas' && (
          <LawKnowledgeAtlas
            onSelectBranch={handleSelectBranch}
            onConsultMaxim={handleSendToChat}
          />
        )}
      </main>

      {/* Cognitive Mind Structure Modal */}
      <MindCognitiveModal
        isOpen={isCognitiveModalOpen}
        onClose={() => setIsCognitiveModalOpen(false)}
      />
    </div>
  );
}
