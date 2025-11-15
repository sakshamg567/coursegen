"use client";

import { useState, useEffect } from "react";
import { useUser } from "./hooks/useUser";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, RefreshCw, Loader2 } from "lucide-react";
import type { Tables } from "@/lib/types";
import LessonCard from "@/components/ui/LessonDisp";

type Lesson = Tables<"lessons">;

export default function Page() {
  const [outline, setOutline] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [mounted, setMounted] = useState(false);
  const userId = useUser();
  const supabase = createClient();

  // Fetch lessons on mount and when userId is available
  useEffect(() => {
    if (!userId) return;

    const fetchLessons = async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (data) {
        setLessons(data);
      }
    };

    fetchLessons();
    setMounted(true);

    // Subscribe to real-time updates
    const channel = supabase
      .channel("lessons-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "lessons",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setLessons((prev) => [payload.new as Lesson, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setLessons((prev) =>
              prev.map((lesson) =>
                lesson.id === payload.new.id ? (payload.new as Lesson) : lesson,
              ),
            );
          } else if (payload.eventType === "DELETE") {
            setLessons((prev) =>
              prev.filter((lesson) => lesson.id !== payload.old.id),
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outline.trim() || !userId) return;

    setIsGenerating(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: outline }],
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate lesson");
      }

      // Clear the input
      setOutline("");
    } catch (error) {
      console.error("Error generating lesson:", error);
      alert("Failed to generate lesson. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRetry = async (lessonId: number) => {
    try {
      const response = await fetch("/api/lesson/retry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lessonId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to retry lesson");
      }

      console.log("Retry triggered successfully:", data);
    } catch (error) {
      console.error("Error retrying lesson:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to retry lesson generation",
      );
    }
  };

  if (!mounted || !userId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">AI Lesson Generator</h1>
          <p className="">
            Generate interactive educational lessons powered by AI
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-white dark:bg-[#121212] rounded-lg border border-gray-200 dark:border-gray-800 p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="outline"
                className="block text-sm font-medium mb-2"
              >
                Lesson Outline
              </label>
              <Input
                id="outline"
                value={outline}
                onChange={(e) => setOutline(e.target.value)}
                placeholder='e.g., "A one-pager on how to divide with long division"'
                className="w-full"
                disabled={isGenerating}
              />
            </div>
            <Button
              type="submit"
              disabled={!outline.trim() || isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Lesson"
              )}
            </Button>
          </form>
        </div>

        {/* Lessons Table */}
        <div className="bg-white dark:bg-[#121212] rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-semibold ">Your Lessons</h2>
          </div>

          {lessons.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4">
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
              <h3 className="text-lg font-semibold mb-2">No lessons yet</h3>
              <p className="text-sm">
                Create your first lesson using the form above
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="w-full">
                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                  {lessons.map((lesson) => (
                    <LessonCard key={lesson.id} lesson={lesson} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
