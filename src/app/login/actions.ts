"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
  passwordMatches,
} from "@/lib/auth";

export async function login(formData: FormData) {
  if (!process.env.APP_PASSWORD || !process.env.SESSION_SECRET) {
    redirect("/login?error=config");
  }

  const password = String(formData.get("password") ?? "");
  if (!passwordMatches(password)) {
    // Cheap brute-force friction on the only unauthenticated endpoint
    await new Promise((resolve) => setTimeout(resolve, 800));
    redirect("/login?error=wrong");
  }

  const token = await createSessionToken();
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  redirect("/");
}
