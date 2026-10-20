/**
 * True for GPU renderer strings that mean "no real GPU" (software rasterisation). Running the
 * Mesh there can block the main thread for seconds, so those visitors get the static page.
 * (P4.2 grows this into the full capability tiers.)
 */
export function isSoftwareRenderer(renderer: string): boolean {
  return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer);
}
