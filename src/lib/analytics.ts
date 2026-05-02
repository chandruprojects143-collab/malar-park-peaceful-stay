// Lightweight click tracking. Logs to console + localStorage; sends to GA if window.gtag exists.
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
