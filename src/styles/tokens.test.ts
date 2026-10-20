import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('./tokens.css', import.meta.url), 'utf8');

/** Colour tokens defined as light-dark(<light>, <dark>), by name. */
const colours = new Map<string, { light: string; dark: string }>();
for (const m of css.matchAll(
  /--(color-[\w-]+):\s*light-dark\(\s*(#[0-9a-f]{6})\s*,\s*(#[0-9a-f]{6})\s*\)/gi,
)) {
  colours.set(m[1], { light: m[2], dark: m[3] });
}

const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5]
    .map((i) => Number.parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// [foreground, background]: WCAG 2.2 AA for text is 4.5:1.
const textPairs: [string, string][] = [
  ['color-text', 'color-bg'],
  ['color-text', 'color-surface'],
  ['color-text', 'color-surface-2'],
  ['color-text-2', 'color-bg'],
  ['color-text-2', 'color-surface'],
  ['color-text-3', 'color-bg'],
  ['color-text-3', 'color-surface'],
  ['color-accent', 'color-bg'],
  ['color-accent', 'color-surface'],
  ['color-accent-2', 'color-bg'],
  ['color-accent-2', 'color-surface'],
  ['color-accent-3', 'color-bg'],
  ['color-accent-3', 'color-surface'],
  ['color-incident', 'color-bg'],
  ['color-on-accent', 'color-accent'],
];

describe('colour tokens', () => {
  it('parses every colour token', () => {
    expect(colours.size).toBeGreaterThanOrEqual(13);
  });

  describe.each(['light', 'dark'] as const)('%s theme', (theme) => {
    it.each(textPairs)('%s on %s meets 4.5:1', (fg, bg) => {
      const f = colours.get(fg);
      const b = colours.get(bg);
      if (!f || !b) throw new Error(`missing token: ${fg} or ${bg}`);
      expect(contrast(f[theme], b[theme])).toBeGreaterThanOrEqual(4.5);
    });
  });
});
