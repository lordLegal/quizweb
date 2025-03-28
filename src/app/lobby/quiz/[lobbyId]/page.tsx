"use server"
// app/lobby/quiz/[lobbyId]/page.tsx
import { notFound } from 'next/navigation';
import QuizRound, { Question } from './QuizRound';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function QuizRoundPage( { params }: { params: Promise<{ lobbyId: string }> }) {
  const { lobbyId } = await params;
  const lobby = await prisma.lobby.findUnique({
    where: { id: lobbyId },
  });
  if (!lobby || lobby.status !== 'STARTED') {
    notFound();
  }
  
  
  let questions: Question[] = [];
  if (lobby.quizId) {
    questions = await prisma.question.findMany({
      where: { quizId: lobby.quizId },
      orderBy: { orderIndex: 'asc' },
      include: { options: true },
    });
  }
  const maxQuestions = 10;
  if (questions.length > maxQuestions) {
    questions = questions.slice(0, maxQuestions);
  }
  
  return (
    <QuizRound 
      lobbyId={lobbyId}
      questions={questions}
      quizId={lobby.quizId ?? ''}
      totalTime={60}
      currentUser={lobby.hostId} // Pass the current user ID to the QuizRound component
    />
  );
}
