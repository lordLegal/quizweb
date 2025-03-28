"use client";

import { useEffect, useState } from "react";

export function ParticipantList({
  lobbyId,
  initialParticipants,
}: {
  lobbyId: string;
  initialParticipants: Array<{ id: string; nickname?: string | null; userId?: number | null }>;
}) {
  const [participants, setParticipants] = useState(initialParticipants);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/lobby/${lobbyId}/status`);
        if (res.ok) {
          const data = await res.json();
          setParticipants(data.lobby.participants);
        }
      } catch (error) {
        console.error("Error polling lobby status:", error);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [lobbyId]);

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Aktuelle Teilnehmer:</h2>
      <ul className="list-disc list-inside">
        {participants.map((p) => (
          <li key={p.id}>
            {p.nickname || (p.userId ? `User ${p.userId}` : 'Gast')}
          </li>
        ))}
      </ul>
    </div>
  );
}
