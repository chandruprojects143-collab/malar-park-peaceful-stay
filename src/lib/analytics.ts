// Lightweight click tracking + UTM link helpers.
export const trackEvent = (name: string, params: Record<string, any> = {}) => {
  try {
    const payload = { name, params, ts: Date.now() };
    // eslint-disable-next-line no-console
    console.info('[analytics]', name, params);
    const key = 'malar_analytics';
    const prev = JSON.parse(localStorage.getItem(key) || '[]');
    prev.push(payload);
    localStorage.setItem(key, JSON.stringify(prev.slice(-200)));
    // @ts-expect-error optional GA
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      // @ts-expect-error optional GA
      window.gtag('event', name, params);
    }
  } catch {
    // ignore
  }
};

export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// ---------------- UTM helpers ----------------
export interface Utm {
  source: string;   // e.g. "website"
  medium: string;   // e.g. "cta", "floating", "navbar"
  campaign?: string; // e.g. "book_now", "girivalam"
  content?: string;  // optional placement
}

const utmString = (u: Utm) => {
  const p = new URLSearchParams({
    utm_source: u.source,
    utm_medium: u.medium,
    utm_campaign: u.campaign || 'malar_park_site',
  });
  if (u.content) p.set('utm_content', u.content);
  return p.toString();
};

const PHONE = '+918300003829';

/** tel: links can't carry UTMs natively – we still track click event */
export const buildTelHref = (_utm: Utm) => `tel:${PHONE}`;

export const buildWhatsAppHref = (text: string, utm: Utm) => {
  const fullText = `${text}\n\n[${utm.medium}/${utm.campaign || 'site'}]`;
  return `https://wa.me/${PHONE.replace('+', '')}?text=${encodeURIComponent(fullText)}`;
};

export const appendUtm = (url: string, utm: Utm) => {
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}${utmString(utm)}`;
};

export const DIRECTIONS_BASE =
  'https://www.google.com/maps/dir/?api=1&destination=Malar+Park,+Tiruvannamalai&destination_place_id=ChIJ_VHwFwDBrDsR6-KLVPQOLw4';
export const REVIEWS_BASE = 'https://g.page/r/Cevii1T0Di_hEBE/review';
export const GBP_PROFILE_BASE = 'https://maps.app.goo.gl/EZeSjsNZx1Tck3zY6';

export const buildDirectionsHref = (utm: Utm) => appendUtm(DIRECTIONS_BASE, utm);
export const buildReviewsHref = (utm: Utm) => appendUtm(REVIEWS_BASE, utm);
