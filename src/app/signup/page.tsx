"use server";
import { SignUpForm } from "./components";
import Link from "next/link";
import { getCurrentSession } from "@/lib/server/session";
import { redirect } from "next/navigation";
import { globalGETRateLimit } from "@/lib/server/requests";

export default async function Page() {
  if (!await globalGETRateLimit()) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600">
        Too many requests
      </div>
    );
  }
  const { session, user } = await getCurrentSession();
  if (session !== null) {
    if (!user.emailVerified) {
      return redirect("/verify-email");
    }
    if (!user.registered2FA) {
      return redirect("/2fa/setup");
    }
    if (!session.twoFactorVerified) {
      return redirect("/2fa");
    }
    return redirect("/");
  }
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white shadow-md rounded px-8 py-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-4">Create an account</h1>
        <p className="text-center text-gray-600 mb-6">
          Your username must be at least 3 characters long and your password at least 8 characters long.
        </p>
        <SignUpForm />
        <div className="mt-4 text-center">
          <Link href="/login" className="text-blue-600 hover:underline font-semibold">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
