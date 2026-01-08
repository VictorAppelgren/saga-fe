/**
 * linkifyIds.ts
 *
 * Utility function to find and convert all reference IDs in text into clickable HTML links.
 *
 * Supported ID formats:
 * - 9-character article IDs (e.g., ABC123XYZ) → linked to `/article/[id]`
 * - Finding IDs (R_XXXXXXXXX or O_XXXXXXXXX) → linked to `/finding/[id]`
 *   - R_ = Risk finding
 *   - O_ = Opportunity finding
 *
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
  function linkifySafe(str: string, regex: RegExp, replacer: (match: string, id: string) => string) {
    return str.replace(regex, (match, id) => {
      const before = str.slice(0, str.indexOf(match));
      const openTag = before.lastIndexOf('<a ');
      const closeTag = before.lastIndexOf('</a>');
      if (openTag > closeTag) return match;
      return replacer(match, id);
    });
  }

  // Helper: determine link for an ID
  function getIdLink(id: string): { href: string; dataAttr: string; cssClass: string } {
    if (id.startsWith('R_') || id.startsWith('O_')) {
      const type = id.startsWith('R_') ? 'risk' : 'opportunity';
      return {
        href: `/finding/${id}`,
        dataAttr: `data-finding-id="${id}" data-finding-type="${type}"`,
        cssClass: `finding-link finding-${type}`
      };
    }
    return {
      href: `/article/${id}`,
      dataAttr: `data-article-id="${id}"`,
      cssClass: 'article-link'
    };
  }

  // 1. Replace Article ID: XXXXXXXXX patterns
  let replaced = text.replace(/(Article ID: )([A-Z0-9]{9})/g, (m, label, id) => {
    const link = getIdLink(id);
    return `${label}<a href="${link.href}" ${link.dataAttr} class="${link.cssClass}"><b>${id}</b></a>`;
  });

  // 2. Replace Finding IDs: R_XXXXXXXXX or O_XXXXXXXXX (11 chars total)
  replaced = replaced.replace(/\b([RO]_[A-Z0-9]{9})\b/g, (match, id) => {
    const link = getIdLink(id);
    return `<a href="${link.href}" ${link.dataAttr} class="${link.cssClass}"><b>${id}</b></a>`;
  });

  // 3. Replace IDs in parentheses (handles both article IDs and finding IDs)
  replaced = replaced.replace(/\(([A-Z0-9_ ,:]+)\)/g, (match, inner) => {
    // First replace finding IDs (11 chars with R_ or O_ prefix)
    let innerReplaced = inner.replace(/\b([RO]_[A-Z0-9]{9})\b/g, (m: string, id: string) => {
      const link = getIdLink(id);
      return `<a href="${link.href}" ${link.dataAttr} class="${link.cssClass}"><b>${id}</b></a>`;
    });
    // Then replace article IDs (9 chars, no prefix) - but NOT if it's part of a finding ID
    innerReplaced = innerReplaced.replace(/(?<![RO]_)\b([A-Z0-9]{9})\b(?!<\/)/g, (m: string, id: string) => {
      // Skip if this looks like it's already been processed or is part of a finding ID
      if (innerReplaced.includes(`>${id}</`)) return m;
      const link = getIdLink(id);
      return `<a href="${link.href}" ${link.dataAttr} class="${link.cssClass}"><b>${id}</b></a>`;
    });
    return '(' + innerReplaced + ')';
  });

  // 4. Replace standalone 9-char article IDs (not already linked, not part of finding ID)
  replaced = linkifySafe(replaced, /(?<![RO]_)\b([A-Z0-9]{9})\b/g, (match, id) => {
    const link = getIdLink(id);
    return `<a href="${link.href}" ${link.dataAttr} class="${link.cssClass}"><b>${id}</b></a>`;
  });

  return replaced;
}
