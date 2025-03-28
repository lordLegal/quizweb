// app/lobby/join/JoinForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function JoinForm({ lobbyId }: { lobbyId: string }) {
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/lobby/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lobbyId, nickname }),
    });
    if (res.ok) {
      router.push(`/lobby/waiting/${lobbyId}?nickname=${nickname}`);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-md">
      <div className="mb-4">
        <label className="block text-gray-700">Nickname:</label>
        <input title='nickname' type="text" name="nickname" required value={nickname} onChange={(e) => setNickname(e.target.value)} className="w-full border border-gray-300 p-2 rounded" />
      </div>
      <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
        {loading ? 'Beitreten...' : 'Lobby beitreten'}
      </button>
    </form>
  );
}
