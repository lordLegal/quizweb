import { notFound } from 'next/navigation';
import LobbyPoller from '../LobbyPoller';
import WaitingRoomActions from './WaitingRoomActions';
import { getCurrentSession } from '@/lib/server/session';
import { getUserFromEmail } from '@/lib/server/user';
import { PrismaClient } from '@prisma/client';
import { ParticipantList } from "./ParticipantList";
import { SearchParams } from 'next/dist/server/request/search-params';

const prisma = new PrismaClient();

export default async function WaitingRoomPage({ params, searchParams }: { params: Promise<{ lobbyId: string }>, searchParams: Promise<SearchParams> }) {
  const { lobbyId } = await params;
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const nickname = resolvedSearchParams.nickname;
  const lobby = await prisma.lobby.findUnique({
    where: { id: lobbyId },
    include: { participants: true },
  });
  if (!lobby) {
    notFound();
  }

   // Hole die Session
   const { user } = await getCurrentSession();
   let currentUser;
    if (user) {
      currentUser = await getUserFromEmail(user.email);
    }
   
   
   // Hole den User aus der Datenbank
    
   

   const currentUserId = currentUser?.id;


  

  if (!lobby.participants.some(participant => participant.nickname === nickname) && lobby.hostId !== currentUserId) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center py-12">
        <h1 className="text-3xl font-bold mb-6">Nickname nicht gefunden</h1>
        <p className="mb-2">Der angegebene Nickname ist in dieser Lobby nicht vorhanden.</p>
      </div>
    );
  }

  if (lobby.participants.length >= lobby.maxPlayers) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center py-12">
        <h1 className="text-3xl font-bold mb-6">Lobby ist voll</h1>
        <p className="mb-2">Die Lobby hat bereits die maximale Spielerzahl erreicht.</p>
      </div>
    );
  }


  
  
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-12">
      <h1 className="text-3xl font-bold mb-6">Lobby: {lobby.id}</h1>
      <p className="mb-2">Maximale Spielerzahl: {lobby.maxPlayers}</p>
      <p className="mb-2">Status: {lobby.status}</p>
      <div className="mb-4">
        <p className="font-bold">Einladungslink:</p>
        <p className="text-blue-600 underline">
          {`https://quizweb-sigma.vercel.app/lobby/join/${lobby.id}`}
        </p>
      </div>
      <LobbyPoller
        lobbyId={lobby.id}
        initialLobby={{
          id: lobby.id,
          status: lobby.status,
          participants: lobby.participants,
          
        }}
        participant={nickname ? lobby.participants.find(p => p.nickname === nickname)?.nickname || '' : ''}
      />
      <WaitingRoomActions
        lobbyId={lobby.id}
        hostId={lobby.hostId}
        currentUserId={currentUserId || 0}
      />
      <div className="mt-6 w-full max-w-md">
        <ParticipantList lobbyId={lobby.id} initialParticipants={lobby.participants} />
      </div>
    </div>
  );
}
