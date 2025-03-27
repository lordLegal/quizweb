import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';

const prisma = new PrismaClient();

export default async function QuizPage({ params }: { params: { lobbyId: string } }) {
  const { lobbyId } = await params;
  // Stelle sicher, dass die Lobby existiert und den Status STARTED hat
  const lobby = await prisma.lobby.findUnique({ where: { id: lobbyId } });
  if (!lobby || lobby.status !== 'STARTED') {
    notFound();
  }
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-12">
      <h1 className="text-3xl font-bold mb-6">Quiz Runde gestartet!</h1>
      <p>Hier beginnt die Fragenrunde. (Implementiere hier deine Quiz-Logik)</p>
    </div>
  );
}
