// app/lobby/waiting/WaitingRoomActions.tsx
'use client';
import { useState } from 'react';
interface WaitingRoomActionsProps {
  lobbyId: string;
  hostId: number;
  currentUserId: number | null;
}

export default function WaitingRoomActions({ lobbyId, hostId, currentUserId }: WaitingRoomActionsProps) {
  const isHost = currentUserId === hostId;
  const [loading, setLoading] = useState(false);
  
  async function handleStart() {
    if (!isHost) return;
    setLoading(true);
    const res = await fetch('/api/lobby/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lobbyId }),
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || 'Fehler beim Starten der Lobby.');
    }
    setLoading(false);
  }
  
  return (
    <div>
      <button 
        onClick={handleStart}
        disabled={loading || !isHost}
        className={`bg-green-600 text-white py-2 px-4 rounded transition ${!isHost ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'}`}
      >
        {loading ? 'Starte Quiz...' : 'Quiz starten'}
      </button>
      {!isHost && <p className="mt-2 text-gray-600">Nur der Host kann das Quiz starten.</p>}
    </div>
  );
}
