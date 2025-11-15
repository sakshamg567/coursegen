import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

import type { Tables } from "@/lib/types";
import Link from "next/link";
import { ArrowRight, RefreshCw } from "lucide-react";

type Lesson = Tables<"lessons">;

export default function LessonCard({
  lesson,
  lessonId,
  lessonNumber,
}: {
  lesson: any;
  lessonId?: number;
  lessonNumber: number;
}) {
  const [lessonStatus, setLessonStatus] = useState<string | null>(
    lesson.status || "pending",
  );
  const [isReady, setIsReady] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!lessonId) return;

    // Fetch initial lesson status
    const fetchLesson = async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("status, compiled_js_url, error")
        .eq("id", lessonId)
        .single();

      if (data) {
        setLessonStatus(data.status);
        setIsReady(data.status === "completed" && !!data.compiled_js_url);
        setErrorMessage(data.error);
      }
    };

    fetchLesson();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`lesson-${lessonId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "lessons",
          filter: `id=eq.${lessonId}`,
        },
        (payload) => {
          const newLesson = payload.new as Lesson;
          setLessonStatus(newLesson.status);
          setIsReady(
            newLesson.status === "completed" && !!newLesson.compiled_js_url,
          );
          setErrorMessage(newLesson.error);
          if (newLesson.status !== "failed") {
            setIsRetrying(false);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [lessonId, supabase]);

  const handleRetry = async () => {
    if (!lessonId || isRetrying) return;

    setIsRetrying(true);
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
      setIsRetrying(false);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to retry lesson generation",
      );
    }
  };

  return (
    <div className="p-3 rounded border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 dark:text-white">
            Lesson {lessonNumber}: {lesson.title}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {lesson.objective}
          </div>

          {/* Show error message if failed */}
          {lessonStatus === "failed" && errorMessage && (
            <div className="mt-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
              <strong>Error:</strong> {errorMessage}
            </div>
          )}
        </div>

        {/* Link to lesson when ready */}
        {isReady && lessonId ? (
          <Link
            href={`/lesson/${lessonId}`}
            className="flex-shrink-0 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors flex flex-row items-center"
          >
            View Lesson {<ArrowRight className="scale-75" />}
          </Link>
        ) : (
          <div className="flex items-center gap-2">
            <LessonStatusBadge status={lessonStatus} />
            {lessonStatus === "failed" && lessonId && (
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="flex-shrink-0 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors flex flex-row items-center gap-1"
                title="Retry lesson generation"
              >
                <RefreshCw
                  className={`w-3 h-3 ${isRetrying ? "animate-spin" : ""}`}
                />
                {isRetrying ? "Retrying..." : "Retry"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function LessonStatusBadge({ status }: { status: string | null }) {
  if (!status || status === "pending") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
        <span>Pending</span>
      </div>
    );
  }

  if (status === "generating" || status === "processing") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
        <div className="animate-spin rounded-full h-2 w-2 border border-blue-600 border-t-transparent"></div>
        <span>Generating...</span>
      </div>
    );
  }

  if (status === "completed") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">
        <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
        <span>Ready</span>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs rounded-full">
        <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
        <span>Failed</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
      <span>{status}</span>
    </div>
  );
}
