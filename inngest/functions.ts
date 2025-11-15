import { inngest } from "./client";
import { vercel } from "@ai-sdk/vercel";
import { generateText } from "@/lib/ai";
import { transformSync } from "esbuild";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/lib/types";
import { generate_svg_tool } from "@/lib/ai/tools";
import { stepCountIs } from "ai";

const MAX_RETRIES = 3;

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

export const generateLesson = inngest.createFunction(
  { id: "generate_lesson" },
  { event: "lesson.generate" },

  async ({ event, step }) => {
    const { lesson_id, title, objective, course_id, previous_error, is_retry } =
      event.data;
    console.log(`[Inngest] Starting lesson generation for lesson ${lesson_id}`);
    const supabase = createServiceClient();

    let attempt = 0;
    let lastErr = "";
    let generated_code = "";
    let html = "";

    const { error: statusError } = await supabase
      .from("lessons")
      .update({ status: "processing" })
      .eq("id", lesson_id);

    if (statusError) {
      console.error("Failed to update status to processing:", statusError);
    }

    while (attempt < MAX_RETRIES) {
      attempt++;
      console.log(
        `[Inngest] Attempt ${attempt}/${MAX_RETRIES} for lesson ${lesson_id}`,
      );

      // Build the prompt based on whether this is a retry or first attempt
      let prompt = "";

      if (attempt === 1 && is_retry && previous_error) {
        // This is a manual retry with a previous error
        prompt = `You are an expert React/TypeScript developer and educational content creator.

This is a RETRY attempt. The previous generation failed with the following error:
${previous_error}

Please generate a corrected version that addresses this error.

Generate a complete, self-contained React component for the following lesson:
Title: ${title}
Objective: ${objective}

CRITICAL REQUIREMENTS:
1. Generate ONLY the component code, no imports, no exports, no markdown
2. The component must be named "LessonComponent"
3. Use Tailwind CSS for styling (it's already available)
4. Make it interactive and engaging where appropriate
5. Include proper TypeScript types
6. The code must be production-ready and error-free
7. For quizzes: include state management, answer checking, and score tracking
8. For explanations: use clear sections, examples, and visual hierarchy
9. For interactive content: add buttons, inputs, and dynamic behavior
10. Use modern React patterns (hooks, functional components)
11. MUST have ALL closing tags - validate JSX is complete

SIMPLE TEMPLATE TO FOLLOW:

function LessonComponent() {
  const [activeSection, setActiveSection] = React.useState(0);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">${title}</h1>

      <div className="bg-blue-50 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-3">Introduction</h2>
        <p className="text-gray-700">
          [Brief introduction about the topic]
        </p>
      </div>

      <div className="space-y-4 mb-6">
        <h2 className="text-xl font-semibold">Key Concepts</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Concept 1</h3>
            <p className="text-sm text-gray-600">[Explanation]</p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Concept 2</h3>
            <p className="text-sm text-gray-600">[Explanation]</p>
          </div>
        </div>
      </div>

      <div className="bg-green-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Summary</h2>
        <p className="text-gray-700">[Brief summary]</p>
      </div>
    </div>
  );
}

You can use UI components from "shadcn".
Available components:
- Box({children, className})
- Text({children, className})
- Callout({title, children})
- AnimatedCard({children, className})
- Graph({data, xKey, yKey, height})
- SVGCanvas({width, height, shapes})
- Calculator({formula, inputs})
- Quiz({questions})
- Timeline({steps})
- CodeBlock({code, language})
- Math({tex})

DO NOT WRITE ANY IMPORT STATEMENTS, ASSUME THE COMPONENTS TO BE IMPORTED GLOBALLY, JUST USE THEM NORMALLY

## SVG GENERATION RULES

You have access to a tool:

    generate_svg({ prompt })

Use this tool to generate **educational SVG diagrams** whenever a diagram would help understanding.

Examples of when to call 'generate_svg':
- force arrows, vectors, motion diagrams
- geometry shapes
- number lines
- coordinate grid visualizations
- free body diagrams
- projectile motion arcs
- physics conceptual explanations
- math relationships or annotated shapes
- algorithm diagrams or flowcharts

Do NOT call generate_svg unless the diagram is directly useful.

### After the tool returns the SVG:

You MUST continue generating and embed the returned SVG in your component like this:

    <div dangerouslySetInnerHTML={{ __html: \`\${svg_from_tool}\` }} />

or wrap it in a component if needed.

IMPORTANT: After calling any tools, you MUST output the complete LessonComponent function with the tool results incorporated.

Now generate the component for: ${objective}

Return ONLY the function code, starting with "function LessonComponent()" and ending with the closing brace.`;
      } else if (attempt === 1) {
        // First attempt (not a retry)
        prompt = `You are an expert React/TypeScript developer and educational content creator.

Generate a complete, self-contained React component for the following lesson:
Title: ${title}
Objective: ${objective}

CRITICAL REQUIREMENTS:
1. Generate ONLY the component code, no imports, no exports, no markdown
2. The component must be named "LessonComponent"
3. Use Tailwind CSS for styling (it's already available)
4. Make it interactive and engaging where appropriate
5. Include proper TypeScript types
6. The code must be production-ready and error-free
7. For quizzes: include state management, answer checking, and score tracking
8. For explanations: use clear sections, examples, and visual hierarchy
9. For interactive content: add buttons, inputs, and dynamic behavior
10. Use modern React patterns (hooks, functional components)
11. MUST have ALL closing tags - validate JSX is complete

SIMPLE TEMPLATE TO FOLLOW:

function LessonComponent() {
  const [activeSection, setActiveSection] = React.useState(0);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">${title}</h1>

      <div className="bg-blue-50 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-3">Introduction</h2>
        <p className="text-gray-700">
          [Brief introduction about the topic]
        </p>
      </div>

      <div className="space-y-4 mb-6">
        <h2 className="text-xl font-semibold">Key Concepts</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Concept 1</h3>
            <p className="text-sm text-gray-600">[Explanation]</p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Concept 2</h3>
            <p className="text-sm text-gray-600">[Explanation]</p>
          </div>
        </div>
      </div>

      <div className="bg-green-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Summary</h2>
        <p className="text-gray-700">[Brief summary]</p>
      </div>
    </div>
  );
}

You can use UI components from "shadcn".
Available components:
- Box({children, className})
- Text({children, className})
- Callout({title, children})
- AnimatedCard({children, className})
- Graph({data, xKey, yKey, height})
- SVGCanvas({width, height, shapes})
- Calculator({formula, inputs})
- Quiz({questions})
- Timeline({steps})
- CodeBlock({code, language})
- Math({tex})

DO NOT WRITE ANY IMPORT STATEMENTS, ASSUME THE COMPONENTS TO BE IMPORTED GLOBALLY, JUST USE THEM NORMALLY

## SVG GENERATION RULES

You have access to a tool:

    generate_svg({ prompt })

Use this tool to generate **educational SVG diagrams** whenever a diagram would help understanding.

Examples of when to call 'generate_svg':
- force arrows, vectors, motion diagrams
- geometry shapes
- number lines
- coordinate grid visualizations
- free body diagrams
- projectile motion arcs
- physics conceptual explanations
- math relationships or annotated shapes
- algorithm diagrams or flowcharts

Do NOT call generate_svg unless the diagram is directly useful.

### After the tool returns the SVG:

You MUST continue generating and embed the returned SVG in your component like this:

    <div dangerouslySetInnerHTML={{ __html: \`\${svg_from_tool}\` }} />

or wrap it in a component if needed.

IMPORTANT: After calling any tools, you MUST output the complete LessonComponent function with the tool results incorporated.

Now generate the component for: ${objective}

Return ONLY the function code, starting with "function LessonComponent()" and ending with the closing brace.`;
      } else {
        // Subsequent retry attempts within the same run
        prompt = `The following React TSX component failed to compile or render:

Error: ${lastErr}

Broken Code:
${generated_code}

Fix it and output a **working corrected version** of the same component.
Rules:
- Keep the same function name (LessonComponent)
- Return only the function code
- It must compile and render without error.`;
      }

      const result = await generateText({
        model: vercel("v0-1.5-md"),
        prompt: prompt,
        temperature: 0.6,
        maxOutputTokens: 10000,
        stopWhen: stepCountIs(5), // Allow up to 5 steps for tool calls and continuation
        tools: { generate_svg: generate_svg_tool },
      });

      console.log("Generation steps:", result.steps?.length || 0);
      console.log("Tool calls made:", result.toolCalls?.length || 0);

      // Log tool results for debugging
      if (result.toolResults && result.toolResults.length > 0) {
        console.log(
          "Tool results:",
          JSON.stringify(result.toolResults, null, 2),
        );
      }

      // Extract the final text after all tool calls
      generated_code = result.text
        .replace(/```typescript\n?/g, "")
        .replace(/```tsx\n?/g, "")
        .replace(/```javascript\n?/g, "")
        .replace(/```jsx\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      // If no component code generated, log the issue
      if (!generated_code.includes("function LessonComponent")) {
        console.error("No LessonComponent found in generated code!");
        console.error("Full response:", result.text);
        lastErr = "Model did not generate a LessonComponent function";
        continue;
      }

      let compiled: string;

      try {
        console.log("compiling code \n\n");

        const result = transformSync(generated_code, {
          loader: "tsx",
          format: "esm",
        });

        console.log("compiled code : ", result.code, "\n\n");

        compiled = result.code;

        const fileName = `${lesson_id}.js`;
        const { error: uploadError } = await supabase.storage
          .from("lessons")
          .upload(fileName, compiled, {
            contentType: "application/javascript",
            upsert: true,
          });

        if (uploadError) {
          throw new Error(`Upload error : ${uploadError.message}`);
        }

        // Fix: Get public URL from the same path where file was uploaded
        const { data: urlData } = supabase.storage
          .from("lessons")
          .getPublicUrl(fileName);

        console.log("Public URL data:", urlData);

        const { error: updateError } = await supabase
          .from("lessons")
          .update({
            compiled_js_url: urlData.publicUrl,
            status: "completed",
            error: null, // Clear any previous errors
          })
          .eq("id", lesson_id);

        if (updateError) {
          console.error(
            "Failed to update lesson with URL and status:",
            updateError,
          );
          throw new Error(`Database update error: ${updateError.message}`);
        }

        console.log(`[Inngest] Successfully completed lesson ${lesson_id}`);
        return { success: true, lesson_id };
      } catch (err: any) {
        lastErr = `Compile error: ${err.message}`;
        console.warn(lastErr);
        continue;
      }
    }

    const { error: failError } = await supabase
      .from("lessons")
      .update({ status: "failed", error: lastErr })
      .eq("id", lesson_id);

    if (failError) {
      console.error("Failed to update lesson status to failed:", failError);
    }

    console.error(
      `[Inngest] Lesson ${lesson_id} generation failed after all retries:`,
      lastErr,
    );
    return { success: false, lesson_id, error: lastErr };
  },
);
