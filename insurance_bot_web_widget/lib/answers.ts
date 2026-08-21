/**
 * The answer engine. Server-side only — imported by /api/chat and nothing
 * else, so none of this reference data reaches the browser.
 *
 * Swapping the canned rules for a real model or retrieval layer means
 * changing `answerFor` and leaving both front-ends untouched.
 */

import { AGENTS, getAgent, type AgentId } from './agents';

interface Rule {
  /** Groups are OR-ed; every word inside one group must appear. */
  keywords: string[][];
  reply: string;
}

interface AgentAnswers {
  rules: Rule[];
  fallback: string;
}

const SALES: AgentAnswers = {
  fallback:
    'That one is outside my patch. I handle targets, rate cards, discounts, commission, training material and claim status — for leave or payroll try the HR Specialist, and for trends and reports try Conversational BI.',
  rules: [
    {
      keywords: [['target'], ['quota'], ['achievement']],
      reply:
        'Quarter to date you are at Rs 28,60,000 of a Rs 45,00,000 target — that is 63%, with 142 of 220 policies issued. You need roughly Rs 3,65,000 of new premium a week to close the gap.',
    },
    {
      keywords: [['discount'], ['approval'], ['rate card']],
      reply:
        'Quote only from the approved rate card. Up to 10% you can sign off yourself, 10-20% needs regional manager approval, and anything above 20% goes to the pricing desk with a written justification. KYC must be complete before issuance either way.',
    },
    {
      keywords: [['commission'], ['payout'], ['brokerage']],
      reply:
        'Commission is released once the first premium is realised, in the payout run on the 7th of the following month. Health and Motor pay 12.5% first year, Term Life 22.5% first year and 5% on renewals. Clawback applies if the policy lapses inside 90 days.',
    },
    {
      keywords: [['training'], ['document'], ['material'], ['handbook'], ['playbook']],
      reply:
        'Training library: New Agent Onboarding Handbook v4.2, Product Guide (Health / Motor / Term Life), the IRDAI Compliance & Ethics refresher, the Objection Handling Playbook and the CRM walkthrough. Tell me which one you want and I will pull up the link.',
    },
    {
      keywords: [['renewal'], ['retention'], ['persistency'], ['lapse']],
      reply:
        'Renewal retention is 88% against a 90% goal. 23 policies lapse inside the next 30 days — 14 Motor, 6 Health, 3 Term Life. The reminder call script is in the Objection Handling Playbook, section 4.',
    },
    {
      keywords: [['claim'], ['settlement']],
      reply:
        'You have 4 open claims: CLM-10241 (surveyor assigned), CLM-10238 (documents pending from customer), CLM-10230 (underwriting review) and CLM-10219 (approved, payout scheduled). Average settlement time this quarter is 9 days.',
    },
    {
      keywords: [['pipeline'], ['lead'], ['prospect'], ['follow up']],
      reply:
        'Your pipeline holds 37 open leads worth Rs 19,40,000. 12 are quote-sent and ageing past 7 days — those convert best if you call before day 10. 5 leads have no activity logged this week.',
    },
    {
      keywords: [['objection'], ['expensive'], ['competitor']],
      reply:
        'For price objections, lead with claim settlement ratio (97.2%) and cashless hospital count (8,400+) before touching the premium. The Objection Handling Playbook has scripted responses for the eight most common pushbacks.',
    },
    {
      keywords: [['product'], ['plan'], ['cover']],
      reply:
        'Active products: Health (Secure Family, Secure Senior), Motor (Comprehensive, Third-Party), Term Life (Shield 20, Shield 30) and a Personal Accident rider. Secure Family is the highest-margin line this quarter.',
    },
  ],
};

const HR: AgentAnswers = {
  fallback:
    'I do not have that one. I cover leave, holidays, payroll, reimbursements, appraisals, benefits and onboarding — for targets or claims try the Sales Specialist, and for numbers and trends try Conversational BI.',
  rules: [
    {
      keywords: [['next', 'leave'], ['upcoming', 'leave'], ['holiday']],
      reply:
        'Your next approved leave is on Mon, 24 Aug 2026 (1 day, casual leave). The next company holiday after that is Gandhi Jayanti on Fri, 2 Oct 2026. You currently have 11 paid leaves remaining.',
    },
    {
      keywords: [['leave'], ['time off'], ['vacation']],
      reply:
        'Leave policy in short: 24 paid leaves a year credited quarterly, plus 12 casual and 8 sick leaves. Planned leave needs 3 working days notice and goes to your reporting manager for approval. Up to 10 unused paid leaves can be encashed in March.',
    },
    {
      keywords: [['payroll'], ['salary'], ['payslip'], ['ctc'], ['form 16']],
      reply:
        'Salary credits on the last working day of each month. Payslips appear in the ESS portal under My Payroll within 48 hours of the credit. Form 16 for FY 2025-26 will be published by 15 Jun 2026. Investment declarations close on 31 Jan.',
    },
    {
      keywords: [['reimbursement'], ['expense'], ['travel']],
      reply:
        'Submit reimbursements in the ESS portal under Expenses within 30 days of the spend, with the original bill attached. Local travel is Rs 12/km on two-wheeler and Rs 22/km on four-wheeler. Manager approval clears in 3 working days and payment rides the next payroll run.',
    },
    {
      keywords: [['appraisal'], ['review'], ['increment'], ['promotion']],
      reply:
        'The appraisal cycle runs annually in April. Self-assessment opens 1 Apr, manager reviews close 20 Apr, and revised letters are issued by 31 May effective 1 Apr. Mid-year check-ins happen in October and do not carry a rating.',
    },
    {
      keywords: [['attendance'], ['wfh'], ['work from home'], ['hybrid'], ['office']],
      reply:
        'The hybrid norm is 3 days in office, with Tuesday and Wednesday fixed as anchor days. Mark attendance through the ESS mobile app or the office badge reader. More than 5 unmarked days in a month triggers a payroll hold.',
    },
    {
      keywords: [['benefit'], ['insurance'], ['mediclaim'], ['gratuity'], ['pf']],
      reply:
        'You are covered by a Rs 5,00,000 family floater mediclaim, Rs 25,00,000 group term life and Rs 10,00,000 personal accident cover. PF is 12% employer plus 12% employee, and gratuity vests after 5 continuous years.',
    },
    {
      keywords: [['onboard'], ['induction'], ['new joiner'], ['probation']],
      reply:
        'New joiners complete a 3-day induction, IRDAI certification within 45 days and a buddy programme through month one. Probation is 6 months and confirmation needs a manager sign-off plus a clear compliance record.',
    },
    {
      keywords: [['grievance'], ['complaint'], ['harassment'], ['escalate']],
      reply:
        'Raise a grievance in the ESS portal under Employee Relations, or write to hr.grievance@abcinsurance.example. POSH complaints go directly to the Internal Committee and are acknowledged within 48 hours, confidentially.',
    },
  ],
};

const BI: AgentAnswers = {
  fallback:
    'I cannot chart that one yet. I report on premium, growth, claims ratio, regional and channel splits, product mix and period comparisons — for policy questions try the Sales Specialist or the HR Specialist.',
  rules: [
    {
      keywords: [['fy'], ['historical'], ['history'], ['last year'], ['previous'], ['close']],
      reply:
        'FY 2023-24 closed at Rs 1.62 Cr gross written premium and FY 2024-25 at Rs 1.94 Cr, up 19.8%. Q4 FY 2024-25 was the best quarter on record at Rs 61.2 lakh, and the claims ratio improved from 68% to 61%.',
    },
    {
      keywords: [['claims ratio'], ['loss ratio'], ['claim', 'trend']],
      reply:
        'Claims ratio by quarter: Q1 66%, Q2 64%, Q3 62%, Q4 61%, and 59% quarter to date. The improvement is mostly Motor, where the average claim size fell 11% after the garage network was renegotiated. Health is flat at 71%.',
    },
    {
      keywords: [['region'], ['zone'], ['branch'], ['geography']],
      reply:
        'West leads at Rs 74.3 lakh (38% of book), then North at Rs 52.1 lakh, South at Rs 44.8 lakh and East at Rs 22.8 lakh. West also has the best persistency at 91%. East is the fastest grower, up 27% year on year off a small base.',
    },
    {
      keywords: [['compare'], ['quarter'], ['qoq'], ['versus']],
      reply:
        'Quarter to date is Rs 28.6 lakh against Rs 24.9 lakh in the same period last quarter, up 14.9%. Policy count is up 9.2% and average premium per policy rose from Rs 18,400 to Rs 20,140. Renewal share of the book fell 3 points to 54%.',
    },
    {
      keywords: [['product'], ['mix'], ['top'], ['best selling']],
      reply:
        'Top 5 by written premium this year: Motor Comprehensive Rs 58.4 lakh, Health Secure Family Rs 47.1 lakh, Term Shield 30 Rs 31.9 lakh, Health Secure Senior Rs 22.6 lakh and Motor Third-Party Rs 18.3 lakh. Secure Family carries the best margin at 31%.',
    },
    {
      keywords: [['channel'], ['agency'], ['digital'], ['online'], ['bancassurance']],
      reply:
        'Channel split: Agency 61%, Bancassurance 21%, Digital 14% and Direct 4%. Digital grew 42% year on year and has the lowest acquisition cost at Rs 1,180 per policy against Rs 3,450 for Agency.',
    },
    {
      keywords: [['forecast'], ['projection'], ['run rate'], ['outlook']],
      reply:
        'At the current run rate the quarter lands near Rs 41.8 lakh against the Rs 45 lakh target, a 7% shortfall. Closing it needs about 34 additional policies at the current average premium, weighted toward Health where conversion is strongest.',
    },
    {
      keywords: [['performer'], ['ranking'], ['leaderboard'], ['best agent']],
      reply:
        'Top performers this quarter: R. Nair Rs 4.9 lakh, S. Iyer Rs 4.2 lakh, M. Desai Rs 3.8 lakh. The median agent is at Rs 1.7 lakh, and the bottom quartile sits under Rs 60,000 — that group also has the weakest renewal retention at 74%.',
    },
  ],
};

const ANSWERS: Record<AgentId, AgentAnswers> = { sales: SALES, hr: HR, bi: BI };

/** Every agent answers a greeting and a thank-you in its own voice. */
function rulesFor(id: AgentId): Rule[] {
  const agent = getAgent(id);
  const own = ANSWERS[id];
  return [
    {
      keywords: [['hi'], ['hello'], ['hey'], ['good morning'], ['good evening'], ['namaste']],
      reply: agent.greeting,
    },
    ...own.rules,
    {
      keywords: [['thank'], ['thanks'], ['bye']],
      reply: `Happy to help! Switch specialist from the menu whenever you need something outside ${agent.scope}.`,
    },
  ];
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Keywords must start on a word boundary, but may run on — so "product"
 * still matches "products" and "claim" matches "claims", while "hi" no
 * longer matches the middle of "which" or "this". Plain `includes` did, which
 * made the greeting swallow half the analytics questions.
 */
const mentions = (haystack: string, keyword: string): boolean =>
  new RegExp(`\\b${escapeRegExp(keyword)}`).test(haystack);

/** First rule whose keyword group fully appears in the message wins. */
export function answerFor(message: string, agentId: AgentId): string {
  const lower = message.toLowerCase();
  const rule = rulesFor(agentId).find((candidate) =>
    candidate.keywords.some((group) => group.every((word) => mentions(lower, word)))
  );
  return rule ? rule.reply : ANSWERS[agentId].fallback;
}

/** Guards against an agent being added to the catalogue with no answers. */
export const coveredAgentIds = (): AgentId[] => AGENTS.map((agent) => agent.id).filter((id) => id in ANSWERS);
