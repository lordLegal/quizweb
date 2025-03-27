"use server";
import { PasswordResetEmailVerificationForm } from "./components";
import { validatePasswordResetSessionRequest } from "@/lib/server/password-reset";
import { globalGETRateLimit } from "@/lib/server/requests";
import { redirect } from "next/navigation";

export default async function Page() {
  if (!globalGETRateLimit()) {
    return (
      <div className="flex items-center justify-center h-screen text-red-600">
        Too many requests
      </div>
    );
  }
  const { session } = await validatePasswordResetSessionRequest();
  if (session === null) {
    return redirect("/forgot-password");
  }
  if (session.emailVerified) {
    if (!session.twoFactorVerified) {
      return redirect("/reset-password/2fa");
    }
    return redirect("/reset-password");
  }
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Verify your email address</h1>
        <p className="mb-6 text-center text-gray-700">
          We sent an 8-digit code to {session.email}.
        </p>
        <PasswordResetEmailVerificationForm />
      </div>
    </div>
  );
}
