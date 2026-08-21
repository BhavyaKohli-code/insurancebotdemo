/**
 * Suite-level branding and the signed-in user.
 *
 * Anything referenced from a client component has to be inlined at build
 * time, which is why these read NEXT_PUBLIC_* rather than plain env vars.
 */

export const BOT_NAME = process.env.NEXT_PUBLIC_BOT_NAME || 'ABC Assist';
export const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME || 'ABC Insurance Ltd.';

/**
 * Stand-in for whoever is signed in. There is no auth in this demo, so the
 * dashboard reads the profile from here until a real session exists.
 */
export const USER = {
  name: process.env.NEXT_PUBLIC_USER_NAME || 'Rahul Nair',
  email: process.env.NEXT_PUBLIC_USER_EMAIL || 'rahul.nair@abcinsurance.example',
  role: process.env.NEXT_PUBLIC_USER_ROLE || 'Sales Agent · West Zone',
} as const;

export const initialsOf = (name: string): string =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase();
