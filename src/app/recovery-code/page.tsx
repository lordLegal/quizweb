import Link from "next/link";

import { getCurrentSession } from "@/lib/server/session";
import { getUserRecoverCode } from "@/lib/server/user";
import { redirect } from "next/navigation";
import { globalGETRateLimit } from "@/lib/server/requests";

export default async function Page() {
	if (!await globalGETRateLimit()) {
		return "Too many requests";
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
		<>
			<h1>Recovery code</h1>
			<p>Your recovery code is: {recoveryCode}</p>
			<p>You can use this recovery code if you lose access to your second factors.</p>
			<Link href="/">Next</Link>
		</>
	);
}
