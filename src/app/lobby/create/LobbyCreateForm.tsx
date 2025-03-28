'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createLobby } from './actions';

interface Quiz {
  id: string;
  title: string;
}

interface LobbyCreateFormProps {
  currentUserId: number;
  currentUserName: string;
  Quizes?: Quiz[]; // Optional, falls Quizes nicht übergeben werden
}

export default function LobbyCreateForm({ currentUserId, currentUserName, Quizes }: LobbyCreateFormProps) {
  const [loading, setLoading] = useState(false);
  const [quizList, setQuizList] = useState<Quiz[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (Quizes) {
      setQuizList(Quizes);
      console.log('Quizes:', Quizes);
    }
  }, [Quizes]);

  console.log('QuizList:', quizList);
  


  

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    // Setze hostId und hostNickname
    formData.append('hostId', currentUserId.toString());
    formData.append('hostNickname', currentUserName);
    // Falls ein Quiz ausgewählt wurde, wird dessen ID übermittelt
    if (selectedQuizId) {
      formData.append('quizId', selectedQuizId);
    }
    console.log('SelectedQuizId:', selectedQuizId);
    const lobby = await createLobby(formData);
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
        <label className="block text-gray-700 font-medium">Quiz auswählen (optional):</label>
        <select
          title='Quiz auswählen (optional)'
          name="quizId"
          value={selectedQuizId}
          onChange={(e) => setSelectedQuizId(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded"
        >
          <option value="">-- Kein Quiz auswählen --</option>
          {quizList.map((quiz) => (
            <option key={quiz.id} value={quiz.id}>
              {quiz.title}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-medium">
          Fragenkatalog (CSV, optional):
        </label>
        <input
          type="file"
          name="questionsCSV"
          accept=".csv"
          title="Fragenkatalog (CSV, optional)"
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


