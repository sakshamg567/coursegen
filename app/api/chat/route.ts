// my-app/app/api/chat/route.ts
import { generateLessonFromOutline } from "@/lib/ai/tools";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Request body:", body);

    const { messages, userId } = body;

    if (!userId) {
      return Response.json({ error: "Missing userId" }, { status: 400 });
    }

    // Extract the outline from the last user message
    const lastMessage = messages[messages.length - 1];
    let outline = "";

    if (typeof lastMessage.content === "string") {
      outline = lastMessage.content;
    } else if (lastMessage.content) {
      outline = String(lastMessage.content);
    }

    if (!outline || outline.trim() === "") {
      return Response.json(
        { error: "Missing lesson outline" },
        { status: 400 },
      );
    }

    console.log("Generating lesson with outline:", outline, "userId:", userId);

    // Call the standalone function directly
    const result = await generateLessonFromOutline({
      outline: outline.trim(),
      userId,
    });

    console.log("Lesson generation result:", result);

    return Response.json(result);
  } catch (error) {
    console.error("Error in chat route:", error);
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate lesson",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
