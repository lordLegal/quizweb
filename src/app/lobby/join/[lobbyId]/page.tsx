import { notFound } from 'next/navigation';
import JoinForm from '@/app/components/joinForm';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function JoinLobbyPage({ params }: { params: Promise<{ lobbyId: string }> }) {
  const { lobbyId } = await params;

  const lobby = await prisma.lobby.findUnique({
    where: { id: lobbyId },
    include: { participants: true },
  });

  if (!lobby) {
    notFound();
  }

  if (lobby.participants.length >= lobby.maxPlayers) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center py-12">
        <h1 className="text-3xl font-bold mb-6">Lobby ist voll</h1>
        <p className="mb-2">Die Lobby hat bereits die maximale Spielerzahl erreicht.</p>
      </div>
    );
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-12">
      <h1 className="text-3xl font-bold mb-6">Lobby: {lobby.id}</h1>
      <p className="mb-2">Maximale Spielerzahl: {lobby.maxPlayers}</p>
      <p className="mb-2">Status: {lobby.status}</p>
      <p className="mb-6">Aktuelle Teilnehmer: {lobby.participants.length}</p>
      <JoinForm lobbyId={lobby.id} />
    </div>
  );
}
