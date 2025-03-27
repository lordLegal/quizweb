'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DashboardPage({ params }: { params: { lobbyId: string } }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userScore = Number(searchParams.get('score')) || 0;

  // Simuliere ein Scoreboard; in einer echten App würdest du hier alle Spieler-Scores abrufen
  const [scoreboard] = useState([
    { username: 'Host', score: userScore },
    { username: 'Gast1', score: 2 },
    { username: 'Gast2', score: 1 },
  ]);

  async function handleNewRound() {
    // API-Aufruf zum Zurücksetzen der Rundendaten
    const res = await fetch('/api/lobby/quiz/newRound', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lobbyId: params.lobbyId }),
    });
    if (res.ok) {
      // Starte eine neue Runde – leite zurück zur Quiz-Round-Seite
      router.push(`/lobby/quiz/${params.lobbyId}`);
    } else {
      alert('Fehler beim Starten einer neuen Runde.');
    }
  }

  async function handleEndGame() {
    // API-Aufruf zum Beenden des Spiels und Löschen der Rundendaten
    const res = await fetch('/api/lobby/quiz/end', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lobbyId: params.lobbyId }),
    });
    if (res.ok) {
      // Nach dem Spielende z. B. zur Lobby-Startseite weiterleiten
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
        <button
          onClick={handleNewRound}
          className="bg-blue-600 text-white py-2 px-4 rounded"
        >
          Neue Runde starten
        </button>
        <button
          onClick={handleEndGame}
          className="bg-red-600 text-white py-2 px-4 rounded"
        >
          Spiel beenden
        </button>
      </div>
    </div>
  );
}
