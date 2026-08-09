import { defineMcp } from "@lovable.dev/mcp-js";
import listRoomsTool from "./tools/list-rooms";
import listFaqsTool from "./tools/list-faqs";
import listReviewsTool from "./tools/list-reviews";
import listAmenitiesTool from "./tools/list-amenities";
import listAttractionsTool from "./tools/list-attractions";

export default defineMcp({
  name: "malar-park-digital",
  title: "Malar Park Digital",
  version: "0.1.0",
  instructions:
    "Tools for Malar Park hotel in Tiruvannamalai. Use `list_rooms` for room types and nightly INR rates, `list_amenities` for facilities, `list_faqs` for guest questions, `list_reviews` for guest feedback, and `list_attractions` for nearby places. All data is public website content.",
  tools: [
    listRoomsTool,
    listAmenitiesTool,
    listFaqsTool,
    listReviewsTool,
    listAttractionsTool,
  ],
});
