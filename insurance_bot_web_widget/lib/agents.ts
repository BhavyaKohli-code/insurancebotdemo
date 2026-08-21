/**
 * The public catalogue of specialists — everything the browser legitimately
 * needs to render a picker and an opening screen.
 *
 * The answers themselves deliberately are NOT here: they live server-side in
 * `lib/answers.ts` and arrive over /api/chat, so the knowledge base never
 * ships to the client.
 *
 * This list is fixed at build time on purpose: the product has no
 * create-an-agent flow, and the sidebar is a picker, not an editor.
 */

import { COMPANY_NAME } from './brand';

export type AgentId = 'sales' | 'hr' | 'bi';

export interface AgentProfile {
  id: AgentId;
  name: string;
  role: string;
  initials: string;
  /** Named in the hand-off line when an agent is asked something off-topic. */
  scope: string;
  greeting: string;
  suggestions: string[];
}

export const AGENTS: AgentProfile[] = [
  {
    id: 'sales',
    name: 'Sales Specialist',
    role: 'Targets, policy & pipeline',
    initials: 'SS',
    scope: 'sales',
    greeting:
      "Hi! I'm your Sales Specialist. I cover targets, the rate card, discount approvals, commission, training material and claim status. Tap a suggestion to start.",
    suggestions: [
      'What is my sales target?',
      'Explain the discount approval rules',
      'Share the sales training document',
      'How is my renewal retention?',
      'Check my claim status',
    ],
  },
  {
    id: 'hr',
    name: 'HR Specialist',
    role: 'Leave, payroll & benefits',
    initials: 'HR',
    scope: 'HR',
    greeting: `Hi! I'm your HR Specialist. Ask me about leave, holidays, payroll, reimbursements, appraisals and benefits at ${COMPANY_NAME}.`,
    suggestions: [
      'What is the leave policy?',
      'When is my next leave?',
      'How do I claim reimbursement?',
      'When is the appraisal cycle?',
      'What are my payroll details?',
    ],
  },
  {
    id: 'bi',
    name: 'Conversational BI',
    role: 'Numbers, trends & reports',
    initials: 'BI',
    scope: 'analytics',
    greeting:
      "Hi! I'm Conversational BI. Ask me for numbers — premium, growth, claims ratio, regional splits, product mix or a period-on-period comparison.",
    suggestions: [
      'How did we close FY 2024-25?',
      'Show the claims ratio trend',
      'Which region is performing best?',
      'Compare this quarter to last',
      'Top products by premium',
    ],
  },
];

export const DEFAULT_AGENT_ID: AgentId = 'sales';

export const getAgent = (id: string): AgentProfile =>
  AGENTS.find((agent) => agent.id === id) ?? AGENTS[0];

export const isAgentId = (value: unknown): value is AgentId =>
  typeof value === 'string' && AGENTS.some((agent) => agent.id === value);
