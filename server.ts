import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side Gemini initialization
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Legal system prompt builder
function buildLegalMindSystemInstruction(jurisdiction: string, lawBranch: string, personaMode: string): string {
  let personaInstruction = '';
  if (personaMode === 'friendly') {
    personaInstruction = `
- النبرة والأسلوب: محاور طبيعي، سلس، بليغ، يشرح المفاهيم القانونية المعقدة بلغة عربية فصحى مبسطة وقريبة للمواطن العادي ورجل الأعمال، مع ضرب أمثلة واقعية دون إخلال بالدقة القانونية الصارمة.`;
  } else if (personaMode === 'advocate') {
    personaInstruction = `
- النبرة والأسلوب: محامٍ ومدافع محنك، يركز على استراتيجيات النزاع، الدفوع الشكلية والموضوعية، كشف الثغرات في موقف الخصم، وتحديد الخطوات التكتيكية لحماية مصالح الموكل بأقوى الحجج.`;
  } else {
    // 'authoritative' or judicial default
    personaInstruction = `
- النبرة والأسلوب: مستشار قضائي رفيع، يتمتع بحياد علمي رصين، أسلوب استشاري عميق، صياغة محكمة كأحكام محاكم النقض والتمييز ومجلس الدولة، مع تفنيد الأسانيد والتكييف القانوني السليم.`;
  }

  return `أنت "العقل المستقل - المحاور القانوني الذكي" (Autonomous Legal Mind).
أنت كيان ذكاء قانوني ولغوي مستقل ومحاور طبيعي فائق البلاغة والخبرة في فروع القانون العام والخاص (General Law & Jurisprudence).

الاختصاص القضائي الحالي: ${jurisdiction || 'القانون العام والقوانين العربية المقارنة (مصر، السعودية، الإمارات، الأنظمة اللاتينية والانجلوسكسونية)'}.
الفرع القانوني المركز عليه: ${lawBranch || 'القانون العام والشامل (مدني، جنائي، إداري، تجاري، عمل، دستوري)'}.

${personaInstruction}

المنهجية الفكرية والتحليلية للعقل المستقل:
1. التكييف القانوني السليم (Legal Characterization): حدد بدقة الوصف القانوني للواقعة أو النزاع المطروح.
2. التأصيل وسند القانون (Legal Basis & Statutory Grounding): اذكر المبادئ القانونية المستقرة، والمواد القانونية ذات الصلة، والسوابق القضائية ومبادئ المحاكم العليا إن وجدت.
3. التقييم الموضوعي للثغرات والمخاطر: وضح نقاط القوة والضعف للموقف القانوني، وما هي المخاطر المحتملة.
4. الحلول والإجراءات العملية المحددة (Actionable Steps & Remedies): قدم خطوات إجرائية واضحة (مواعيد التقادم، طرق التقاضي، صيغ التسوية، الإخطارات الرسمية).
5. المحاورة الطبيعية: تجاوب كعقل ذكي حي، استفسر من المستخدم عن تفاصيل جوهرية ناقصة إذا كانت الواقعة تحتاج ذلك للوصول لرأي قانوني قاطع، واشرح بأريحية وفصاحة تامة.

قواعد الصياغة:
- اكتب بلغة عربية رصينة وأنيقة متقنة.
- نسق إجاباتك بعناوين واضحة ونقاط مرتبة منطقياً.
- اذكر دائماً تنبيهاً مهنياً موجزاً بأن المشورة تهدف للتوجيه والتحليل القانوني الاستراتيجي وتتطلب دوماً مراجعة الأوراق الثبوتية أمام قاضي الموضوع.`;
}

async function streamGeminiWithFallback(params: {
  contents: any;
  systemInstruction?: string;
}) {
  const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const responseStream = await ai.models.generateContentStream({
        model,
        contents: params.contents,
        config: params.systemInstruction ? { systemInstruction: params.systemInstruction } : undefined,
      });
      return responseStream;
    } catch (err: any) {
      console.warn(`Attempt with ${model} failed, trying next model:`, err?.message);
      lastError = err;
      await new Promise((r) => setTimeout(r, 400));
    }
  }
  throw lastError;
}

async function generateGeminiWithFallback(params: {
  contents: any;
  systemInstruction?: string;
}) {
  const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.systemInstruction ? { systemInstruction: params.systemInstruction } : undefined,
      });
      return response;
    } catch (err: any) {
      console.warn(`Generate attempt with ${model} failed, trying next:`, err?.message);
      lastError = err;
      await new Promise((r) => setTimeout(r, 400));
    }
  }
  throw lastError;
}

// SSE Chat Stream Endpoint
app.post('/api/legal-mind/chat-stream', async (req, res) => {
  const { messages, jurisdiction = 'عام ومقارن', lawBranch = 'شامل', personaMode = 'authoritative' } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'قائمة الرسائل مطلوبة' });
    return;
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');

  try {
    const systemInstruction = buildLegalMindSystemInstruction(jurisdiction, lawBranch, personaMode);

    const formattedContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const responseStream = await streamGeminiWithFallback({
      contents: formattedContents,
      systemInstruction,
    });

    for await (const chunk of responseStream) {
      const text = chunk.text || '';
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error: any) {
    console.error('Error during chat stream:', error);
    const errorMessage = error?.message || 'حدث خطأ غير متوقع أثناء معالجة الاستشارة القانونية';
    res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
    res.end();
  }
});

// Contract & Legal Document Audit Endpoint
app.post('/api/legal-mind/audit-document', async (req, res) => {
  const { documentText, jurisdiction = 'عام ومقارن', focusType = 'مراجعة مخاطر شاملة' } = req.body;

  if (!documentText || documentText.trim().length === 0) {
    res.status(400).json({ error: 'نص المستند أو العقد مطلوب للتدقيق' });
    return;
  }

  try {
    const prompt = `أنت العقل المستقل للتدقيق القانوني للعقود والوثائق.
قم بإجراء فحص وتدقيق قانوني رصين للمستند/العقد التالي وفقاً لأحكام ${jurisdiction}.
نوع الفحص المطلوب: ${focusType}.

نص المستند:
"""
${documentText}
"""

قدم تحليلك القانوني الشامل وفق التقسيمات الدقيقة التالية:
1. التكييف والملخص القانوني للمستند
2. مؤشر الأمان القانوني وتوزيع المخاطر والالتزامات (المخاطر العالية، المتوسطة، والمنخفضة)
3. البنود الخطرة أو المجحفة مع شرح السبب القانوني
4. البنود الجوهرية المفقودة التي يجب إضافتها لحماية الحقوق (مثل شروط الإعفاء، القوة القاهرة، فض النزاعات، الاختصاص القضائي، الشروط الجزائية)
5. الصياغة المقترحة البديلة لأهم بند يحتاج لتعديل فوري (Redrafted Safe Clauses)
6. الخلاصة والتوصية الختامية للعقل القانوني`;

    const response = await generateGeminiWithFallback({
      contents: prompt,
      systemInstruction: 'أنت مستشار قانوني خبير في تدقيق العقود والنزاعات، متمكن من صياغة العقود المتوازنة والمحمية نظامياً.',
    });

    res.json({ analysis: response.text || '' });
  } catch (error: any) {
    console.error('Document audit error:', error);
    res.status(500).json({ error: error?.message || 'فشل تدقيق المستند' });
  }
});

// Legal Deed & Pleading Drafter Endpoint
app.post('/api/legal-mind/draft-deed', async (req, res) => {
  const { deedType, clientDetails, opponentDetails, caseFacts, claims, jurisdiction = 'مصر/العالم العربي' } = req.body;

  if (!deedType || !caseFacts) {
    res.status(400).json({ error: 'نوع المحرر والوقائع مطلوبان للصياغة' });
    return;
  }

  try {
    const prompt = `أنت العقل المستقل المتخصص في الصياغة القانونية الرفيعة ومذكرات الدفاع والدعاوى القضائية.
المطلوب صياغة محرّر قانوني احترافي وفقاً للأصول القضائية وقواعد الصياغة النظامية.

- نوع المحرر القانوني: ${deedType} (مثال: صحيفة دعوى، إنذار رسمي على يد محضر، مذكرة دفاع، عقد، اتفاقية صلح)
- الاختصاص القضائي: ${jurisdiction}
- بيانات الطرف الأول / الطالب / المدعي: ${clientDetails || 'الطرف الأول'}
- بيانات الطرف الثاني / المنذر إليه / المدعى عليه: ${opponentDetails || 'الطرف الثاني'}
- وقائع الموضوع والنزاع: ${caseFacts}
- الطلبات والمطالبات: ${claims || 'إلزام الطرف الثاني بالحقوق والتعويضات المقررة نظاماً'}

قم بصياغة المحرر صياغة قانونية متكاملة تتضمن:
- الديباجة الرسمية المحكمة
- بيان الوقائع بتسلسل منطقي كرونولوجي مقنع
- الأسانيد القانونية والمبادئ الفقهية والقضائية الداعمة
- الدفوع القانونية (إن كانت مذكرة دفاع)
- الطلبات الختامية الجازمة والدقيقة
- خاتمة رسمية للتوقيع وتاريخ التحرير`;

    const response = await generateGeminiWithFallback({
      contents: prompt,
      systemInstruction: 'أنت فقيه وقانوني بارع في صياغة المحررات القضائية والعقود المانعة للجهالة والغبن.',
    });

    res.json({ draft: response.text || '' });
  } catch (error: any) {
    console.error('Draft deed error:', error);
    res.status(500).json({ error: error?.message || 'فشل إعداد الصياغة القانونية' });
  }
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', engine: 'Autonomous Legal Mind - Gemini 3.8 Flash' });
});

// Vite Middleware for Development / Static serving for Production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Autonomous Legal Mind server running on port ${PORT}`);
  });
}

startServer();
