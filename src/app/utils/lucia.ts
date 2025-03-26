// lib/lucia.ts
import { lucia } from "lucia";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { prisma } from "./db";
import { cookies } from "next/headers";
import { cache } from "react";
import type { Session, User } from "lucia";

// Typ-Definitionen für Lucia
declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

// Benutzerattribute, die in der Datenbank gespeichert werden
interface DatabaseUserAttributes {
  name: string | null;
  email: string;
  emailVerified: Date | null;
  image: string | null;
}

// Erstelle die Lucia-Auth-Instanz
export const auth = lucia({
  env: process.env.NODE_ENV === "production" ? "PROD" : "DEV",
  middleware: {
    // Verbinde mit Next.js - stellt sicher, dass Cookies richtig gesetzt werden
    async sessionCookie() {
      const cookieStore = cookies();
      return cookieStore.get("session")?.value ?? null;
    }
  },
  adapter: prismaAdapter(prisma),
  
  // Für großartige Fehlermeldungen
  sessionCookie: {
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === "production"
    }
  },
  
  // Kann angepasst werden, insbesondere getUserAttributes()
  getUserAttributes: (databaseUser) => {
    return {
      name: databaseUser.name,
      email: databaseUser.email,
      emailVerified: databaseUser.emailVerified,
      image: databaseUser.image
    };
  }
});

// Typen für Sitzungs-Validierungsergebnisse
export interface SessionValidationResult {
  user: User | null;
  session: Session | null;
}

// Cookies-Hilfsfunktionen
export async function setSessionCookie(token: string, expiresAt: Date): Promise<void> {
  const cookieStore = cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/"
  });
}

export async function deleteSessionCookie(): Promise<void> {
  const cookieStore = cookies();
  cookieStore.set("session", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/"
  });
}

// Cache-Funktionen für die Sitzungsvalidierung
export const validateSession = cache(
  async (): Promise<SessionValidationResult> => {
    const sessionId = cookies().get("session")?.value ?? null;
    
    if (!sessionId) {
      return {
        user: null,
        session: null
      };
    }
    
    const { session, user } = await auth.validateSession(sessionId);
    
    try {
      if (session && session.fresh) {
        const sessionCookie = auth.createSessionCookie(session.id);
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
      }
      
      if (!session) {
        const sessionCookie = auth.createBlankSessionCookie();
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
      }
    } catch {
      // Fehlerbehandlung
    }
    
    return {
      user,
      session
    };
  }
);

// Für Benutzersitzungen in App Router-Komponenten
export async function getPageSession() {
  return await validateSession();
}