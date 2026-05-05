/**
 * Inject/update <meta> tags for Open Graph + Twitter dynamic images.
 * Returns a cleanup function that restores prior values.
 */
export interface SocialMeta {
  title?: string;
  description?: string;
  /** Absolute or root-relative image URLs. First is primary. */
  images: string[];
  url?: string;
  type?: "website" | "article" | "product";
}

const ensureMeta = (selector: string, attr: "name" | "property", key: string): HTMLMetaElement => {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  return el;
};

const toAbsolute = (url: string) => {
  if (!url) return url;
  if (/^https?:\/\//i.test(url) || url.startsWith("data:")) return url;
  if (typeof window === "undefined") return url;
  if (url.startsWith("/")) return window.location.origin + url;
  return new URL(url, window.location.href).toString();
};

export const setSocialMeta = (meta: SocialMeta): (() => void) => {
  const created: HTMLMetaElement[] = [];
  const previous: { el: HTMLMetaElement; content: string }[] = [];

  const upsert = (selector: string, attr: "name" | "property", key: string, content: string) => {
    let el = document.head.querySelector<HTMLMetaElement>(selector);
    if (!el) {
      el = ensureMeta(selector, attr, key);
      created.push(el);
    } else {
      previous.push({ el, content: el.content });
    }
    el.content = content;
  };

  // Skip data:/blob: URLs (crawlers can't fetch them) — only use http(s) or root-relative
  const absolute = meta.images.map(toAbsolute);
  const usableImages = absolute.filter((u) => /^https?:\/\//i.test(u));
  const skipped = absolute.filter((u) => !/^https?:\/\//i.test(u));
  if (skipped.length > 0 && typeof console !== "undefined") {
    console.warn(
      `[socialMeta] Skipped ${skipped.length} non-public image URL(s) (data:/blob:) from OG/Twitter meta. Re-upload to hosted storage to enable rich previews.`,
      skipped.map((u) => (u.length > 60 ? u.slice(0, 60) + "…" : u))
    );
  }

  if (meta.title) {
    upsert('meta[property="og:title"]', "property", "og:title", meta.title);
    upsert('meta[name="twitter:title"]', "name", "twitter:title", meta.title);
  }
  if (meta.description) {
    upsert('meta[property="og:description"]', "property", "og:description", meta.description);
    upsert('meta[name="twitter:description"]', "name", "twitter:description", meta.description);
  }
  if (meta.url) {
    upsert('meta[property="og:url"]', "property", "og:url", meta.url);
  }
  if (meta.type) {
    upsert('meta[property="og:type"]', "property", "og:type", meta.type);
  }
  upsert('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");

  if (usableImages.length > 0) {
    upsert('meta[property="og:image"]', "property", "og:image", usableImages[0]);
    upsert('meta[name="twitter:image"]', "name", "twitter:image", usableImages[0]);

    // Additional images: remove previously-injected extras, then append fresh
    document.head
      .querySelectorAll('meta[data-dyn-og-extra="1"]')
      .forEach((n) => n.remove());
    usableImages.slice(1).forEach((src) => {
      const m = document.createElement("meta");
      m.setAttribute("property", "og:image");
      m.setAttribute("data-dyn-og-extra", "1");
      m.content = src;
      document.head.appendChild(m);
      created.push(m);
    });
  }

  return () => {
    created.forEach((el) => el.remove());
    previous.forEach(({ el, content }) => { el.content = content; });
    document.head
      .querySelectorAll('meta[data-dyn-og-extra="1"]')
      .forEach((n) => n.remove());
  };
};
