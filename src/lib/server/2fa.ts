import { PrismaClient, Prisma } from '@prisma/client';
import { decryptToString, encryptString } from "./encryption";
import { ExpiringTokenBucket } from "./rate-limit";
import { generateRandomRecoveryCode } from "./utils";

const prisma = new PrismaClient();

export const totpBucket = new ExpiringTokenBucket<number>(5, 60 * 30);
export const recoveryCodeBucket = new ExpiringTokenBucket<number>(3, 60 * 60);

export async function resetUser2FAWithRecoveryCode(userId: number, recoveryCode: string): Promise<boolean> {
  // Verwenden einer Transaktion, um sicherzustellen, dass alle Operationen atomar sind
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Benutzer mit der angegebenen ID finden
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { recoveryCode: true }
    });
    
    if (!user) {
      return false;
    }
    
    // Recovery-Code entschlüsseln und vergleichen
    const userRecoveryCode = decryptToString(user.recoveryCode);
    if (recoveryCode !== userRecoveryCode) {
      return false;
    }
    
    // Neuen Recovery-Code generieren und verschlüsseln
    const newRecoveryCode = generateRandomRecoveryCode();
    const encryptedNewRecoveryCode = encryptString(newRecoveryCode);
    
    // Alle Sitzungen des Benutzers aktualisieren
    await tx.session.updateMany({
      where: { userId },
      data: { twoFactorVerified: false }
    });
    
    // Benutzer aktualisieren mit OPTIMISTIC CONCURRENCY CHECK
    try {
      await tx.user.update({
        where: { 
          id: userId,
          recoveryCode: user.recoveryCode // Stellt sicher, dass der Recovery-Code nicht geändert wurde
        },
        data: {
          recoveryCode: encryptedNewRecoveryCode,
          totpKey: null
        }
      });
      
      // Wenn wir hier ankommen, war die Aktualisierung erfolgreich
      return true;
    } catch {
      // Wenn ein Fehler bei der Aktualisierung auftritt (z.B. weil der Recovery-Code bereits geändert wurde)
      return false;
    }
  });
}