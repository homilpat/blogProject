export function hasRichTextContent(content: string) {
  if (/<img\b[^>]*\bsrc\s*=\s*(?:"[^"]+"|'[^']+'|[^\s>]+)/i.test(content)) return true;

  const text = content
    .replace(/<[^>]*>/g, ' ')
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&#160;', ' ')
    .replaceAll('&#xA0;', ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return text.length > 0;
}
