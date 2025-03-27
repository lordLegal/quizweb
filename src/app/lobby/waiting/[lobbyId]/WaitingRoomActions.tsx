'use client';
import { useState } from 'react';

export default function WaitingRoomActions({ lobbyId, hostId }: { lobbyId: string; hostId: number; }) {
  // Simuliere den aktuell eingeloggten User – in einer realen App holst du die User-ID aus der Session
  const currentUserId = 1;
  const isHost = currentUserId === hostId;
  const [loading, setLoading] = useState(false);

  async function handleStart() {
    if (!isHost) return; // Gäste dürfen nicht starten
    setLoading(true);
    const res = await fetch('/api/lobby/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lobbyId }),
    });
    if (res.ok) {
      // Der Poller (LobbyPoller) übernimmt den Statuswechsel und leitet alle weiter
    } else {
      alert('Fehler beim Starten der Lobby.');
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
      {!isHost && (
        <p className="mt-2 text-gray-600">Nur der Host kann das Quiz starten.</p>
      )}
    </div>
  );
}
