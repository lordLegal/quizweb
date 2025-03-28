'use server';
import { PrismaClient, QuizAttempt } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

/**
 * Startet einen neuen QuizAttempt.
 * currentUser kann auch 0 sein, wenn es sich um einen Nickname-User handelt.
 */
export async function startQuizAttempt(userId: number, quizId: string): Promise<QuizAttempt> {
  const attempt = await prisma.quizAttempt.create({
    data: {
      userId, // Falls userId 0, dann handelt es sich um einen Nickname-User
      quizId,
      startedAt: new Date(),
    },
  });
  return attempt;
}

/**
 * Schließt den Attempt ab, setzt completedAt und Score.
 */
export async function finishQuizAttempt(attemptId: string, score: number): Promise<QuizAttempt> {
  const attempt = await prisma.quizAttempt.update({
    where: { id: attemptId },
    data: {
      completedAt: new Date(),
      score,
    },
  });
  revalidatePath(`/lobby/quiz/${attempt.quizId}/dashboard`);
  return attempt;
}
