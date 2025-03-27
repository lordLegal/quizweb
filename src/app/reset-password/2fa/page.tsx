"use server";

import { PasswordResetRecoveryCodeForm, PasswordResetTOTPForm } from "./components";
import { validatePasswordResetSessionRequest } from "@/lib/server/password-reset";
import { globalGETRateLimit } from "@/lib/server/requests";
import { redirect } from "next/navigation";

export default async function Page() {
  if (!globalGETRateLimit()) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        Too many requests
      </div>
    );
  }
  
  const { session, user } = await validatePasswordResetSessionRequest();

  if (session === null) {
    return redirect("/forgot-password");
  }
  if (!session.emailVerified) {
    return redirect("/reset-password/verify-email");
  }
  if (!user.registered2FA) {
    return redirect("/reset-password");
  }
  if (session.twoFactorVerified) {
    return redirect("/reset-password");
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4">Two-Factor Authentication</h1>
      <p className="mb-8 text-gray-700">
        Enter the code from your authenticator app.
      </p>
      <PasswordResetTOTPForm />
      <section className="mt-12 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Or use your recovery code instead
        </h2>
        <PasswordResetRecoveryCodeForm />
      </section>
    </div>
  );
}
