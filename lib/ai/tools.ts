import z from "zod";
import { tool } from "ai";
import * as ai from "ai";
import { google } from "@ai-sdk/google";
import { wrapAISDK } from "langsmith/experimental/vercel";
import { createClient } from "@/lib/supabase/server";
import { inngest } from "@/inngest/client";
import { Database } from "@/lib/types";

const { generateObject } = wrapAISDK(ai);

export const generateCoursePlan = tool({
  description: "Break a topic into multiple structured lessons",
  inputSchema: z.object({
    outline: z
      .string()
      .describe("The outline of the course provided by the user"),
    lesson_count: z.number().describe("Number of lessons to generate"),
  }),
  execute: async function ({ outline, lesson_count }) {
    const supabase = await createClient();
    console.log("Generating course plan for:", {
      outline,
      lesson_count,
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
    const userId = "1234";
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

    const lessonInserts: Database["public"]["Tables"]["lessons"]["Insert"] =
      object.lessons.map((lesson, index) => ({
        course_id: data.id,
        title: lesson.title,
        objective: lesson.objective,
        order: index + 1,
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
      lesson_count: lessons.length,
      success: true,
      message: `Created Course ${object.topic} with ${lessons.length} lessons`,
    };
  },
});
