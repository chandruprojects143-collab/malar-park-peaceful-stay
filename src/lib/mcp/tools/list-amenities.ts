import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseAnon } from "../supabase";

export default defineTool({
  name: "list_amenities",
  title: "List hotel amenities",
  description:
    "List the published amenities and facilities offered at Malar Park hotel.",
  inputSchema: {
    limit: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .describe("Maximum number of amenities to return. Defaults to 50."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }) => {
    const supabase = supabaseAnon();
    const { data, error } = await supabase
      .from("amenities")
      .select("title, description, sort")
      .eq("enabled", true)
      .order("sort")
      .limit(limit ?? 50);

    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }

    const amenities = (data ?? []).map((a) => ({
      title: a.title,
      description: a.description ?? "",
    }));

    return {
      content: [{ type: "text", text: JSON.stringify(amenities, null, 2) }],
      structuredContent: { amenities },
    };
  },
});
