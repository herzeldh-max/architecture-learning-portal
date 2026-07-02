export type Lang = 'he' | 'ar'

export interface Dictionary {
  common: {
    login: string
    register: string
    logout: string
    backToHome: string
  }
  nav: {
    brand: string
    home: string
    buildingTheory: string
    buildingLegislation: string
    dictionary: string
    promptEngineering: string
    admin: string
    adminBadge: string
  }
  home: {
    collegeSubtitle: string
    heroTitle: string
    heroDesc: string
    startNow: string
    featuresTitle: string
    featuresSubtitle: string
    features: {
      theory: { title: string; subtitle: string; points: string[] }
      legislation: { title: string; subtitle: string; points: string[] }
      exam: { title: string; subtitle: string; points: string[] }
      progress: { title: string; subtitle: string; points: string[] }
    }
  }
  auth: {
    login: {
      title: string
      subtitle: string
      email: string
      password: string
      submit: string
      submitting: string
      error: string
      noAccount: string
      registerLink: string
      forgotPasswordLink: string
    }
    register: {
      title: string
      subtitle: string
      fullName: string
      fullNamePlaceholder: string
      email: string
      password: string
      passwordPlaceholder: string
      confirmPassword: string
      confirmPasswordPlaceholder: string
      submit: string
      submitting: string
      errorMismatch: string
      errorShort: string
      errorGeneric: string
      successNeedsLogin: string
      hasAccount: string
      loginLink: string
    }
    forgotPassword: {
      title: string
      subtitle: string
      email: string
      submit: string
      submitting: string
      success: string
      error: string
      backToLogin: string
    }
    resetPassword: {
      title: string
      subtitle: string
      password: string
      passwordPlaceholder: string
      confirmPassword: string
      confirmPasswordPlaceholder: string
      submit: string
      submitting: string
      errorMismatch: string
      errorShort: string
      errorGeneric: string
      success: string
      backToLogin: string
      invalidLink: string
    }
  }
  dashboard: {
    greeting: string
    welcome: string
    theoryCard: { title: string; desc: string; links: { materials: string; chat: string; exam: string } }
    legislationCard: { title: string; desc: string; link: string }
    adminSection: { title: string; manage: string; upload: string; stats: string }
    recentStats: { title: string; avgScore: string; recentQuestions: string }
  }
  buildingTheory: {
    title: string
    subtitle: string
    chatButton: string
    examButton: string
    quickLinks: {
      chat: { title: string; desc: string }
      examA: { title: string; desc: string }
      examB: { title: string; desc: string }
    }
    noMaterials: string
    noMaterialsSub: string
    semesterA: string
    semesterB: string
    bothSemesters: string
  }
  buildingLegislation: {
    title: string
    subtitle: string
    chatButton: string
    examButton: string
    quickLinks: {
      chat: { title: string; desc: string }
      exam: { title: string; desc: string }
    }
    materialsTitle: string
    noMaterials: string
    noMaterialsSub: string
    upload: {
      title: string
      nameLabel: string
      namePlaceholder: string
      fileLabel: string
      submit: string
      uploading: string
      success: string
      error: string
      delete: string
      deleteConfirm: string
      existingTitle: string
    }
  }
  exam: {
    title: string
    settingsTitle: string
    semester: string
    semesterA: string
    semesterB: string
    bothSemesters: string
    questionType: string
    mixed: string
    multiple: string
    open: string
    start: string
    preparing: string
    preparingNew: string
    finish: string
    questionsLabel: string
    totalLabel: string
    pointsSuffix: string
    multipleBadge: string
    openBadge: string
    questionNumber: string
    answerPlaceholder: string
    submitAnswer: string
    checking: string
    correct: string
    partial: string
    incorrect: string
    correctAnswerLabel: string
    nextQuestion: string
    choiceLetters: string[]
  }
  theoryChat: {
    breadcrumb: string
    title: string
    chatTitle: string
    chatSubtitle: string
    initialMessage: string
    thinking: string
    placeholder: string
    send: string
    errorRetry: string
    errorConnection: string
  }
  legislationChat: {
    breadcrumb: string
    title: string
    chatTitle: string
    chatSubtitle: string
    initialMessage: string
    searching: string
    suggestionsLabel: string
    suggestions: string[]
    placeholder: string
    send: string
    errorConnection: string
  }
  legislationResources: {
    title: string
    items: { name: string; url: string }[]
  }
  dictionary: {
    title: string
    subtitle: string
    searchPlaceholder: string
    allLetters: string
    noResults: string
    termsCount: string
  }
  footer: string
}

const he: Dictionary = {
  common: {
    login: 'כניסה',
    register: 'הרשמה',
    logout: 'יציאה',
    backToHome: 'חזרה לדף הבית',
  },
  nav: {
    brand: 'פורטל לימוד - אדריכלות',
    home: 'דף הבית',
    buildingTheory: 'תורת הבנייה',
    buildingLegislation: 'תחיקת הבנייה',
    dictionary: 'מילון אדריכלי',
    promptEngineering: 'כתיבת פרומפטים',
    admin: 'ניהול',
    adminBadge: 'מנהל',
  },
  home: {
    collegeSubtitle: 'המכללה הטכנולוגית בבאר שבע',
    heroTitle: 'ברוכים הבאים לפורטל הלימוד',
    heroDesc: 'מערכת AI מתקדמת לסטודנטים לאדריכלות ועיצוב פנים. שאלות, חומרים ותרגול לקראת הבחינות.',
    startNow: 'התחל עכשיו',
    featuresTitle: 'מה תמצאו בפורטל?',
    featuresSubtitle: 'כל מה שצריך כדי להתכונן בביטחון לקורסי תורת הבנייה ותחיקת הבנייה',
    features: {
      theory: {
        title: 'תורת הבנייה',
        subtitle: "קורס לשנה א'",
        points: [
          'חומרי לימוד מהמצגות לפי סמסטר',
          'שאלות חופשיות על החומר עם AI',
          'הכנה למבחן עם שאלות מותאמות',
          'ניקוד מיידי ומשוב מפורט',
        ],
      },
      legislation: {
        title: 'תחיקת הבנייה',
        subtitle: 'תקנות תכנון ובנייה',
        points: [
          'שאלות על תקנות עדכניות',
          'מידע ממקורות רשמיים (נבו, כנסת)',
          'ציון מקור מדויק לכל תשובה',
          'חומר עדכני ומאומת',
        ],
      },
      exam: {
        title: 'הכנה למבחן',
        subtitle: 'שאלות ללא הגבלה',
        points: [
          'שאלות אמריקאיות ופתוחות',
          "תשובות אקראיות - לא תמיד א'",
          'מניעת חזרה על שאלות',
          'מעקב ציונים אישי',
        ],
      },
      progress: {
        title: 'מעקב התקדמות',
        subtitle: 'ממשק אישי',
        points: [
          'היסטוריית שאלות ותשובות',
          'ממוצע ציונים לפי נושא',
          'זיהוי נושאים שדורשים חיזוק',
          'חשבון אישי מאובטח',
        ],
      },
    },
  },
  auth: {
    login: {
      title: 'כניסה לפורטל',
      subtitle: 'פורטל לימוד - אדריכלות ועיצוב פנים',
      email: 'אימייל',
      password: 'סיסמה',
      submit: 'כניסה',
      submitting: 'מתחבר...',
      error: 'אימייל או סיסמה שגויים',
      noAccount: 'אין לך חשבון?',
      registerLink: 'הרשמה',
      forgotPasswordLink: 'שכחת סיסמה?',
    },
    register: {
      title: 'הרשמה לפורטל',
      subtitle: 'פורטל לימוד - אדריכלות ועיצוב פנים',
      fullName: 'שם מלא',
      fullNamePlaceholder: 'ישראל ישראלי',
      email: 'אימייל',
      password: 'סיסמה',
      passwordPlaceholder: 'לפחות 6 תווים',
      confirmPassword: 'אימות סיסמה',
      confirmPasswordPlaceholder: 'הכנס שוב את הסיסמה',
      submit: 'הרשמה',
      submitting: 'נרשם...',
      errorMismatch: 'הסיסמאות אינן תואמות',
      errorShort: 'הסיסמה חייבת להכיל לפחות 6 תווים',
      errorGeneric: 'שגיאה בהרשמה',
      successNeedsLogin: 'נרשמת בהצלחה! אנא התחבר.',
      hasAccount: 'כבר רשום?',
      loginLink: 'כניסה',
    },
    forgotPassword: {
      title: 'שחזור סיסמה',
      subtitle: 'הזן את כתובת האימייל שלך ונשלח לך קישור לאיפוס הסיסמה',
      email: 'אימייל',
      submit: 'שלח קישור לאיפוס',
      submitting: 'שולח...',
      success: 'נשלח אליך אימייל עם קישור לאיפוס הסיסמה. בדוק את תיבת הדואר שלך.',
      error: 'אירעה שגיאה בשליחת הקישור. נסה שוב.',
      backToLogin: 'חזרה לדף הכניסה',
    },
    resetPassword: {
      title: 'איפוס סיסמה',
      subtitle: 'הזן סיסמה חדשה לחשבונך',
      password: 'סיסמה חדשה',
      passwordPlaceholder: 'לפחות 6 תווים',
      confirmPassword: 'אימות סיסמה',
      confirmPasswordPlaceholder: 'הכנס שוב את הסיסמה',
      submit: 'עדכן סיסמה',
      submitting: 'מעדכן...',
      errorMismatch: 'הסיסמאות אינן תואמות',
      errorShort: 'הסיסמה חייבת להכיל לפחות 6 תווים',
      errorGeneric: 'אירעה שגיאה בעדכון הסיסמה. נסה שוב.',
      success: 'הסיסמה עודכנה בהצלחה! מעביר אותך לדף הכניסה...',
      backToLogin: 'חזרה לדף הכניסה',
      invalidLink: 'הקישור פג תוקף או אינו תקין. בקש קישור חדש לאיפוס סיסמה.',
    },
  },
  dashboard: {
    greeting: 'שלום, {name} 👋',
    welcome: 'ברוך הבא לפורטל הלימוד',
    theoryCard: {
      title: 'תורת הבנייה',
      desc: 'חומרי לימוד, שאלות חופשיות והכנה למבחן',
      links: { materials: 'חומרי לימוד', chat: 'שאלות חופשיות', exam: 'הכנה למבחן' },
    },
    legislationCard: {
      title: 'תחיקת הבנייה',
      desc: 'שאלות על תקנות תכנון ובנייה עם מקורות עדכניים',
      link: 'חומרי לימוד',
    },
    adminSection: {
      title: 'ממשק מנהל',
      manage: 'לממשק הניהול',
      upload: 'העלאת PDFs',
      stats: 'סטטיסטיקות',
    },
    recentStats: {
      title: 'סטטיסטיקות אחרונות',
      avgScore: 'ממוצע ציון',
      recentQuestions: 'שאלות אחרונות',
    },
  },
  buildingTheory: {
    title: 'תורת הבנייה',
    subtitle: "קורס לשנה א' | מצגות וחומרי לימוד",
    chatButton: 'שאלות חופשיות',
    examButton: 'הכנה למבחן',
    quickLinks: {
      chat: { title: 'שאלות חופשיות', desc: 'שאל כל שאלה על החומר' },
      examA: { title: "הכנה למבחן - סמסטר א'", desc: "תרגול שאלות מסמסטר א'" },
      examB: { title: "הכנה למבחן - סמסטר ב'", desc: "תרגול שאלות מסמסטר ב'" },
    },
    noMaterials: 'אין עדיין חומרי לימוד מועלים',
    noMaterialsSub: 'המרצה יעלה בקרוב את מצגות הקורס',
    semesterA: "סמסטר א'",
    semesterB: "סמסטר ב'",
    bothSemesters: 'חומר משני הסמסטרים',
  },
  buildingLegislation: {
    title: 'תחיקת הבנייה',
    subtitle: 'תקנות תכנון ובנייה, חוקים ונהלים',
    chatButton: 'שאלות על תקנות',
    examButton: 'הכנה למבחן',
    quickLinks: {
      chat: { title: 'שאלות על תקנות', desc: 'שאל כל שאלה על תקנות תכנון ובנייה' },
      exam: { title: 'הכנה למבחן', desc: 'שאלות אמריקאיות ופתוחות על חוקי הבנייה' },
    },
    materialsTitle: 'תקנים וחומרי לימוד',
    noMaterials: 'אין עדיין תקנים או מסמכים מועלים',
    noMaterialsSub: 'מסמכים שיועלו ישמשו את ה-AI לענות בצורה מדויקת יותר',
    upload: {
      title: 'העלאת תקן או מסמך',
      nameLabel: 'שם המסמך',
      namePlaceholder: 'לדוגמה: תקן ישראלי 1918 - בידוד תרמי',
      fileLabel: 'קובץ PDF',
      submit: 'העלה קובץ',
      uploading: 'מעלה...',
      success: 'הקובץ הועלה בהצלחה',
      error: 'שגיאה בהעלאת הקובץ',
      delete: 'מחק',
      deleteConfirm: 'למחוק את המסמך?',
      existingTitle: 'מסמכים קיימים',
    },
  },
  exam: {
    title: 'הכנה למבחן - תורת הבנייה',
    settingsTitle: 'הגדרות תרגול',
    semester: 'סמסטר',
    semesterA: "סמסטר א'",
    semesterB: "סמסטר ב'",
    bothSemesters: 'שניהם',
    questionType: 'סוג שאלות',
    mixed: 'מעורב',
    multiple: 'אמריקאיות',
    open: 'פתוחות',
    start: 'התחל תרגול',
    preparing: 'מכין שאלה...',
    preparingNew: 'מכין שאלה חדשה...',
    finish: 'סיום',
    questionsLabel: 'שאלות',
    totalLabel: 'סה"כ',
    pointsSuffix: 'נקודות',
    multipleBadge: 'אמריקאית',
    openBadge: 'פתוחה',
    questionNumber: 'שאלה {n}',
    answerPlaceholder: 'כתב את תשובתך כאן...',
    submitAnswer: 'שלח תשובה',
    checking: 'בודק...',
    correct: 'תשובה נכונה!',
    partial: 'תשובה חלקית',
    incorrect: 'תשובה שגויה',
    correctAnswerLabel: 'התשובה הנכונה:',
    nextQuestion: 'שאלה הבאה ›',
    choiceLetters: ['א', 'ב', 'ג', 'ד'],
  },
  theoryChat: {
    breadcrumb: 'תורת הבנייה',
    title: 'שאלות חופשיות',
    chatTitle: '💬 שאלות על תורת הבנייה',
    chatSubtitle: 'מענה מבוסס מצגות הקורס + ידע מקצועי',
    initialMessage: 'שלום! אני עוזר הלימוד לקורס תורת הבנייה. שאל אותי כל שאלה על החומר - אענה על פי המצגות ועל פי ידע מקצועי.',
    thinking: 'חושב...',
    placeholder: 'שאל שאלה על תורת הבנייה...',
    send: 'שלח',
    errorRetry: 'אירעה שגיאה, נסה שוב.',
    errorConnection: 'אירעה שגיאה בחיבור לשרת.',
  },
  legislationChat: {
    breadcrumb: 'תחיקת הבנייה',
    title: 'שאלות על תקנות',
    chatTitle: '📋 תחיקת הבנייה - שאלות על תקנות',
    chatSubtitle: 'מבוסס על נבו, כנסת, משרד הפנים ומשרד הבינוי | מקורות מצוינים בכל תשובה',
    initialMessage: 'שלום! אני עוזר הלימוד לקורס תחיקת הבנייה.\n\nאני יכול לענות על שאלות בנושא תקנות תכנון ובנייה עדכניות, חוקים, תקנות ונהלים. התשובות שלי מבוססות על מקורות רשמיים (אתר נבו, כנסת, משרד הפנים).\n\nשאל אותי כל שאלה!',
    searching: 'מחפש במקורות רשמיים...',
    suggestionsLabel: 'שאלות מוצעות:',
    suggestions: [
      'מהו חוק התכנון והבנייה?',
      'מהן דרישות הנגישות לבניין ציבורי?',
      'מה הם תקנות הבטיחות באש לבניינים?',
      'מהם כללי הקו הבונה?',
    ],
    placeholder: 'שאל על תקנות תכנון ובנייה...',
    send: 'שלח',
    errorConnection: 'אירעה שגיאה בחיבור לשרת.',
  },
  legislationResources: {
    title: 'קישורים למקורות רשמיים',
    items: [
      { name: 'פיקוד העורף - הנחיות והוראות בנייה למרחב מוגן', url: 'https://www.oref.org.il' },
      { name: 'מכון התקנים הישראלי', url: 'https://www.sii.org.il' },
      { name: 'משרד הפנים - מינהל התכנון (חוזרים ותקנות תכנון ובנייה)', url: 'https://www.gov.il/he/departments/the_planning_administration' },
    ],
  },
  dictionary: {
    title: 'מילון אדריכלי',
    subtitle: 'מונחי יסוד בתורת הבנייה ובאדריכלות, בעברית ובערבית',
    searchPlaceholder: 'חיפוש מונח...',
    allLetters: 'הכל',
    noResults: 'לא נמצאו מונחים מתאימים',
    termsCount: '{n} מונחים',
  },
  footer: 'פורטל לימוד - אדריכלות ועיצוב פנים | © כל הזכויות שמורות לבן שבת הרצל | המכללה הטכנולוגית באר שבע',
}

const ar: Dictionary = {
  common: {
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    logout: 'تسجيل الخروج',
    backToHome: 'العودة إلى الصفحة الرئيسية',
  },
  nav: {
    brand: 'بوابة التعلم - هندسة العمارة',
    home: 'الصفحة الرئيسية',
    buildingTheory: 'نظرية البناء',
    buildingLegislation: 'تشريعات البناء',
    dictionary: 'القاموس المعماري',
    promptEngineering: 'كتابة البرومبت',
    admin: 'الإدارة',
    adminBadge: 'مدير',
  },
  home: {
    collegeSubtitle: 'الكلية التكنولوجية في بئر السبع',
    heroTitle: 'مرحبًا بكم في بوابة التعلم',
    heroDesc: 'نظام ذكاء اصطناعي متقدم لطلاب هندسة العمارة وتصميم الديكور الداخلي. أسئلة، مواد تعليمية، وتدريب للاستعداد للامتحانات.',
    startNow: 'ابدأ الآن',
    featuresTitle: 'ما الذي ستجدونه في البوابة؟',
    featuresSubtitle: 'كل ما تحتاجونه للاستعداد بثقة لمقررات نظرية البناء وتشريعات البناء',
    features: {
      theory: {
        title: 'نظرية البناء',
        subtitle: 'مقرر السنة الأولى',
        points: [
          'مواد تعليمية من العروض التقديمية حسب الفصل الدراسي',
          'أسئلة حرة حول المادة باستخدام الذكاء الاصطناعي',
          'استعداد للامتحان بأسئلة مخصصة',
          'تقييم فوري وملاحظات مفصلة',
        ],
      },
      legislation: {
        title: 'تشريعات البناء',
        subtitle: 'لوائح التخطيط والبناء',
        points: [
          'أسئلة حول اللوائح المحدثة',
          'معلومات من مصادر رسمية (نِفو، الكنيست)',
          'تحديد مصدر دقيق لكل إجابة',
          'مادة محدثة وموثقة',
        ],
      },
      exam: {
        title: 'الاستعداد للامتحان',
        subtitle: 'أسئلة غير محدودة',
        points: [
          'أسئلة اختيار من متعدد وأسئلة مفتوحة',
          'ترتيب إجابات عشوائي - ليس دائمًا الخيار أ',
          'منع تكرار الأسئلة',
          'تتبع شخصي للدرجات',
        ],
      },
      progress: {
        title: 'تتبع التقدم',
        subtitle: 'واجهة شخصية',
        points: [
          'سجل الأسئلة والإجابات',
          'متوسط الدرجات حسب الموضوع',
          'تحديد المواضيع التي تحتاج إلى تعزيز',
          'حساب شخصي آمن',
        ],
      },
    },
  },
  auth: {
    login: {
      title: 'تسجيل الدخول إلى البوابة',
      subtitle: 'بوابة التعلم - هندسة العمارة وتصميم الديكور الداخلي',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      submit: 'تسجيل الدخول',
      submitting: 'جاري تسجيل الدخول...',
      error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
      noAccount: 'ليس لديك حساب؟',
      registerLink: 'إنشاء حساب',
      forgotPasswordLink: 'هل نسيت كلمة المرور؟',
    },
    register: {
      title: 'إنشاء حساب في البوابة',
      subtitle: 'بوابة التعلم - هندسة العمارة وتصميم الديكور الداخلي',
      fullName: 'الاسم الكامل',
      fullNamePlaceholder: 'مثال: محمد أحمد',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      passwordPlaceholder: '6 أحرف على الأقل',
      confirmPassword: 'تأكيد كلمة المرور',
      confirmPasswordPlaceholder: 'أدخل كلمة المرور مرة أخرى',
      submit: 'إنشاء حساب',
      submitting: 'جاري التسجيل...',
      errorMismatch: 'كلمتا المرور غير متطابقتين',
      errorShort: 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل',
      errorGeneric: 'حدث خطأ أثناء التسجيل',
      successNeedsLogin: 'تم التسجيل بنجاح! يرجى تسجيل الدخول.',
      hasAccount: 'هل لديك حساب بالفعل؟',
      loginLink: 'تسجيل الدخول',
    },
    forgotPassword: {
      title: 'استعادة كلمة المرور',
      subtitle: 'أدخل بريدك الإلكتروني وسنرسل لك رابطًا لإعادة تعيين كلمة المرور',
      email: 'البريد الإلكتروني',
      submit: 'إرسال رابط إعادة التعيين',
      submitting: 'جاري الإرسال...',
      success: 'تم إرسال بريد إلكتروني يحتوي على رابط لإعادة تعيين كلمة المرور. تحقق من بريدك الوارد.',
      error: 'حدث خطأ أثناء إرسال الرابط. حاول مرة أخرى.',
      backToLogin: 'العودة إلى صفحة تسجيل الدخول',
    },
    resetPassword: {
      title: 'إعادة تعيين كلمة المرور',
      subtitle: 'أدخل كلمة مرور جديدة لحسابك',
      password: 'كلمة المرور الجديدة',
      passwordPlaceholder: '6 أحرف على الأقل',
      confirmPassword: 'تأكيد كلمة المرور',
      confirmPasswordPlaceholder: 'أدخل كلمة المرور مرة أخرى',
      submit: 'تحديث كلمة المرور',
      submitting: 'جاري التحديث...',
      errorMismatch: 'كلمتا المرور غير متطابقتين',
      errorShort: 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل',
      errorGeneric: 'حدث خطأ أثناء تحديث كلمة المرور. حاول مرة أخرى.',
      success: 'تم تحديث كلمة المرور بنجاح! سيتم تحويلك إلى صفحة تسجيل الدخول...',
      backToLogin: 'العودة إلى صفحة تسجيل الدخول',
      invalidLink: 'الرابط منتهي الصلاحية أو غير صالح. يرجى طلب رابط جديد لإعادة تعيين كلمة المرور.',
    },
  },
  dashboard: {
    greeting: 'أهلًا، {name} 👋',
    welcome: 'مرحبًا بك في بوابة التعلم',
    theoryCard: {
      title: 'نظرية البناء',
      desc: 'مواد تعليمية، أسئلة حرة، واستعداد للامتحان',
      links: { materials: 'المواد التعليمية', chat: 'أسئلة حرة', exam: 'الاستعداد للامتحان' },
    },
    legislationCard: {
      title: 'تشريعات البناء',
      desc: 'أسئلة حول لوائح التخطيط والبناء مع مصادر محدثة',
      link: 'المواد التعليمية',
    },
    adminSection: {
      title: 'واجهة المدير',
      manage: 'إلى واجهة الإدارة',
      upload: 'رفع ملفات PDF',
      stats: 'الإحصائيات',
    },
    recentStats: {
      title: 'إحصائيات أخيرة',
      avgScore: 'متوسط الدرجات',
      recentQuestions: 'أسئلة أخيرة',
    },
  },
  buildingTheory: {
    title: 'نظرية البناء',
    subtitle: 'مقرر السنة الأولى | عروض تقديمية ومواد تعليمية',
    chatButton: 'أسئلة حرة',
    examButton: 'الاستعداد للامتحان',
    quickLinks: {
      chat: { title: 'أسئلة حرة', desc: 'اطرح أي سؤال حول المادة' },
      examA: { title: 'الاستعداد للامتحان - الفصل الأول', desc: 'تدريب على أسئلة الفصل الأول' },
      examB: { title: 'الاستعداد للامتحان - الفصل الثاني', desc: 'تدريب على أسئلة الفصل الثاني' },
    },
    noMaterials: 'لا توجد مواد تعليمية مرفوعة حتى الآن',
    noMaterialsSub: 'سيقوم المحاضر برفع عروض المقرر قريبًا',
    semesterA: 'الفصل الأول',
    semesterB: 'الفصل الثاني',
    bothSemesters: 'مواد من الفصلين',
  },
  buildingLegislation: {
    title: 'تشريعات البناء',
    subtitle: 'لوائح التخطيط والبناء، القوانين والإجراءات',
    chatButton: 'أسئلة حول اللوائح',
    examButton: 'الاستعداد للامتحان',
    quickLinks: {
      chat: { title: 'أسئلة حول اللوائح', desc: 'اطرح أي سؤال حول لوائح التخطيط والبناء' },
      exam: { title: 'الاستعداد للامتحان', desc: 'أسئلة اختيار من متعدد ومفتوحة حول قوانين البناء' },
    },
    materialsTitle: 'المواصفات والمواد التعليمية',
    noMaterials: 'لا توجد مواصفات أو مستندات مرفوعة حتى الآن',
    noMaterialsSub: 'المستندات التي تُرفع ستُستخدم بواسطة الذكاء الاصطناعي للإجابة بدقة أكبر',
    upload: {
      title: 'رفع مواصفة أو مستند',
      nameLabel: 'اسم المستند',
      namePlaceholder: 'مثال: المواصفة الإسرائيلية 1918 - العزل الحراري',
      fileLabel: 'ملف PDF',
      submit: 'رفع الملف',
      uploading: 'جاري الرفع...',
      success: 'تم رفع الملف بنجاح',
      error: 'حدث خطأ في رفع الملف',
      delete: 'حذف',
      deleteConfirm: 'هل تريد حذف المستند؟',
      existingTitle: 'مستندات موجودة',
    },
  },
  exam: {
    title: 'الاستعداد للامتحان - نظرية البناء',
    settingsTitle: 'إعدادات التدريب',
    semester: 'الفصل الدراسي',
    semesterA: 'الفصل الأول',
    semesterB: 'الفصل الثاني',
    bothSemesters: 'كلاهما',
    questionType: 'نوع الأسئلة',
    mixed: 'مختلط',
    multiple: 'اختيار من متعدد',
    open: 'مفتوحة',
    start: 'ابدأ التدريب',
    preparing: 'جاري تحضير السؤال...',
    preparingNew: 'جاري تحضير سؤال جديد...',
    finish: 'إنهاء',
    questionsLabel: 'الأسئلة',
    totalLabel: 'الإجمالي',
    pointsSuffix: 'نقاط',
    multipleBadge: 'اختيار من متعدد',
    openBadge: 'مفتوح',
    questionNumber: 'السؤال {n}',
    answerPlaceholder: 'اكتب إجابتك هنا...',
    submitAnswer: 'إرسال الإجابة',
    checking: 'جاري التحقق...',
    correct: 'إجابة صحيحة!',
    partial: 'إجابة جزئية',
    incorrect: 'إجابة خاطئة',
    correctAnswerLabel: 'الإجابة الصحيحة:',
    nextQuestion: 'السؤال التالي ›',
    choiceLetters: ['أ', 'ب', 'ج', 'د'],
  },
  theoryChat: {
    breadcrumb: 'نظرية البناء',
    title: 'أسئلة حرة',
    chatTitle: '💬 أسئلة حول نظرية البناء',
    chatSubtitle: 'إجابات مبنية على عروض المقرر + معرفة متخصصة',
    initialMessage: 'مرحبًا! أنا مساعد التعلم لمقرر نظرية البناء. اسألني أي سؤال حول المادة - سأجيب بناءً على العروض التقديمية والمعرفة المتخصصة.',
    thinking: 'جاري التفكير...',
    placeholder: 'اطرح سؤالًا حول نظرية البناء...',
    send: 'إرسال',
    errorRetry: 'حدث خطأ، حاول مرة أخرى.',
    errorConnection: 'حدث خطأ في الاتصال بالخادم.',
  },
  legislationChat: {
    breadcrumb: 'تشريعات البناء',
    title: 'أسئلة حول اللوائح',
    chatTitle: '📋 تشريعات البناء - أسئلة حول اللوائح',
    chatSubtitle: 'مبني على نِفو، الكنيست، وزارة الداخلية ووزارة الإنشاء | يتم ذكر المصادر في كل إجابة',
    initialMessage: 'مرحبًا! أنا مساعد التعلم لمقرر تشريعات البناء.\n\nيمكنني الإجابة على أسئلة حول لوائح التخطيط والبناء المحدثة، القوانين، الأنظمة والإجراءات. إجاباتي مبنية على مصادر رسمية (موقع نِفو، الكنيست، وزارة الداخلية).\n\nاسألني أي سؤال!',
    searching: 'جاري البحث في المصادر الرسمية...',
    suggestionsLabel: 'أسئلة مقترحة:',
    suggestions: [
      'ما هو قانون التخطيط والبناء؟',
      'ما هي متطلبات إمكانية الوصول لمبنى عام؟',
      'ما هي أنظمة السلامة من الحرائق للمباني؟',
      'ما هي قواعد خط البناء؟',
    ],
    placeholder: 'اسأل عن لوائح التخطيط والبناء...',
    send: 'إرسال',
    errorConnection: 'حدث خطأ في الاتصال بالخادم.',
  },
  legislationResources: {
    title: 'روابط لمصادر رسمية',
    items: [
      { name: 'قيادة الجبهة الداخلية - تعليمات وتوجيهات بناء الغرف المحمية', url: 'https://www.oref.org.il' },
      { name: 'معهد المواصفات الإسرائيلي', url: 'https://www.sii.org.il' },
      { name: 'وزارة الداخلية - إدارة التخطيط (تعليمات ولوائح التخطيط والبناء)', url: 'https://www.gov.il/he/departments/the_planning_administration' },
    ],
  },
  dictionary: {
    title: 'القاموس المعماري',
    subtitle: 'مصطلحات أساسية في نظرية البناء والهندسة المعمارية، بالعبرية والعربية',
    searchPlaceholder: 'البحث عن مصطلح...',
    allLetters: 'الكل',
    noResults: 'لم يتم العثور على مصطلحات مطابقة',
    termsCount: '{n} مصطلحًا',
  },
  footer: 'بوابة التعلم - هندسة العمارة وتصميم الديكور الداخلي | © جميع الحقوق محفوظة لبن شبت هرتسل | الكلية التكنولوجية بئر السبع',
}

export const dictionaries: Record<Lang, Dictionary> = { he, ar }

export function getDictionary(lang: Lang): Dictionary {
  return dictionaries[lang] || dictionaries.he
}

export function isValidLang(value: string | undefined): value is Lang {
  return value === 'he' || value === 'ar'
}
