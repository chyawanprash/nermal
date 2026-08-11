export const isMac =
  typeof navigator !== 'undefined' && /mac|iphone|ipad/i.test(navigator.userAgent);

/** The platform's "primary" modifier — Cmd on macOS, Ctrl elsewhere. */
export function primaryModifierHeld(event: KeyboardEvent): boolean {
  return isMac ? event.metaKey : event.ctrlKey;
}

/** Render a shortcut for display, e.g. `{ key: 'k', shift: true }` -> "⌘⇧K" / "Ctrl+Shift+K". */
export function formatShortcut(shortcut: { key: string; shift?: boolean; alt?: boolean }): string {
  const parts: string[] = [];
  if (isMac) {
    if (shortcut.alt) parts.push('⌥');
    if (shortcut.shift) parts.push('⇧');
    parts.push('⌘');
    parts.push(shortcut.key.toUpperCase());
    return parts.join('');
  }
  parts.push('Ctrl');
  if (shortcut.alt) parts.push('Alt');
  if (shortcut.shift) parts.push('Shift');
  parts.push(shortcut.key.toUpperCase());
  return parts.join('+');
}

export interface ShortcutMatch {
  key: string;
  shift?: boolean;
  alt?: boolean;
}

/** Does this KeyboardEvent match a shortcut spec (using the platform's primary modifier)? */
export function matchesShortcut(event: KeyboardEvent, shortcut: ShortcutMatch): boolean {
  return (
    primaryModifierHeld(event) &&
    event.key.toLowerCase() === shortcut.key.toLowerCase() &&
    Boolean(shortcut.shift) === event.shiftKey &&
    Boolean(shortcut.alt) === event.altKey
  );
}

/** True while focus is in a text input/textarea/contenteditable — used to avoid stealing keys while typing. */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable;
}
