import { notFound } from 'next/navigation';
import LobbyPoller from '../LobbyPoller';
import WaitingRoomActions from './WaitingRoomActions';
import { getCurrentSession } from '@/lib/server/session';
import { getUserFromEmail } from '@/lib/server/user';
import { PrismaClient } from '@prisma/client';
import { ParticipantList } from "./ParticipantList";

const prisma = new PrismaClient();

export default async function WaitingRoomPage({ params }: { params: Promise<{ lobbyId: string }> }) {
  const { lobbyId } = await params;
  const lobby = await prisma.lobby.findUnique({
    where: { id: lobbyId },
    include: { participants: true },
  });
  if (!lobby) {
    notFound();
  }
  
  const { user } = await getCurrentSession();
  let currentUserId: number | null = null;
  if (user) {
    const currentUser = await getUserFromEmail(user.email);
    currentUserId = currentUser?.id ?? null;
  }
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-12">
      <h1 className="text-3xl font-bold mb-6">Lobby: {lobby.id}</h1>
      <p className="mb-2">Maximale Spielerzahl: {lobby.maxPlayers}</p>
      <p className="mb-2">Status: {lobby.status}</p>
      <div className="mb-4">
        <p className="font-bold">Einladungslink:</p>
        <p className="text-blue-600 underline">
          {`${process.env.NEXT_PUBLIC_BASE_URL}/lobby/join/${lobby.id}`}
        </p>
      </div>
      <LobbyPoller
        lobbyId={lobby.id}
        initialLobby={{
          id: lobby.id,
          status: lobby.status,
          participants: lobby.participants,
        }}
      />
      <WaitingRoomActions
        lobbyId={lobby.id}
        hostId={lobby.hostId}
        currentUserId={currentUserId}
      />
      <div className="mt-6 w-full max-w-md">
        <ParticipantList lobbyId={lobby.id} initialParticipants={lobby.participants} />
      </div>
    </div>
  );
}
