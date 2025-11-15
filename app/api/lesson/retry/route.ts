import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { type Database } from "@/lib/types";
import { inngest } from "@/inngest/client";

// Create a Supabase client with service role for server-side operations
function createServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

export async function POST(request: NextRequest) {
  try {
    const { lessonId } = await request.json();

    if (!lessonId) {
      return NextResponse.json(
        { error: "Lesson ID is required" },
        { status: 400 },
      );
    }

    const supabase = createServiceClient();

    // Fetch the lesson details including the previous error
    const { data: lesson, error: fetchError } = await supabase
      .from("lessons")
      .select("*")
      .eq("id", lessonId)
      .single();

    if (fetchError || !lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Reset the lesson status to pending
    const { error: updateError } = await supabase
      .from("lessons")
      .update({
        status: "pending",
        error: null,
      })
      .eq("id", lessonId);

    if (updateError) {
      throw new Error(`Failed to update lesson: ${updateError.message}`);
    }

    // Trigger the Inngest event with the previous error context
    await inngest.send({
      name: "lesson.generate",
      data: {
        lesson_id: lesson.id,
        title: lesson.title,
        objective: lesson.objective,
        course_id: lesson.course_id,
        previous_error: lesson.error, // Include the previous error
        is_retry: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Lesson generation retry triggered",
      lessonId,
    });
  } catch (error) {
    console.error("Error retrying lesson:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to retry lesson",
      },
      { status: 500 },
    );
  }
}
