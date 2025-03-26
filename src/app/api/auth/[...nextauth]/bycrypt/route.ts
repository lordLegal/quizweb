// app/api/auth/bcrypt/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";


export async function POST(req: NextRequest) {
  try {
    const { action, password, hash } = await req.json();
    
    if (action === "hash") {
      // Passwort hashen
      const saltRounds = 10;
      const hashedPassword = await bcryptjs.hash(password, saltRounds);
      return NextResponse.json({ hash: hashedPassword });
    } 
    else if (action === "compare") {
      // Passwort vergleichen
      const match = await bcryptjs.compare(password, hash);
      return NextResponse.json({ match });
    } 
    else {
      return NextResponse.json(
        { error: "Ungültige Aktion. Verwende 'hash' oder 'compare'." },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("bcrypt API Fehler:", error);
    return NextResponse.json(
      { error: "Fehler bei der Verarbeitung" },
      { status: 500 }
    );
  }
}