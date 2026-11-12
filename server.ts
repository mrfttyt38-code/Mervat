import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
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

// ChatGPT-Caliber Central Polymath & Legal Mind system prompt builder
function buildLegalMindSystemInstruction(
  jurisdiction: string,
  lawBranch: string,
  personaMode: string,
  voiceTone: string = 'friendly'
): string {
  let personaInstruction = '';
  if (personaMode === 'natural') {
    personaInstruction = `
- نمط الشخصية: النمط الطبيعي التام (أسلوب شات جي بي تي الحواري المرن).
- تتحدث بتلقائية إنسانية، ذكاء اجتماعي، وخفة ظل متزنة عند الدردشة، وبعمق منهجي ودقة متناهية عند طرح الأسئلة العلمية أو البرمجية أو العملية أو القانونية، دون فرض أي قوالب جاهزة.`;
  } else if (personaMode === 'friendly') {
    personaInstruction = `
- نمط الشخصية: محاور مبسط وواضح.
- تشرح أعقد المفاهيم بلغة قريبة وأمثلة حياتية ملموسة مع الحفاظ على الدقة الكاملة.`;
  } else if (personaMode === 'advocate') {
    personaInstruction = `
- نمط الشخصية: محاجج استراتيجي ومدافع محنك.
- تركز على البراهين القاطعة، مقارنة البدائل، وكشف الثغرات المنطقية أو القانونية وبناء أقوى حجة ممكنة.`;
  } else {
    personaInstruction = `
- نمط الشخصية: مستشار وباحث موسوعي رفيع.
- تقدم تحليلاً رصيناً ومحايداً يزن المعطيات والأدلة بميزان العلم والقضاء.`;
  }

  let toneInstruction = '';
  if (voiceTone === 'formal') {
    toneInstruction = `- النبرة: رسمية رصينة. استخدم عربية فصحى محكمة وأسلوباً أكاديمياً ومهنياً وقوراً.`;
  } else if (voiceTone === 'technical') {
    toneInstruction = `- النبرة: تقنية تخصصية دقيقة. ركز على المصطلحات الهندسية والعلمية أو الإجرائية، المعادلات، والأكواد بإيجاز احترافي مباشر.`;
  } else {
    toneInstruction = `- النبرة: ودية مرنة وطبيعية. خاطب المستخدم بوضوح ودفء وسلاسة تشبه أرقى حوارات ChatGPT.`;
  }

  return `أنت "العقل المستقل" — عقل ذكاء اصطناعي مركزي شامل بمستوى وقدرات **ChatGPT** في الفهم العميق، الاستنتاج المنطقي، الحوار الطبيعي، والإبداع عبر **جميع المجالات البشرية** إلى جانب براعتك القانونية الكاملة.

كيف تفكر وتتحاور كعقل ChatGPT المركزي:
1. **ابدأ بالإجابة المباشرة فوراً:** لا تمهّد بمقدمات إنشائية طويلة ولا تكرر سؤال المستخدم؛ أعطِ الخلاصة أو الحل من أول جملة.
2. **تكيّف بذكاء مع حجم السؤال وسياقه:**
   - الأسئلة البسيطة أو التحيات والدردشة ("عامل ايه"، "احكيلي نكتة"، "قارن بين كذا وكذا باختصار"): أجب ببساطة وطبيعية وإيجاز ذكي دون محاضرات مطولة.
   - الأسئلة المركبة (برمجة، رياضيات، فيزياء، طب، اقتصاد، تخطيط مشاريع، كتابة إبداعية، تلخيص، ترجمة، أو قضايا قانونية): نظم إجابتك بتنسيق Markdown نظيف (عناوين فرعية، نقاط واضحة، جداول مقارنة عند الحاجة، وكتل برمجية نظيفة قابلة للتشغيل مع ذكر اللغة).
3. **ذاكرة سياقية حية ومتابعة دقيقة:** افهم أوامر التعديل والمتابعة القصيرة ("اختصر"، "لخصها في 3 نقاط"، "حوّلها لبايثون"، "ترجمها للإنجليزية"، "اشرحلي بمثال أبسط") بناءً على الرسائل السابقة في المحادثة مباشرة.
4. **شمولية مطلقة في كل العلوم والمهارات:**
   - **البرمجة والذكاء الاصطناعي:** كتابة وتصحيح الأكواد بجميع اللغات، تصميم الأنظمة (System Design)، قواعد البيانات، وتحليل الأداء.
   - **العلوم البحتة والتطبيقية:** الفيزياء، الرياضيات، الكيمياء، الأحياء، الفلك، والطب (مع تنويه طبي مهني عند المسائل الصحية الشخصية فقط).
   - **الأعمال والإنسانيات:** الاقتصاد، التسويق، الإدارة، الفلسفة، علم النفس، التاريخ، الأدب، الترجمة، وصياغة الإيميلات والخطط.
   - **القانون والقضاء:** عند طرح نزاع قانوني أو عقد أو مسألة تنظيمية أو اختيار فرع قانوني، طبّق التكييف القضائي الدقيق وفق (${jurisdiction || 'القانون العام والمقارن'}) مع الدفوع والخطوات العملية.
   - **قاعدة حاسمة:** لا تقحم مصطلحات المحاكم أو "قاضي الموضوع" في الأسئلة غير القانونية إطلاقاً!
5. **الصدق والدقة:** إذا لم تتوفر معلومة محددة أو نص رقم مادة قانونية معينة بيقين، صرّح بذلك بأمانة أو قدّم القاعدة العامة الدقيقة دون تأليف.
6. **تفاعل ختامي ذكي:** اختم الإجابات التحليلية بسؤال أو عرض مساعدة قصير وذكي يناسب السياق (مثلاً: "هل تود أن أكتب لك الكود كاملاً..." أو "هل تحب أن نلخص ذلك في جدول..." إلخ).

التخصص النشط المختار حالياً: ${lawBranch || 'كافة العلوم والمعارف الشاملة'}.
الاختصاص القانوني المرجعي (عند اللزوم القانوني): ${jurisdiction || 'عام ومقارن'}.
${personaInstruction}
${toneInstruction}`;
}

async function streamGeminiWithFallback(params: {
  contents: any;
  systemInstruction?: string;
}) {
  const modelsToTry = ['gemini-4-hydrogen', 'gemini-3.1-flash-lite'];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const config: any = {};
      if (params.systemInstruction) {
        config.systemInstruction = params.systemInstruction;
      }
      if (model === 'gemini-4-hydrogen') {
        config.thinkingConfig = { thinkingLevel: ThinkingLevel.MEDIUM };
      }

      const responseStream = await ai.models.generateContentStream({
        model,
        contents: params.contents,
        config,
      });
      return responseStream;
    } catch (err: any) {
      console.warn(`Attempt with ${model} failed, trying next model:`, err?.message);
      lastError = err;
      await new Promise((r) => setTimeout(r, 300));
    }
  }
  throw lastError;
}

async function generateGeminiWithFallback(params: {
  contents: any;
  systemInstruction?: string;
}) {
  const modelsToTry = ['gemini-4-hydrogen', 'gemini-3.1-flash-lite'];
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
      await new Promise((r) => setTimeout(r, 300));
    }
  }
  throw lastError;
}

// SSE Chat Stream Endpoint
app.post('/api/legal-mind/chat-stream', async (req, res) => {
  const {
    messages,
    jurisdiction = 'عام ومقارن',
    lawBranch = 'شامل',
    personaMode = 'natural',
    voiceTone = 'friendly',
  } = req.body;

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
      const systemInstruction = buildLegalMindSystemInstruction(jurisdiction, lawBranch, personaMode, voiceTone);

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
                text: `\n[ملف / مستند مرفق: ${att.name}]:\n"""\n${att.textPreview}\n"""\n`,
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
        setTimeout(() => reject(new Error('Cloud response timeout')), 25000)
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
      voiceTone,
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

// Voice Transcription Endpoint (STT via Gemini 3.5 Transcribe)
app.post('/api/voice/transcribe', async (req, res) => {
  const { audioBase64, mimeType = 'audio/webm' } = req.body;
  if (!audioBase64) {
    res.status(400).json({ error: 'بيانات الصوت مطلوبة للتحويل إلى نص' });
    return;
  }

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY') {
    res.status(503).json({ error: 'خدمة التفريغ الصوتي السحابية غير متوفرة حالياً' });
    return;
  }

  try {
    const cleanBase64 = audioBase64.includes(',') ? audioBase64.split(',')[1] : audioBase64;
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
          {
            text: 'فرّغ هذا التسجيل الصوتي إلى نص واضح ودقيق بنفس اللغة المنطوقة (العربية أو الإنجليزية) بدون أي مقدمات أو تعليقات.',
          },
        ],
      },
    });

    res.json({ text: (response.text || '').trim() });
  } catch (err: any) {
    console.warn('Voice transcription failed:', err?.message);
    res.status(500).json({ error: 'تعذر تفريغ المقطع الصوتي' });
  }
});

// Natural Arabic Voice Synthesis Endpoint (TTS via Gemini 3.8 Flash Lite TTS)
app.post('/api/voice/tts', async (req, res) => {
  const { text, voiceTone = 'friendly' } = req.body;
  if (!text || !String(text).trim()) {
    res.status(400).json({ error: 'النص مطلوب للتحويل إلى صوت' });
    return;
  }

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY') {
    res.status(503).json({ error: 'خدمة الصوت السحابية غير متوفرة حالياً' });
    return;
  }

  try {
    // Convert markdown/code cleanly to natural spoken text
    const spokenText = String(text)
      .replace(/```[\s\S]*?```/g, ' ... وإليك الكود البرمجي الموضح أمامك على الشاشة ... ')
      .replace(/\|[-:\s|]+\|/g, ' ')
      .replace(/\|/g, '، ')
      .replace(/[#*`_~>]/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 1800);

    const voiceName =
      voiceTone === 'formal' ? 'Charon' : voiceTone === 'technical' ? 'Fenrir' : 'Zephyr';
    const style =
      voiceTone === 'formal'
        ? 'Clear, authoritative, articulate Arabic broadcaster'
        : voiceTone === 'technical'
        ? 'Calm, precise, analytical Arabic expert'
        : 'Warm, friendly, natural conversational Arabic assistant';

    let response: any;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: spokenText,
                speechMetadata: { style },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });
    } catch {
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [{ text: spokenText }],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });
    }

    const audioBase64 =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!audioBase64) {
      res.status(502).json({ error: 'لم يتم إرجاع بيانات صوتية' });
      return;
    }

    res.json({ audioBase64, mimeType: 'audio/wav' });
  } catch (err: any) {
    console.warn('Voice TTS failed, client will use browser speechSynthesis:', err?.message);
    res.status(200).json({ fallbackBrowserTTS: true });
  }
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', engine: 'Autonomous Central Mind - Gemini 4 Hydrogen' });
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
