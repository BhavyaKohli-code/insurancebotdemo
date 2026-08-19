/**
 * All non-UI logic for the chat widget: branding, canned answers, input
 * validation and the bridge back to whatever embeds us. ChatWidget.jsx should
 * stay pure markup + state, so anything with a rule in it belongs here.
 */

export const BOT_NAME = import.meta.env.VITE_BOT_NAME || 'ABC Assist';
export const COMPANY_NAME = import.meta.env.VITE_COMPANY_NAME || 'ABC Insurance Ltd.';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const MAX_MESSAGE_LENGTH = 300;

export const SUGGESTIONS = [
  'What is the leave policy?',
  'When is my next leave?',
  'Share the sales training document',
  'What is my sales target?',
  'Check my claim status',
];

/** First rule whose keyword group fully appears in the message wins. */
const RULES = [
  {
    keywords: [['hi'], ['hello'], ['hey'], ['good morning'], ['good evening'], ['namaste']],
    reply: `Hi! I'm ${BOT_NAME}, your ${COMPANY_NAME} helper. I can answer questions about leave, sales policy, targets, training material and claims. Try one of the suggestions below.`,
  },
  {
    keywords: [['next', 'leave'], ['upcoming', 'leave'], ['holiday']],
    reply:
      'Your next approved leave is on Mon, 24 Aug 2026 (1 day, casual leave). The next company holiday after that is Gandhi Jayanti on Fri, 2 Oct 2026. You currently have 11 paid leaves remaining.',
  },
  {
    keywords: [['leave']],
    reply:
      'Leave policy in short: 24 paid leaves a year credited quarterly, plus 12 casual and 8 sick leaves. Planned leave needs 3 working days notice and goes to your reporting manager for approval. Up to 10 unused paid leaves can be encashed in March.',
  },
  {
    keywords: [['training'], ['document'], ['material'], ['handbook']],
    reply:
      'Here is the training library: New Agent Onboarding Handbook v4.2, Product Guide (Health / Motor / Term Life), the IRDAI Compliance & Ethics refresher, the Objection Handling Playbook and the CRM walkthrough. Tell me which one you want and I will pull up the link.',
  },
  {
    keywords: [['target'], ['quota']],
    reply:
      'Quarter to date you are at Rs 28,60,000 of a Rs 45,00,000 target — that is 63%, with 142 of 220 policies issued. Renewal retention is 88% against a 90% goal.',
  },
  {
    keywords: [['claim'], ['settlement']],
    reply:
      'You have 4 open claims: CLM-10241 (surveyor assigned), CLM-10238 (documents pending from customer), CLM-10230 (underwriting review) and CLM-10219 (approved, payout scheduled). Average settlement time this quarter is 9 days.',
  },
  {
    keywords: [['sales', 'policy'], ['discount'], ['commission']],
    reply:
      'Sales policy essentials: quote only from the approved rate card, discounts above 10% need regional manager sign-off, KYC must be complete before issuance, and commission is released once the first premium is realised.',
  },
  {
    keywords: [['historical'], ['history'], ['last year'], ['previous']],
    reply:
      'FY 2023-24 closed at Rs 1.62 Cr gross written premium and FY 2024-25 at Rs 1.94 Cr, up 19.8%. Q4 FY 2024-25 was the best quarter on record and the claims ratio improved from 68% to 61%.',
  },
  {
    keywords: [['thank'], ['thanks'], ['bye']],
    reply: `Happy to help! Ping me any time you need something from ${COMPANY_NAME}.`,
  },
];

const FALLBACK =
  "I don't have an answer for that yet. I can help with leave policy, sales policy, sales targets, historical data, training documents and claim status.";

function cannedReply(text) {
  const lower = text.toLowerCase();
  const rule = RULES.find((r) => r.keywords.some((group) => group.every((w) => lower.includes(w))));
  return rule ? rule.reply : FALLBACK;
}

/**
 * Returns the cleaned message, or an `error` string the UI can show as-is.
 */
export function validateMessage(raw) {
  const text = raw.trim().replace(/\s+/g, ' ');
  if (!text) return { error: 'Type a message first.' };
  if (text.length > MAX_MESSAGE_LENGTH) {
    return { error: `Please keep it under ${MAX_MESSAGE_LENGTH} characters.` };
  }
  return { text };
}

/** Uses the backend when one is configured, otherwise the canned engine. */
export async function askBot(text) {
  if (!API_BASE_URL) return cannedReply(text);

  try {
    const response = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }),
    });
    if (!response.ok) throw new Error(`Bad status ${response.status}`);
    const data = await response.json();
    return data.reply || cannedReply(text);
  } catch (error) {
    console.warn('[widget] backend unreachable, falling back to canned reply', error);
    return cannedReply(text);
  }
}

/** Bridge to the host: a React Native WebView, or a parent frame on the web. */
export function notifyHost(type) {
  const message = JSON.stringify({ source: 'abc-chat-widget', type });

  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(message);
  } else if (window.parent !== window) {
    window.parent.postMessage(message, '*');
  }
}

export const clockTime = () =>
  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
