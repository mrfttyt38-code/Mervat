import { LegalChatSession, ChatMessage, Jurisdiction, LawBranch, PersonaMode } from '../types/legal';

const STORAGE_KEY = 'autonomous_legal_mind_sessions_v1';

export function getInitialWelcomeMessage(
  jurisdiction: Jurisdiction,
  lawBranch: LawBranch,
  personaMode: PersonaMode
): ChatMessage {
  return {
    id: `init-${Date.now()}`,
    role: 'model',
    content: `أهلاً بك. أنا "العقل المستقل - المحاور القانوني العام".
أتمتع ببنية إدراكية قانونية ولغوية مستقلة، مصممة لاستيعاب كافة وقائع النزاعات والاستشارات في فروع القانون العام والخاص، وتكييفها تكييفاً قضائياً سليماً، وصياغة الرأي القانوني والدفوع الاستراتيجية بلسان فصيح وطبيعي.

تفضل بسرد وقائع استشارتك أو قضيتك أو تساؤلك، وسأقوم بتحليلها تأصيلاً وتكييفاً وتقديم الحلول العملية المباشرة.`,
    timestamp: 'الآن',
    jurisdiction,
    lawBranch,
    personaMode,
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
  title?: string
): LegalChatSession {
  const initialMessage = getInitialWelcomeMessage(jurisdiction, lawBranch, personaMode);
  const now = Date.now();
  const newSession: LegalChatSession = {
    id: `session-${now}-${Math.random().toString(36).substring(2, 7)}`,
    title: title || 'استشارة قانونية جديدة',
    createdAt: now,
    updatedAt: now,
    jurisdiction,
    lawBranch,
    personaMode,
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
