export interface Course {
  user_id: string;
  topic: string;
  status: "planning" | "preparing" | "completed";
  trace_id: string;
}
