"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { signIn } from "@/auth";
import { signOut } from "@/auth";
import { signInFormSchema } from "../validators";

export async function signInWithCredentials(
  _prevState: unknown,
  formData: FormData,
) {
  try {
    const user = signInFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
      callbackUrl: formData.get("callbackUrl"),
    });

    await signIn("credentials", {
      ...user,
      redirect: true,
    });
    return { success: true, message: "Sign in successfully" };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    return { success: false, message: "Invalid email or password" };
  }
}

export async function signOutUser() {
  return await signOut();
}
