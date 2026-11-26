import sanitizeHtml from 'sanitize-html'

export function stripHtml(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
  })
    .replace(/\s+/g, ' ')
    .trim()
}

export function sanitizeRichText(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'code'],
    allowedAttributes: {
      a: ['href', 'rel', 'target'],
    },
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', {
        rel: 'noopener noreferrer nofollow',
        target: '_blank',
      }),
    },
    allowedSchemes: ['http', 'https', 'mailto'],
  })
}

/** Fence untrusted user text before placing in model prompts. */
export function fenceUserText(label: string, text: string): string {
  const cleaned = text.replace(/<\/?user_content>/gi, '')
  return `<user_content name="${label}">\n${cleaned}\n</user_content>`
}
