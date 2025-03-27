// app/lobby/quiz/[lobbyId]/QuizRound.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
  questions: Question[];
  timerDuration: number;
}

export default function QuizRound({ lobbyId, questions, timerDuration }: QuizRoundProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timerDuration);
  const [score, setScore] = useState(0);
  const router = useRouter();

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      handleNextQuestion();
    }
  }, [timeLeft]);

  function handleNextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTimeLeft(timerDuration);
    } else {
      router.push(`/lobby/quiz/${lobbyId}/dashboard?score=${score}`);
    }
  }

  function handleAnswer(optionId: string) {
    const selectedOption = currentQuestion.options.find(o => o.id === optionId);
    if (selectedOption && selectedOption.isCorrect) {
      setScore(prev => prev + 1);
    }
    handleNextQuestion();
  }

  if (!currentQuestion) {
    return <div>Keine Fragen verfügbar.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-12">
      <h2 className="text-2xl font-bold mb-4">
        Frage {currentQuestionIndex + 1} von {questions.length}
      </h2>
      <div className="mb-4 p-4 bg-white rounded shadow">
        <p className="text-xl mb-4">{currentQuestion.text}</p>
        {currentQuestion.options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleAnswer(option.id)}
            className="block bg-blue-600 text-white py-2 px-4 rounded mb-2 w-full"
          >
            {option.text}
          </button>
        ))}
      </div>
      <div className="mb-4">
        <p>Zeit verbleibend: {timeLeft} Sekunden</p>
      </div>
      <div>
        <p>Aktuelle Punkte: {score}</p>
      </div>
    </div>
  );
}
