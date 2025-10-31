"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeRichText = sanitizeRichText;
const sanitize_html_1 = __importDefault(require("sanitize-html"));
function sanitizeRichText(input) {
    if (!input)
        return null;
    const clean = (0, sanitize_html_1.default)(input, {
        allowedTags: ['b', 'strong', 'i', 'em', 'u', 'br'],
        allowedAttributes: {},
        // Disallow all non-text content, strip any other tags
        disallowedTagsMode: 'discard'
    });
    return clean || null;
}
