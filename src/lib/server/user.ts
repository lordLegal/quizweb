import { PrismaClient } from '@prisma/client';
import { decrypt, decryptToString, encrypt, encryptString } from "./encryption";
import { hashPassword } from "./password";
import { generateRandomRecoveryCode } from "./utils";

const prisma = new PrismaClient();

export function verifyUsernameInput(username: string): boolean {
	return username.length > 3 && username.length < 32 && username.trim() === username;
}

export async function createUser(email: string, username: string, password: string): Promise<User> {
	const passwordHash = await hashPassword(password);
	const recoveryCode = generateRandomRecoveryCode();
	const encryptedRecoveryCode = encryptString(recoveryCode);
	
	const user = await prisma.user.create({
		data: {
			email,
			username,
			passwordHash,
			recoveryCode: encryptedRecoveryCode,
		},
		select: {
			id: true,
			username: true,
			email: true,
			emailVerified: true,
			totpKey: true,
		},
	});

	return {
		id: user.id,
		username: user.username,
		email: user.email,
		emailVerified: user.emailVerified,
		registered2FA: user.totpKey !== null,
	};
}

export async function updateUserPassword(userId: number, password: string): Promise<void> {
	const passwordHash = await hashPassword(password);
	await prisma.user.update({
		where: { id: userId },
		data: { passwordHash },
	});
}

export async function updateUserEmailAndSetEmailAsVerified(userId: number, email: string): Promise<void> {
	await prisma.user.update({
		where: { id: userId },
		data: { 
			email,
			emailVerified: true,
		},
	});
}

export async function setUserAsEmailVerifiedIfEmailMatches(userId: number, email: string): Promise<boolean> {
	try {
		const result = await prisma.user.updateMany({
			where: { 
				id: userId,
				email,
			},
			data: { 
				emailVerified: true,
			},
		});
		return result.count > 0;
	} catch {
		return false;
	}
}

export async function getUserPasswordHash(userId: number): Promise<string> {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { passwordHash: true },
	});
	
	if (!user) {
		throw new Error("Invalid user ID");
	}
	
	return user.passwordHash;
}

export async function getUserRecoverCode(userId: number): Promise<string> {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { recoveryCode: true },
	});
	
	if (!user) {
		throw new Error("Invalid user ID");
	}
	
	return decryptToString(user.recoveryCode);
}

export async function getUserTOTPKey(userId: number): Promise<Uint8Array | null> {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { totpKey: true },
	});
	
	if (!user) {
		throw new Error("Invalid user ID");
	}
	
	if (user.totpKey === null) {
		return null;
	}
	
	return decrypt(user.totpKey);
}

export async function updateUserTOTPKey(userId: number, key: Uint8Array): Promise<void> {
	const encrypted = encrypt(key);
	await prisma.user.update({
		where: { id: userId },
		data: { totpKey: encrypted },
	});
}

export async function resetUserRecoveryCode(userId: number): Promise<string> {
	const recoveryCode = generateRandomRecoveryCode();
	const encrypted = encryptString(recoveryCode);
	
	await prisma.user.update({
		where: { id: userId },
		data: { recoveryCode: encrypted },
	});
	
	return recoveryCode;
}

export async function getUserFromEmail(email: string): Promise<User | null> {
	const user = await prisma.user.findUnique({
		where: { email },
		select: {
			id: true,
			email: true,
			username: true,
			emailVerified: true,
			totpKey: true,
		},
	});
	
	if (!user) {
		return null;
	}
	
	return {
		id: user.id,
		email: user.email,
		username: user.username,
		emailVerified: user.emailVerified,
		registered2FA: user.totpKey !== null,
	};
}

export interface User {
	id: number;
	email: string;
	username: string;
	emailVerified: boolean;
	registered2FA: boolean;
}