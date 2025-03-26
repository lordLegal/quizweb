// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getServerSession } from "next-auth";
import { authOptions } from "./utils/authoptions";
import AuthProvider from "./components/auth/Authprovider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Spieleplattform",
  description: "Eine moderne Spieleplattform mit Next.js 15",
};


export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Session-Daten vorausladen - beeinflusst PPR statischen Teil
  const session = await getServerSession(authOptions);

  return (
    <html lang="de">
      <body className={inter.className}>
        <AuthProvider session={session}>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}