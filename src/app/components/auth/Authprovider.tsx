// components/auth/AuthProvider.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";

type AuthProviderProps = {
  children: React.ReactNode;
  session: Session | null;
};

/**
 * Auth Provider Komponente
 * Stellt die NextAuth Session für die gesamte Anwendung bereit
 */
export default function AuthProvider({ children, session }: AuthProviderProps) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}