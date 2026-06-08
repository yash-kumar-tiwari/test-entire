"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { createServiceClient } from "@/lib/supabase";
import { signupSchema, loginSchema } from "@/validations/schemas";
import { sendWelcomeEmail } from "@/services/email";

export async function signup(formData) {
  const validated = signupSchema.safeParse(
    Object.fromEntries(formData)
  );

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
    if (authError.message.includes("already registered")) {
      return { error: { email: ["This email is already registered"] } };
    }
    return { error: { _form: [authError.message] } };
  }

  const userId = authData.user?.id;
  if (!userId) {
    return { error: { _form: ["Failed to create account"] } };
  }

  const serviceClient = createServiceClient();

  const { error: profileError } = await serviceClient.from("profiles").insert({
    id: userId,
    email,
    handle,
  });

  if (profileError) {
    if (profileError.code === "23505") {
      await serviceClient.auth.admin.deleteUser(userId);
      return { error: { handle: ["This handle is already taken"] } };
    }
    await serviceClient.auth.admin.deleteUser(userId);
    return { error: { _form: ["Failed to create profile"] } };
  }

  try {
    await sendWelcomeEmail({ email, handle });
  } catch {
    // Email failure should not block signup
  }

  redirect("/dashboard");
}

export async function login(formData) {
  const validated = loginSchema.safeParse(
    Object.fromEntries(formData)
  );

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
    return { error: { _form: ["Invalid email or password"] } };
  }

  redirect("/dashboard");
}

export async function logout() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  await supabase.auth.signOut();
  redirect("/login");
}
