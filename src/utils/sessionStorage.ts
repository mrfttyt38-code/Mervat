import { LegalChatSession, ChatMessage, Jurisdiction, LawBranch, PersonaMode, VoiceTone } from '../types/legal';

const STORAGE_KEY = 'autonomous_legal_mind_sessions_v1';

export function getInitialWelcomeMessage(
  jurisdiction: Jurisdiction,
  lawBranch: LawBranch,
  personaMode: PersonaMode,
  voiceTone: VoiceTone = 'friendly'
): ChatMessage {
  const intro =
    personaMode === 'natural'
      ? `أهلاً بك! أنا "العقل المستقل" — المحاور الموسوعي والقانوني الذكي.
أتمتع ببراعة شاملة في **كافة العلوم والمعارف** (الفيزياء والرياضيات، البرمجة والذكاء الاصطناعي، الطب وعلوم الحياة، الاقتصاد، الفلسفة والتاريخ والآداب) إلى جانب تمكني العميق من **كافة فروع القانون والقضاء**.

اسألني في أي علم أو فكرة أو واقعة بطريقتك الطبيعية التلقائية (أو أرفق أي ملف أو مستند من الأسفل)، وسنتحاور معاً بعمق ومرونة خطوة بخطوة.`
      : `أهلاً بك. أنا "العقل المستقل - المحاور الموسوعي والقانوني الشامل".
أتمتع ببنية إدراكية متكاملة بارعة في كافة العلوم الطبيعية والتقنية والطبية والإنسانية، إلى جانب استيعاب كافة وقائع النزاعات والاستشارات في فروع القانون العام والخاص وصياغة الرأي المنهجي والقضائي السليم.

تفضل بطرح سؤالك العلمي أو البرمجي أو الطبي أو الاقتصادي أو واقعة استشارتك القانونية، وسأقدم لك التحليل الدقيق والحلول العملية المباشرة.`;

  return {
    id: `init-${Date.now()}`,
    role: 'model',
    content: intro,
    timestamp: 'الآن',
    jurisdiction,
    lawBranch,
    personaMode,
    voiceTone,
  };
}

export function loadSavedSessions(): LegalChatSession[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      return parsed.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    }
    return [];
  } catch (error) {
    console.error('Failed to load legal chat sessions from LocalStorage:', error);
    return [];
  }
}

export function saveAllSessions(sessions: LegalChatSession[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error('Failed to save legal chat sessions to LocalStorage:', error);
  }
}

export function createNewSession(
  jurisdiction: Jurisdiction,
  lawBranch: LawBranch,
  personaMode: PersonaMode,
  title?: string,
  voiceTone: VoiceTone = 'friendly'
): LegalChatSession {
  const initialMessage = getInitialWelcomeMessage(jurisdiction, lawBranch, personaMode, voiceTone);
  const now = Date.now();
  const newSession: LegalChatSession = {
    id: `session-${now}-${Math.random().toString(36).substring(2, 7)}`,
    title: title || 'جلسة حوار ومعرفة جديدة',
    createdAt: now,
    updatedAt: now,
    jurisdiction,
    lawBranch,
    personaMode,
    voiceTone,
    messages: [initialMessage],
  };

  const existing = loadSavedSessions();
  const updated = [newSession, ...existing];
  saveAllSessions(updated);
  return newSession;
}

export function deriveTitleFromMessage(userMessageText: string): string {
  if (!userMessageText) return 'استشارة قانونية';
  const clean = userMessageText
    .replace(/[#*`_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (clean.length <= 40) return clean;
  return clean.substring(0, 38) + '...';
}

export function deleteSavedSession(sessionId: string): LegalChatSession[] {
  const existing = loadSavedSessions();
  const filtered = existing.filter((s) => s.id !== sessionId);
  saveAllSessions(filtered);
  return filtered;
}

export function clearAllSavedSessions(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error(e);
  }
}
