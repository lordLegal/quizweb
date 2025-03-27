import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/server/session';
import { getUserFromEmail } from '@/lib/server/user';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  // Hole die Session und den User aus deinem Auth-System
  const { user } = await getCurrentSession();
  if (!user) {
    return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
  }
  const currentUser = await getUserFromEmail(user.email);
  if (!currentUser) {
    return NextResponse.json({ error: 'User nicht gefunden' }, { status: 404 });
  }
  const currentUserId = currentUser.id;

  try {
    const body = await request.json();
    const { lobbyId } = body;
    if (!lobbyId) {
      return NextResponse.json({ error: 'lobbyId ist erforderlich' }, { status: 400 });
    }
    
    // Lade die Lobby aus der Datenbank
    const lobby = await prisma.lobby.findUnique({
      where: { id: lobbyId },
    });
    if (!lobby) {
      return NextResponse.json({ error: 'Lobby nicht gefunden.' }, { status: 404 });
    }
    
    // Überprüfe, ob der aktuelle User der Host ist
    if (lobby.hostId !== currentUserId) {
      return NextResponse.json({ error: 'Nur der Host kann das Quiz starten.' }, { status: 403 });
    }
    
    // Setze den Lobby‑Status auf STARTED
    const updatedLobby = await prisma.lobby.update({
      where: { id: lobbyId },
      data: { status: 'STARTED' },
    });
    
    return NextResponse.json({ lobby: updatedLobby });
  } catch (error) {
    console.error('Error starting lobby:', error);
    return NextResponse.json({ error: 'Fehler beim Starten der Lobby' }, { status: 500 });
  }
}
