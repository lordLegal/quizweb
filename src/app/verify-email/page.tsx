"use server";
import Link from "next/link";
import { EmailVerificationForm, ResendEmailVerificationCodeForm } from "./components";
import { getCurrentSession } from "@/lib/server/session";
import { redirect } from "next/navigation";
import { getUserEmailVerificationRequestFromRequest } from "@/lib/server/email-verfication";
import { globalGETRateLimit } from "@/lib/server/requests";

export default async function Page() {
  if (!await globalGETRateLimit()) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600">
        Too many requests
      </div>
    );
  }
  const { user } = await getCurrentSession();
  if (user === null) {
    return redirect("/login");
  }

  // Falls keine bestehende Verifikation vorliegt, aber die E-Mail schon verifiziert ist, leite zur Home-Seite weiter.
  const verificationRequest = await getUserEmailVerificationRequestFromRequest();
  if (verificationRequest === null && user.emailVerified) {
    return redirect("/");
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white shadow-md rounded px-8 py-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-4">
          Verify your email address
        </h1>
        <p className="text-center text-gray-600 mb-6">
          We sent an 8-digit code to {verificationRequest?.email ?? user.email}.
        </p>
        <EmailVerificationForm />
        <div className="mt-6">
          <ResendEmailVerificationCodeForm />
        </div>
        <div className="mt-8 text-center">
          <Link href="/settings" className="text-blue-600 hover:underline font-semibold">
            Change your email
          </Link>
        </div>
      </div>
    </div>
  );
}
