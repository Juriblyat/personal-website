/**
 * Resolve a CSS colour token (e.g. '--color-accent') to a concrete colour string.
 * Custom properties that use light-dark() are not resolved by getComputedStyle, so we let the
 * browser resolve them through a real `color` declaration on a throwaway element.
 */
export function readColor(token: string): string {
  const probe = document.createElement('span');
  probe.style.color = `var(${token})`;
  probe.style.display = 'none';
  document.body.append(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();
  return value;
}

/** Calls back whenever the active theme may have changed (toggle or OS preference). */
export function onThemeChange(callback: () => void): () => void {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  const media = matchMedia('(prefers-color-scheme: light)');
  media.addEventListener('change', callback);
  return () => {
    observer.disconnect();
    media.removeEventListener('change', callback);
  };
}
