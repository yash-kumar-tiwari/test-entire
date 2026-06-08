-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  handle TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_handle ON profiles(handle);

-- Bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id_public ON bookmarks(user_id, is_public);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Profiles policies
-- Anyone can read public profile info (by handle lookup)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT
  USING (true);

-- Users can insert their own profile
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT
  WITH CHECK (id = auth.uid());

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Bookmarks policies
-- Users can read their own bookmarks
DROP POLICY IF EXISTS "Users can read their own bookmarks" ON bookmarks;
CREATE POLICY "Users can read their own bookmarks" ON bookmarks
  FOR SELECT
  USING (user_id = auth.uid());

-- Anyone can read public bookmarks
DROP POLICY IF EXISTS "Anyone can read public bookmarks" ON bookmarks;
CREATE POLICY "Anyone can read public bookmarks" ON bookmarks
  FOR SELECT
  USING (is_public = true);

-- Users can insert their own bookmarks
DROP POLICY IF EXISTS "Users can insert their own bookmarks" ON bookmarks;
CREATE POLICY "Users can insert their own bookmarks" ON bookmarks
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own bookmarks
DROP POLICY IF EXISTS "Users can update their own bookmarks" ON bookmarks;
CREATE POLICY "Users can update their own bookmarks" ON bookmarks
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own bookmarks
DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON bookmarks;
CREATE POLICY "Users can delete their own bookmarks" ON bookmarks
  FOR DELETE
  USING (user_id = auth.uid());
