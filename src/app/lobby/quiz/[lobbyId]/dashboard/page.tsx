"use server";
import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";

const prisma = new PrismaClient();

export default async function DashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ lobbyId: string }>;
  searchParams: Promise<{ userId?: string }>;
}) {
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearchParams = await Promise.resolve(searchParams);
  
  const { lobbyId } = resolvedParams;
  const userId = resolvedSearchParams.userId;
  if (!userId) {
    notFound();
  }

  // Lade den letzten Attempt dieses Users für dieses Quiz
  const lobby = await prisma.lobby.findUnique({ where: { id: lobbyId } });
  if (!lobby) {
    notFound();
  }
  if (!lobby.quizId) {
    notFound();
  }

  const attempt = await prisma.quizAttempt.findFirst({
    where: {
      userId: Number(userId),
      quizId: lobby.quizId,
    },
    orderBy: { startedAt: "desc" },
  });

  if (!attempt || !attempt.completedAt) {
    notFound();
  }

  const durationSeconds =
    (attempt.completedAt.getTime() - attempt.startedAt.getTime()) / 1000;
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Dein Score: {attempt.score}</p>
      <p>Benötigte Zeit: {Math.floor(durationSeconds)} Sekunden</p>
    </div>
  );
}
