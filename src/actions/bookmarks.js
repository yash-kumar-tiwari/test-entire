"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase";
import { bookmarkSchema } from "@/validations/schemas";

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

  const { error } = await supabase.from("bookmarks").insert({
    user_id: user.id,
    title,
    url,
    is_public,
  });

  if (error) {
    return { error: { _form: ["Failed to create bookmark"] } };
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
    return { error: { _form: ["Failed to update bookmark"] } };
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
    return { error: { _form: ["Failed to delete bookmark"] } };
  }

  revalidatePath("/dashboard");
}
