import type { ShortcutMatch } from '$lib/utils/keyboard';

export type ShortcutId =
  | 'new-note'
  | 'command-palette'
  | 'search'
  | 'save'
  | 'lock-vault'
  | 'settings'
  | 'close-overlay';

export interface ShortcutDef {
  id: ShortcutId;
  label: string;
  keys: ShortcutMatch;
  /** Whether this fires even while a text field is focused (e.g. Escape, Save). */
  allowWhileTyping: boolean;
}

export const SHORTCUTS: ShortcutDef[] = [
  { id: 'new-note', label: 'New Note', keys: { key: 'n' }, allowWhileTyping: false },
  { id: 'command-palette', label: 'Command Palette', keys: { key: 'k' }, allowWhileTyping: true },
  { id: 'save', label: 'Save', keys: { key: 's' }, allowWhileTyping: true },
  { id: 'lock-vault', label: 'Lock Vault', keys: { key: 'l', shift: true }, allowWhileTyping: true },
  { id: 'settings', label: 'Settings', keys: { key: ',' }, allowWhileTyping: false },
];
