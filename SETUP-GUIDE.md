# מדריך הגדרה ופריסה - פורטל לימוד אדריכלות

## שלב 1: Supabase - מסד הנתונים

### 1.1 יצירת פרויקט
1. עבור לאתר **supabase.com** והתחבר עם חשבון Google
2. לחץ "New project"
3. שם הפרויקט: `architecture-learning`
4. בחר Region: `eu-central-1` (אירופה, הקרוב לישראל)
5. המתן ~2 דקות עד שהפרויקט נוצר

### 1.2 קבלת מפתחות API
1. בפרויקט, עבור לـ **Settings > API**
2. העתק:
   - `Project URL` ← NEXT_PUBLIC_SUPABASE_URL
   - `anon public` key ← NEXT_PUBLIC_SUPABASE_ANON_KEY
   - `service_role` key ← SUPABASE_SERVICE_ROLE_KEY (שמור בסוד!)

### 1.3 יצירת הטבלאות
1. בתפריט שמאל, לחץ **SQL Editor**
2. לחץ "New query"
3. הדבק את כל התוכן מהקובץ `supabase-schema.sql`
4. לחץ **Run** (או Ctrl+Enter)
5. וודא שאין שגיאות

### 1.4 יצירת Storage Bucket
1. עבור לـ **Storage** בתפריט
2. לחץ "New bucket"
3. שם: `pdfs`
4. Public bucket: **כבוי** (private)
5. לחץ "Save"

### 1.5 הגדרת Storage Policy
1. לחץ על bucket ה-`pdfs`
2. לחץ "Policies"
3. הוסף Policy ל-INSERT: "authenticated users can upload"
4. הוסף Policy ל-SELECT: "authenticated users can read"
5. הוסף Policy ל-DELETE: "only admins can delete"

---

## שלב 2: Anthropic API (Claude)

1. עבור לـ **console.anthropic.com**
2. הירשם/התחבר
3. עבור לـ **API Keys**
4. לחץ "Create Key"
5. שמור את המפתח → ANTHROPIC_API_KEY
6. וודא שיש לך **Credits** (הכנס כרטיס אשראי)

**עלויות משוערות:**
- כל שאלה/תשובה: ~$0.003 (0.3 סנט)
- 100 שאלות ביום = ~$0.30/יום = ~$9/חודש

---

## שלב 3: Tavily Search API (לתחיקת הבנייה)

1. עבור לـ **tavily.com**
2. לחץ "Start for Free"
3. הירשם עם אימייל
4. עבור לـ Dashboard > API Keys
5. העתק את המפתח → TAVILY_API_KEY

**תוכנית חינמית:** 1,000 חיפושים לחודש (מספיק לשימוש כיתתי)

---

## שלב 4: הגדרת .env.local

פתח את הקובץ `.env.local` בתיקיית הפרויקט ומלא:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
ANTHROPIC_API_KEY=sk-ant-...
TAVILY_API_KEY=tvly-...
ADMIN_EMAIL=your-email@example.com   ← המייל שלך!
```

**חשוב:** החלף `your-email@example.com` במייל שלך - זה יגדיר אותך כמנהל אוטומטית.

---

## שלב 5: פריסה ל-Vercel

### 5.1 הכנת GitHub Repository
1. פתח **Git Bash** בתיקיית הפרויקט
2. הרץ:
```bash
git init
git add .
git commit -m "Initial commit"
```
3. עבור לـ **github.com** וצור Repository חדש (ריק)
4. הרץ את הפקודות שGitHub מראה (git remote add + git push)

### 5.2 פריסה ב-Vercel
1. עבור לـ **vercel.com** והתחבר עם GitHub
2. לחץ "New Project"
3. בחר את ה-Repository שיצרת
4. לחץ "Deploy"

### 5.3 הגדרת Environment Variables ב-Vercel
1. לאחר הפריסה, עבור לـ **Settings > Environment Variables**
2. הוסף את כל המשתנים מ-.env.local:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ANTHROPIC_API_KEY`
   - `TAVILY_API_KEY`
   - `ADMIN_EMAIL`
3. לחץ **Redeploy** לאחר הוספת המשתנים

---

## שלב 6: הפעלה ראשונה

### 6.1 הרשמה כמנהל
1. עבור לכתובת האתר שקיבלת מ-Vercel
2. לחץ "הרשמה"
3. הכנס **את המייל שהגדרת ב-ADMIN_EMAIL**
4. הכנס שם וסיסמה
5. המערכת תזהה אותך כמנהל אוטומטית

### 6.2 העלאת מצגות ראשונות
1. לאחר הכניסה, עבור לـ "ניהול > העלאת מצגות"
2. העלה קבצי PDF של המצגות
3. בחר קורס (תורת הבנייה) וסמסטר
4. המערכת תחלץ טקסט אוטומטית

### 6.3 שיתוף עם הסטודנטים
1. שלח לסטודנטים את כתובת האתר
2. הם ייכנסו לדף ההרשמה
3. יירשמו עם המייל והסיסמה שלהם
4. יתחברו ויתחילו לשאול שאלות

---

## הרצה מקומית (לפיתוח)

```bash
cd architecture-learning-app
npm run dev
```

פתח http://localhost:3000

---

## פתרון בעיות

**"Supabase connection failed"**
- בדוק שה-URL וה-ANON_KEY נכונים ב-.env.local
- בדוק שהפרויקט ב-Supabase פעיל

**"Storage upload failed"**
- בדוק שהبאكت `pdfs` נוצר ב-Supabase Storage
- בדוק שה-Policies מוגדרות

**"Question generation failed"**
- בדוק את ה-ANTHROPIC_API_KEY
- בדוק שיש Credits בחשבון Anthropic

**הסטודנט לא מופיע כמנהל**
- בדוק שהמייל ב-ADMIN_EMAIL זהה למייל ההרשמה
- נסה למחוק ולהירשם שוב

---

## מבנה האתר

```
/                     ← דף נחיתה
/register             ← הרשמה
/login                ← כניסה
/dashboard            ← דשבורד סטודנט
/building-theory      ← חומרי תורת הבנייה
/building-theory/chat ← שאלות חופשיות
/building-theory/exam ← הכנה למבחן
/building-legislation/chat ← שאלות תחיקה
/admin                ← ממשק מנהל
/admin/upload         ← העלאת מצגות
/admin/students       ← רשימת סטודנטים
/admin/statistics     ← סטטיסטיקות
```
