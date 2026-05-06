import { classifyImageUrl } from "./imageValidation";
import { slugify } from "./analytics";
import type { DisplayRoom } from "@/components/RoomsSection";

export interface RoomSeoExpectation {
  room: string;
  slug: string;
  url: string;
  expected: {
    title: string;
    description: string;
    canonical: string;
    ogImage: string | null;
    twitterImage: string | null;
    ogType: "product";
  };
  imageIssues: { url: string; kind: string; message: string }[];
  metaWarnings: string[];
}

const toAbsolute = (url: string): string => {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  if (typeof window === "undefined") return url;
  if (url.startsWith("/")) return window.location.origin + url;
  return new URL(url, window.location.origin + "/").toString();
};

export const buildRoomSeoExpectations = (
  rooms: DisplayRoom[],
  origin: string
): RoomSeoExpectation[] =>
  rooms.map((r) => {
    const slug = slugify(r.name);
    const url = `${origin}/rooms/${slug}`;
    const absImages = r.images.map(toAbsolute);
    const publicImages = absImages.filter((u) => /^https?:\/\//i.test(u));
    const ogImage = publicImages[0] ?? null;

    const imageIssues = absImages
      .map((u) => classifyImageUrl(u))
      .filter((i): i is NonNullable<typeof i> => i !== null)
      .map((i) => ({ url: i.url, kind: i.kind, message: i.message }));

    const title = `${r.name} – ₹${r.price}/night | Malar Park Hotel`;
    const description = r.desc;

    const warnings: string[] = [];
    if (!ogImage) warnings.push("No publicly reachable og:image — social previews will be blank");
    if (title.length > 60) warnings.push(`title is ${title.length} chars (>60 hurts SERP)`);
    if (description.length > 160)
      warnings.push(`description is ${description.length} chars (>160 truncates in SERP)`);
    if (description.length < 50)
      warnings.push(`description is ${description.length} chars (<50 too thin)`);

    return {
      room: r.name,
      slug,
      url,
      expected: {
        title,
        description,
        canonical: url,
        ogImage,
        twitterImage: ogImage,
        ogType: "product",
      },
      imageIssues,
      metaWarnings: warnings,
    };
  });
