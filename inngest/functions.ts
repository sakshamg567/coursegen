import { inngest } from "./client";
import { vercel } from "@ai-sdk/vercel";
import { generateText } from "@/lib/ai";
import { transformSync } from "esbuild";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/lib/types";

const MAX_RETRIES = 1;

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
    const { lesson_id, title, objective, course_id } = event.data;
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
      const prompt =
        attempt === 1
          ? `You are an expert React/TypeScript developer and educational content creator.

       Generate a complete, self-contained React component for the following lesson:
      Title: ${title}
       objective: ${objective}

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

       Now generate the component for: ${objective}

       Return ONLY the function code, starting with "function LessonComponent()" and ending with the closing brace.`
          : `The following React TSX component failed to compile or render:

       Error: ${lastErr}

       Broken Code:
       ${generated_code}

       Fix it and output a **working corrected version** of the same component.
       Rules:
       - Keep the same function name (LessonComponent)
       - Return only the function code
       - It must compile and render without error.`;

      const { text } = await generateText({
        model: vercel("v0-1.5-md"),
        prompt: prompt,
        temperature: 0.6,
        maxOutputTokens: 10000,
      });

      generated_code = text
        .replace(/```typescript\n?/g, "")
        .replace(/```tsx\n?/g, "")
        .replace(/```javascript\n?/g, "")
        .replace(/```jsx\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

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

      // let Component: any;
      // try {
      //   console.log("generating react component\n\n");

      //   const vm = new NodeVM({
      //     sandbox: { React },
      //     require: { external: false },
      //     timeout: 2000,
      //   });
      //   const exports = vm.run(compiled, "lesson.js");
      //   Component = exports?.LessonComponent ?? exports?.default;

      //   console.log("generated react component : ", Component, "\n\n");
      // } catch (err: any) {
      //   lastErr = `Runtime error : ${err.message}`;
      //   console.warn(lastErr);
      //   continue;
      // }

      // try {
      //   const { renderToString } = await import("react-dom/server");
      //   html = renderToString(React.createElement(Component));
      //   await supabase
      //     .from("lessons")
      //     .update({ status: "completed" })
      //     .eq("id", lesson_id);
      // } catch (err: any) {
      //   console.warn("Rendering error : ", err.message);
      //   await supabase
      //     .from("lessons")
      //     .update({ status: "failed" })
      //     .eq("id", lesson_id);
      // }
      //
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
