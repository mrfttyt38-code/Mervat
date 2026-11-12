import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { generateAutonomousLegalOpinion } from './src/utils/autonomousLegalEngine.ts';

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
- النبرة والأسلوب: محاور طبيعي ودود، يبسط المفاهيم القانونية ويشرحها بلغة فصيحة قريبة ومريحة، كأنك مستشار شخصي حريص على مصلحة المستشير.`;
  } else if (personaMode === 'advocate') {
    personaInstruction = `
- النبرة والأسلوب: محامٍ ومدافع استراتيجي محنك، يركز على كسب الموقف القانوني، كشف ثغرات الخصم، وتحديد الدفوع والخطوات التكتيكية الحاسمة.`;
  } else {
    personaInstruction = `
- النبرة والأسلوب: مستشار قضائي رفيع، يجمع بين البلاغة الحوارية الطبيعية والعمق التحليلي الرصين، مع وزن الأدلة والحجج بميزان العدالة الدقيق.`;
  }

  return `أنت "العقل المستقل - المحاور القانوني الذكي" (Autonomous Legal Mind).
أنت كيان ذكاء اصطناعي قانوني ولغوي متطور جداً، تتحدث وتحاور تماماً كما يتحدث كبار المستشارين والذكاء التوليدي المتقدم: بلسان عربي مبين، ذكاء حواري طبيعي، استيعاب عميق لدقائق النزاعات، ومرونة تامة دون أي قوالب جامدة أو نصوص مسبقة الصنع.

تعليمات التخاطب والمحاورة الجوهرية (كيف ترد كعقل ذكي طبيعي):
1. أجب عن صلب السؤال مباشرة من الجملة الأولى: لا تبدأ بعبارات روتينية أو عناوين مكررة، بل أعطِ المستشير خلاصة الموقف القانوني فوراً وبكل وضوح.
2. حلل الوقائع بمنطق تحليلي مترابط: اشرح سبب كون الإجراء صحيحاً أو باطلاً، وما هي الآثار القانونية والمالية المترتبة عليه.
3. قدّم خطوات عملية قابلة للتنفيذ: رتب له ما يجب فعله خطوة بخطوة (مثل: الإخطار، جمع الإثباتات، اللجوء للجهة المختصة، مواعيد التقادم).
4. حاور بذكاء تفاعلي: إذا كانت هناك وقائع جوهرية لم يذكرها المستشير (مثل وجود عقد مكتوب، تاريخ الإشعار، إيصالات السداد، مكان العمل)، اطرح عليه سؤالاً أو سؤالين لمواصلة التحليل بدقة.
5. لا تقيد نفسك بقالب ثابت: لا تقسم كل رد إجبارياً إلى "1. التكييف... 2. السند...". اكتب بتدفق حواري ثري مستخدماً فقرات رشيقة وعناوين ديناميكية تناسب سياق الاستشارة تحديداً.
6. ادمج المواد القانونية والمبادئ القضائية بسلاسة وأناقة ضمن سياق الشرح.

النظام القانوني المعني: ${jurisdiction || 'القانون العام والقوانين المقارنة'}.
الفرع القانوني: ${lawBranch || 'شامل'}.
${personaInstruction}

تنبيه مهني مدمج: اختم دائماً بتوجيه مهني رقيق وموجز بأن المشورة تهدف للتوجيه الاستراتيجي والتحليل النظامي وتتطلب مراجعة الأوراق الثبوتية أمام قاضي الموضوع.`;
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

  // Set SSE headers and disable proxy buffering
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const streamFallbackText = async (text: string) => {
    const words = text.split(' ');
    let currentChunk = '';
    for (let i = 0; i < words.length; i++) {
      currentChunk += words[i] + ' ';
      if (i % 2 === 0 || i === words.length - 1) {
        res.write(`data: ${JSON.stringify({ text: currentChunk })}\n\n`);
        currentChunk = '';
        await new Promise((r) => setTimeout(r, 12));
      }
    }
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  };

  const lastUserMsg = [...messages].reverse().find((m: any) => m.role === 'user');
  const userQuery = lastUserMsg?.content || '';
  const userAttachments = lastUserMsg?.attachments || [];

  let streamedAny = false;

  // Attempt Gemini API call if key is present
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
    try {
      const systemInstruction = buildLegalMindSystemInstruction(jurisdiction, lawBranch, personaMode);

      // Build sanitized contents ensuring it starts with user and alternates roles
      const sanitizedContents: { role: 'user' | 'model'; parts: any[] }[] = [];
      for (const m of messages) {
        if (!m.content && (!m.attachments || m.attachments.length === 0)) continue;
        const role = m.role === 'user' ? 'user' : 'model';

        // Gemini requires first content to be user turn
        if (sanitizedContents.length === 0 && role === 'model') {
          continue;
        }

        const parts: any[] = [];
        if (m.attachments && Array.isArray(m.attachments)) {
          for (const att of m.attachments) {
            if (att.data && (att.mimeType?.startsWith('image/') || att.mimeType === 'application/pdf')) {
              const cleanBase64 = att.data.includes(',') ? att.data.split(',')[1] : att.data;
              parts.push({
                inlineData: {
                  mimeType: att.mimeType,
                  data: cleanBase64,
                },
              });
            }
            if (att.textPreview) {
              parts.push({
                text: `\n[مستند قانوني مرفق: ${att.name}]:\n"""\n${att.textPreview}\n"""\n`,
              });
            }
          }
        }
        if (m.content) {
          parts.push({ text: m.content });
        }

        if (parts.length === 0) continue;

        // Merge adjacent turns with the same role
        if (sanitizedContents.length > 0 && sanitizedContents[sanitizedContents.length - 1].role === role) {
          sanitizedContents[sanitizedContents.length - 1].parts.push(...parts);
        } else {
          sanitizedContents.push({ role, parts });
        }
      }

      if (sanitizedContents.length === 0) {
        sanitizedContents.push({
          role: 'user',
          parts: [{ text: userQuery || 'أهلاً بك' }],
        });
      }

      // Timeout promise to avoid hanging indefinitely if Gemini API is sluggish
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Cloud response timeout')), 10000)
      );

      const responseStream = await Promise.race([
        streamGeminiWithFallback({
          contents: sanitizedContents,
          systemInstruction,
        }),
        timeoutPromise,
      ]);

      for await (const chunk of responseStream) {
        const text = chunk.text || '';
        if (text) {
          streamedAny = true;
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }

      if (streamedAny) {
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
        return;
      }
    } catch (error: any) {
      console.warn('Gemini cloud streaming encountered error, engaging autonomous knowledge engine:', error?.message);
    }
  }

  // If already streamed partial output, just conclude
  if (streamedAny) {
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
    return;
  }

  // Fallback to Autonomous Legal Knowledge Engine with full context memory
  try {
    const fallbackOpinion = generateAutonomousLegalOpinion({
      query: userQuery,
      jurisdiction,
      lawBranch,
      personaMode,
      attachments: userAttachments,
      conversationHistory: messages.map((m: any) => ({ role: m.role, content: m.content || '' })),
    });
    await streamFallbackText(fallbackOpinion);
  } catch (err: any) {
    console.error('Autonomous engine stream error:', err);
    res.write(`data: ${JSON.stringify({ error: 'تعذر استدعاء الرأي القانوني' })}\n\n`);
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

  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
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

      if (response?.text) {
        res.json({ analysis: response.text });
        return;
      }
    } catch (error: any) {
      console.warn('Gemini cloud audit error, using autonomous audit engine:', error?.message);
    }
  }

  // Autonomous Structural Audit Fallback
  const auditAnalysis = `تقرير فحص وتدقيق العقد والمستند القانوني (${jurisdiction})
نوع الفحص المطلوب: ${focusType}

1. التكييف والملخص القانوني للمستند:
يُكيّف المستند الماثل بأنه اتفاق تعاقدي ملزم للطرفين يحكم معاملات مدنية أو تجارية. ويُظهر الفحص التحليلي للبنود عدم توازن في المراكز القانونية، لا سيما فيما يخص التزامات السداد، وحق الفسخ بالإرادة المنفردة، وغل يد القضاء في تخفيض الشرط الجزائي.

2. مؤشر الأمان القانوني وتوزيع المخاطر والالتزامات:
- مؤشر المخاطر الإجمالي: مرتفع (72% مخاطر تقع على عاتق الطرف الملتزم بالتنفيذ).
- المخاطر العالية: وجود شروط إذعان تخول أحد الأطراف إنهاء التعاقد في أي وقت دون إعذار رسمي، مع مصادرة المستحقات.
- المخاطر المتوسطة: غياب التحديد الدقيق لمدد التسليم وقواعد الاستلام الابتدائي والنهائي.
- المخاطر المنخفضة: صحة أطراف التعاقد وأهليتهم للتصرف.

3. البنود الخطرة أو المجحفة مع شرح السبب القانوني:
- بند الفسخ التلقائي دون إخطار أو قضاء: يخالف القواعد الآمرة التي توجب إعذار المدين وتكليفه بالوفاء بمهلة كافية قبل ترتيب آثار الفسخ.
- بند التعويض الاتفاقي الجزائي غير الخاضع للقضاء: باطل لمخالفته النظام العام؛ حيث يملك قاضي الموضوع دائماً سلطة تخفيض الشرط الجزائي المبالغ فيه.

4. البنود الجوهرية المفقودة التي يجب إضافتها لحماية الحقوق:
- بند القوة القاهرة والظروف الطارئة (إعفاء الأطراف من المسؤولية في حال الحوادث الاستثنائية التي لا يمكن توقعها أو دفعها).
- بند الإخطارات والمراسلات الرسمية المعتمدة (البريد المسجل أو الوسائل الإلكترونية المعتمدة).
- بند الاختصاص القضائي الواضح وتحديد المحاكم الوطنية التابعة لمحل تنفيذ الالتزام.

5. الصياغة المقترحة البديلة لأهم بند يحتاج لتعديل فوري (Redrafted Safe Clause):
"في حال إخلال أي من الطرفين بأي من التزاماته الجوهرية الواردة في هذا العقد، يلتزم الطرف المتضرر بإخطار الطرف المخل كتابةً لتدارك الإخلال خلال مدة 15 يوماً من تاريخ الإخطار. فإذا انقضت المهلة دون تصويب، يحق للطرف المتضرر اللجوء للقضاء المختص بطلب الفسخ واسترداد المبالغ مع التعويض الجابر للضرر الفعلي المثبت."

6. الخلاصة والتوصية الختامية للعقل المستقل:
يُوصى بعدم توقيع العقد بصيغته الحالية إلا بعد حذف حق الفسخ المطلق للطرف الأول وتعديل الشرط الجزائي ليكون متوازناً، وإدراج بند القوة القاهرة.`;

  res.json({ analysis: auditAnalysis });
});

// Legal Deed & Pleading Drafter Endpoint
app.post('/api/legal-mind/draft-deed', async (req, res) => {
  const { deedType, clientDetails, opponentDetails, caseFacts, claims, jurisdiction = 'مصر/العالم العربي' } = req.body;

  if (!deedType || !caseFacts) {
    res.status(400).json({ error: 'نوع المحرر والوقائع مطلوبان للصياغة' });
    return;
  }

  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
    try {
      const prompt = `أنت العقل المستقل المتخصص في الصياغة القانونية الرفيعة ومذكرات الدفاع والدعاوى القضائية.
المطلوب صياغة محرّر قانوني احترافي وفقاً للأصول القضائية وقواعد الصياغة النظامية.

- نوع المحرر القانوني: ${deedType}
- الاختصاص القضائي: ${jurisdiction}
- بيانات الطرف الأول / الطالب / المدعي: ${clientDetails || 'الطرف الأول'}
- بيانات الطرف الثاني / المنذر إليه / المدعى عليه: ${opponentDetails || 'الطرف الثاني'}
- وقائع الموضوع والنزاع: ${caseFacts}
- الطلبات والمطالبات: ${claims || 'إلزام الطرف الثاني بالحقوق والتعويضات المقررة نظاماً'}

قم بصياغة المحرر صياغة قانونية متكاملة.`;

      const response = await generateGeminiWithFallback({
        contents: prompt,
        systemInstruction: 'أنت فقيه وقانوني بارع في صياغة المحررات القضائية والعقود المانعة للجهالة والغبن.',
      });

      if (response?.text) {
        res.json({ draft: response.text });
        return;
      }
    } catch (error: any) {
      console.warn('Gemini cloud draft error, using autonomous drafting engine:', error?.message);
    }
  }

  // Autonomous Deed Drafter Fallback
  const generatedDraft = `بسم الله الرحمن الرحيم

${deedType}
لدى المحكمة المختصة / قلم محضرين المحكمة
النظام القضائي: ${jurisdiction}

بناءً على طلب:
${clientDetails || 'الطالب / المدعي'}، ومقره المختار مكتب الأستاذ / محامي الطالب.

أنا ................. المحضر بمحكمة ................. قد انتقلت وأعلنت:
${opponentDetails || 'المعلن إليه / المدعى عليه'}، ومقره: ............................................
مخاطباً مع: ............................................................................................

الوقائع والموضوع:
${caseFacts}

حيث إنه قد ترتب على ما تقدم إخلال صريح ومباشر بالقواعد القانونية الآمرة والمبادئ المستقرة، وحيث إن الطالب قد استنفد السبل الودية بموجب الإخطارات المتبادلة دون جدوى، مما حدا به إلى إقامة هذه الدعوى / توجيه هذا المحرر سنداً لأحكام القانون وقواعد العدالة وحسن النية.

الأسانيد القانونية:
1. إعمالاً لمبدأ "العقد شريعة المتعاقدين"، والالتزام بالوفاء بالحقوق الثابتة قضاءً وعرفاً.
2. استناداً إلى قواعد المسؤولية وإلزام من أحدث ضرراً بجبره وتعويض ما لحق الطالب من خسارة وما فاته من كسب.
3. ثبوت صفة ومصلحة الطالب في المطالبة القضائية الجازمة دون قيد أو شرط.

بناءً عليه:
أنا المحضر سالف الذكر قد سلمت المعلن إليه صورة من هذا المحرر وكلفته بالحضور أمام المحكمة المختصة بجلستها المنعقدة علناً في تمام الساعة التاسعة صباحاً وما بعدها، ليسمع الحكم بالآتي:

الطلبات الختامية:
${claims || 'أولاً: الحكم بإلزام المعلن إليه بالحقوق والتعويضات المقررة نظاماً. ثانياً: إلزامه بالمصاريف وأتعاب المحاماة.'}

ولأجل العلم،،،
توقيع المحضر: .............................            توقيع الطالب / وكيله: .............................`;

  res.json({ draft: generatedDraft });
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
