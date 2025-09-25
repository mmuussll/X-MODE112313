
export const parseMarkdown = (text: string): string => {
  if (!text) return '';

  let html = text
    // Sanitize HTML tags
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Headings
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    // Unordered lists
    .replace(/^\s*[-*] (.*)/gim, '<ul><li>$1</li></ul>')
    .replace(/<\/ul><ul>/gim, '') // Merge consecutive list items
    // Horizontal rule
    .replace(/^-{3,}/gim, '<hr/>')
    // Line breaks
    .replace(/\n/g, '<br />');

  // Clean up extra breaks around block elements
  html = html.replace(/<br \/>(<[hH][1-3]>|<[uU][lL]>|<hr\/>)/g, '$1');
  html = html.replace(/(<\/[hH][1-3]>|<\/[uU][lL]>|<hr\/>)<br \/>/g, '$1');

  return html;
};
