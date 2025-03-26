import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 Tage
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
    newUser: "/auth/register",
  },
  providers: [
    // Nur Credentials-Provider für Benutzername/Passwort-Login
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Benutzername", type: "text" },
        password: { label: "Passwort", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials.password) {
          throw new Error("Benutzername und Passwort erforderlich");
        }

        // Benutzer nach Benutzername suchen
        const user = await prisma.user.findFirst({
          where: {
            name: credentials.username
          },
          include: {
            roles: {
              include: {
                role: true,
              },
            },
          },
        });

        if (!user || !user.password) {
          throw new Error("Ungültiger Benutzername oder Passwort");
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!passwordMatch) {
          throw new Error("Ungültiger Benutzername oder Passwort");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          roles: user.roles.map((userRole) => userRole.role.name),
        };
      },
    }),
  ],
  callbacks: {
    // Anpassung der Session-Informationen
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.roles = token.roles as string[];
      }

      return session;
    },
    // Anpassung des JWT-Tokens
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.roles = user.roles;
      }

      // Aktuelle Benutzerrollen abrufen, falls nicht bereits im Token
      if (token.id && !token.roles) {
        const userWithRoles = await prisma.user.findUnique({
          where: {
            id: token.id as string,
          },
          include: {
            roles: {
              include: {
                role: true,
              },
            },
          },
        });

        if (userWithRoles) {
          token.roles = userWithRoles.roles.map((userRole) => userRole.role.name);
        }
      }

      return token;
    },
  },
  events: {
    // PlayerProfile automatisch erstellen, wenn ein neuer Benutzer registriert wird
    async createUser({ user }) {
      await prisma.playerProfile.create({
        data: {
          userId: user.id,
          nickname: user.name || `Player${Math.floor(Math.random() * 10000)}`,
          level: 1,
          experience: 0,
        },
      });

      // Standardrolle "player" zuweisen
      const playerRole = await prisma.role.findUnique({
        where: {
          name: "player",
        },
      });

      if (playerRole) {
        await prisma.userRole.create({
          data: {
            userId: user.id,
            roleId: playerRole.id,
          },
        });
      }
    },
    // Bei jedem Login die lastLogin-Zeit im PlayerProfile aktualisieren
    async signIn({ user }) {
      // Sicherstellen, dass das PlayerProfile existiert
      const playerProfile = await prisma.playerProfile.findUnique({
        where: {
          userId: user.id,
        },
      });

      if (playerProfile) {
        await prisma.playerProfile.update({
          where: {
            userId: user.id,
          },
          data: {
            lastLogin: new Date(),
          },
        });
      } else {
        // Falls es noch kein Profil gibt, eines erstellen
        await prisma.playerProfile.create({
          data: {
            userId: user.id,
            nickname: user.name || `Player${Math.floor(Math.random() * 10000)}`,
            level: 1,
            experience: 0,
            lastLogin: new Date(),
          },
        });
      }
    },
  },
  // Sicherheitseinstellungen
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

// Registrierungsfunktion (außerhalb von NextAuth, für manuellen Aufruf)
export async function registerUser(username: string, email: string, password: string) {
  // Prüfen, ob Benutzer bereits existiert
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { name: username },
        { email }
      ]
    }
  });

  if (existingUser) {
    throw new Error("Benutzername oder E-Mail bereits registriert");
  }

  // Passwort hashen
  const hashedPassword = await bcrypt.hash(password, 10);

  // Benutzer erstellen
  const user = await prisma.user.create({
    data: {
      name: username,
      email,
      password: hashedPassword,
    },
  });

  // Standardrolle "player" zuweisen
  const playerRole = await prisma.role.findUnique({
    where: {
      name: "player",
    },
  });

  if (playerRole) {
    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: playerRole.id,
      },
    });
  }

  // PlayerProfile erstellen
  await prisma.playerProfile.create({
    data: {
      userId: user.id,
      nickname: username,
      level: 1,
      experience: 0,
    },
  });

  return user;
}

// Erweiterte Session-Typen für TypeScript
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      roles: string[];
    };
  }

  interface User {
    id: string;
    name?: string | null;
    password?: string;
    roles?: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name?: string | null;
    roles?: string[];
  }
}