
import DashboardPageClient from "./DashboardPageClient";

export default async function DashboardPage({ params }: { params: Promise<{ lobbyId: string }> }) {
  // Hier sind die dynamischen Parameter bereits aufgelöst
  return <DashboardPageClient params={await params} />;
}
