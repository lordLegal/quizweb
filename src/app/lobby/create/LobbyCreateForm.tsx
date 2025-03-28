'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createLobby } from './actions';

interface LobbyCreateFormProps {
  currentUserId: number;
  currentUserName: string;
}

export default function LobbyCreateForm({ currentUserId, currentUserName }: LobbyCreateFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    // Setze hostId und hostNickname
    formData.append('hostId', currentUserId.toString());
    formData.append('hostNickname', currentUserName);

    // Server Action zum Erstellen der Lobby aufrufen
    const lobby = await createLobby(formData);
    // Direkt in den Warteraum weiterleiten
    router.push(`/lobby/waiting/${lobby.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-md">
      <div className="mb-4">
        <label className="block text-gray-700 font-medium">Maximale Spielerzahl:</label>
        <input
          type="number"
          name="maxPlayers"
          required
          title="Maximale Spielerzahl"
          className="w-full border border-gray-300 p-2 rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-medium">Quiz ID (optional):</label>
        <input
          type="text"
          name="quizId"
          placeholder="Falls ein Quiz ausgewählt werden soll"
          className="w-full border border-gray-300 p-2 rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-medium">
          Fragenkatalog (CSV, optional):
        </label>
        <input
        title='Fragenkatalog (CSV, optional)'
          type="file"
          name="questionsCSV"
          accept=".csv"
          className="w-full"
        />
        <p className="text-sm text-gray-500">
          Lade eine CSV-Datei hoch, um eigene Fragen zu verwenden. Andernfalls werden Standardfragen genutzt.
        </p>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
      >
        {loading ? 'Erstelle Lobby...' : 'Lobby erstellen'}
      </button>
    </form>
  );
}
