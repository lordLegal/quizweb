import { TwoFactorSetUpForm } from "./components";
import { getCurrentSession } from "@/lib/server/session";
import { encodeBase64 } from "@oslojs/encoding";
import { createTOTPKeyURI } from "@oslojs/otp";
import { redirect } from "next/navigation";
import { renderSVG } from "uqr";
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
  if (user.registered2FA && !session.twoFactorVerified) {
    return redirect("/2fa");
  }

  // Generiere einen neuen TOTP-Schlüssel
  const totpKey = new Uint8Array(20);
  crypto.getRandomValues(totpKey);
  const encodedTOTPKey = encodeBase64(totpKey);
  const keyURI = createTOTPKeyURI("Demo", user.username, totpKey, 30, 6);
  const qrcode = renderSVG(keyURI);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Set up two-factor authentication</h1>
      <div className="mb-8">
        <div className="w-48 h-48 mx-auto" dangerouslySetInnerHTML={{ __html: qrcode }} />
      </div>
      <div className="bg-white shadow-md rounded px-8 py-8 w-full max-w-md">
        <TwoFactorSetUpForm encodedTOTPKey={encodedTOTPKey} />
      </div>
    </div>
  );
}
