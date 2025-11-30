import type express from "express";
import sanitizeHtml from "sanitize-html";

export type RichTextField = { key: string; required?: boolean };

export type RichTextOptions = {
  maxPlainTextChars?: number;
};

/**
 * Normalize and validate rich-text fields:
 * - Sanitizes HTML to an allowed tag/attribute set aligned with frontend RTE
 * - Derives plain text for accurate length counting
 * - Enforces plain-text length caps
 * - Attaches sanitized HTML and `{key}Plain` to `req.body`
 */
export function normalizeRichTextFields(
  fields: RichTextField[],
  opts: RichTextOptions = {}
) {
  const MAX_PLAIN_TEXT_CHARS = opts.maxPlainTextChars ?? 2000;

  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      for (const { key, required } of fields) {
        const raw = (req.body?.[key] ?? "") as string;
        if (required && (!raw || typeof raw !== "string")) {
          return res.status(400).json({ message: `Missing required field: ${key}` });
        }
        if (typeof raw !== "string") continue;

        const sanitizedHtml = sanitizeHtml(raw, {
          allowedTags: [
            "p", "br", "blockquote",
            "strong", "b", "em", "i", "u", "s", "span",
            "ul", "ol", "li",
            "h1", "h2", "h3", "h4", "h5", "h6",
            "code", "pre",
            "a",
          ],
          allowedAttributes: {
            a: ["href", "target", "rel"],
            span: ["class"],
            code: ["class"],
            pre: ["class"],
          },
          allowedSchemes: ["http", "https", "mailto"],
          allowedSchemesByTag: { a: ["http", "https", "mailto"] },
          transformTags: {
            a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
          },
          disallowedTagsMode: "discard",
        });

        let plain = sanitizeHtml(sanitizedHtml, { allowedTags: [], allowedAttributes: {} });
        plain = plain
          .replace(/[\u00A0]/g, " ")
          .replace(/[\u200B-\u200D\uFEFF]/g, "")
          .replace(/\s+/g, " ")
          .trim();

        if (plain.length > MAX_PLAIN_TEXT_CHARS) {
          return res.status(400).json({
            message: `${key} exceeds maximum length`,
            details: { plainLength: plain.length, max: MAX_PLAIN_TEXT_CHARS },
          });
        }

        (req.body as any)[key] = sanitizedHtml;
        (req.body as any)[`${key}Plain`] = plain;
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}
