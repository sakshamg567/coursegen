import { generateCoursePlan } from "@/lib/ai/tools";
import { google } from "@ai-sdk/google";
import * as ai from "ai";
import { stepCountIs } from "ai";
import { wrapAISDK } from "langsmith/experimental/vercel";

const { streamText } = wrapAISDK(ai);

export async function POST(req: Request) {
  const { messages, userId }: { messages: ai.UIMessage[]; userId: string } =
    await req.json();
  console.log("userId: ", userId);

  const result = streamText({
    model: google("gemini-flash-latest"),
    system: `You are a helpful educational assistant that helps users create structured courses.

When a user asks to create a course or lessons, you MUST:
0. Just generate some pretext, like whatever, a bit about topic 2-3 liners are enough.
1. Call the generateCoursePlan
2. Wait for the tool result
3. Explain to the user what was created based on the tool output
4. Include the course_id from the tool result in your response

Always acknowledge the course creation and provide details about the generated lessons.`,
    messages: ai.convertToModelMessages(messages),
    tools: {
      generateCoursePlan,
    },
    stopWhen: stepCountIs(5), // Allow multiple steps for tool calling
    experimental_transform: ai.smoothStream(),
  });

  return result.toUIMessageStreamResponse();
}
