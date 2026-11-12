import { LawBranch } from '../types/legal';

export type LegalNodeCategory = 'root' | 'public' | 'private' | 'cross';

export interface MindMapNode {
  id: string;
  label: string;
  shortLabel: string;
  category: LegalNodeCategory;
  x: number; // Coordinate on 1000x620 viewBox
  y: number;
  description: string;
  keyStatutes: string[];
  chatBranch?: LawBranch;
  sampleQuestion: string;
}

export interface MindMapEdge {
  id: string;
  from: string;
  to: string;
  type: 'hierarchy' | 'intersection';
  label: string;
  intersectionDetail: string;
}

export const MIND_MAP_NODES: MindMapNode[] = [
  // Center Root
  {
    id: 'root',
    label: 'النظام القانوني العام وسيادة القانون',
    shortLabel: 'سيادة القانون',
    category: 'root',
    x: 500,
    y: 80,
    description:
      'القاعدة الهرمية العليا التي تضمن وحدة النظام التشريعي وتدرج القواعد القانونية (الدستور ثم التشريع العادي ثم اللوائح)، وتنظم التوازن بين المصلحة العامة وحقوق الأفراد.',
    keyStatutes: ['الدستور والوثيقة العليا', 'مبدأ تدرج القوانين', 'مبدأ الشرعية وسيادة القانون'],
    chatBranch: 'القانون العام والشامل',
    sampleQuestion: 'كيف يضمن مبدأ تدرج القوانين عدم تعارض اللوائح الإدارية مع النصوص الدستورية والقوانين العادية؟',
  },

  // Public Law Branch Hub
  {
    id: 'public-hub',
    label: 'القانون العام (سلطة السيادة)',
    shortLabel: 'القانون العام',
    category: 'public',
    x: 770,
    y: 195,
    description:
      'مجموعة القواعد التي تنظم العلاقات التي تدخل فيها الدولة بصفتها صاحبة السيادة والسلطان، وتستهدف تحقيق المصلحة العامة وحفظ النظام العام.',
    keyStatutes: ['قانون مجلس الدولة', 'القواعد الآمرة للنظام العام', 'قانون الميزانية والضرائب'],
    chatBranch: 'القانون العام والشامل',
    sampleQuestion: 'ما المعيار القضائي الحاسم للتمييز بين العقد الإداري الخاضع للقانون العام والعقد المدني؟',
  },

  // Private Law Branch Hub
  {
    id: 'private-hub',
    label: 'القانون الخاص (مصالح الأفراد)',
    shortLabel: 'القانون الخاص',
    category: 'private',
    x: 230,
    y: 195,
    description:
      'مجموعة القواعد التي تحكم الروابط بين الأفراد، أو بينهم وبين الدولة عندما تتصرف كشخص عادي منزوع من امتيازات السلطة العامة.',
    keyStatutes: ['القانون المدني (الشريعة العامة)', 'مدونة التجارة', 'قانون الأحوال الشخصية'],
    chatBranch: 'القانون المدني والالتزامات',
    sampleQuestion: 'متى يغلب النظام العام على مبدأ سلطان الإرادة في عقود القانون الخاص؟',
  },

  // Public Law Sub-nodes (Right Side in RTL)
  {
    id: 'constitutional',
    label: 'القانون الدستوري والحريات',
    shortLabel: 'الدستوري',
    category: 'public',
    x: 890,
    y: 330,
    description:
      'قمة الهرم التشريعي؛ يحدد شكل الدولة، وتوزيع السلطات التشريعية والتنفيذية والقضائية، ويكفل الحقوق والحريات الأساسية للأفراد.',
    keyStatutes: ['نصوص الدستور', 'أحكام المحكمة الدستورية العليا', 'مواثيق حقوق الإنسان'],
    chatBranch: 'القانون الدستوري وحقوق الإنسان',
    sampleQuestion: 'كيف يتم الطعن بعدم دستورية نص قانوني أثناء نظر دعوى موضوعية أمام القضاء؟',
  },
  {
    id: 'administrative',
    label: 'القانون الإداري ومجلس الدولة',
    shortLabel: 'الإداري',
    category: 'public',
    x: 740,
    y: 350,
    description:
      'يحكم نشاط السلطة التنفيذية والمرافق العامة، ويختص بمنازعات القرارات الإدارية (دعوى الإلغاء والتعويض) والعقود الإدارية والوظيفة العامة.',
    keyStatutes: ['قانون مجلس الدولة', 'قانون التعاقدات العامة', 'نظام الخدمة المدنية'],
    chatBranch: 'القانون الإداري وقضاء مجلس الدولة',
    sampleQuestion: 'ما هي أوجه الطعن الخمسة لإلغاء القرار الإداري المشوب بعيب إساءة استعمال السلطة أو عدم الاختصاص؟',
  },
  {
    id: 'criminal',
    label: 'القانون الجنائي والعقوبات',
    shortLabel: 'الجنائي',
    category: 'public',
    x: 610,
    y: 440,
    description:
      'يحدد الأفعال المجرمة والعقوبات المقررة لحماية أمن المجتمع وأرواح الأفراد وأموالهم، وتطبيق مبدأ الشرعية الجنائية وضمانات المحاكمة العادلة.',
    keyStatutes: ['قانون العقوبات', 'قانون الإجراءات الجنائية', 'نظام مكافحة الاحتيال المالي'],
    chatBranch: 'القانون الجنائي والعقوبات',
    sampleQuestion: 'ما الفرق الجوهري بين النصب والاحتيال الجنائي وبين الإخلال المدني في العقود من حيث القصد الجنائي؟',
  },
  {
    id: 'fiscal',
    label: 'القانون المالي والضريبي',
    shortLabel: 'المالي والضريبي',
    category: 'public',
    x: 865,
    y: 495,
    description:
      'ينظم الموارد والنفقات العامة للدولة، والضرائب المباشرة وغير المباشرة، والرسوم الجمركية، ومكافحة التهرب الضريبي.',
    keyStatutes: ['قانون ضريبة الدخل والقيمة المضافة', 'قانون الجمارك', 'لوائح الزكاة والضريبة'],
    chatBranch: 'القانون العام والشامل',
    sampleQuestion: 'ما هي الضمانات الإجرائية للممول والشركات عند الطعن على التقدير الجزافي للضرائب؟',
  },

  // Private Law Sub-nodes (Left Side in RTL)
  {
    id: 'civil',
    label: 'القانون المدني والالتزامات',
    shortLabel: 'المدني',
    category: 'private',
    x: 110,
    y: 330,
    description:
      'الشريعة العامة للمعاملات وأم القوانين الخاصة؛ ينظم مصادر الالتزام (العقد، الإرادة المنفردة، الفعل الضار، الإثراء بلا سبب) والحقوق العينية والملكية.',
    keyStatutes: ['التقنين المدني', 'نظام المعاملات المدنية', 'قواعد المسؤولية التقصيرية والعقدية'],
    chatBranch: 'القانون المدني والالتزامات',
    sampleQuestion: 'كيف تفرق المحكمة بين القوة القاهرة التي تبرئ المدين والظروف الطارئة التي تتيح إعادة التوازن للعقد؟',
  },
  {
    id: 'commercial',
    label: 'القانون التجاري والشركات',
    shortLabel: 'التجاري والشركات',
    category: 'private',
    x: 260,
    y: 350,
    description:
      'يحكم الأعمال التجارية والتجار والشركات التجارية، والأوراق التجارية (الشيك، الكمبيالة، السند لأمر)، والإفلاس والتصفية والتحكيم التجاري.',
    keyStatutes: ['نظام الشركات', 'قانون التجارة والأوراق التجارية', 'قانون الإفلاس والتحكيم'],
    chatBranch: 'القانون التجاري والشركات والملكية الفكرية',
    sampleQuestion: 'ما حدود مسؤولية مدير الشركة ذات المسؤولية المحدودة في ماله الخاص عند مخالفة نظام الشركات؟',
  },
  {
    id: 'labor',
    label: 'قانون العمل والتأمينات',
    shortLabel: 'العمل والتأمينات',
    category: 'private',
    x: 375,
    y: 455,
    description:
      'ينظم علاقة العمل التبعية المأجورة بين العامل وصاحب العمل بضوابط آمرة لحماية الطرف الأضعف، وحقوق نهاية الخدمة والإجازات والتأمينات.',
    keyStatutes: ['نظام العمل', 'قانون التأمينات الاجتماعية', 'لوائح التسوية العمالية'],
    chatBranch: 'قانون العمل والتأمينات الاجتماعية',
    sampleQuestion: 'متى ينقلب بند عدم المنافسة في عقد العمل من شرط مشروع إلى قيد باطل يتعارض مع حرية العمل؟',
  },
  {
    id: 'procedure',
    label: 'المرافعات والإجراءات القضائية',
    shortLabel: 'المرافعات والإثبات',
    category: 'private',
    x: 145,
    y: 505,
    description:
      'القواعد الإجرائية الشكلية لحماية الحقوق الموضوعية: الاختصاص القضائي، مواعيد الطعن والاستئناف والنقض، وقواعد الإثبات والتنفيذ الجبري.',
    keyStatutes: ['قانون المرافعات المدنية والتجارية', 'قانون الإثبات', 'نظام التنفيذ الجبري'],
    chatBranch: 'قانون المرافعات والإجراءات القضائية',
    sampleQuestion: 'ما هي الدفوع الشكلية التي يجب إبداؤها قبل الكلام في الموضوع وإلا سقط الحق فيها؟',
  },

  // Cross-Cutting / Hybrid Modern Legislations (Center Bridge)
  {
    id: 'cyber',
    label: 'التشريعات الرقمية والأمن السيبراني',
    shortLabel: 'القانون الرقمي',
    category: 'cross',
    x: 500,
    y: 310,
    description:
      'فرع تشريعي متقاطع يجمع بين قواعد القانون العام والخاص؛ ينظم التجارة الإلكترونية، حماية البيانات الشخصية، التوقيع الإلكتروني، ومكافحة الجرائم السيبرانية.',
    keyStatutes: ['قانون مكافحة جرائم تقنية المعلومات', 'قانون حماية البيانات الشخصية', 'قانون التوقيع الإلكتروني'],
    chatBranch: 'القانون التجاري والشركات والملكية الفكرية',
    sampleQuestion: 'ما مدى حجية رسائل البريد الإلكتروني وتطبيقات المحادثة كدليل إثبات رقمي في العقود والمنازعات؟',
  },
  {
    id: 'ip-competition',
    label: 'حماية المنافسة والملكية الفكرية',
    shortLabel: 'المنافسة والفكرية',
    category: 'cross',
    x: 500,
    y: 555,
    description:
      'منظومة متقاطعة تربط حماية الابتكار والعلامات التجارية بالنظام الاقتصادي العام لمنع الاحتكار وحماية المستهلك.',
    keyStatutes: ['قانون حماية الملكية الفكرية', 'قانون منع الاحتكار والمنافسة', 'قانون حماية المستهلك'],
    chatBranch: 'القانون التجاري والشركات والملكية الفكرية',
    sampleQuestion: 'كيف يتقاطع قانون المنافسة غير المشروعة مع قانون العمل في حالات استقطاب العملاء والأسرار التجارية؟',
  },
];

export const MIND_MAP_EDGES: MindMapEdge[] = [
  // Hierarchical Tree Connections
  {
    id: 'e-root-pub',
    from: 'root',
    to: 'public-hub',
    type: 'hierarchy',
    label: 'فرع السيادة',
    intersectionDetail: 'يتفرع القانون العام عن القاعدة الدستورية لتنظيم سلطات الدولة وحماية الصالح العام.',
  },
  {
    id: 'e-root-priv',
    from: 'root',
    to: 'private-hub',
    type: 'hierarchy',
    label: 'فرع الأفراد',
    intersectionDetail: 'يتفرع القانون الخاص لحماية الحرية التعاقدية واستقرار المعاملات المدنية والتجارية.',
  },
  {
    id: 'e-root-cyber',
    from: 'root',
    to: 'cyber',
    type: 'hierarchy',
    label: 'تشريع عابر للفروع',
    intersectionDetail: 'التحول الرقمي يفرض قواعد موحدة تربط السيادة الرقمية بالتعاملات التجارية الخاصة.',
  },
  {
    id: 'e-pub-const',
    from: 'public-hub',
    to: 'constitutional',
    type: 'hierarchy',
    label: 'القواعد العليا',
    intersectionDetail: 'يرسم القانون الدستوري حدود السلطات العامة وضمانات حقوق المواطنين.',
  },
  {
    id: 'e-pub-admin',
    from: 'public-hub',
    to: 'administrative',
    type: 'hierarchy',
    label: 'نشاط الإدارة',
    intersectionDetail: 'يخضع القرار الإداري وعقود الإدارة لرقابة قضاء مجلس الدولة ضماناً لمبدأ المشروعية.',
  },
  {
    id: 'e-pub-crim',
    from: 'public-hub',
    to: 'criminal',
    type: 'hierarchy',
    label: 'الحق العام للعقاب',
    intersectionDetail: 'تتولى النيابة العامة تحريك الدعوى العمومية لحماية المجتمع بالردع العام والخاص.',
  },
  {
    id: 'e-pub-fisc',
    from: 'public-hub',
    to: 'fiscal',
    type: 'hierarchy',
    label: 'السيادة المالية',
    intersectionDetail: 'تمارس الدولة حق فرض الضرائب والرسوم بنص تشريعي صريح لتحقيق التوازن المالي.',
  },
  {
    id: 'e-priv-civ',
    from: 'private-hub',
    to: 'civil',
    type: 'hierarchy',
    label: 'الشريعة العامة',
    intersectionDetail: 'يظل القانون المدني المرجع الاحتياطي الأول في حال غياب نص خاص في أي فرع تجاري أو عمالي.',
  },
  {
    id: 'e-priv-comm',
    from: 'private-hub',
    to: 'commercial',
    type: 'hierarchy',
    label: 'سرعة الائتمان',
    intersectionDetail: 'يتميز القانون التجاري عن المدني بحرية الإثبات والتضامن المفترض وسرعة تداول الأوراق التجارية.',
  },
  {
    id: 'e-priv-labor',
    from: 'private-hub',
    to: 'labor',
    type: 'hierarchy',
    label: 'الحماية الآمرة',
    intersectionDetail: 'يتدخل المشرع في عقد العمل بقواعد آمرة تحمي العامل ولا يجوز الاتفاق على مخالفتها.',
  },
  {
    id: 'e-priv-proc',
    from: 'private-hub',
    to: 'procedure',
    type: 'hierarchy',
    label: 'طريق التقاضي',
    intersectionDetail: 'يترجم قانون المرافعات الحقوق الموضوعية إلى إجراءات ومواعيد ملزمة أمام المحاكم.',
  },

  // Cross-Cutting Intersections (التشريعات المتقاطعة)
  {
    id: 'x-crim-comm',
    from: 'criminal',
    to: 'commercial',
    type: 'intersection',
    label: 'جرائم الشركات والشيكات',
    intersectionDetail:
      'يتقاطع القانون الجنائي مع التجاري في جرائم إصدار شيك بدون رصيد، التفالس بالتدليس، وتبديد أموال المساهمين، وغسل الأموال التجارية.',
  },
  {
    id: 'x-crim-cyber',
    from: 'criminal',
    to: 'cyber',
    type: 'intersection',
    label: 'الجرائم السيبرانية والاحتيال',
    intersectionDetail:
      'تُشدد العقوبات الجنائية عندما تُرتكب جرائم النصب والابتزاز والتزوير عبر الشبكات الرقمية ووسائل الدفع الإلكتروني.',
  },
  {
    id: 'x-comm-cyber',
    from: 'commercial',
    to: 'cyber',
    type: 'intersection',
    label: 'التجارة والتعاقد الإلكتروني',
    intersectionDetail:
      'يربط قانون التوقيع الإلكتروني وحماية البيانات التعاقدات التجارية الرقمية بحجية الإثبات والتنفيذ عبر الحدود.',
  },
  {
    id: 'x-civ-admin',
    from: 'civil',
    to: 'administrative',
    type: 'intersection',
    label: 'العقود الإدارية vs المدنية',
    intersectionDetail:
      'رغم خضوع العقود المدنية لتساوي الأطراف، يتميز العقد الإداري ببنود استثنائية غير مألوفة (تعديل وسلطة جزاء) ترجح المصلحة العامة مع تعويض المتعاقد.',
  },
  {
    id: 'x-civ-labor',
    from: 'civil',
    to: 'labor',
    type: 'intersection',
    label: 'تقييد سلطان الإرادة',
    intersectionDetail:
      'نشأ عقد العمل من عباءة عقد الإيجار المدني، ثم استقل بضوابط آمرة تمنع انتقاص حقوق العامل حتى لو قبل بها في العقد.',
  },
  {
    id: 'x-const-proc',
    from: 'constitutional',
    to: 'procedure',
    type: 'intersection',
    label: 'ضمانات المحاكمة العادلة',
    intersectionDetail:
      'تلتزم قوانين المرافعات والإجراءات بالمبادئ الدستورية الخاصة بحق التقاضي، وعلنية الجلسات، وحق الدفاع، وعدم تحصين أي عمل إداري.',
  },
  {
    id: 'x-fisc-comm',
    from: 'fiscal',
    to: 'commercial',
    type: 'intersection',
    label: 'الوعاء الضريبي للشركات',
    intersectionDetail:
      'تُحدد الضرائب المستحقة على الشركات بناءً على دفاترها التجارية وقوائمها المالية المنظمة وفق نظام الشركات.',
  },
  {
    id: 'x-ip-labor',
    from: 'labor',
    to: 'ip-competition',
    type: 'intersection',
    label: 'الأسرار التجارية وعدم المنافسة',
    intersectionDetail:
      'يتقاطع قانون العمل مع قانون المنافسة والملكية الفكرية في ملكية ابتكارات الموظفين أثناء العمل، وحماية الأسرار التجارية بعد ترك الوظيفة.',
  },
  {
    id: 'x-ip-comm',
    from: 'commercial',
    to: 'ip-competition',
    type: 'intersection',
    label: 'العلامات التجارية والاحتكار',
    intersectionDetail:
      'حماية العلامات التجارية وبراءات الاختراع للكيانات التجارية مع منع الممارسات الاحتكارية والإغراق السعري في السوق.',
  },
  {
    id: 'x-crim-fisc',
    from: 'criminal',
    to: 'fiscal',
    type: 'intersection',
    label: 'التهرب الضريبي والجمركي',
    intersectionDetail:
      'يتحول النزاع الضريبي إلى جريمة جنائية مالية عند استخدام فواتير وهمية أو إخفاء الأنشطة الخاضعة للضريبة عمداً.',
  },
];
