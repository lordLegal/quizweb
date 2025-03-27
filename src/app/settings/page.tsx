import Link from "next/link";
import { RecoveryCodeSection, UpdateEmailForm, UpdatePasswordForm } from "./components";
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
  if (user.registered2FA && !session.twoFactorVerified) {
    return redirect("/2fa");
  }
  let recoveryCode: string | null = null;
  if (user.registered2FA) {
    recoveryCode = await getUserRecoverCode(user.id);
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-semibold text-blue-600 hover:underline">
          Home
        </Link>
        <Link href="/settings" className="text-xl font-semibold text-blue-600 hover:underline">
          Settings
        </Link>
      </header>
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        <section className="mb-8 p-6 bg-white shadow rounded">
          <h2 className="text-2xl font-semibold mb-4">Update email</h2>
          <p className="mb-4 text-gray-700">
            Your email: <span className="font-medium">{user.email}</span>
          </p>
          <UpdateEmailForm />
        </section>
        <section className="mb-8 p-6 bg-white shadow rounded">
          <h2 className="text-2xl font-semibold mb-4">Update password</h2>
          <UpdatePasswordForm />
        </section>
        {user.registered2FA && (
          <section className="mb-8 p-6 bg-white shadow rounded">
            <h2 className="text-2xl font-semibold mb-4">Update two-factor authentication</h2>
            <Link href="/2fa/setup" className="text-blue-600 hover:underline font-semibold">
              Update
            </Link>
          </section>
        )}
        {recoveryCode !== null && (
          <section className="p-6 bg-white shadow rounded">
            <RecoveryCodeSection recoveryCode={recoveryCode} />
          </section>
        )}
      </main>
    </div>
  );
}
