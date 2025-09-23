/**
 * linkifyIds.ts
 *
 * Utility function to find and convert all 9-character article IDs
 * inside parentheses in a text block into clickable HTML links.
 *
 * - 9-character IDs are assumed to be articles, linked to `/article/[id]`
 * - IDs may be mixed with labels and commas inside parentheses
 * - Only IDs in parentheses are matched, to avoid false positives elsewhere in the text
 * - The function preserves labels and other text inside the parentheses
 *
 * Usage:
 *   import { linkifyIds } from './linkifyIds';
 *   const html = linkifyIds(markdownText);
 *   // Render with {@html html} in Svelte
 */

export function linkifyIds(text: string): string {
  // Helper: don't linkify if already inside a link
  function linkifySafe(str: string, regex: RegExp, replacer: (id: string) => string) {
    return str.replace(regex, (match, id) => {
      const before = str.slice(0, str.indexOf(match));
      const openTag = before.lastIndexOf('<a ');
      const closeTag = before.lastIndexOf('</a>');
      if (openTag > closeTag) return match;
      return replacer(id);
    });
  }

  // 1. Replace Article ID: XXXXXXXXX patterns
  let replaced = text.replace(/(Article ID: )([A-Z0-9]{9})/g, (m, label, id) => 
    `${label}<a href="/article/${id}" data-article-id="${id}"><b>${id}</b></a>`);

  // 2. Replace IDs in parentheses
  replaced = replaced.replace(/\(([A-Z0-9 ,:]+)\)/g, (match, inner) => {
    let innerReplaced = linkifySafe(inner, /\b([A-Z0-9]{9})\b/g, id => 
      `<a href="/article/${id}" data-article-id="${id}"><b>${id}</b></a>`);
    return '(' + innerReplaced + ')';
  });

  // 3. Replace standalone 9-char IDs
  replaced = linkifySafe(replaced, /\b([A-Z0-9]{9})\b/g, id => 
    `<a href="/article/${id}" data-article-id="${id}"><b>${id}</b></a>`);

  return replaced;
}
