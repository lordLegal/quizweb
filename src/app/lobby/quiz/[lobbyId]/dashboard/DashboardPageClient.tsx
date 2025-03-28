'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';

interface DashboardPageClientProps {
  params: { lobbyId: string };
}

export default function DashboardPageClient({ params }: DashboardPageClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userScore = Number(searchParams.get('score')) || 0;

  const [scoreboard] = useState([
    { username: 'HostUser', score: userScore },
    { username: 'Gast1', score: 2 },
    { username: 'Gast2', score: 1 },
  ]);

  async function handleNewRound() {
    const res = await fetch('/api/lobby/quiz/newRound', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lobbyId: params.lobbyId }),
    });
    if (res.ok) {
      router.push(`/lobby/quiz/${params.lobbyId}`);
    } else {
      alert('Fehler beim Starten einer neuen Runde.');
    }
  }

  async function handleEndGame() {
    const res = await fetch('/api/lobby/quiz/end', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lobbyId: params.lobbyId }),
    });
    if (res.ok) {
      router.push(`/lobby`);
    } else {
      alert('Fehler beim Beenden des Spiels.');
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-12">
      <h1 className="text-3xl font-bold mb-6">Quiz Dashboard</h1>
      <div className="mb-4">
        <h2 className="text-2xl">Ergebnisse</h2>
        <ul>
          {scoreboard.map((entry, index) => (
            <li key={index}>
              {entry.username}: {entry.score} Punkte
            </li>
          ))}
        </ul>
      </div>
      <div className="flex space-x-4">
        <button onClick={handleNewRound} className="bg-blue-600 text-white py-2 px-4 rounded">
          Neue Runde starten
        </button>
        <button onClick={handleEndGame} className="bg-red-600 text-white py-2 px-4 rounded">
          Spiel beenden
        </button>
      </div>
    </div>
  );
}
