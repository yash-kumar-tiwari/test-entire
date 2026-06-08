import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  handle: z
    .string()
    .min(2, "Handle must be at least 2 characters")
    .max(30, "Handle must be at most 30 characters")
    .regex(
      /^[a-z0-9_]+$/,
      "Handle can only contain lowercase letters, numbers, and underscores"
    ),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const bookmarkSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  url: z
    .string()
    .min(1, "URL is required")
    .regex(
      /^https?:\/\/.+/,
      "URL must start with http:// or https://"
    ),
  is_public: z.boolean(),
});
