"use server";
import { PrismaClient } from '@prisma/client';
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import { cookies } from "next/headers";
import { cache } from "react";
import type { User } from "./user";

const prisma = new PrismaClient();

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	
	const sessionWithUser = await prisma.session.findUnique({
		where: { id: sessionId },
		include: {
			user: {
				select: {
					id: true,
					email: true,
					username: true,
					emailVerified: true,
					totpKey: true
				}
			}
		}
	});
	
	if (!sessionWithUser) {
		return { session: null, user: null };
	}
	
	const session: Session = {
		id: sessionWithUser.id,
		userId: sessionWithUser.userId,
		expiresAt: sessionWithUser.expiresAt,
		twoFactorVerified: sessionWithUser.twoFactorVerified
	};
	
	const user: User = {
		id: sessionWithUser.user.id,
		email: sessionWithUser.user.email,
		username: sessionWithUser.user.username,
		emailVerified: sessionWithUser.user.emailVerified,
		registered2FA: sessionWithUser.user.totpKey !== null
	};
	
	// Check if session is expired
	if (Date.now() >= session.expiresAt.getTime()) {
		await prisma.session.delete({
			where: { id: session.id }
		});
		return { session: null, user: null };
	}
	
	// Extend session if it's about to expire
	if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
		session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
		
		await prisma.session.update({
			where: { id: session.id },
			data: { expiresAt: session.expiresAt }
		});
	}
	
	return { session, user };
}

export const getCurrentSession = cache(async (): Promise<SessionValidationResult> => {
	"use server";
	const cookieStore = await cookies();
	const token = cookieStore.get("session")?.value ?? null;
	if (token === null) {
		return { session: null, user: null };
	}
	const result = await validateSessionToken(token);
	return result;
});

export async function invalidateSession(sessionId: string): Promise<void> {
	await prisma.session.delete({
		where: { id: sessionId }
	});
}

export async function invalidateUserSessions(userId: number): Promise<void> {
	await prisma.session.deleteMany({
		where: { userId }
	});
}

export async function setSessionTokenCookie(token: string, expiresAt: Date): Promise<void> {
	"use server";
	const cookieStore = await cookies();
	cookieStore.set("session", token, {
		httpOnly: true,
		path: "/",
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		expires: expiresAt
	});
}

export async function deleteSessionTokenCookie(): Promise<void> {
	"use server";
	const cookieStore = await cookies();
	cookieStore.set("session", "", {
		httpOnly: true,
		path: "/",
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: 0
	});
}

export async function generateSessionToken(): Promise<string> {
	const tokenBytes = new Uint8Array(20);
	crypto.getRandomValues(tokenBytes);
	const token = encodeBase32LowerCaseNoPadding(tokenBytes).toLowerCase();
	return token;
}

export async function createSession(token: string, userId: number, flags: SessionFlags): Promise<Session> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
	
	const session = await prisma.session.create({
		data: {
			id: sessionId,
			userId,
			expiresAt,
			twoFactorVerified: flags.twoFactorVerified
		}
	});
	
	return {
		id: session.id,
		userId: session.userId,
		expiresAt: session.expiresAt,
		twoFactorVerified: session.twoFactorVerified
	};
}

export async function setSessionAs2FAVerified(sessionId: string): Promise<void> {
	await prisma.session.update({
		where: { id: sessionId },
		data: { twoFactorVerified: true }
	});
}

export interface SessionFlags {
	twoFactorVerified: boolean;
}

export interface Session extends SessionFlags {
	id: string;
	expiresAt: Date;
	userId: number;
}

type SessionValidationResult = { session: Session; user: User } | { session: null; user: null };