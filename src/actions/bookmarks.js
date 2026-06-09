"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase";
import { bookmarkSchema } from "@/validations/schemas";

async function ensureProfile(supabase, user) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (profile) return true;

  // Profile missing — create one from email
  const base = user.email.split("@")[0].replace(/[^a-z0-9_]/gi, "_").toLowerCase().slice(0, 20);
  const suffix = Math.random().toString(36).slice(2, 6);
  const handle = `${base}_${suffix}`;

  const { error } = await supabase.rpc("create_profile", {
    user_id: user.id,
    user_email: user.email,
    user_handle: handle,
  });

  if (error) {
    console.error("Failed to auto-create profile:", error);
    return false;
  }

  return true;
}

export async function createBookmark(formData) {
  const validated = bookmarkSchema.safeParse({
    title: formData.get("title"),
    url: formData.get("url"),
    is_public: formData.get("is_public") === "true",
  });

  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  const { title, url, is_public } = validated.data;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: { _form: ["Not authenticated"] } };
  }

  // Try insert — if profile is missing, create it and retry
  const { error } = await supabase.from("bookmarks").insert({
    user_id: user.id,
    title,
    url,
    is_public,
  });

  if (error) {
    const msg = error.message?.toLowerCase() || "";

    if (msg.includes("schema cache") || msg.includes("does not exist") || msg.includes("relation")) {
      return {
        error: {
          _form: [
            "Database tables are missing. Run 'supabase/schema.sql' in your Supabase SQL Editor.",
          ],
        },
      };
    }

    // Foreign key violation → profile missing → try to fix
    if (
      msg.includes("foreign key") ||
      msg.includes("violates foreign") ||
      error.code === "23503"
    ) {
      const created = await ensureProfile(supabase, user);
      if (!created) {
        return {
          error: {
            _form: [
              "Your account is missing a profile. Try signing up again with a different email.",
            ],
          },
        };
      }

      const { error: retryError } = await supabase
        .from("bookmarks")
        .insert({ user_id: user.id, title, url, is_public });

      if (retryError) {
        return { error: { _form: [retryError.message] } };
      }
    } else {
      return { error: { _form: [error.message] } };
    }
  }

  revalidatePath("/dashboard");
}

export async function updateBookmark(formData) {
  const id = formData.get("id");
  if (!id) {
    return { error: { _form: ["Bookmark ID is required"] } };
  }

  const validated = bookmarkSchema.safeParse({
    title: formData.get("title"),
    url: formData.get("url"),
    is_public: formData.get("is_public") === "true",
  });

  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  const { title, url, is_public } = validated.data;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: { _form: ["Not authenticated"] } };
  }

  const { error } = await supabase
    .from("bookmarks")
    .update({ title, url, is_public, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    const msg = error.message?.toLowerCase() || "";
    if (msg.includes("schema cache") || msg.includes("does not exist") || msg.includes("relation")) {
      return { error: { _form: ["Database tables are missing. Run 'supabase/schema.sql' in your Supabase SQL Editor."] } };
    }
    return { error: { _form: [error.message] } };
  }

  revalidatePath("/dashboard");
}

export async function deleteBookmark(formData) {
  const id = formData.get("id");
  if (!id) {
    return { error: { _form: ["Bookmark ID is required"] } };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: { _form: ["Not authenticated"] } };
  }

  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    const msg = error.message?.toLowerCase() || "";
    if (msg.includes("schema cache") || msg.includes("does not exist") || msg.includes("relation")) {
      return { error: { _form: ["Database tables are missing. Run 'supabase/schema.sql' in your Supabase SQL Editor."] } };
    }
    return { error: { _form: [error.message] } };
  }

  revalidatePath("/dashboard");
}
