import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ lobbyId: string }> }
) {
  try {
    const { lobbyId } = await params;
    const lobby = await prisma.lobby.findUnique({
      where: { id: lobbyId },
      include: { participants: true },
    });
    if (!lobby) {
      return NextResponse.json({ error: 'Lobby not found' }, { status: 404 });
    }
    return NextResponse.json({ lobby });
  } catch (error) {
    console.error('Error fetching lobby status:', error);
    return NextResponse.json({ error: 'Error fetching lobby status' }, { status: 500 });
  }
}
