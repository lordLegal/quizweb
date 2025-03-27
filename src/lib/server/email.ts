import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function verifyEmailInput(email: string): boolean {
	return /^.+@.+\..+$/.test(email) && email.length < 256;
}

export async function checkEmailAvailability(email: string): Promise<boolean> {
	try {
		const count = await prisma.user.count({
			where: { email }
		});
		
		return count === 0;
	} catch (error) {
		console.error("Error during email availability check:", error);
		throw new Error("Fehler bei der Überprüfung der E-Mail-Verfügbarkeit");
	}
}