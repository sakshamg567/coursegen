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

export const generateCoursePlan = tool({
  name: "generate_course_plan",
  description: "Break a topic into multiple structured lessons",
  inputSchema: z.object({
    outline: z
      .string()
      .describe("The outline of the course provided by the user"),
    lesson_count: z.number().describe("Number of lessons to generate"),
    userId: z.string().describe("The ID of the user creating the course"),
  }),
  execute: async function ({ outline, lesson_count, userId }) {
    const supabase = createServiceClient();
    console.log("Generating course plan for:", {
      outline,
      lesson_count,
      userId,
    });

    const { object } = await generateObject({
      model: google("gemini-flash-latest"),
      schema: z.object({
        topic: z
          .string()
          .describe(
            "50-80 Words title for the course based on provided outline",
          ),
        lessons: z.array(
          z.object({
            title: z.string().describe("The title of the topic to generate"),
            objective: z.string().describe("Learning objective of the lesson"),
          }),
        ),
      }),
      prompt: `Create a course breakdown for the following outline:

"${outline}"

Generate exactly ${lesson_count} lessons that cover this topic comprehensively.
Each lesson should have a clear title and specific learning objective.

Course Outline: ${outline}
Number of Lessons: ${lesson_count}

Generate the course structure now.`,
    });

    console.log("Generated course plan:", JSON.stringify(object, null, 2));

    // Insert into Supabase
    const { data: data, error: error } = await supabase
      .from("courses")
      .insert({
        topic: object.topic,
        outline: outline,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      console.error("Error inserting course:", error);
      throw new Error(`Failed to store course: ${error.message}`);
    }

    const lessonInserts: Database["public"]["Tables"]["lessons"]["Insert"][] =
      object.lessons.map((lesson, index) => ({
        course_id: data.id,
        title: lesson.title,
        objective: lesson.objective,
        status: "pending",
      }));

    const { data: lessons, error: lessonsError } = await supabase
      .from("lessons")
      .insert(lessonInserts)
      .select();

    if (lessonsError) {
      throw new Error(`Failed to store lessons : ${lessonsError.message}`);
    }

    console.log(`Created ${lessons.length} lesson entries`);

    const eventPromises = lessons.map((lesson) =>
      inngest.send({
        name: "lesson.generate",
        data: {
          lesson_id: lesson.id,
          title: lesson.title,
          objective: lesson.objective,
          course_id: data.id,
        },
      }),
    );

    await Promise.all(eventPromises);
    console.log(`Triggered ${eventPromises.length} Inngest events`);

    return {
      course_plan: object,
      course_id: data?.id,
      lesson_ids: lessons.map((l) => l.id),
      lesson_count: lessons.length,
      success: true,
      message: `Created Course ${object.topic} with ${lessons.length} lessons`,
    };
  },
});

export const generate_svg_tool = tool({
  name: "generate_svg",
  description: "Generate a clean educational SVG diagram",
  inputSchema: z.object({
    prompt: z
      .string()
      .describe(
        "Detailed instructions describing what the diagram should show",
      ),
  }),
  execute: async ({ prompt }) => {
    // INTERNAL strict SVG generation prompt
    const svgDirective = `
You are an SVG diagram generator.

Your ONLY task is to output a SINGLE <svg> element that contains the diagram.

HARD REQUIREMENTS:
- Output ONLY valid inline SVG markup.
- The ENTIRE response MUST be exactly: <svg> ... </svg>
- NO backticks, NO markdown, NO explanations, NO comments.
- Black 2px strokes only.
- No gradients, filters, clipPaths, masks, CSS, <defs>, external references.
- Use simple primitives only: <line>, <circle>, <rect>, <path>, <polygon>.
- Center the diagram and make it readable.
- Use explicit width="600" height="300" and a matching viewBox.

User diagram request:
${prompt}
    `.trim();

    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: z.object({
        svg: z
          .string()
          .describe("The final SVG diagram. Must be a single <svg> element."),
      }),
      prompt: svgDirective,
    });

    return { svg: object.svg };
  },
});
