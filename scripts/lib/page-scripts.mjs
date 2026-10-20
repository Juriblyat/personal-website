// URLs of the scripts a page loads up front: <script src> and modulepreload links.
export function initialScriptUrls(html) {
  const urls = [
    ...html.matchAll(/<script[^>]+src="([^"]+\.js)"/g),
    ...html.matchAll(/<link[^>]+rel="modulepreload"[^>]+href="([^"]+)"/g),
  ].map((m) => m[1]);
  return [...new Set(urls)].filter((u) => u.startsWith('/'));
}
