// my-app/lib/ai/tools.ts
import z from "zod";
import { tool } from "ai";
import * as ai from "ai";
import { google } from "@ai-sdk/google";
import { wrapAISDK } from "langsmith/experimental/vercel";
import { createClient } from "@supabase/supabase-js";
import { inngest } from "@/inngest/client";
import { Database } from "@/lib/types";
const { generateObject } = wrapAISDK(ai);

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

// Extract the logic into a standalone function
export async function generateLessonFromOutline({
  outline,
  userId,
}: {
  outline: string;
  userId: string;
}) {
  const supabase = createServiceClient();
  console.log("Generating lesson for:", {
    outline,
    userId,
  });

  const { object } = await generateObject({
    model: google("gemini-flash-lite-latest"),
    schema: z.object({
      lesson: z.object({
        objective: z.string().describe("Learning objective of the lesson"),
        title: z
          .string()
          .describe(
            "40-50 character title for the lesson based on provided outline",
          ),
      }),
    }),
    prompt: `Create a lesson breakdown for the following outline:

"${outline}"

Generate exactly 1 lesson that cover this topic comprehensively.
The lesson should have a clear title and specific learning objective.

Course Outline: ${outline}

Generate the lesson structure now.
- Never return an array.
- Never return more than one lesson.
- The lesson must be fully self-contained.
`,
  });

  console.log("Generated lesson plan:", JSON.stringify(object, null, 2));

  // Insert into Supabase
  const { data: lesson, error: error } = await supabase
    .from("lessons")
    .insert({
      title: object.lesson.title,
      objective: object.lesson.objective,
      status: "pending",
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    console.error("Error inserting lesson:", error);
    throw new Error(`Failed to store lesson: ${error.message}`);
  }

  inngest.send({
    name: "lesson.generate",
    data: {
      lesson_id: lesson.id,
      title: lesson.title,
      objective: lesson.objective,
      user_id: lesson.user_id,
    },
  });

  console.log(`Triggered Inngest event for lesson : ${lesson.title}`);

  return {
    lesson: object,
    lesson_id: lesson.id,
    success: true,
    message: `Created lesson ${lesson.title}`,
  };
}

// Keep the tool for AI SDK usage
export const generate_lesson = tool({
  name: "generate_lesson",
  description: "Formulate a topic into a designed structured lessons",
  inputSchema: z.object({
    outline: z
      .string()
      .describe("The outline of the lesson provided by the user"),
    userId: z.string().describe("The ID of the user creating the course"),
  }),
  execute: async function ({ outline, userId }) {
    return generateLessonFromOutline({ outline, userId });
  },
});
