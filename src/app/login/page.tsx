import { LoginForm } from "./components";
import Link from "next/link";
import { getCurrentSession } from "@/lib/server/session";
import { redirect } from "next/navigation";
import { globalGETRateLimit } from "@/lib/server/requests";

export default async function Page() {
  if (!globalGETRateLimit()) {
    return <div className="flex h-screen items-center justify-center text-red-600">Too many requests</div>;
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md bg-white p-8 rounded shadow">
        <h1 className="text-3xl font-bold text-center mb-6">Sign In</h1>
        <LoginForm />
        <div className="mt-6 flex flex-col items-center space-y-2">
          <Link href="/signup" className="text-blue-600 hover:underline">
            Create an account
          </Link>
          <Link href="/forgot-password" className="text-blue-600 hover:underline">
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
}
