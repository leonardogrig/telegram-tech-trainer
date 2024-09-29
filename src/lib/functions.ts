import { lastQuestionTimeForQuestion, quizInterval } from "..";

export function getTimeInfo(): {
  minutesRemaining: number;
  secondsRemaining: number;
} {
  const currentTime = Date.now();
  const timeElapsed = currentTime - lastQuestionTimeForQuestion;
  const timeRemaining = quizInterval - timeElapsed;
  return {
    minutesRemaining: Math.floor(timeRemaining / 60000),
    secondsRemaining: Math.floor((timeRemaining % 60000) / 1000),
  };
}

export function shuffleQuestions(questions: Question[]): Question[] {
  let shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getNextQuestion(
  questions: Question[],
  currentIndex: number
): [Question, number] {
  if (currentIndex >= questions.length) {
    questions = shuffleQuestions(questions);
    currentIndex = 0;
  }
  return [questions[currentIndex], currentIndex + 1];
}
