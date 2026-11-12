export type Jurisdiction =
  | 'عام ومقارن'
  | 'مصر (القانون المصري)'
  | 'السعودية (الأنظمة السعودية والشريعة)'
  | 'الإمارات (القانون الاتحادي)'
  | 'الكويت (القانون الكويتي)'
  | 'المغرب (القانون المغربي)'
  | 'الأنظمة اللاتينية والإنجليزية (مقارن)';

export type LawBranch =
  | 'القانون العام والشامل'
  | 'القانون المدني والالتزامات'
  | 'القانون الجنائي والعقوبات'
  | 'القانون التجاري والشركات والملكية الفكرية'
  | 'القانون الإداري وقضاء مجلس الدولة'
  | 'قانون العمل والتأمينات الاجتماعية'
  | 'القانون الدستوري وحقوق الإنسان'
  | 'قانون المرافعات والإجراءات القضائية';

export type PersonaMode = 'friendly' | 'authoritative' | 'advocate';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  jurisdiction?: string;
  lawBranch?: string;
  personaMode?: PersonaMode;
  isStreaming?: boolean;
}

export interface LegalChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  jurisdiction: Jurisdiction;
  lawBranch: LawBranch;
  personaMode: PersonaMode;
  messages: ChatMessage[];
}

export interface ContractAuditResult {
  analysis: string;
  timestamp: string;
  documentTitle?: string;
}

export interface LegalTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  defaultText: string;
}

export interface LegalMaxim {
  arabic: string;
  latin?: string;
  meaning: string;
  branch: string;
  application: string;
}
