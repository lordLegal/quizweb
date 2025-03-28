'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { startQuizAttempt, finishQuizAttempt } from "./actions"; // Server Actions

export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  text: string;
  options: Option[];
}

export interface QuizRoundProps {
  lobbyId: string;
  quizId: string;        // Damit wir wissen, welches Quiz gespielt wird
  questions: Question[]; // Alle Fragen
  totalTime: number;     // Gesamtzeit in Sekunden
  currentUser: number;   // Aktuelle User-ID (0 bei Nickname-User)
}

export default function QuizRound({ lobbyId, quizId, questions, totalTime, currentUser }: QuizRoundProps) {
  const router = useRouter();
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  // Beim Mounten: Starte den Attempt – auch für Nickname-User (currentUser === 0)
  useEffect(() => {
    async function createAttempt() {
      const attempt = await startQuizAttempt(currentUser, quizId);
      setAttemptId(attempt.id);
    }
    createAttempt();
  }, [quizId, currentUser]);

  // Gesamt-Timer: läuft von totalTime herunter
  useEffect(() => {
    if (finished) return;
    if (timeLeft <= 0) {
      handleFinish();
      return;
    }
    const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, finished]);

  function handleAnswer(optionId: string) {
    if (finished) return;
    const selectedOption = questions[currentQuestionIndex].options.find(o => o.id === optionId);
    if (selectedOption && selectedOption.isCorrect) {
      setScore(prev => prev + 1);
    }
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleFinish();
    }
  }

  async function handleFinish() {
    setFinished(true);
    if (!attemptId) return;
    await finishQuizAttempt(attemptId, score);
    // Weiterleitung zum Dashboard (im Dashboard kannst du dann z.B. den Nickname anzeigen, falls currentUser === 0)
    router.push(`/lobby/quiz/${lobbyId}/dashboard`);
  }

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) {
    return <div>Keine Fragen verfügbar.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-12">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">
          Frage {currentQuestionIndex + 1} von {questions.length}
        </h2>
        <p className="text-lg text-gray-600">
          Verbleibende Zeit: {timeLeft} Sekunden
        </p>
        <p className="text-lg text-gray-600">Aktuelle Punkte: {score}</p>
      </div>
      <div className="mt-4 p-4 bg-white rounded shadow w-full max-w-md">
        <p className="mb-4 font-bold text-xl">{currentQuestion.text}</p>
        {currentQuestion.options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleAnswer(option.id)}
            disabled={finished}
            className="block w-full mb-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
          >
            {option.text}
          </button>
        ))}
      </div>
    </div>
  );
}
