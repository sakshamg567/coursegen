"use client";
import { useState } from "react";
export default function LessonComponent() {
  const [currentExample, setCurrentExample] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const examples = [
    {
      title: "Train and Platform",
      scenario: "You're sitting on a train moving at 60 km/h. A person on the platform sees you moving at 60 km/h, but you see them moving backward at 60 km/h.",
      explanation: "Motion depends on your reference frame. From the platform (stationary frame), you're moving. From the train (moving frame), the platform appears to move."
    },
    {
      title: "Walking on a Moving Train",
      scenario: "You walk forward at 5 km/h inside a train moving at 60 km/h. To someone on the platform, you're moving at 65 km/h forward.",
      explanation: "Velocities add when moving in the same direction. Your velocity relative to the ground = train velocity + your velocity relative to train."
    },
    {
      title: "Two Cars Approaching",
      scenario: "Car A moves east at 50 km/h, Car B moves west at 40 km/h. From Car A's perspective, Car B approaches at 90 km/h.",
      explanation: "When objects move toward each other, their relative velocity is the sum of their individual speeds."
    }
  ];
  const quizQuestions = [
    {
      id: 1,
      question: "A passenger walks at 3 m/s toward the front of a train moving at 20 m/s. What is the passenger's speed relative to the ground?",
      options: ["17 m/s", "20 m/s", "23 m/s", "3 m/s"],
      correct: "23 m/s"
    },
    {
      id: 2,
      question: "Two cars approach each other. Car A travels at 60 km/h, Car B at 40 km/h. What is their relative speed?",
      options: ["20 km/h", "50 km/h", "100 km/h", "60 km/h"],
      correct: "100 km/h"
    },
    {
      id: 3,
      question: "What is a reference frame?",
      options: ["A type of motion", "A coordinate system used to describe motion", "The speed of an object", "A force acting on objects"],
      correct: "A coordinate system used to describe motion"
    }
  ];
  const handleQuizAnswer = (questionId, answer) => {
    setQuizAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };
  const handleQuizSubmit = () => {
    const newScore = quizQuestions.reduce(
      (acc, q) => quizAnswers[q.id] === q.correct ? acc + 1 : acc,
      0
    );
    setScore(newScore);
    setQuizSubmitted(true);
  };
  const resetQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setScore(0);
  };
  if (showQuiz) {
    return /* @__PURE__ */ React.createElement("div", { className: "max-w-4xl mx-auto p-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-8" }, /* @__PURE__ */ React.createElement("h1", { className: "text-3xl font-bold text-gray-800" }, "Relative Motion Quiz"), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setShowQuiz(false),
        className: "px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
      },
      "Back to Lesson"
    )), !quizSubmitted ? /* @__PURE__ */ React.createElement("div", { className: "space-y-8" }, quizQuestions.map((q) => /* @__PURE__ */ React.createElement("div", { key: q.id, className: "bg-white p-6 rounded-lg shadow-md border" }, /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-semibold mb-4 text-gray-800" }, q.id, ". ", q.question), /* @__PURE__ */ React.createElement("div", { className: "space-y-2" }, q.options.map((option) => /* @__PURE__ */ React.createElement("label", { key: option, className: "flex items-center space-x-3 cursor-pointer" }, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "radio",
        name: `question-${q.id}`,
        value: option,
        checked: quizAnswers[q.id] === option,
        onChange: () => handleQuizAnswer(q.id, option),
        className: "w-4 h-4 text-blue-600"
      }
    ), /* @__PURE__ */ React.createElement("span", { className: "text-gray-700" }, option)))))), /* @__PURE__ */ React.createElement("div", { className: "flex justify-center" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: handleQuizSubmit,
        disabled: Object.keys(quizAnswers).length !== quizQuestions.length,
        className: "px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
      },
      "Submit Quiz"
    ))) : /* @__PURE__ */ React.createElement("div", { className: "text-center" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white p-8 rounded-lg shadow-md border max-w-md mx-auto" }, /* @__PURE__ */ React.createElement("h2", { className: "text-2xl font-bold mb-4 text-gray-800" }, "Quiz Results"), /* @__PURE__ */ React.createElement("div", { className: "text-4xl font-bold mb-4" }, /* @__PURE__ */ React.createElement("span", { className: score === quizQuestions.length ? "text-green-600" : score >= quizQuestions.length / 2 ? "text-yellow-600" : "text-red-600" }, score, "/", quizQuestions.length)), /* @__PURE__ */ React.createElement("p", { className: "text-gray-600 mb-6" }, score === quizQuestions.length ? "Perfect! You understand relative motion!" : score >= quizQuestions.length / 2 ? "Good job! Review the concepts and try again." : "Keep studying! Relative motion takes practice to master."), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: resetQuiz,
        className: "px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      },
      "Try Again"
    ))));
  }
  return /* @__PURE__ */ React.createElement("div", { className: "max-w-4xl mx-auto p-6" }, /* @__PURE__ */ React.createElement("div", { className: "text-center mb-8" }, /* @__PURE__ */ React.createElement("h1", { className: "text-4xl font-bold text-gray-800 mb-4" }, "Introduction to Motion"), /* @__PURE__ */ React.createElement("h2", { className: "text-2xl text-blue-600 font-semibold" }, "Understanding Relative Motion")), /* @__PURE__ */ React.createElement("div", { className: "bg-blue-50 p-6 rounded-lg mb-8 border-l-4 border-blue-500" }, /* @__PURE__ */ React.createElement("h3", { className: "text-xl font-bold text-blue-800 mb-3" }, "What is Relative Motion?"), /* @__PURE__ */ React.createElement("p", { className: "text-gray-700 text-lg leading-relaxed" }, "Relative motion is the concept that motion is always described relative to a reference frame. An object that appears stationary in one reference frame may appear to be moving in another reference frame.")), /* @__PURE__ */ React.createElement("div", { className: "grid md:grid-cols-2 gap-6 mb-8" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white p-6 rounded-lg shadow-md border" }, /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-bold text-gray-800 mb-3" }, "Key Concepts"), /* @__PURE__ */ React.createElement("ul", { className: "space-y-2 text-gray-700" }, /* @__PURE__ */ React.createElement("li", { className: "flex items-start space-x-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-blue-600 font-bold" }, "\u2022"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("strong", null, "Reference Frame:"), " A coordinate system from which motion is observed")), /* @__PURE__ */ React.createElement("li", { className: "flex items-start space-x-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-blue-600 font-bold" }, "\u2022"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("strong", null, "Relative Velocity:"), " Velocity of one object as seen from another")), /* @__PURE__ */ React.createElement("li", { className: "flex items-start space-x-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-blue-600 font-bold" }, "\u2022"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("strong", null, "Observer:"), " The person or object from whose perspective motion is described")))), /* @__PURE__ */ React.createElement("div", { className: "bg-white p-6 rounded-lg shadow-md border" }, /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-bold text-gray-800 mb-3" }, "Mathematical Relationship"), /* @__PURE__ */ React.createElement("div", { className: "bg-gray-50 p-4 rounded-lg" }, /* @__PURE__ */ React.createElement("p", { className: "text-center text-lg font-mono text-gray-800 mb-2" }, "v", /* @__PURE__ */ React.createElement("sub", null, "AB"), " = v", /* @__PURE__ */ React.createElement("sub", null, "A"), " - v", /* @__PURE__ */ React.createElement("sub", null, "B")), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-gray-600 text-center" }, "Velocity of A relative to B = Velocity of A - Velocity of B")))), /* @__PURE__ */ React.createElement("div", { className: "bg-white p-6 rounded-lg shadow-md border mb-8" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-4" }, /* @__PURE__ */ React.createElement("h3", { className: "text-xl font-bold text-gray-800" }, "Interactive Examples"), /* @__PURE__ */ React.createElement("div", { className: "flex space-x-2" }, examples.map((_, index) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: index,
      onClick: () => setCurrentExample(index),
      className: `w-3 h-3 rounded-full transition-colors ${currentExample === index ? "bg-blue-600" : "bg-gray-300"}`
    }
  )))), /* @__PURE__ */ React.createElement("div", { className: "bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg" }, /* @__PURE__ */ React.createElement("h4", { className: "text-lg font-semibold text-blue-800 mb-3" }, examples[currentExample].title), /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white p-4 rounded-lg border-l-4 border-blue-400" }, /* @__PURE__ */ React.createElement("h5", { className: "font-semibold text-gray-800 mb-2" }, "Scenario:"), /* @__PURE__ */ React.createElement("p", { className: "text-gray-700" }, examples[currentExample].scenario)), /* @__PURE__ */ React.createElement("div", { className: "bg-white p-4 rounded-lg border-l-4 border-green-400" }, /* @__PURE__ */ React.createElement("h5", { className: "font-semibold text-gray-800 mb-2" }, "Explanation:"), /* @__PURE__ */ React.createElement("p", { className: "text-gray-700" }, examples[currentExample].explanation)))), /* @__PURE__ */ React.createElement("div", { className: "flex justify-between mt-4" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setCurrentExample(Math.max(0, currentExample - 1)),
      disabled: currentExample === 0,
      className: "px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
    },
    "Previous"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setCurrentExample(Math.min(examples.length - 1, currentExample + 1)),
      disabled: currentExample === examples.length - 1,
      className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
    },
    "Next"
  ))), /* @__PURE__ */ React.createElement("div", { className: "bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-500 mb-8" }, /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-bold text-yellow-800 mb-3" }, "Real-World Applications"), /* @__PURE__ */ React.createElement("div", { className: "grid md:grid-cols-2 gap-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold text-gray-800 mb-2" }, "Transportation"), /* @__PURE__ */ React.createElement("ul", { className: "text-sm text-gray-700 space-y-1" }, /* @__PURE__ */ React.createElement("li", null, "\u2022 Aircraft navigation in wind"), /* @__PURE__ */ React.createElement("li", null, "\u2022 Ship movement in currents"), /* @__PURE__ */ React.createElement("li", null, "\u2022 Satellite orbital mechanics"))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold text-gray-800 mb-2" }, "Sports & Recreation"), /* @__PURE__ */ React.createElement("ul", { className: "text-sm text-gray-700 space-y-1" }, /* @__PURE__ */ React.createElement("li", null, "\u2022 Ball games (tennis, baseball)"), /* @__PURE__ */ React.createElement("li", null, "\u2022 Racing (relative speeds)"), /* @__PURE__ */ React.createElement("li", null, "\u2022 Swimming in moving water"))))), /* @__PURE__ */ React.createElement("div", { className: "text-center" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setShowQuiz(true),
      className: "px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg"
    },
    "Test Your Understanding"
  )));
}
