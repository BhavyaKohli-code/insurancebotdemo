import { NextResponse } from 'next/server';
import { DEFAULT_AGENT_ID, isAgentId } from '@/lib/agents';
import { answerFor } from '@/lib/answers';
import { validateMessage } from '@/lib/validation';

/**
 * POST /api/chat — { message, agentId } -> { reply, agentId }
 *
 * The single place an answer is produced. Both front-ends call it, and the
 * mobile app reaches it through the same origin it loads the widget from.
 */
export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Expected a JSON body.' }, { status: 400 });
  }

  const body = (payload ?? {}) as { message?: unknown; agentId?: unknown };

  // Kept whole rather than destructured so the union still narrows below.
  const validation = validateMessage(body.message);
  if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 });

  // An unknown agent falls back rather than 400-ing: the catalogue can grow
  // while an older client is still open.
  const agentId = isAgentId(body.agentId) ? body.agentId : DEFAULT_AGENT_ID;

  return NextResponse.json({ reply: answerFor(validation.text, agentId), agentId });
}
