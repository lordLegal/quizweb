import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { lobbyId, nickname } = body;

    if (!lobbyId || !nickname) {
      return NextResponse.json(
        { error: 'Fehlende Felder: lobbyId und nickname sind erforderlich.' },
        { status: 400 }
      );
    }

    // Neuen Lobby-Teilnehmer anlegen (für Gäste ohne Account)
    const participant = await prisma.lobbyParticipant.create({
      data: {
        lobbyId,
        nickname,
      },
    });

    return NextResponse.json({ participant });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Fehler beim Beitreten der Lobby.' }, { status: 500 });
  }
}
