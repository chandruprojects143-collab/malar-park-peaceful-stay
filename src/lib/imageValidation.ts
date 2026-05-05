/**
 * Utilities to validate that room/gallery photo URLs are publicly reachable
 * (http/https) rather than base64 / data URLs which crawlers cannot fetch.
 */

export type ImageIssueKind = "data-url" | "blob-url" | "relative" | "empty";

export interface ImageIssue {
  url: string;
  kind: ImageIssueKind;
  message: string;
}

export const classifyImageUrl = (url: string): ImageIssue | null => {
  if (!url || url.trim() === "") {
    return { url, kind: "empty", message: "Empty image URL" };
  }
  if (url.startsWith("data:")) {
    return {
      url: url.slice(0, 60) + "…",
      kind: "data-url",
      message:
        "Base64/data URL — social crawlers (Facebook, Twitter, WhatsApp) cannot fetch this. Re-upload to hosted storage.",
    };
  }
  if (url.startsWith("blob:")) {
    return {
      url,
      kind: "blob-url",
      message: "Blob URL is session-only and not publicly reachable.",
    };
  }
  if (/^https?:\/\//i.test(url)) return null;
  // Relative paths only work when served from same origin — flag for awareness
  if (url.startsWith("/")) {
    return {
      url,
      kind: "relative",
      message: "Relative URL — OK on same origin, but verify it resolves publicly.",
    };
  }
  return { url, kind: "relative", message: "Unrecognized URL format." };
};

export const isPubliclyReachable = (url: string): boolean => {
  if (!url) return false;
  if (url.startsWith("data:") || url.startsWith("blob:")) return false;
  return /^https?:\/\//i.test(url) || url.startsWith("/");
};

export interface RoomLike {
  name: string;
  images: string[];
}

export const auditRoomImages = (rooms: RoomLike[]) => {
  const issues: { room: string; index: number; issue: ImageIssue }[] = [];
  let totalImages = 0;
  let badImages = 0;
  for (const r of rooms) {
    r.images.forEach((img, i) => {
      totalImages++;
      const issue = classifyImageUrl(img);
      if (issue) {
        badImages++;
        issues.push({ room: r.name, index: i, issue });
      }
    });
  }
  return { totalImages, badImages, issues };
};
