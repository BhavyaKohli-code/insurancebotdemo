/**
 * The browser's half of the chat contract. Answers come from /api/chat, which
 * is same-origin for both surfaces and for the mobile WebView, so a relative
 * URL is all that is needed.
 */

import type { AgentId } from './agents';
import type { ChatResponse } from './bridge';

const UNREACHABLE =
  'I could not reach the assistant service just now. Check your connection and try again.';

export async function askBot(message: string, agentId: AgentId): Promise<string> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, agentId }),
    });

    if (!response.ok) throw new Error(`Bad status ${response.status}`);

    const data = (await response.json()) as Partial<ChatResponse>;
    return data.reply || UNREACHABLE;
  } catch (error) {
    console.warn('[widget] /api/chat failed', error);
    return UNREACHABLE;
  }
}
