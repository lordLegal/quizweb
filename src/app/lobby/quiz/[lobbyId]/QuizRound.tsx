"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
import { startQuizAttempt, finishQuizAttempt } from "./actions"; // Server Actions

export interface QuizRoundProps {
  lobbyId: string;
  quizId: string;          // Damit wir wissen, welches Quiz wir spielen
  questions: Question[];   // Alle Fragen
  totalTime: number;       // Gesamtzeit in Sekunden
  currentUser: number;     // Current user identifier
}

export default function QuizRound({ lobbyId, quizId, questions, totalTime, currentUser }: QuizRoundProps) {
  const router = useRouter();
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  // Beim Mounten: Attempt starten
  useEffect(() => {
    async function createAttempt() {
      
      
      const attempt = await startQuizAttempt(currentUser, quizId);
      setAttemptId(attempt.id);
    }
    createAttempt();
  }, [quizId]);

  // Gesamt-Timer
  useEffect(() => {
    if (finished) return;
    if (timeLeft <= 0) {
      handleFinish();
      return;
    }
    const timer = setTimeout(() => setTimeLeft(time => time - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, finished]);

  function handleAnswer(option: Option) {
    if (finished) return;
    if (option.isCorrect) {
      setScore(s => s + 1);
    }
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
    } else {
      handleFinish();
    }
  }

  async function handleFinish() {
    setFinished(true);
    if (!attemptId) return; // Falls noch kein Attempt erstellt wurde
    // Hier rufst du finishQuizAttempt auf und übergibst den finalen Score
    await finishQuizAttempt(attemptId, score);
    // Dann leitest du zum Dashboard weiter
    router.push(`/lobby/quiz/${lobbyId}/dashboard`);
  }

  const currentQuestion = questions[currentQuestionIndex];

  if (!currentQuestion) {
    return <div>Keine Fragen verfügbar.</div>;
  }

  return (
    <div className="p-4">
      <h2>Frage {currentQuestionIndex + 1} / {questions.length}</h2>
      <p>Verbleibende Zeit: {timeLeft} Sekunden</p>
      <p>Punkte: {score}</p>

      <div className="mt-4 p-4 bg-white rounded shadow">
        <p className="mb-4 font-bold text-xl">{currentQuestion.text}</p>
        {currentQuestion.options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => handleAnswer(opt)}
            disabled={finished}
            className="block w-full mb-2 bg-blue-600 text-white py-2 rounded"
          >
            {opt.text}
          </button>
        ))}
      </div>
    </div>
  );
}
