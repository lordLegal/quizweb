"use server";
import { notFound } from "next/navigation";
import QuizRound, { Question } from "./QuizRound";
import { PrismaClient } from "@prisma/client";
import { getCurrentSession } from "@/lib/server/session";
import { getUserFromEmail } from "@/lib/server/user";

const prisma = new PrismaClient();

export default async function QuizRoundPage({ params, searchParams }: { 
  params: Promise<{ lobbyId: string }>,
  searchParams: Promise<{ nickname?: string }>
}) {
  const { lobbyId } = await params;
  const resolvedSearchParams = await Promise.resolve(searchParams);
  console.log('Resolved Search Params:', resolvedSearchParams);
  const lobby = await prisma.lobby.findUnique({
    where: { id: lobbyId },
  });
  if (!lobby || lobby.status !== 'STARTED') {
    notFound();
  }
  
  // Hole die Session
  const { user } = await getCurrentSession();
  
  // Hole den User aus der DB – falls vorhanden. Falls nicht (z. B. bei Nickname-User), verwenden wir 0.
  const currentUserObj = await getUserFromEmail(user?.email || '');
  const currentUser = currentUserObj ? currentUserObj.id : 0;
  
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
      totalTime={60} // Gesamtzeit in Sekunden für alle Fragen
      currentUser={currentUser} // 0, falls kein richtiger Account
    />
  );
}
