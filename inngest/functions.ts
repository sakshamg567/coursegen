import { inngest } from "./client";
import { vercel } from "@ai-sdk/vercel";
import { generateText } from "@/lib/ai";
import { transformSync } from "esbuild";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/lib/types";
import { generate_AiImage_tool } from "@/lib/ai/tools";
import { stepCountIs } from "ai";
import { VM } from "vm2";
import {
  __lesson_writer_base_prompt,
  __lesson_writer_error_prompt,
} from "@/lib/ai/prompt";

const MAX_RETRIES = 2;

/**
 * Removes thinking tags and other unwanted content from generated code
 */
function cleanGeneratedCode(text: string): string {
  // Remove thinking tags and their content
  let cleaned = text.replace(/<thinking>[\s\S]*?<\/thinking>/gi, "");

  // Remove any text before the first function declaration
  const functionStart = cleaned.search(/function\s+LessonComponent/);
  if (functionStart !== -1) {
    cleaned = cleaned.substring(functionStart);
  }

  // Remove markdown code blocks
  cleaned = cleaned
    .replace(/```typescript\n?/gi, "")
    .replace(/```tsx\n?/gi, "")
    .replace(/```javascript\n?/gi, "")
    .replace(/```jsx\n?/gi, "")
    .replace(/```react\n?/gi, "")
    .replace(/```\n?/g, "");

  // Remove any export statements
  cleaned = cleaned.replace(/export\s+default\s+LessonComponent;?\s*/gi, "");
  cleaned = cleaned.replace(/export\s+{\s*LessonComponent\s*};?\s*/gi, "");

  // Trim whitespace
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * Validates the compiled code by executing it in a safe VM environment
 * Returns { valid: true } if successful, or { valid: false, error: string } if there's a runtime error
 */
function validateCompiledCode(compiledCode: string): {
  valid: boolean;
  error?: string;
} {
  try {
    // Create a safe VM with a timeout
    const vm = new VM({
      timeout: 5000, // 5 second timeout
      sandbox: {
        // Mock React and common dependencies
        React: {
          useState: () => [null, () => {}],
          useEffect: () => {},
          useCallback: () => {},
          useMemo: () => null,
          useRef: () => ({ current: null }),
          createElement: () => ({}),
          Fragment: {},
        },
        console: {
          log: () => {},
          error: () => {},
          warn: () => {},
        },
        // Mock window object for any window references
        window: {},
        document: {},
        // Mock registry components
        Box: () => ({}),
        Text: () => ({}),
        Callout: () => ({}),
        Calculator: () => ({}),
        AnimatedCard: () => ({}),
        SVGCanvas: () => ({}),
        MathFormula: () => ({}),
        Timeline: () => ({}),
        Quiz: () => ({}),
        CodeBlock: () => ({}),
        Graph: () => ({}),
        Card: () => ({}),
        Badge: () => ({}),
        Progress: () => ({}),
        Mermaid: () => ({}),
      },
    });

    // Wrap the compiled code to catch any execution errors
    const wrappedCode = `
       ${compiledCode}

       // Check if LessonComponent is defined and is a function
       if (typeof LessonComponent === 'undefined') {
         throw new Error('LessonComponent is not defined');
       }

       if (typeof LessonComponent !== 'function') {
         throw new Error('LessonComponent is not a function');
       }

       // Try to instantiate the component to catch immediate errors
       try {
         LessonComponent({});
       } catch (e) {
         // If it's a hook error, that's okay - it means the component is structured correctly
         if (e.message && e.message.includes('hook')) {
           // This is expected - hooks can't be called outside of React
           return true;
         }
         throw e;
       }

       return true;
     `;

    const result = vm.run(wrappedCode);

    return { valid: true };
  } catch (err: any) {
    console.error("Runtime validation error:", err.message);
    return {
      valid: false,
      error: `Runtime error: ${err.message}`,
    };
  }
}

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
        prompt =
          `You are an expert React/TypeScript developer and educational content creator.

This is a RETRY attempt. The previous generation failed with the following error:
${previous_error}

Please generate a corrected version that addresses this error.` +
          __lesson_writer_base_prompt({ title, objective });
      } else if (attempt === 1) {
        // First attempt (not a retry)
        prompt =
          "You are an expert React/TypeScript developer and educational content creator." +
          __lesson_writer_base_prompt({ title, objective });
      } else {
        // Subsequent retry attempts within the same run
        prompt = __lesson_writer_error_prompt({ lastErr, generated_code });
      }

      const result = await generateText({
        model: vercel("v0-1.5-md"),
        prompt: prompt,
        temperature: 0.6,
        maxOutputTokens: 10000,
        stopWhen: stepCountIs(5), // Allow up to 5 steps for tool calls and continuation
        // tools: { generate_image: generate_AiImage_tool },
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

      // Extract and clean the generated code
      console.log("Raw response length:", result.text.length);
      generated_code = cleanGeneratedCode(result.text);
      console.log("Cleaned code length:", generated_code.length);

      // If no component code generated, log the issue
      if (!generated_code.includes("function LessonComponent")) {
        console.error("No LessonComponent found in generated code!");
        console.error(
          "Raw response (first 500 chars):",
          result.text.substring(0, 500),
        );
        lastErr = "Model did not generate a LessonComponent function";
        continue;
      }

      // ===== Basic syntax validation =====
      const openBraces = (generated_code.match(/{/g) || []).length;
      const closeBraces = (generated_code.match(/}/g) || []).length;
      const openParens = (generated_code.match(/\(/g) || []).length;
      const closeParens = (generated_code.match(/\)/g) || []).length;

      if (openBraces !== closeBraces) {
        lastErr = `Syntax error: Mismatched braces (${openBraces} open, ${closeBraces} close)`;
        console.warn(lastErr);
        continue;
      }

      if (openParens !== closeParens) {
        lastErr = `Syntax error: Mismatched parentheses (${openParens} open, ${closeParens} close)`;
        console.warn(lastErr);
        continue;
      }

      let compiled: string;

      try {
        console.log("Compiling code...\n");

        const result = transformSync(generated_code, {
          loader: "tsx",
          format: "esm",
        });

        console.log("Compiled successfully\n");

        compiled = result.code;

        // // ====== RUNTIME VALIDATION ======
        // const validation = validateCompiledCode(compiled);

        // if (!validation.valid) {
        //   lastErr = validation.error || "Runtime validation failed";
        //   console.warn("Runtime validation failed:", lastErr);
        //   continue;
        // }

        // console.log("Runtime validation passed");

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
