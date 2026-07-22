"use server";

import { redirect } from "next/navigation";
import { verifyAdminPassword } from "@/lib/auth/password";
import {
  clearAdminSessionCookie,
  setAdminSessionCookie,
} from "@/lib/auth/session";

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");

  if (!password) {
    return { error: "Password is required" };
  }

  try {
    if (!verifyAdminPassword(password)) {
      return { error: "Incorrect password" };
    }
    await setAdminSessionCookie();
  } catch (error) {
    console.error("loginAction failed", error);
    return { error: "Login is not configured. Check server environment variables." };
  }

  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await clearAdminSessionCookie();
  redirect("/admin/login");
}
