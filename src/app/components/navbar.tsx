'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { redirect, usePathname } from 'next/navigation';
import { FaBars, FaTimes, FaUser, FaSignOutAlt, FaSignInAlt } from 'react-icons/fa';
import { deleteSessionTokenCookie } from '@/lib/server/session';

// Typen für Auth-Benutzer
export interface User {
	id: number;
	email: string;
	username: string;
	emailVerified: boolean;
	registered2FA: boolean;
}
type AuthProps = {
  user: User | null;
  isLoading: boolean;
};

const Navbar = ({ user, isLoading }: AuthProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  // Navigationslinks
  const navLinks = [
    { name: 'Startseite', href: '/' },
  ];

  // Scrollen erkennen für Schatten-Effekt
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mobile Menü umschalten
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-white/80 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo und Marke */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-blue-600">MeinLogo</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`transition-colors duration-300 ${
                  pathname === link.href
                    ? 'text-blue-600 font-medium'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {/* Auth Buttons Desktop */}
            <div className="ml-4 flex items-center">
              {isLoading ? (
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
              ) : user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <FaUser size={16} />
                    </div>
                    <span className="text-sm font-medium">{user.username}</span>
                  </div>
                  <button
                    onClick={deleteSessionTokenCookie}
                    className="flex items-center text-sm text-gray-600 hover:text-blue-600"
                  >
                    <FaSignOutAlt size={16} className="mr-1" />
                    <span>Abmelden</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => redirect('/login')}
                  className="flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-300"
                >
                  <FaSignInAlt size={16} className="mr-1" />
                  <span>Anmelden</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            {!isMenuOpen ? (
              <button
              title='Open Menu'
                onClick={toggleMenu}
                className="p-2 rounded-md text-gray-600 hover:text-blue-600 focus:outline-none"
              >
                <FaBars size={24} />
              </button>
            ) : (
              <button
              title='Close Menu'
                onClick={toggleMenu}
                className="p-2 rounded-md text-gray-600 hover:text-blue-600 focus:outline-none"
              >
                <FaTimes size={24} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === link.href
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}

            {/* Auth Buttons Mobile */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              {isLoading ? (
                <div className="w-full py-2 flex justify-center">
                  <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                </div>
              ) : user ? (
                <div className="px-3 py-2">
                  <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        <FaUser size={16} />
                      </div>
                    <div>
                      <p className="text-sm font-medium">{user.username}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      deleteSessionTokenCookie();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    <FaSignOutAlt size={16} className="mr-2" />
                    <span>Abmelden</span>
                  </button>
                </div>
              ) : (
                <div className="px-3 py-2">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      redirect('/login');
                    }}
                    className="w-full flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    <FaSignInAlt size={16} className="mr-2" />
                    <span>Anmelden</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;