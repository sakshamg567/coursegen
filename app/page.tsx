"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import { Weather } from "@/components/weather";
import { DefaultChatTransport } from "ai";

export default function Page() {
  const [input, setInput] = useState("");
  const userId = "1234";
  const { messages, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      body: { userId },
    }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage({ text: input });
    setInput("");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          AI Course Generator
        </h1>

        {/* Messages */}
        <div className="space-y-4 mb-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`p-4 rounded-lg ${
                message.role === "user"
                  ? "bg-blue-100 dark:bg-blue-900 ml-12"
                  : "bg-white dark:bg-gray-800 mr-12"
              }`}
            >
              <div className="font-semibold mb-2 text-gray-900 dark:text-white">
                {message.role === "user" ? "You" : "AI"}
              </div>
              <div className="text-gray-800 dark:text-gray-200">
                {message.parts.map((part, index) => {
                  // Text content
                  if (part.type === "text") {
                    return <div key={index}>{part.text}</div>;
                  }

                  // Weather tool (keep your existing one)
                  if (part.type === "tool-displayWeather") {
                    switch (part.state) {
                      case "input-available":
                        return <div key={index}>Loading weather...</div>;
                      case "output-available":
                        return (
                          <div key={index}>
                            <Weather {...part.output} />
                          </div>
                        );
                      case "output-error":
                        return <div key={index}>Error: {part.errorText}</div>;
                      default:
                        return null;
                    }
                  }

                  // Course generation tool
                  if (part.type === "tool-generateCoursePlan") {
                    switch (part.state) {
                      case "input-available":
                        return (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-blue-600 dark:text-blue-400"
                          >
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            Generating course plan...
                          </div>
                        );
                      case "output-available":
                        return (
                          <CoursePlanDisplay key={index} output={part.output} />
                        );
                      case "output-error":
                        return (
                          <div
                            key={index}
                            className="text-red-600 dark:text-red-400"
                          >
                            Error: {part.errorText}
                          </div>
                        );
                      default:
                        return null;
                    }
                  }

                  return null;
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Try: "Create a course on Python with 5 lessons"'
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

// Component to display course plan
function CoursePlanDisplay({ output }: { output: any }) {
  const { course_plan, course_id, success } = output;

  if (!success || !course_plan) {
    return (
      <div className="text-red-600 dark:text-red-400">
        Failed to generate course plan
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
      <div className="flex items-center gap-2 mb-3">
        <svg
          className="w-5 h-5 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="font-semibold text-green-800 dark:text-green-200">
          Course Created! ID: {course_id}
        </span>
      </div>

      <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">
        {course_plan.topic}
      </h3>

      <div className="space-y-3">
        {course_plan.lessons.map((lesson: any, idx: number) => (
          <div
            key={idx}
            className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
          >
            <div className="font-medium text-gray-900 dark:text-white">
              Lesson {idx + 1}: {lesson.title}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {lesson.objective}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
