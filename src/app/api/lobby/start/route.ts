import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { lobbyId } = body;
    if (!lobbyId) {
      return NextResponse.json({ error: 'lobbyId is required' }, { status: 400 });
    }
    // Setze den Lobby‑Status auf STARTED
    const lobby = await prisma.lobby.update({
      where: { id: lobbyId },
      data: { status: 'STARTED' },
    });
    return NextResponse.json({ lobby });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Fehler beim Starten der Lobby' }, { status: 500 });
  }
}
