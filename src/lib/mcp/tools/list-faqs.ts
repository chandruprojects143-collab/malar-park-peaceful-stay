import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseAnon } from "../supabase";

export default defineTool({
  name: "list_faqs",
  title: "List FAQs",
  description:
    "List the published Malar Park frequently asked questions and their answers. Optionally filter by a keyword.",
  inputSchema: {
    search: z
      .string()
      .optional()
      .describe("Optional keyword to match against the question text."),
    limit: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .describe("Maximum number of FAQs to return. Defaults to 50."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ search, limit }) => {
    const supabase = supabaseAnon();
    let query = supabase
      .from("faqs")
      .select("question, answer_html, sort")
      .eq("enabled", true)
      .order("sort")
      .limit(limit ?? 50);

    if (search?.trim()) query = query.ilike("question", `%${search.trim()}%`);

    const { data, error } = await query;
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }

    const faqs = (data ?? []).map((f) => ({
      question: f.question,
      answer: (f.answer_html ?? "").replace(/<[^>]*>/g, "").trim(),
    }));

    return {
      content: [{ type: "text", text: JSON.stringify(faqs, null, 2) }],
      structuredContent: { faqs },
    };
  },
});
