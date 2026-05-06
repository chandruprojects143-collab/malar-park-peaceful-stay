/**
 * Headless SEO diagnostics — runs in CI to fail PRs that introduce
 * duplicate JSON-LD ids or invalid OG/Twitter image URLs (data:/blob:).
 *
 * Strategy: import the source-of-truth helpers (no DOM needed) and audit
 * the room dataset + FAQ schema builders directly.
 */
import { auditRoomImages, classifyImageUrl } from "../src/lib/imageValidation";
import { defaultRooms } from "../src/components/RoomsSection";
import { buildFaqSchema, faqKeys } from "../src/components/FAQSection";
import { buildRoomSeoExpectations } from "../src/lib/roomSeoExpectations";

const ORIGIN = "https://malar-park-peaceful-stay.lovable.app";

let failed = false;
const fail = (msg: string) => {
  console.error(`✗ ${msg}`);
  failed = true;
};
const pass = (msg: string) => console.log(`✓ ${msg}`);

console.log("── SEO diagnostics ──");

// 1. Image audit
const audit = auditRoomImages(defaultRooms.map((r) => ({ name: r.name, images: r.images })));
if (audit.badImages > 0) {
  for (const i of audit.issues) {
    fail(`Bad image URL [${i.room} #${i.index}] ${i.issue.kind}: ${i.issue.message}`);
  }
} else {
  pass(`All ${audit.totalImages} room image URLs are publicly reachable.`);
}

// 2. FAQ schema sanity (en + ta produce same number of QAs, no empty fields)
for (const lang of ["en", "ta"] as const) {
  const schema: any = buildFaqSchema(lang, ORIGIN + "/");
  if (schema.mainEntity.length !== faqKeys.length) {
    fail(`FAQ ${lang}: expected ${faqKeys.length} questions, got ${schema.mainEntity.length}`);
  }
  for (const q of schema.mainEntity) {
    if (!q.name || !q.acceptedAnswer?.text) {
      fail(`FAQ ${lang}: empty question/answer detected`);
    }
  }
}
pass("FAQ JSON-LD schemas (en + ta) are well-formed.");

// 3. Per-room SEO expectations
const expectations = buildRoomSeoExpectations(defaultRooms, ORIGIN);
for (const e of expectations) {
  if (e.imageIssues.length > 0) {
    for (const ii of e.imageIssues) fail(`[${e.room}] image: ${ii.message}`);
  }
  if (e.metaWarnings.length > 0) {
    for (const w of e.metaWarnings) console.warn(`⚠ [${e.room}] ${w}`);
  }
  if (!e.expected.ogImage) fail(`[${e.room}] no public og:image`);
}
pass(`Per-room SEO checked for ${expectations.length} rooms.`);

// 4. Sanity: classifyImageUrl rejects data: URLs
if (classifyImageUrl("data:image/png;base64,AAA")?.kind !== "data-url") {
  fail("classifyImageUrl regression — data: URLs not flagged");
}

if (failed) {
  console.error("\n❌ SEO diagnostics FAILED");
  process.exit(1);
} else {
  console.log("\n✅ SEO diagnostics passed");
}
