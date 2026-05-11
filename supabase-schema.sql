-- ============================================================
-- SCHEMA: פורטל לימוד - אדריכלות ועיצוב פנים
-- הרץ את הקוד הזה ב-Supabase SQL Editor
-- ============================================================

-- פרופילי משתמשים
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'student')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- קבצי PDF
CREATE TABLE IF NOT EXISTS public.pdfs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course TEXT NOT NULL CHECK (course IN ('building_theory', 'building_legislation')),
  semester TEXT CHECK (semester IN ('A', 'B', 'both')),
  title TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  extracted_text TEXT DEFAULT '',
  file_size INTEGER DEFAULT 0,
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- היסטוריית שאלות (מניעת חזרה)
CREATE TABLE IF NOT EXISTS public.question_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  question_hash TEXT NOT NULL,
  course TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, question_hash)
);

-- מפגשי הכנה למבחן
CREATE TABLE IF NOT EXISTS public.exam_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course TEXT NOT NULL,
  semester TEXT,
  question_type TEXT DEFAULT 'mixed',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE
);

-- תשובות במבחן
CREATE TABLE IF NOT EXISTS public.exam_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.exam_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('open', 'multiple')),
  choices JSONB,
  correct_answer TEXT NOT NULL,
  student_answer TEXT,
  score INTEGER CHECK (score IN (0, 5, 10)),
  feedback TEXT,
  full_correct_answer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdfs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_answers ENABLE ROW LEVEL SECURITY;

-- user_profiles: כל אחד רואה את עצמו, admin רואה הכל
CREATE POLICY "users can see own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "admin can see all profiles" ON public.user_profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- pdfs: כולם יכולים לראות, רק admin יכול להוסיף/למחוק
CREATE POLICY "anyone can view pdfs" ON public.pdfs
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "admin can manage pdfs" ON public.pdfs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- question_history: רק של עצמו
CREATE POLICY "users manage own question history" ON public.question_history
  FOR ALL USING (auth.uid() = user_id);

-- exam_sessions: רק של עצמו, admin רואה הכל
CREATE POLICY "users manage own exam sessions" ON public.exam_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "admin can view all sessions" ON public.exam_sessions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- exam_answers: רק של עצמו, admin רואה הכל
CREATE POLICY "users manage own exam answers" ON public.exam_answers
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "admin can view all answers" ON public.exam_answers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- STORAGE
-- ============================================================
-- צור bucket בשם 'pdfs' ב-Supabase Storage עם ההגדרות:
-- Public: false
-- File size limit: 50MB
-- Allowed MIME types: application/pdf

-- ============================================================
-- INDEX לביצועים
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_pdfs_course ON public.pdfs(course);
CREATE INDEX IF NOT EXISTS idx_pdfs_semester ON public.pdfs(semester);
CREATE INDEX IF NOT EXISTS idx_question_history_user ON public.question_history(user_id, course);
CREATE INDEX IF NOT EXISTS idx_exam_answers_user ON public.exam_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_answers_session ON public.exam_answers(session_id);
