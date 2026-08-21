'use client';

/**
 * The conversation state shared by both surfaces: the embedded mobile widget
 * and the desktop dashboard. They look nothing alike, but they send messages,
 * switch specialists and manage history identically — so that lives here and
 * the components stay presentational.
 *
 * Both surfaces are mounted with `ssr: false`, so `window` is guaranteed here
 * and state can be seeded straight from `localStorage` and the clock. Under
 * prerendering it could not: a chat built during SSR would carry a different
 * id and timestamp than the one hydration builds, which React reports as a
 * mismatch.
 */

import { useCallback, useEffect, useRef, useState, type DependencyList } from 'react';
import { askBot } from './api';
import { clockTime } from './bridge';
import { validateMessage } from './validation';
import { DEFAULT_AGENT_ID, getAgent, type AgentId, type AgentProfile } from './agents';
import {
  deleteChat,
  draftChat,
  loadChats,
  saveChat,
  titleFrom,
  type Author,
  type Chat,
  type Message,
} from './history';

// Ids must not collide with the messages of a chat restored from a previous
// session, so they carry the load time rather than restarting from 1.
let nextId = 1;
export const makeMessage = (author: Author, text: string): Message => ({
  id: `m-${Date.now().toString(36)}-${nextId++}`,
  author,
  text,
  time: clockTime(),
});

/** A fresh conversation, opened on the agent's own greeting. */
function startChat(agentId: AgentId): Chat {
  const chat = draftChat(agentId);
  chat.messages = [makeMessage('bot', getAgent(agentId).greeting)];
  return chat;
}

export interface ChatSession {
  agent: AgentProfile;
  chat: Chat;
  chats: Chat[];
  error: string;
  input: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  isEmpty: boolean;
  typing: boolean;
  changeInput: (value: string) => void;
  newChat: () => void;
  openAgent: (agentId: AgentId) => void;
  openChat: (saved: Chat) => void;
  removeChat: (id: string) => void;
  send: (raw: string, options?: { refocus?: boolean }) => Promise<void>;
}

export function useChatSession(): ChatSession {
  const [chats, setChats] = useState<Chat[]>(loadChats);
  const [chat, setChat] = useState<Chat>(() => startChat(DEFAULT_AGENT_ID));
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [typing, setTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const agent = getAgent(chat.agentId);

  // True while the conversation still holds nothing but the agent greeting,
  // which is what the dashboard shows its welcome state for.
  const isEmpty = chat.messages.length <= 1;

  const send = useCallback(
    async (raw: string, { refocus = true }: { refocus?: boolean } = {}) => {
      // `typing` gates re-entry, so the captured `chat` cannot go stale
      // between the guard and the send.
      if (typing) return;

      // Kept whole rather than destructured so the union still narrows below.
      const validation = validateMessage(raw);
      if (!validation.ok) {
        setError(validation.error);
        return;
      }
      const text = validation.text;

      setError('');
      setInput('');

      // The chat is only titled — and only worth persisting — once the user
      // has actually said something.
      const asked: Chat = {
        ...chat,
        title: chat.title || titleFrom(text),
        messages: [...chat.messages, makeMessage('user', text)],
        updatedAt: Date.now(),
      };
      setChat(asked);
      setTyping(true);

      const reply = await askBot(text, asked.agentId);
      // Small pause so the typing indicator is actually visible.
      await new Promise((resolve) => setTimeout(resolve, 500));

      const answered: Chat = {
        ...asked,
        messages: [...asked.messages, makeMessage('bot', reply)],
        updatedAt: Date.now(),
      };
      setTyping(false);
      setChat(answered);
      setChats(saveChat(answered));
      if (refocus) inputRef.current?.focus();
    },
    [chat, typing]
  );

  const openAgent = useCallback((agentId: AgentId) => {
    setChat(startChat(agentId));
    setError('');
  }, []);

  const openChat = useCallback((saved: Chat) => {
    setChat(saved);
    setError('');
  }, []);

  const newChat = useCallback(() => {
    setChat((current) => startChat(current.agentId));
    setError('');
  }, []);

  const removeChat = useCallback((id: string) => {
    setChats(deleteChat(id));
    setChat((current) => (current.id === id ? startChat(current.agentId) : current));
  }, []);

  const changeInput = useCallback((value: string) => {
    setInput(value);
    setError((current) => (current ? '' : current));
  }, []);

  return {
    agent,
    chat,
    chats,
    error,
    input,
    inputRef,
    isEmpty,
    typing,
    changeInput,
    newChat,
    openAgent,
    openChat,
    removeChat,
    send,
  };
}

/** Keeps a scroll container pinned to the newest message. */
export function useAutoScroll<T extends HTMLElement>(deps: DependencyList) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: 'smooth' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}
