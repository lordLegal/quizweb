"use server";

import { PasswordResetForm } from "./components";
import { validatePasswordResetSessionRequest } from "@/lib/server/password-reset";
import { globalGETRateLimit } from "@/lib/server/requests";
import { redirect } from "next/navigation";

export default async function Page() {
  if (!globalGETRateLimit()) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600">
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
  if (user.registered2FA && !session.twoFactorVerified) {
    return redirect("/reset-password/2fa");
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="bg-white shadow-md rounded px-8 py-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          Enter your new password
        </h1>
        <PasswordResetForm />
      </div>
    </div>
  );
}
