// components/blocks/QuizComponent.tsx
import { useState } from "react";

type QuizQuestion = {
  id: number;
  question: string;
  options: string[];
  correct: string;
};

type QuizComponentProps = {
  questions: QuizQuestion[];
  onComplete?: (score: number) => void;
};

export const QuizComponent = ({
  questions,
  onComplete,
}: QuizComponentProps) => {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    const score = questions.reduce(
      (acc, q) => (answers[q.id] === q.correct ? acc + 1 : acc),
      0,
    );
    setSubmitted(true);
    onComplete?.(score);
  };

  if (submitted)
    return (
      <div className="p-4 rounded bg-green-50 border border-green-300">
        <h2 className="font-bold mb-2">Quiz Complete!</h2>
        <p>
          Your score:{" "}
          {
            Object.values(answers).filter((a, i) => a === questions[i].correct)
              .length
          }
        </p>
      </div>
    );

  return (
    <div className="space-y-6">
      {questions.map((q) => (
        <div key={q.id} className="p-4 border rounded">
          <h3 className="font-semibold mb-2">
            {q.id}. {q.question}
          </h3>
          {q.options.map((option) => (
            <label key={option} className="block">
              <input
                type="radio"
                name={`q-${q.id}`}
                value={option}
                onChange={() =>
                  setAnswers((prev) => ({ ...prev, [q.id]: option }))
                }
              />
              <span className="ml-2">{option}</span>
            </label>
          ))}
        </div>
      ))}

      <button
        onClick={handleSubmit}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Submit
      </button>
    </div>
  );
};
