// Utility: simpleMarkdown.ts
// Lightweight markdown-to-HTML renderer for Svelte app (headings, bold, code, links, lists, blockquotes, hr, spacing)
export function simpleMarkdown(line: string): string {
  // Bold
  line = line.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
  // Inline code
  line = line.replace(/`([^`]+)`/g, '<code style="background:#f4f4f4;padding:2px 4px;border-radius:4px;font-size:0.98em;">$1</code>');
  // Links
  line = line.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

  // Headings: match lines starting with 1-6 hashes, possibly with leading spaces
  const headingMatch = line.match(/^(\s*)(#{1,6})\s+(.*)$/);
  if (headingMatch) {
    const level = headingMatch[2].length;
    const text = headingMatch[3];
    const sizes = ['1.3em','1.15em','1.08em','1em','0.97em','0.95em'];
    const weights = ['bold','600','600','600','600','600'];
    const topmargins = ['1.5em','1em','1em','0.8em','0.7em','0.7em'];
    return `<div style="font-weight:${weights[level-1]};font-size:${sizes[level-1]};margin-top:${topmargins[level-1]};">${text}</div>`;
  }

  // Blockquote
  if (line.startsWith('> ')) return `<div style="border-left:3px solid #ccc;padding-left:1em;color:#666;font-style:italic;margin:0.5em 0;">${line.slice(2)}</div>`;
  // Horizontal rule
  if (line.trim() === '---') return '<hr style="border:none;border-top:1px solid #eee;margin:1em 0;">';
  // Numbered list
  if (/^\d+\.\s/.test(line)) {
    return `<div style="margin-left:1.3em;">${line.replace(/^(\d+)\.\s/, '<b>$1.</b> ')}</div>`;
  }
  // Bullets
  if (line.startsWith('- ')) return `<div style="margin-left:1em;">• ${line.slice(2)}</div>`;
  // Paragraph spacing
  if (line.trim() === '') return '<br>';
  return `<div>${line}</div>`;
}
