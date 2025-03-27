// app/api/lobby/quiz/end/route.ts
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { lobbyId } = await request.json();
    if (!lobbyId) {
      return NextResponse.json({ error: 'lobbyId required' }, { status: 400 });
    }
    await prisma.lobby.update({
      where: { id: lobbyId },
      data: { status: 'FINISHED' },
    });
    // Hier können zusätzlich Rundendaten gelöscht werden.
    return NextResponse.json({ message: 'Spiel beendet' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error ending game' }, { status: 500 });
  }
}
