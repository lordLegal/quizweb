import Link from "next/link";
import { TwoFactorVerificationForm } from "./components";
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
  
  if (session === null) {
    return redirect("/login");
  }
  if (!user.emailVerified) {
    return redirect("/verify-email");
  }
  if (!user.registered2FA) {
    return redirect("/2fa/setup");
  }
  if (session.twoFactorVerified) {
    return redirect("/");
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white shadow-md rounded px-8 py-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-4">Two-factor authentication</h1>
        <p className="text-center text-gray-600 mb-6">
          Enter the code from your authenticator app.
        </p>
        <TwoFactorVerificationForm />
        <div className="text-center mt-4">
          <Link href="/2fa/reset" className="text-blue-600 hover:underline font-semibold">
            Use recovery code
          </Link>
        </div>
      </div>
    </div>
  );
}
