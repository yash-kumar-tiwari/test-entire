import { NextResponse } from "next/server";

const SQL = `
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  handle TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_handle ON profiles(handle);

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

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Users can read their own bookmarks" ON bookmarks;
CREATE POLICY "Users can read their own bookmarks" ON bookmarks FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Anyone can read public bookmarks" ON bookmarks;
CREATE POLICY "Anyone can read public bookmarks" ON bookmarks FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Users can insert their own bookmarks" ON bookmarks;
CREATE POLICY "Users can insert their own bookmarks" ON bookmarks FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own bookmarks" ON bookmarks;
CREATE POLICY "Users can update their own bookmarks" ON bookmarks FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON bookmarks;
CREATE POLICY "Users can delete their own bookmarks" ON bookmarks FOR DELETE USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION create_profile(user_id UUID, user_email TEXT, user_handle TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO profiles (id, email, handle) VALUES (user_id, user_email, user_handle);
END;
$$;

GRANT EXECUTE ON FUNCTION create_profile TO anon;
GRANT EXECUTE ON FUNCTION create_profile TO authenticated;
`;

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return NextResponse.json(
      { error: "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local" },
      { status: 400 }
    );
  }

  const projectRef = url.replace("https://", "").replace(".supabase.co", "");

  try {
    const res = await fetch(`https://${projectRef}.supabase.co/sql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ query: SQL }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `SQL endpoint returned ${res.status}: ${text}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Database setup complete. Tables, RLS policies, and functions created." });
  } catch (err) {
    return NextResponse.json(
      { error: `Failed: ${err.message}` },
      { status: 500 }
    );
  }
}
