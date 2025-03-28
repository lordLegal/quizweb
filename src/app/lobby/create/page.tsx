import { getCurrentSession } from '@/lib/server/session';
import { getUserFromEmail } from '@/lib/server/user';
import LobbyCreateForm from './LobbyCreateForm';
import { notFound } from 'next/navigation';

export default async function CreateLobbyPage() {
  // Hole die Session
  const { user } = await getCurrentSession();
  if (!user) {
    notFound(); // oder redirect zu Login
  }
  
  // Hole den User aus der Datenbank
  const currentUser = await getUserFromEmail(user.email);
  if (!currentUser) {
    notFound();
  }
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-12">
      <h1 className="text-3xl font-bold mb-6">Lobby erstellen</h1>
      <LobbyCreateForm
        currentUserId={currentUser.id}
        currentUserName={currentUser.username}
      />
    </div>
  );
}
