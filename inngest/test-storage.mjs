import "dotenv/config"; // <--- this loads .env*, important
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,

  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, // or anon to test anon
);

async function run() {
  const fakeFile = Buffer.from("console.log('test');");

  const { data, error } = await supabase.storage
    .from("lessons")
    .upload("test/test.js", fakeFile, {
      contentType: "application/javascript",
      upsert: true,
    });

  console.log("data:", data);
  console.log("error:", error);
}

run();
