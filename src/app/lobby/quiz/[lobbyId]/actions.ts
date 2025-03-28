'use server';

import { revalidatePath } from 'next/cache';
import { PrismaClient, QuizAttempt } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Lege einen neuen QuizAttempt für einen User an.
 * userId und quizId kannst du aus der Session oder Lobby holen.
 */
export async function startQuizAttempt(userId: number, quizId: string): Promise<QuizAttempt> {
  const attempt = await prisma.quizAttempt.create({
    data: {
      userId,
      quizId,
      startedAt: new Date(),
    },
  });
  return attempt;
}

/**
 * Schließe den Attempt ab, setze completedAt und Score.
 * (In einer echten Anwendung würdest du hier serverseitig
 * den Score anhand der Antworten berechnen.)
 */
export async function finishQuizAttempt(attemptId: string, score: number): Promise<QuizAttempt> {
  const attempt = await prisma.quizAttempt.update({
    where: { id: attemptId },
    data: {
      completedAt: new Date(),
      score,
    },
  });
  // Revalidate (optional), falls du statische Seiten hast
  revalidatePath(`/lobby/quiz/${attempt.quizId}/dashboard`);
  return attempt;
}
