'use client';

import { useEffect, useState } from 'react';
import { BOT_NAME, COMPANY_NAME } from '@/lib/brand';
import { MAX_MESSAGE_LENGTH } from '@/lib/validation';
import { notifyHost } from '@/lib/bridge';
import { AGENTS, getAgent } from '@/lib/agents';
import { groupByDay } from '@/lib/history';
import { useAutoScroll, useChatSession } from '@/lib/useChatSession';

/**
 * The embedded surface: a phone-sized sheet shown inside the mobile app's
 * WebView. The desktop equivalent is `Dashboard.tsx`; both share their
 * conversation logic through `useChatSession`.
 */
export default function ChatWidget() {
  const {
    agent,
    chat,
    chats,
    error,
    input,
    inputRef,
    typing,
    changeInput,
    newChat,
    openAgent,
    openChat,
    removeChat,
    send,
  } = useChatSession();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const listRef = useAutoScroll<HTMLDivElement>([chat.messages, typing]);

  // Announced once the sheet is mounted, which is the host's cue to drop its
  // loading spinner.
  useEffect(() => notifyHost('ready'), []);

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setDrawerOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  const close = () => setDrawerOpen(false);

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden bg-slate-50 font-sans text-[15px] text-slate-800">
      <header className="flex items-center gap-2.5 border-b border-black/10 bg-[#0B3C7A] px-3 py-3 text-white">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          className="-ml-0.5 rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path
              fill="currentColor"
              d="M3 6h18a1 1 0 000-2H3a1 1 0 000 2zm18 5H3a1 1 0 000 2h18a1 1 0 000-2zm0 7H3a1 1 0 000 2h18a1 1 0 000-2z"
            />
          </svg>
        </button>

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[11px] font-semibold tracking-wide ring-1 ring-inset ring-white/20">
          {agent.initials}
        </div>
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-[15px] font-semibold">{agent.name}</span>
          <span className="truncate text-[11px] text-white/60">{agent.role}</span>
        </div>

        <button
          type="button"
          onClick={() => notifyHost('close')}
          aria-label="Close chat"
          className="ml-auto rounded-lg px-2 py-1 text-lg leading-none text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          ✕
        </button>
      </header>

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {chat.messages.map((message) => (
          <div
            key={message.id}
            className={`flex flex-col ${message.author === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                message.author === 'user'
                  ? 'rounded-br-md bg-[#0B3C7A] text-white'
                  : 'rounded-bl-md border border-slate-200 bg-white text-slate-800'
              }`}
            >
              {message.text}
            </div>
            <span className="mt-1 px-1 text-[11px] text-slate-400">
              {message.author === 'bot' && (
                <>
                  <span className="font-medium text-slate-500">{agent.name}</span>
                  {' · '}
                </>
              )}
              {message.time}
            </span>
          </div>
        ))}

        {typing && (
          <div className="flex w-fit gap-1 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-3.5 py-3">
            {[0, 150, 300].map((delay) => (
              <span
                key={delay}
                style={{ animationDelay: `${delay}ms` }}
                className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto px-4 pb-2.5">
        {agent.suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            disabled={typing}
            // Stops the tap from moving focus into (or out of) the composer.
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => send(suggestion, { refocus: false })}
            className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 transition-colors hover:border-[#0B3C7A] hover:text-[#0B3C7A] disabled:opacity-50"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {error && <p className="px-4 pb-1 text-xs text-red-600">{error}</p>}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t border-slate-200 bg-white px-3 py-2.5"
      >
        <input
          ref={inputRef}
          value={input}
          maxLength={MAX_MESSAGE_LENGTH}
          onChange={(event) => changeInput(event.target.value)}
          placeholder={`Message ${agent.name}…`}
          aria-label="Message"
          autoComplete="off"
          className="min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 outline-none transition-colors placeholder:text-slate-400 focus:border-[#0B3C7A] focus:bg-white"
        />
        <button
          type="submit"
          disabled={!input.trim() || typing}
          aria-label="Send message"
          // Keeps focus in the input so the keyboard does not flicker shut.
          onMouseDown={(event) => event.preventDefault()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0B3C7A] text-white transition-opacity disabled:opacity-40"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path
              fill="currentColor"
              d="M3.4 20.4l17.45-7.48a1 1 0 000-1.84L3.4 3.6a.999.999 0 00-1.4.92V9.5c0 .5.37.93.87.99L15 12 2.87 13.51c-.5.06-.87.49-.87.99v4.98a1 1 0 001.4.92z"
            />
          </svg>
        </button>
      </form>

      <div
        onClick={close}
        aria-hidden="true"
        className={`absolute inset-0 z-20 bg-slate-900/40 transition-opacity duration-200 ${
          drawerOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        aria-label="Agents and chat history"
        aria-hidden={!drawerOpen}
        className={`absolute inset-y-0 left-0 z-30 flex w-[86%] max-w-[290px] flex-col border-r border-slate-200 bg-white transition-transform duration-200 ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3.5">
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[14px] font-semibold text-slate-900">{BOT_NAME}</p>
            <p className="truncate text-[11px] text-slate-500">{COMPANY_NAME}</p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close menu"
            className="rounded-lg px-1.5 py-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        <div className="px-3 pt-3">
          <button
            type="button"
            onClick={() => {
              newChat();
              close();
            }}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[13px] font-medium text-slate-700 transition-colors hover:border-[#0B3C7A] hover:text-[#0B3C7A]"
          >
            <span className="text-[15px] leading-none">+</span>
            New chat
          </button>
        </div>

        <div className="mt-4 flex-1 overflow-y-auto px-3 pb-4">
          <p className="px-1 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
            Specialists
          </p>
          <div className="space-y-0.5">
            {AGENTS.map((option) => {
              const active = option.id === chat.agentId;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    openAgent(option.id);
                    close();
                  }}
                  aria-current={active ? 'true' : undefined}
                  className={`relative flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors ${
                    active ? 'bg-slate-100' : 'hover:bg-slate-50'
                  }`}
                >
                  {active && (
                    <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-[#0B3C7A]" />
                  )}
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-semibold tracking-wide ${
                      active ? 'bg-[#0B3C7A] text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {option.initials}
                  </span>
                  <span className="min-w-0 flex-1 leading-tight">
                    <span
                      className={`block truncate text-[13px] ${
                        active ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'
                      }`}
                    >
                      {option.name}
                    </span>
                    <span className="block truncate text-[11px] text-slate-500">{option.role}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <p className="px-1 pb-1.5 pt-5 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
            Recent
          </p>

          {chats.length === 0 && (
            <p className="px-1 py-1 text-[12px] leading-relaxed text-slate-400">
              Your conversations will appear here once you send a message.
            </p>
          )}

          {groupByDay(chats).map((bucket) => (
            <div key={bucket.label}>
              <p className="px-1 pb-0.5 pt-2 text-[11px] font-medium text-slate-400">
                {bucket.label}
              </p>
              <div className="space-y-0.5">
                {bucket.chats.map((saved) => {
                  const owner = getAgent(saved.agentId);
                  const active = saved.id === chat.id;
                  return (
                    <div key={saved.id} className="group relative">
                      <button
                        type="button"
                        onClick={() => {
                          openChat(saved);
                          close();
                        }}
                        className={`flex w-full flex-col gap-0.5 rounded-lg py-1.5 pl-2 pr-7 text-left leading-tight transition-colors ${
                          active ? 'bg-slate-100' : 'hover:bg-slate-50'
                        }`}
                      >
                        <span className="w-full truncate text-[13px] text-slate-700">
                          {saved.title || 'New chat'}
                        </span>
                        <span className="w-full truncate text-[11px] text-slate-400">
                          {owner.name}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          removeChat(saved.id);
                        }}
                        aria-label={`Delete chat ${saved.title || 'New chat'}`}
                        className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-1 text-xs text-slate-400 opacity-0 transition-opacity hover:bg-slate-200 hover:text-slate-700 focus:opacity-100 group-hover:opacity-100"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
