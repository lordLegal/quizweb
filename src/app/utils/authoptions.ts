// lib/auth.ts
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { comparePassword, hashPassword } from "./bycrypt";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
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
    email?: string | null;
    image?: string | null;
    password?: string;
    roles?: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name?: string | null;
    email?: string | null;
    picture?: string | null;
    roles?: string[];
  }
}

// Erweiterte Typdefinitionen für User mit Rollen
type UserWithRoles = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  password: string | null;
  roles: Array<{
    role: {
      id: string;
      name: string;
    };
  }>;
};

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

        try {
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
          }) as UserWithRoles | null;

          if (!user || !user.password) {
            throw new Error("Ungültiger Benutzername oder Passwort");
          }

          // Passwort über API prüfen
          const passwordMatch = await comparePassword(
            credentials.password,
            user.password
          );

          if (!passwordMatch) {
            throw new Error("Ungültiger Benutzername oder Passwort");
          }

          // Erfolgreiche Authentifizierung
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            roles: user.roles.map((userRole) => userRole.role.name),
          };
        } catch (error) {
          console.error("Authentifizierungsfehler:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string | null;
        session.user.email = token.email as string | null;
        session.user.image = token.picture as string | null;
        session.user.roles = (token.roles as string[]) || [];
      }

      return session;
    },
    
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
        token.roles = user.roles || [];
      }

      // Aktuelle Benutzerrollen abrufen, falls nicht bereits im Token
      if (token.id && !token.roles) {
        try {
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
          }) as UserWithRoles | null;

          if (userWithRoles) {
            token.roles = userWithRoles.roles.map((userRole) => userRole.role.name);
          }
        } catch (error) {
          console.error("Fehler beim Abrufen der Benutzerrollen:", error);
        }
      }

      return token;
    },
  },
  events: {
    async createUser(message) {
      try {
        // PlayerProfile erstellen
        await prisma.playerProfile.create({
          data: {
            userId: message.user.id,
            nickname: message.user.name || `Player${Math.floor(Math.random() * 10000)}`,
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
              userId: message.user.id,
              roleId: playerRole.id,
            },
          });
        }
      } catch (error) {
        console.error("Fehler beim Erstellen des Spielerprofils:", error);
      }
    },
    
    async signIn(message) {
      try {
        // Sicherstellen, dass das PlayerProfile existiert
        const playerProfile = await prisma.playerProfile.findUnique({
          where: {
            userId: message.user.id,
          },
        });

        if (playerProfile) {
          await prisma.playerProfile.update({
            where: {
              userId: message.user.id,
            },
            data: {
              lastLogin: new Date(),
            },
          });
        } else {
          // Falls es noch kein Profil gibt, eines erstellen
          await prisma.playerProfile.create({
            data: {
              userId: message.user.id,
              nickname: message.user.name || `Player${Math.floor(Math.random() * 10000)}`,
              level: 1,
              experience: 0,
              lastLogin: new Date(),
            },
          });
        }
      } catch (error) {
        console.error("Fehler beim Aktualisieren des Login-Datums:", error);
      }
    },
  },
  // Sicherheitseinstellungen
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

/**
 * Server-Action für die Benutzerregistrierung
 */
export async function registerUser(
  username: string, 
  email: string, 
  password: string
) {
  "use server"; // Next.js Server Action Markierung
  
  try {
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

    // Passwort über API hashen
    const hashedPassword = await hashPassword(password);

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

    // Benutzer ohne sensible Daten zurückgeben
    return {
      id: user.id,
      name: user.name,
      email: user.email
    };
  } catch (error) {
    console.error("Fehler bei der Benutzerregistrierung:", error);
    throw error;
  }
}

/**
 * Prüft, ob ein Benutzer eine bestimmte Rolle hat
 */
export async function userHasRole(userId: string, roleName: string): Promise<boolean> {
  "use server";
  try {
    const userRole = await prisma.userRole.findFirst({
      where: {
        userId,
        role: {
          name: roleName
        }
      }
    });
    
    return !!userRole;
  } catch (error) {
    console.error("Fehler beim Prüfen der Benutzerrolle:", error);
    return false;
  }
}

/**
 * Weist einem Benutzer eine Rolle zu
 */
export async function assignRoleToUser(userId: string, roleName: string): Promise<boolean> {
  "use server";
  try {
    // Prüfen, ob die Rolle existiert
    const role = await prisma.role.findUnique({
      where: {
        name: roleName
      }
    });
    
    if (!role) {
      throw new Error(`Rolle "${roleName}" nicht gefunden`);
    }
    
    // Prüfen, ob der Benutzer die Rolle bereits hat
    const existingUserRole = await prisma.userRole.findFirst({
      where: {
        userId,
        roleId: role.id
      }
    });
    
    if (existingUserRole) {
      return true; // Benutzer hat die Rolle bereits
    }
    
    // Rolle zuweisen
    await prisma.userRole.create({
      data: {
        userId,
        roleId: role.id
      }
    });
    
    return true;
  } catch (error) {
    console.error("Fehler beim Zuweisen der Rolle:", error);
    return false;
  }
}