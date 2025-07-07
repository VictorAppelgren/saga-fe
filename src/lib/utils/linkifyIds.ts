/**
 * linkifyIds.ts
 *
 * Utility function to find and convert all 7-character (insight) and 5-character (article) uppercase alphanumeric IDs
 * inside parentheses in a text block into clickable HTML links. This is useful for making references to insights and articles
 * easily navigable in reports, markdown, or chat UIs.
 *
 * - 7-character IDs are assumed to be insights, linked to `/insight/[id]`
 * - 5-character IDs are assumed to be articles, linked to `/article/[id]`
 * - IDs may be mixed with labels and commas inside parentheses, e.g. (Insight ID: 2ADKPQD, 65SE7U8), (A4SJ3, 2ADKPQD)
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
      // If already inside <a ...>, skip
      const before = str.slice(0, str.indexOf(match));
      const openTag = before.lastIndexOf('<a ');
      const closeTag = before.lastIndexOf('</a>');
      if (openTag > closeTag) return match;
      return replacer(id);
    });
  }

  // 1. Replace Insight ID: XXXXXXX and Article ID: XXXXX patterns
  let replaced = text.replace(/(Insight ID: )([A-Z0-9]{7})/g, (m, label, id) => `${label}<a href="/insight/${id}" data-insight-id="${id}"><b>${id}</b></a>`)
    .replace(/(Article ID: )([A-Z0-9]{5})/g, (m, label, id) => `${label}<a href="/article/${id}" data-article-id="${id}"><b>${id}</b></a>`);

  // 2. Replace IDs in parentheses or comma-separated lists
  replaced = replaced.replace(/\(([A-Z0-9 ,:]+)\)/g, (match, inner) => {
    let innerReplaced = linkifySafe(inner, /\b([A-Z0-9]{7})\b/g, id => `<a href="/insight/${id}" data-insight-id="${id}"><b>${id}</b></a>`);
    innerReplaced = linkifySafe(innerReplaced, /\b([A-Z0-9]{5})\b/g, id => `<a href="/article/${id}" data-article-id="${id}"><b>${id}</b></a>`);
    return '(' + innerReplaced + ')';
  });

  // 3. Replace standalone 7-char and 5-char IDs at word boundaries (not already inside a link)
  replaced = linkifySafe(replaced, /\b([A-Z0-9]{7})\b/g, id => `<a href="/insight/${id}" data-insight-id="${id}"><b>${id}</b></a>`);
  replaced = linkifySafe(replaced, /\b([A-Z0-9]{5})\b/g, id => `<a href="/article/${id}" data-article-id="${id}"><b>${id}</b></a>`);

  return replaced;
}
