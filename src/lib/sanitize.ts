import sanitizeHtml from 'sanitize-html';

export function sanitizeRichText(input?: string): string | null {
  if (!input) return null;
  const clean = sanitizeHtml(input, {
    allowedTags: ['b', 'strong', 'i', 'em', 'u', 'br'],
    allowedAttributes: {},
    // Disallow all non-text content, strip any other tags
    disallowedTagsMode: 'discard'
  });
  return clean || null;
}
