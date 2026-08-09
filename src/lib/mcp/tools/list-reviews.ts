import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseAnon } from "../supabase";

export default defineTool({
  name: "list_reviews",
  title: "List guest reviews",
  description:
    "List published guest reviews for Malar Park, featured/pinned reviews first, with rating and guest name.",
  inputSchema: {
    minRating: z
      .number()
      .int()
      .min(1)
      .max(5)
      .optional()
      .describe("Only return reviews with at least this star rating."),
    limit: z
      .number()
      .int()
      .min(1)
      .max(50)
      .optional()
      .describe("Maximum number of reviews to return. Defaults to 20."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ minRating, limit }) => {
    const supabase = supabaseAnon();
    let query = supabase
      .from("reviews")
      .select("guest_name, rating, text, country, featured, sort")
      .eq("enabled", true)
      .order("featured", { ascending: false })
      .order("sort")
      .limit(limit ?? 20);

    if (minRating) query = query.gte("rating", minRating);

    const { data, error } = await query;
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }

    const reviews = (data ?? []).map((r) => ({
      guestName: r.guest_name,
      rating: r.rating,
      review: r.text,
      country: r.country ?? null,
      pinned: r.featured,
    }));

    return {
      content: [{ type: "text", text: JSON.stringify(reviews, null, 2) }],
      structuredContent: { reviews },
    };
  },
});
