import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch the lesson from database
  const { data: lesson, error } = await supabase
    .from("lessons")
    .select("compiled_js_url")
    .eq("id", id)
    .single();

  if (error || !lesson?.compiled_js_url) {
    return new NextResponse("Lesson not found", { status: 404 });
  }

  // Fetch the compiled code from storage
  const response = await fetch(lesson.compiled_js_url);

  if (!response.ok) {
    return new NextResponse("Failed to fetch compiled code", { status: 500 });
  }

  let compiled = await response.text();

  // Replace the React import with a CDN version
  compiled = compiled.replace(
    /import\s+React\s+from\s+['"]react['"]/g,
    `import React from 'https://esm.sh/react@18'`,
  );
  compiled = compiled.replace(
    /import\s+{([^}]+)}\s+from\s+['"]react['"]/g,
    `import {$1} from 'https://esm.sh/react@18'`,
  );

  return new NextResponse(compiled, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
