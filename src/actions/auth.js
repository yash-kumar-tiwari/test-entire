"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { signupSchema, loginSchema } from "@/validations/schemas";
import { sendWelcomeEmail } from "@/services/email";

function getFormData(prevState, formData) {
  if (!formData && prevState instanceof FormData) {
    return prevState;
  }
  return formData;
}

export async function signup(prevState, formData) {
  const fd = getFormData(prevState, formData);

  if (!fd) {
    return null;
  }

  const validated = signupSchema.safeParse(Object.fromEntries(fd));

  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  const { email, password, handle } = validated.data;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    const msg = authError.message.toLowerCase();

    if (msg.includes("already registered")) {
      return {
        error: {
          email: [
            "This email already has an account. Try logging in instead.",
          ],
        },
      };
    }

    if (msg.includes("rate limit") || msg.includes("security purposes")) {
      return {
        error: {
          _form: [
            "You can only sign up once per minute. Please wait 60 seconds and try again, or log in if you already have an account.",
          ],
        },
      };
    }

    return { error: { _form: [authError.message] } };
  }

  const userId = authData.user?.id;
  if (!userId) {
    return {
      error: { _form: ["Something went wrong. Please try again."] },
    };
  }

  const { error: profileError } = await supabase.rpc("create_profile", {
    user_id: userId,
    user_email: email,
    user_handle: handle,
  });

  if (profileError) {
    const msg = (profileError.message || "").toLowerCase();
    const code = profileError.code || "";

    if (msg.includes("duplicate") || code === "23505") {
      return { error: { handle: ["This handle is already taken"] } };
    }

    if (
      msg.includes("function") &&
      (msg.includes("not found") || msg.includes("does not exist"))
    ) {
      return {
        error: {
          _form: [
            "Database setup incomplete. Run 'supabase/schema.sql' in your Supabase SQL Editor to create the required function.",
          ],
        },
      };
    }

    return {
      error: {
        _form: [
          "Account created but profile setup failed. Try logging in — if that fails, contact support.",
        ],
      },
    };
  }

  try {
    await sendWelcomeEmail({ email, handle });
  } catch {
    // Email failure should not block signup
  }

  redirect("/dashboard");
}

export async function login(prevState, formData) {
  const fd = getFormData(prevState, formData);

  if (!fd) {
    return null;
  }

  const validated = loginSchema.safeParse(Object.fromEntries(fd));

  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  const { email, password } = validated.data;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    const msg = error.message.toLowerCase();

    if (msg.includes("rate limit") || msg.includes("security purposes")) {
      return {
        error: {
          _form: ["Too many login attempts. Please wait 60 seconds."],
        },
      };
    }

    if (
      msg.includes("invalid login") ||
      msg.includes("invalid credentials")
    ) {
      return { error: { _form: ["Invalid email or password"] } };
    }

    return { error: { _form: [error.message] } };
  }

  redirect("/dashboard");
}

export async function logout() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  await supabase.auth.signOut();
  redirect("/login");
}
