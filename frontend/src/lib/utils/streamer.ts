const HEX = '0123456789abcdef';

/**
 * Deterministically turns text into fixed-looking hex noise, for streamer
 * mode — same input always scrambles the same way, so the overlay doesn't
 * flicker on re-render, but nothing readable survives.
 */
export function scramble(text: string): string {
  if (!text) return '';

  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (Math.imul(hash, 31) + text.charCodeAt(i)) >>> 0;
  }

  let state = hash || 1;
  let out = '';
  for (let i = 0; i < text.length; i++) {
    state = (Math.imul(state, 1103515245) + 12345) >>> 0;
    out += HEX[state % HEX.length];
    if (i % 4 === 3 && i !== text.length - 1) out += ' ';
  }
  return out;
}
