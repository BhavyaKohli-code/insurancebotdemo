/**
 * Canned, zero-cost reply engine.
 *
 * Matching is deliberately dumb: the first rule whose keywords all appear in
 * the message wins. When VITE_API_BASE_URL is set later, swap `getReply` for a
 * fetch to that backend and the rest of the widget keeps working unchanged.
 */

export const SUGGESTIONS = [
  'What is the leave policy?',
  'When is my next leave?',
  'Share the sales training document',
  'What is my sales target?',
  'Check my claim status',
];

const RULES = [
  {
    keywords: [['hi'], ['hello'], ['hey'], ['good morning'], ['good evening'], ['namaste']],
    reply:
      "Hi! I'm ABC Assist, your ABC Insurance helper. I can answer questions about leave, sales policy, targets, training material and claims. Try one of the suggestions below.",
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
    reply: 'Happy to help! Ping me any time you need something from ABC Insurance.',
  },
];

const FALLBACK =
  "I don't have an answer for that yet. I can help with leave policy, sales policy, sales targets, historical data, training documents and claim status.";

export function getReply(message) {
  const text = message.toLowerCase();

  for (const rule of RULES) {
    const matched = rule.keywords.some((group) => group.every((word) => text.includes(word)));
    if (matched) return rule.reply;
  }

  return FALLBACK;
}
