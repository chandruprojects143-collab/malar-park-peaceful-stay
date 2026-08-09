import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseAnon } from "../supabase";

export default defineTool({
  name: "list_rooms",
  title: "List rooms",
  description:
    "List the published Malar Park guest rooms with their name, slug, description and nightly price in INR.",
  inputSchema: {
    limit: z
      .number()
      .int()
      .min(1)
      .max(50)
      .optional()
      .describe("Maximum number of rooms to return. Defaults to 20."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }) => {
    const supabase = supabaseAnon();
    const { data, error } = await supabase
      .from("rooms")
      .select("name, slug, description, price, sort")
      .eq("enabled", true)
      .order("sort")
      .limit(limit ?? 20);

    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }

    const rooms = (data ?? []).map((r) => ({
      name: r.name,
      slug: r.slug,
      description: r.description ?? "",
      pricePerNightInr: r.price ?? null,
    }));

    return {
      content: [{ type: "text", text: JSON.stringify(rooms, null, 2) }],
      structuredContent: { rooms },
    };
  },
});
