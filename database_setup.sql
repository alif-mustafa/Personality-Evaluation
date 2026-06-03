-- 1. ENSURE ALL TABLES EXIST (Created in dependency order)
CREATE TABLE IF NOT EXISTS public.profiles (
  id            uuid references auth.users(id) on delete cascade primary key,
  email         text not null,
  display_name  text,
  avatar_url    text,
  created_at    timestamp with time zone default timezone('utc'::text, now()) not null
);

CREATE TABLE IF NOT EXISTS public.couple_invites (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  inviter_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  partner_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  inviter_email text,
  partner_email text,
  invite_code text UNIQUE NOT NULL,
  assessment_type text,
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.couples (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_1_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_2_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_1_id, user_2_id)
);

-- 2. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couple_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couples ENABLE ROW LEVEL SECURITY;


-- 3. DROP EXISTING POLICIES/TRIGGERS TO AVOID CONFLICTS 
-- (This will only drop them if they exist, so it's safe for new databases)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage their own invites" ON public.couple_invites;
DROP POLICY IF EXISTS "Users can view their own couple record" ON public.couples;
DROP POLICY IF EXISTS "Users can insert their own couple record" ON public.couples;
DROP POLICY IF EXISTS "Users can update their own couple record" ON public.couples;


-- 4. RE-CREATE POLICIES (Security Rules)

-- Profile Rules
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

-- Invite Rules
CREATE POLICY "Users can manage their own invites" ON public.couple_invites
  FOR ALL USING (auth.uid() = inviter_id OR auth.uid() = partner_id);

-- Couple Record Rules
CREATE POLICY "Users can view their own couple record" ON public.couples FOR SELECT 
  USING (auth.uid() = user_1_id OR auth.uid() = user_2_id);
CREATE POLICY "Users can insert their own couple record" ON public.couples FOR INSERT 
  WITH CHECK (auth.uid() = user_1_id OR auth.uid() = user_2_id);
CREATE POLICY "Users can update their own couple record" ON public.couples FOR UPDATE 
  USING (auth.uid() = user_1_id OR auth.uid() = user_2_id);


-- 5. RE-CREATE TRIGGERS (Auto-create a profile when someone signs up)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ──────────────────────────────────────────────────────────────────────
-- 6. USER ASSESSMENTS TABLE (run this block in Supabase SQL Editor)
-- ──────────────────────────────────────────────────────────────────────

-- Add age / gender to profiles if not already present
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS age int;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender text;

-- Stores each user's completed assessment results so partners can read them
CREATE TABLE IF NOT EXISTS public.user_assessments (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assessment_type text NOT NULL,
  scores          jsonb NOT NULL,
  completed_at    timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, assessment_type)
);

ALTER TABLE public.user_assessments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts on re-run
DROP POLICY IF EXISTS "Users can upsert own assessments" ON public.user_assessments;
DROP POLICY IF EXISTS "Partners can read each other assessments" ON public.user_assessments;

-- A user can read and write their own results
CREATE POLICY "Users can upsert own assessments" ON public.user_assessments
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- A linked partner can READ your results (needed for heatmap / status panel)
CREATE POLICY "Partners can read each other assessments" ON public.user_assessments
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.couples
      WHERE (user_1_id = auth.uid() AND user_2_id = user_assessments.user_id)
         OR (user_2_id = auth.uid() AND user_1_id = user_assessments.user_id)
    )
  );

-- Also allow the couple_invites table to be read by the partner_email owner
-- (needed for checkInvites() to work for newly-signed-up partners)
DROP POLICY IF EXISTS "Partners can view invites by email" ON public.couple_invites;
CREATE POLICY "Partners can view invites by email" ON public.couple_invites
  FOR SELECT USING (
    auth.uid() = inviter_id
    OR partner_email = (SELECT email FROM public.profiles WHERE id = auth.uid())
  );

-- ──────────────────────────────────────────────────────────────────────
-- 7. COUPLE INVITE ENHANCEMENTS
-- ──────────────────────────────────────────────────────────────────────

-- Track when the partner accepted the invite
ALTER TABLE public.couple_invites ADD COLUMN IF NOT EXISTS accepted_at timestamp with time zone;

-- Allow the invited partner (matched by email) to update the invite to 'accepted'
DROP POLICY IF EXISTS "Partners can accept invites by email" ON public.couple_invites;
CREATE POLICY "Partners can accept invites by email" ON public.couple_invites
  FOR UPDATE USING (
    partner_email = (SELECT email FROM public.profiles WHERE id = auth.uid())
  );
