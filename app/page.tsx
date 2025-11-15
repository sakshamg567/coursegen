"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useEffect, useRef } from "react";
import { DefaultChatTransport } from "ai";
import { useUser } from "./hooks/useUser";
import {
  loadMessagesFromStorage,
  clearChatHistory,
} from "./hooks/useChatPersistence";
import LessonCard from "@/components/ui/LessonDisp";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Input } from "@/components/ui/input";
const CHAT_STORAGE_KEY = "ai-course-chat-messages";
const CHAT_VERSION = "1";

export default function Page() {
  const [input, setInput] = useState("");
  const [mounted, setMounted] = useState(false);
  const userId = useUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages synchronously on client
  const getInitialMessages = () => {
    if (typeof window === "undefined") return [];
    return loadMessagesFromStorage();
  };

  const { messages, sendMessage, setMessages } = useChat({
    transport: new DefaultChatTransport({
      body: { userId },
    }),
    initialMessages: getInitialMessages(),
  });

  // Mark as mounted and restore messages
  useEffect(() => {
    const savedMessages = loadMessagesFromStorage();
    if (savedMessages.length > 0) {
      console.log("Restoring messages:", savedMessages);
      setMessages(savedMessages);
    }
    setMounted(true);
  }, [setMessages]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (!mounted || messages.length === 0) return;

    try {
      const stored = {
        version: CHAT_VERSION,
        messages,
        timestamp: Date.now(),
      };
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(stored));
      console.log("Saved", messages.length, "messages to localStorage");
    } catch (error) {
      console.error("Failed to save chat messages:", error);
    }
  }, [messages, mounted]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput("");
  };

  const handleClearChat = () => {
    if (confirm("Are you sure you want to clear the chat history?")) {
      clearChatHistory();
      setMessages([]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      <div className="max-w-4xl mx-auto w-full flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            AI Course Generator
          </h1>

          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              Clear Chat
            </button>
          )}
        </div>

        {/* Messages - Scrollable area */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-600 mb-4">
                  <svg
                    className="w-16 h-16 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  No messages yet
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Start by describing the course you'd like to create
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  key={message.id}
                  className={`p-2 rounded-2xl ${
                    message.role === "user" ? "bg-[#1f1f1f]" : ""
                  }`}
                >
                  <div className="text-gray-800 dark:text-gray-200 leading-relaxed tracking-wide">
                    {message.parts?.map((part, index) => {
                      // Text content
                      if (part.type === "text") {
                        return (
                          <ReactMarkdown
                            children={part.text}
                            key={index}
                            remarkPlugins={[remarkGfm]}
                          />
                        );
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
                              <CoursePlanDisplay
                                key={index}
                                output={part.output}
                              />
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
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Fixed Input Form at bottom */}
        <div className="border-gray-200 dark:border-gray-700 bg-transparent p-6">
          <form
            onSubmit={handleSubmit}
            className="flex flex-row gap-2 bg-[#121212] items-center rounded-md p-2 border border-border h-15 min-h-15"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='Try: "Create a course on Python with 5 lessons"'
              className="flex-1 px-4 py-3 focus:ring-0 border-0 text-gray-900 dark:text-white focus:border-0 focus-visible:ring-0 shadow-none"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-1 pl-1.5 aspect-square flex items-center justify-center bg-white disabled:border disabled:border-border hover:bg-blue-700 disabled:bg-transparent disabled:cursor-not-allowed font-medium rounded-lg transition-colors scale-75"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="32"
                viewBox="0 0 15 16"
              >
                <path
                  fill={`${!input.trim() ? "#454545" : "#000000"}`}
                  d="M12.49 7.14L3.44 2.27c-.76-.41-1.64.3-1.4 1.13l1.24 4.34q.075.27 0 .54l-1.24 4.34c-.24.83.64 1.54 1.4 1.13l9.05-4.87a.98.98 0 0 0 0-1.72Z"
                />
              </svg>{" "}
            </button>
          </form>

          {messages.length > 0 && (
            <div className="mb-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                💾 Chat history is saved automatically
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Component to display course plan
function CoursePlanDisplay({ output }: { output: any }) {
  const { course_plan, course_id, success, lesson_ids } = output;

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
          <LessonCard
            key={idx}
            lesson={lesson}
            lessonId={lesson_ids?.[idx]}
            lessonNumber={idx + 1}
          />
        ))}
      </div>
    </div>
  );
}
