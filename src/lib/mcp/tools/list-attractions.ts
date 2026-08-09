import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseAnon } from "../supabase";

export default defineTool({
  name: "list_attractions",
  title: "List nearby attractions",
  description:
    "List nearby attractions and places of interest around Malar Park in Tiruvannamalai, with distance where available.",
  inputSchema: {
    limit: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .describe("Maximum number of attractions to return. Defaults to 50."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }) => {
    const supabase = supabaseAnon();
    const { data, error } = await supabase
      .from("attractions")
      .select("name, description, distance, maps_url, sort")
      .eq("enabled", true)
      .order("sort")
      .limit(limit ?? 50);

    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }

    const attractions = (data ?? []).map((a) => ({
      name: a.name,
      description: a.description ?? "",
      distance: a.distance ?? null,
      mapsUrl: a.maps_url ?? null,
    }));

    return {
      content: [{ type: "text", text: JSON.stringify(attractions, null, 2) }],
      structuredContent: { attractions },
    };
  },
});
