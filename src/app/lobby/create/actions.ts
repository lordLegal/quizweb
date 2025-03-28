'use server';

import { PrismaClient } from '@prisma/client';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

// Hilfsfunktion zum Mischen eines Arrays (Fisher-Yates)
function shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export async function createLobby(formData: FormData) {
  const hostId = Number(formData.get('hostId'));
  const hostNickname = formData.get('hostNickname')?.toString() || null;
  const maxPlayers = Number(formData.get('maxPlayers'));
  // Zuerst: quizId aus dem Formular lesen, falls vorhanden
  let quizId = formData.get('quizId')?.toString() || null;

  if (!hostId || !maxPlayers) {
    throw new Error('Fehlende Felder: hostId und maxPlayers müssen angegeben werden.');
  }

  // Prüfe, ob eine CSV-Datei hochgeladen wurde
  const csvFile = formData.get('questionsCSV');
  if (csvFile && typeof csvFile !== 'string' && await (csvFile as File).text() !== '') {
    // Lese den CSV-Inhalt
    const csvText = await (csvFile as File).text();
    
    const records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
    });
    // Erstelle ein neues Quiz basierend auf dem CSV-Inhalt
    const customQuiz = await prisma.quiz.create({
      data: {
        title: "Custom Quiz",
        description: "Fragen aus CSV hochgeladen",
        isPublic: false,
        creatorId: hostId,
      },
    });
    // Erstelle zu jeder CSV-Zeile eine Frage mit Optionen
    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const frageText = row.question;
      const korrekteAntwort = row.correct_answer;
      const falscheAntworten = [row.wrong_answer_1, row.wrong_answer_2, row.wrong_answer_3];
      const optionen = [
        { text: korrekteAntwort, isCorrect: true },
        ...falscheAntworten.map((text: string) => ({ text, isCorrect: false })),
      ];
      // Mische die Optionen
      const gemischteOptionen = shuffle(optionen);
      
      await prisma.question.create({
        data: {
          text: frageText,
          explanation: null,
          points: 1,
          type: "MULTIPLE_CHOICE",
          quizId: customQuiz.id,
          orderIndex: i + 1,
          options: {
            create: gemischteOptionen.map((option, idx) => ({
              text: option.text,
              isCorrect: option.isCorrect,
              orderIndex: idx,
            })),
          },
        },
      });
    }
    // Setze quizId auf die ID des neu erstellten Quiz
    quizId = customQuiz.id;
  }

  if (quizId) {
    // Überprüfe, ob das Quiz existiert
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });
    if (!quiz) {
      throw new Error('Das angegebene Quiz existiert nicht.');
    }
  }

  // Erstelle die Lobby
  const lobby = await prisma.lobby.create({
    data: {
      hostId,
      quizId,
      maxPlayers,
      status: 'WAITING',
    },
  });

  // Trage den Gastgeber als ersten Teilnehmer ein
  await prisma.lobbyParticipant.create({
    data: {
      lobbyId: lobby.id,
      userId: hostId,
      nickname: hostNickname,
    },
  });

  return lobby;
}
