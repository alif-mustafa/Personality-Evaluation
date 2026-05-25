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
