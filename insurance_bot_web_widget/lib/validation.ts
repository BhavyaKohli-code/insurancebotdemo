/**
 * Shared by the composer and the API route, so the browser and the server
 * agree on what counts as a sendable message.
 */

export const MAX_MESSAGE_LENGTH = 300;

/** Tagged rather than using optional fields, so `if (!result.ok)` narrows. */
export type Validated = { ok: true; text: string } | { ok: false; error: string };

/** Returns the cleaned message, or an `error` string the UI can show as-is. */
export function validateMessage(raw: unknown): Validated {
  if (typeof raw !== 'string') return { ok: false, error: 'Type a message first.' };

  const text = raw.trim().replace(/\s+/g, ' ');
  if (!text) return { ok: false, error: 'Type a message first.' };
  if (text.length > MAX_MESSAGE_LENGTH) {
    return { ok: false, error: `Please keep it under ${MAX_MESSAGE_LENGTH} characters.` };
  }
  return { ok: true, text };
}
