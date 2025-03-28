// app/lobby/waiting/LobbyPoller.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Lobby = {
  id: string;
  status: 'WAITING' | 'STARTED' | 'FINISHED';
  participants: Array<{ id: string; nickname: string | null; userId?: number | null }>;
};

export default function LobbyPoller({ lobbyId, initialLobby, participant }: { lobbyId: string; initialLobby: Lobby; participant: string }) {
  const [lobby, setLobby] = useState<Lobby>(initialLobby);
  const [notification, setNotification] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/lobby/${lobbyId}/status`);
        if (res.ok) {
          const data = await res.json();
          if (data.lobby) {
            const newLobby = data.lobby as Lobby;
            if (newLobby.participants.length > lobby.participants.length) {
              const newParticipant = newLobby.participants[newLobby.participants.length - 1];
              setNotification(`Neuer Teilnehmer: ${newParticipant.nickname || `User ${newParticipant.userId}`}`);
              setTimeout(() => setNotification(null), 3000);
            }
            setLobby(newLobby);
            if (newLobby.status === 'STARTED') {
              router.push(`/lobby/quiz/${lobbyId}?nickname=${participant}`);
            }
          }
        }
      } catch (error) {
        console.error('Error polling lobby status:', error);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [lobby, lobbyId, router, participant]);

  return (
    <div>
      {notification && <div className="bg-blue-100 text-blue-800 p-2 rounded mb-4">{notification}</div>}
    </div>
  );
}
