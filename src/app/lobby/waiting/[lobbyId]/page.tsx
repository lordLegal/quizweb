import { notFound } from 'next/navigation';
import QuizRound from './QuizRound';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function QuizRoundPage({ params }: { params: { lobbyId: string } }) {
  const { lobbyId } = params;
  // Prüfe, ob die Lobby existiert und bereits gestartet wurde
  const lobby = await prisma.lobby.findUnique({
    where: { id: lobbyId },
  });
  if (!lobby || lobby.status !== 'STARTED') {
    notFound();
  }
  
  // Falls eine Quiz-ID gesetzt ist, lade die zugehörigen Fragen
  let questions: {
    id: string;
    quizId: string;
    text: string;
    orderIndex: number;
    options: {
      id: string;
      questionId: string;
      text: string;
      isCorrect: boolean;
    }[];
  }[] = [];
  if (lobby.quizId) {
    questions = await prisma.question.findMany({
      where: { quizId: lobby.quizId },
      orderBy: { orderIndex: 'asc' },
      include: {
        options: true, // Hole die Antwortoptionen
      },
    });
  }
  // Optional: Begrenze die maximale Anzahl Fragen (z. B. 10)
  const maxQuestions = 10;
  if (questions.length > maxQuestions) {
    questions = questions.slice(0, maxQuestions);
  }
  
  return (
    <QuizRound 
      lobbyId={lobbyId}
      questions={questions}
      timerDuration={30}  // Timer-Dauer in Sekunden pro Frage
    />
  );
}
