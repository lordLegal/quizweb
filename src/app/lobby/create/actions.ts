'use server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function createLobby(formData: FormData) {
  const hostId = Number(formData.get('hostId'));
  const hostNickname = formData.get('hostNickname')?.toString() || null;
  const maxPlayers = Number(formData.get('maxPlayers'));
  const quizId = formData.get('quizId')?.toString() || null;

  if (!hostId || !maxPlayers) {
    throw new Error('Fehlende Felder: hostId und maxPlayers müssen angegeben werden.');
  }

  // Lobby erstellen
  const lobby = await prisma.lobby.create({
    data: {
      hostId,
      quizId,
      maxPlayers,
      status: 'WAITING',
    },
  });

  // Gastgeber als ersten Teilnehmer eintragen – setze dabei den tatsächlichen Nickname
  await prisma.lobbyParticipant.create({
    data: {
      lobbyId: lobby.id,
      userId: hostId,
      nickname: hostNickname,
    },
  });

  return lobby;
}
