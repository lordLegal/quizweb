import Link from "next/link";
import { getCurrentSession } from "@/lib/server/session";
import { getUserRecoverCode } from "@/lib/server/user";
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
  if (!session.twoFactorVerified) {
    return redirect("/2fa");
  }
  
  const recoveryCode = await getUserRecoverCode(user.id);
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-6">Recovery Code</h1>
        <p className="text-lg text-gray-800 mb-4 text-center">
          Your recovery code is:
        </p>
        <div className="bg-gray-100 border border-gray-300 rounded p-4 text-center text-xl font-mono mb-6">
          {recoveryCode}
        </div>
        <p className="text-sm text-gray-600 mb-6 text-center">
          You can use this recovery code if you lose access to your second factors.
        </p>
        <div className="text-center">
          <Link href="/" className="text-blue-600 hover:underline font-semibold">
            Next
          </Link>
        </div>
      </div>
    </div>
  );
}
