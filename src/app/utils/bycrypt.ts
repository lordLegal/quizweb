// lib/bcrypt-env-middleware.ts

/**
 * Bereitet die URL für bcrypt API-Aufrufe vor
 * - Wenn im Browser: Relative URL verwenden
 * - Wenn im Server: NEXTAUTH_URL aus Umgebungsvariablen verwenden
 */
export function getBcryptApiUrl(): string {
  // In einem Browser
  if (typeof window !== 'undefined') {
    return '/api/auth/bcrypt';
  }
  
  // In einer Server-Komponente oder Server-Funktion
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  return `${baseUrl}/api/auth/bcrypt`;
}

/**
 * Hasht ein Passwort über die bcrypt API
 */
export async function hashPassword(password: string): Promise<string> {
  const apiUrl = getBcryptApiUrl();
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      action: 'hash', 
      password 
    }),
  });
  
  if (!response.ok) {
    throw new Error('Fehler beim Hashen des Passworts');
  }
  
  const data = await response.json();
  return data.hash;
}

/**
 * Vergleicht ein Passwort mit einem Hash über die bcrypt API
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  const apiUrl = getBcryptApiUrl();
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      action: 'compare', 
      password, 
      hash 
    }),
  });
  
  if (!response.ok) {
    throw new Error('Fehler beim Vergleichen des Passworts');
  }
  
  const data = await response.json();
  return data.match;
}