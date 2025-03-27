// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
//import Navbar from "./components/navbar";
import { getCurrentSession } from "@/lib/server/session";
import { getUserFromEmail } from "@/lib/server/user";
import Navbar from "./components/navbar";
import type { User } from "@/lib/server/user";

export const metadata: Metadata = {
  title: "Spieleplattform",
  description: "Eine moderne Spieleplattform mit Next.js 15",
};


export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const { user } = await getCurrentSession();
    
    let isLoading = true;
    let user_Real: User | null = null;
    if (user !== null) {
      user_Real = await getUserFromEmail(user.email) || null;
    }
      isLoading = false;
    
  return (
    <html lang="de">
      <body className={inter.className}>
        <Navbar user={user_Real} isLoading={isLoading} />
        <main className="pt-10">
          {children}
        </main>
      </body>
    </html>
  );
}