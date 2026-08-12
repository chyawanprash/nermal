/**
 * Cmd/Ctrl+B on a selection cycles through three bold weights instead of a
 * single on/off bold, by wrapping the selection in a <span data-bold-level>
 * and bumping/removing that level on repeat presses.
 *
 * Most fonts (including this editor's serif stack) only ship Regular(400)
 * and Bold(700) faces, so a bare `font-weight: 500` has no matching face
 * and silently renders as normal — level 1 would look like a no-op. Pairing
 * font-weight with a growing `-webkit-text-stroke` guarantees each of the
 * three levels is visually distinct regardless of the font's actual weight
 * axis.
 */
const BOLD_LEVELS: Record<number, { fontWeight: string; strokeWidth: string }> = {
  1: { fontWeight: '600', strokeWidth: '0px' }, // medium
  2: { fontWeight: '700', strokeWidth: '0.4px' }, // semibold
  3: { fontWeight: '700', strokeWidth: '0.9px' }, // extrabold
};
const MAX_BOLD_LEVEL = 3;

function applyBoldLevel(span: HTMLElement, level: number) {
  const { fontWeight, strokeWidth } = BOLD_LEVELS[level];
  span.style.fontWeight = fontWeight;
  span.style.setProperty('-webkit-text-stroke', `${strokeWidth} currentColor`);
}

/**
 * Applies to the current window selection if it's inside `editorRoot`.
 * No-ops (returns false) when there's no selection, it's collapsed, or it
 * spans outside the editor. Returns true if the DOM was mutated, so the
 * caller knows to re-read innerHTML and persist it.
 */
export function cycleBoldWeight(editorRoot: HTMLElement): boolean {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return false;

  const range = selection.getRangeAt(0);
  if (!editorRoot.contains(range.commonAncestorContainer)) return false;

  const container = range.commonAncestorContainer;
  const containerEl = container.nodeType === Node.TEXT_NODE ? container.parentElement : (container as Element);
  const existingSpan = containerEl?.closest<HTMLElement>('span[data-bold-level]') ?? null;

  if (existingSpan && editorRoot.contains(existingSpan) && existingSpan.textContent === selection.toString()) {
    const level = Number(existingSpan.dataset.boldLevel);

    if (level >= MAX_BOLD_LEVEL) {
      const parent = existingSpan.parentNode;
      if (!parent) return false;
      const textNode = document.createTextNode(existingSpan.textContent ?? '');
      parent.replaceChild(textNode, existingSpan);
      selectNode(selection, textNode);
    } else {
      const nextLevel = level + 1;
      existingSpan.dataset.boldLevel = String(nextLevel);
      applyBoldLevel(existingSpan, nextLevel);
      selectContents(selection, existingSpan);
    }
    return true;
  }

  const span = document.createElement('span');
  span.dataset.boldLevel = '1';
  applyBoldLevel(span, 1);
  span.appendChild(range.extractContents());
  range.insertNode(span);
  selectContents(selection, span);
  return true;
}

/** Simple on/off formats (underline, strikethrough): wrap the selection in
 * a marker span on first press, unwrap it on second — no level-cycling. */
function toggleSpanFormat(editorRoot: HTMLElement, attr: string, applyStyle: (span: HTMLElement) => void): boolean {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return false;

  const range = selection.getRangeAt(0);
  if (!editorRoot.contains(range.commonAncestorContainer)) return false;

  const container = range.commonAncestorContainer;
  const containerEl = container.nodeType === Node.TEXT_NODE ? container.parentElement : (container as Element);
  const existingSpan = containerEl?.closest<HTMLElement>(`span[${attr}]`) ?? null;

  if (existingSpan && editorRoot.contains(existingSpan) && existingSpan.textContent === selection.toString()) {
    const parent = existingSpan.parentNode;
    if (!parent) return false;

    const fragment = document.createDocumentFragment();
    while (existingSpan.firstChild) fragment.appendChild(existingSpan.firstChild);
    const firstChild = fragment.firstChild;
    const lastChild = fragment.lastChild;
    parent.replaceChild(fragment, existingSpan);

    if (firstChild && lastChild) {
      const newRange = document.createRange();
      newRange.setStartBefore(firstChild);
      newRange.setEndAfter(lastChild);
      selection.removeAllRanges();
      selection.addRange(newRange);
    }
    return true;
  }

  const span = document.createElement('span');
  span.setAttribute(attr, '');
  applyStyle(span);
  span.appendChild(range.extractContents());
  range.insertNode(span);
  selectContents(selection, span);
  return true;
}

export function toggleUnderline(editorRoot: HTMLElement): boolean {
  return toggleSpanFormat(editorRoot, 'data-underline', (span) => {
    span.style.textDecorationLine = 'underline';
  });
}

export function toggleStrikethrough(editorRoot: HTMLElement): boolean {
  return toggleSpanFormat(editorRoot, 'data-strike', (span) => {
    span.style.textDecorationLine = 'line-through';
  });
}

function selectNode(selection: Selection, node: Node) {
  const range = document.createRange();
  range.selectNode(node);
  selection.removeAllRanges();
  selection.addRange(range);
}

function selectContents(selection: Selection, node: Node) {
  const range = document.createRange();
  range.selectNodeContents(node);
  selection.removeAllRanges();
  selection.addRange(range);
}
