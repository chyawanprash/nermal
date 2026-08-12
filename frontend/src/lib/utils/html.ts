/**
 * Converts note content (HTML from the rich-text editor) to plain text for
 * search matching, snippets, and list previews. Block boundaries (<br>,
 * <div>, <p>) become newlines so lines don't run together.
 */
export function stripHtml(html: string): string {
  const container = document.createElement('div');
  container.innerHTML = html;

  container.querySelectorAll('br').forEach((br) => br.replaceWith('\n'));
  container.querySelectorAll('div, p').forEach((block) => {
    block.insertAdjacentText('afterend', '\n');
  });

  return (container.textContent ?? '').replace(/\n{2,}/g, '\n').trim();
}
