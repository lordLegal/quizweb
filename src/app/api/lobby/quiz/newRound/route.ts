// app/api/lobby/quiz/newRound/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { lobbyId } = await request.json();
    if (!lobbyId) {
      return NextResponse.json({ error: 'lobbyId required' }, { status: 400 });
    }
    // Hier könnten Rundendaten zurückgesetzt werden – im Beispiel kein zusätzlicher Code.
    return NextResponse.json({ message: 'Neue Runde gestartet' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error starting new round' }, { status: 500 });
  }
}
