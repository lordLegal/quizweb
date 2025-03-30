import { getCurrentSession } from '@/lib/server/session';
import { getUserFromEmail } from '@/lib/server/user';
import LobbyCreateForm from './LobbyCreateForm';
import {  redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function CreateLobbyPage() {
  // Hole die Session
  const { user } = await getCurrentSession();
  if (!user) {
    redirect('/signup');
    return;
  }
  
  // Hole den User aus der Datenbank
  const currentUser = await getUserFromEmail(user.email);
  if (!currentUser) {
    redirect('/signup');
    return;
  }

  const quizzes = await prisma.quiz.findMany({
    where: { isPublic: true },
  });
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-12">
      <h1 className="text-3xl font-bold mb-6">Lobby erstellen</h1>
      <LobbyCreateForm
        currentUserId={currentUser.id}
        currentUserName={currentUser.username}
        Quizes={quizzes} // Übergebe die Quizzes an das Formular
      />
    </div>
  );
}
