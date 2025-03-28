"use server";
import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";

const prisma = new PrismaClient();

export default async function DashboardPage({ params }: { params: Promise<{ lobbyId: string }> }) {
  const { lobbyId } = await params;
  
  // Lade die Lobby und ihre Teilnehmer
  const lobby = await prisma.lobby.findUnique({
    where: { id: lobbyId },
    include: { participants: true },
  });
  if (!lobby || !lobby.quizId) {
    notFound();
  }

  // Lade alle abgeschlossenen QuizAttempts für das Quiz der Lobby
  const attempts = await prisma.quizAttempt.findMany({
    where: {
      quizId: lobby.quizId,
      completedAt: { not: null },
    },
    orderBy: { score: "desc" },
  });

  // Erstelle ein Ergebnis-Array, das für jeden Versuch
  // den Benutzernamen (oder Nickname), Score und benötigte Zeit enthält.
  const results = attempts.map((attempt) => {
    const durationSeconds =
      (attempt.completedAt!.getTime() - attempt.startedAt.getTime()) / 1000;
    let username = "";
    if (attempt.userId === 0) {
      // Nickname-User: Versuche, den Nickname aus den Lobby-Teilnehmern zu erhalten.
      const participant = lobby.participants.find((p) => p.userId === 0);
      username = participant?.nickname || "Gast";
    } else {
      // Für registrierte Benutzer: Hier einfach "User {userId}" als Platzhalter.
      // In einer echten App kannst du den echten Benutzernamen anzeigen.
      username = `User ${attempt.userId}`;
    }
    return {
      username,
      score: attempt.score || 0,
      duration: Math.floor(durationSeconds),
    };
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Quiz Dashboard</h1>
      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-2">Platz</th>
            <th className="border border-gray-300 px-4 py-2">Benutzer</th>
            <th className="border border-gray-300 px-4 py-2">Punkte</th>
            <th className="border border-gray-300 px-4 py-2">Zeit (Sek.)</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result, index) => (
            <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}>
              <td className="border border-gray-300 px-4 py-2 text-center">{index + 1}</td>
              <td className="border border-gray-300 px-4 py-2">{result.username}</td>
              <td className="border border-gray-300 px-4 py-2 text-center">{result.score}</td>
              <td className="border border-gray-300 px-4 py-2 text-center">{result.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
