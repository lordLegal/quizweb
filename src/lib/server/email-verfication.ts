import { PrismaClient } from '@prisma/client';
import { generateRandomOTP } from "./utils";
import { ExpiringTokenBucket } from "./rate-limit";
import { encodeBase32 } from "@oslojs/encoding";
import { cookies } from "next/headers";
import { getCurrentSession } from "./session";
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

export async function getUserEmailVerificationRequest(userId: number, id: string): Promise<EmailVerificationRequest | null> {
	const request = await prisma.emailVerificationRequest.findFirst({
		where: {
			id,
			userId
		}
	});
	
	if (!request) {
		return null;
	}
	
	return {
		id: request.id,
		userId: request.userId,
		code: request.code,
		email: request.email,
		expiresAt: request.expiresAt
	};
}

export async function createEmailVerificationRequest(userId: number, email: string): Promise<EmailVerificationRequest> {
	// Zuerst vorhandene Anfragen löschen
	await deleteUserEmailVerificationRequest(userId);
	
	const idBytes = new Uint8Array(20);
	crypto.getRandomValues(idBytes);
	const id = encodeBase32(idBytes).toLowerCase();

	const code = generateRandomOTP();
	const expiresAt = new Date(Date.now() + 1000 * 60 * 10);
	
	const request = await prisma.emailVerificationRequest.create({
		data: {
			id,
			userId,
			code,
			email,
			expiresAt
		}
	});

	return {
		id: request.id,
		userId: request.userId,
		code: request.code,
		email: request.email,
		expiresAt: request.expiresAt
	};
}

export async function deleteUserEmailVerificationRequest(userId: number): Promise<void> {
	await prisma.emailVerificationRequest.deleteMany({
		where: {
			userId
		}
	});
}

export async function sendVerificationEmail(email: string, code: string): Promise<void> {
	// Erstelle einen Transporter mit deinen SMTP-Einstellungen
	try {
	const transporter = nodemailer.createTransport({
	  host: process.env.SMTP_HOST,
	  port: Number(process.env.SMTP_PORT),
	  secure: process.env.SMTP_SECURE === 'true', // true bei Port 465, false bei anderen Ports
	  auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS,
	  },
	});
  
	// Definiere die Mail-Optionen
	const mailOptions = {
	  from: '"Quiz App" <kontakt@digitalkreativ.at>', // Passe Absender an
	  to: email,
	  subject: 'Your Verification Code',
	  text: `Your verification code is ${code}`, // Klartext-Version
	  html: `<p>Your verification code is <strong>${code}</strong></p>`, // HTML-Version
	};
	
	// Versende die E-Mail
	const info = await transporter.sendMail(mailOptions);
	console.log(`Verification email sent: ${info.messageId}`);
	} catch (error) {
		console.error("Error sending verification email:", error);
		throw new Error(`Fehler beim Senden der Bestätigungs-E-Mail ${error}`);
	}
  }

export async function setEmailVerificationRequestCookie(request: EmailVerificationRequest): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.set("email_verification", request.id, {
		httpOnly: true,
		path: "/",
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		expires: request.expiresAt
	});
}

export async function deleteEmailVerificationRequestCookie(): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.set("email_verification", "", {
		httpOnly: true,
		path: "/",
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: 0
	});
}

export async function getUserEmailVerificationRequestFromRequest(): Promise<EmailVerificationRequest | null> {
	const sessionResult = await getCurrentSession();
	const { user } = sessionResult;
	
	if (user === null) {
		return null;
	}
	
	const cookieStore = await cookies();
	const id = cookieStore.get("email_verification")?.value ?? null;
	if (id === null) {
		return null;
	}
	
	const request = await getUserEmailVerificationRequest(user.id, id);
	if (request === null) {
		deleteEmailVerificationRequestCookie();
	}
	
	return request;
}

export const sendVerificationEmailBucket = new ExpiringTokenBucket<number>(3, 60 * 10);

export interface EmailVerificationRequest {
	id: string;
	userId: number;
	code: string;
	email: string;
	expiresAt: Date;
}