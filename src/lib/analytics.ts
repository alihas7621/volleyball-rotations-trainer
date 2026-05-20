/**
 * Google Analytics 4 utility.
 *
 * Uses the VITE_GA_MEASUREMENT_ID environment variable.
 * If the variable is missing, all tracking calls are safe no-ops.
 *
 * ── Cloudflare Setup ──────────────────────────────────────────────
 * To enable analytics in production, add the environment variable in
 * Cloudflare Pages/Workers:
 *   Dashboard > Workers & Pages > volleyball-rotations-trainer
 *   > Settings > Environment Variables > Add variable:
 *     Name:  VITE_GA_MEASUREMENT_ID
 *     Value: G-XXXXXXXXXX   (your GA4 Measurement ID)
 *
 * For local development, create a .env file in the project root:
 *   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
 * ──────────────────────────────────────────────────────────────────
 */

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

/** Inject the GA4 gtag.js script into the document head. */
export function initGA(): void {
  if (!GA_ID) return;
  if (document.getElementById('ga-script')) return;

  const script = document.createElement('script');
  script.id = 'ga-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  // Must match Google's exact gtag snippet: push the arguments object, not an array
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).gtag = function () {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID, { send_page_view: true });
}

/** Track a page view (call on route change). */
export function trackPageView(path: string): void {
  if (!GA_ID || !window.gtag) return;
  window.gtag('config', GA_ID, { page_path: path });
}

/** Track a custom event with optional metadata. */
export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean>,
): void {
  if (!GA_ID || !window.gtag) return;
  window.gtag('event', name, params);
}

// ── Type augmentation for gtag globals ──────────────────────────
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}
