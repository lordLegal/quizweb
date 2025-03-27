'use client';

import Link from 'next/link';
import Image from 'next/image';

const HomePage = () => {
  return (
    <main className="pt-16">
      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Willkommen bei der Quiz App</h1>
          <p className="text-xl mb-8">
            Erstelle, teile und spiele aufregende Quiz-Spiele mit Freunden – ganz einfach und interaktiv!
          </p>
          <Link
            href="/lobby"
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition duration-300"
          >
            Jetzt Lobby erstellen
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-3xl font-bold mb-4">Wie funktioniert’s?</h2>
              <p className="mb-4">
                Erstelle eine Lobby und lade deine Freunde per Link ein. Als Gastgeber bestimmst du die maximale Anzahl an Teilnehmern und wählst einen Fragenstapel aus. Teilnehmer können sich entweder mit einem Account anmelden oder einfach einen Nickname verwenden.
              </p>
              <ul className="list-disc ml-5 space-y-2">
                <li>Einfache Lobby-Erstellung und Verwaltung</li>
                <li>Flexible Teilnehmeranmeldung mit oder ohne Account</li>
                <li>Individuelle Einstellung der maximalen Benutzerzahl</li>
                <li>Auswahl von Standard- oder Custom-Fragenstapeln</li>
                <li>Möglichkeit eigene Fragen hochzuladen und zu erstellen</li>
              </ul>
            </div>
            <div className="flex items-center justify-center">
              {/* Next.js Image Wrapper */}
              <Image
                src="/quiz-illustration.svg"
                alt="Quiz Illustration"
                width={500}
                height={500}
                className="w-3/4"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Unsere Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white shadow-md p-6 rounded-lg hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-semibold mb-2">Lobby Erstellen</h3>
              <p>
                Erstelle in wenigen Klicks deine eigene Spiel-Lobby, in der du alle wichtigen Einstellungen festlegen kannst.
              </p>
            </div>
            <div className="bg-white shadow-md p-6 rounded-lg hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-semibold mb-2">Freunde Einladen</h3>
              <p>
                Versende einen persönlichen Einladungslink an deine Freunde, damit sie direkt an deiner Lobby teilnehmen können.
              </p>
            </div>
            <div className="bg-white shadow-md p-6 rounded-lg hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-semibold mb-2">Custom Fragenstapel</h3>
              <p>
                Wähle aus vordefinierten Fragenstapeln oder erstelle deinen eigenen, um das Quiz individuell zu gestalten.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Bereit für dein nächstes Quiz-Abenteuer?</h2>
          <p className="mb-8">
            Starte jetzt deine eigene Quiz-Lobby und fordere deine Freunde zu spannenden Herausforderungen heraus!
          </p>
          <Link
            href="/lobby"
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition duration-300"
          >
            Jetzt loslegen
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>© 2025 Quiz App. Alle Rechte vorbehalten.</p>
        </div>
      </footer>
    </main>
  );
};

export default HomePage;
