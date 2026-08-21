/**
 * Chat history, persisted to localStorage.
 *
 * The widget runs inside an iframe on the web and a WebView on native, so
 * storage is per-origin and may be unavailable (private mode, cleared
 * permissions). Every access is guarded: losing history degrades the sidebar,
 * it never breaks the chat. Reads also have to survive server rendering,
 * where `window` does not exist at all.
 */

import type { AgentId } from './agents';

const STORAGE_KEY = 'abc-chat-history-v1';
const MAX_CHATS = 50;
const TITLE_LENGTH = 42;

export type Author = 'user' | 'bot';

export interface Message {
  id: string;
  author: Author;
  text: string;
  time: string;
}

export interface Chat {
  id: string;
  agentId: AgentId;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface DayBucket {
  label: string;
  chats: Chat[];
}

function readStore(): Chat[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as Chat[]) : [];
  } catch {
    return [];
  }
}

function writeStore(chats: Chat[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  } catch {
    /* quota or storage disabled — history just will not survive a reload */
  }
}

/** Newest first, so the sidebar can render straight down the list. */
export function loadChats(): Chat[] {
  return readStore().sort((a, b) => b.updatedAt - a.updatedAt);
}

/** A chat that exists only in memory until the first message is sent. */
export function draftChat(agentId: AgentId): Chat {
  const now = Date.now();
  return {
    id: `chat-${now}-${Math.random().toString(36).slice(2, 8)}`,
    agentId,
    title: '',
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

export const titleFrom = (text: string): string =>
  text.length > TITLE_LENGTH ? `${text.slice(0, TITLE_LENGTH).trimEnd()}…` : text;

/** Inserts or replaces `chat`, trims the tail, and returns the new list. */
export function saveChat(chat: Chat): Chat[] {
  const rest = readStore().filter((existing) => existing.id !== chat.id);
  const chats = [chat, ...rest].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, MAX_CHATS);
  writeStore(chats);
  return chats;
}

export function deleteChat(id: string): Chat[] {
  const chats = readStore().filter((chat) => chat.id !== id);
  writeStore(chats);
  return chats.sort((a, b) => b.updatedAt - a.updatedAt);
}

/**
 * Groups chats into the Today / Yesterday / Earlier buckets the sidebar
 * renders. Empty buckets are dropped so the UI never shows a bare heading.
 */
export function groupByDay(chats: Chat[], now: number = Date.now()): DayBucket[] {
  const startOfToday = new Date(now).setHours(0, 0, 0, 0);
  const startOfYesterday = startOfToday - 86_400_000;

  const buckets: DayBucket[] = [
    { label: 'Today', chats: [] },
    { label: 'Yesterday', chats: [] },
    { label: 'Earlier', chats: [] },
  ];

  for (const chat of chats) {
    if (chat.updatedAt >= startOfToday) buckets[0].chats.push(chat);
    else if (chat.updatedAt >= startOfYesterday) buckets[1].chats.push(chat);
    else buckets[2].chats.push(chat);
  }

  return buckets.filter((bucket) => bucket.chats.length > 0);
}
