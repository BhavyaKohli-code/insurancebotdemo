'use client';

import { useEffect, useRef, useState } from 'react';
import { BOT_NAME, COMPANY_NAME, initialsOf, USER } from '@/lib/brand';
import { MAX_MESSAGE_LENGTH } from '@/lib/validation';
import { AGENTS, getAgent, type AgentId } from '@/lib/agents';
import { groupByDay } from '@/lib/history';
import { useAutoScroll, useChatSession } from '@/lib/useChatSession';

/**
 * The desktop surface, served at /dashboard.
 *
 * Unlike the embedded widget this is a full application shell: a persistent
 * sidebar that collapses to an icon rail, a top bar carrying the active
 * specialist and the user's profile, and a centred conversation column.
 */
export default function Dashboard() {
  const {
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
  } = useChatSession();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const listRef = useAutoScroll<HTMLDivElement>([chat.messages, typing]);

  // Dismiss the profile menu on an outside click or Escape, the way any
  // desktop menu is expected to behave.
  useEffect(() => {
    if (!profileOpen) return undefined;
    const onPointer = (event: MouseEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) setProfileOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setProfileOpen(false);
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [profileOpen]);

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-white font-sans text-[15px] text-slate-800">
      <aside
        className={`flex shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-slate-50 transition-[width] duration-200 ${
          sidebarOpen ? 'w-[276px]' : 'w-[60px]'
        }`}
      >
        {!sidebarOpen && (
          <Rail
            activeAgentId={chat.agentId}
            onExpand={() => setSidebarOpen(true)}
            onNewChat={newChat}
            onPickAgent={openAgent}
          />
        )}

        <div
          className={`w-[276px] flex-1 flex-col overflow-hidden ${sidebarOpen ? 'flex' : 'hidden'}`}
        >
          <div className="flex items-center gap-2 px-4 py-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0B3C7A] text-[12px] font-bold text-white">
              ABC
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-[14px] font-semibold text-slate-900">{BOT_NAME}</p>
              <p className="truncate text-[11px] text-slate-500">{COMPANY_NAME}</p>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
            >
              <PanelIcon />
            </button>
          </div>

          <div className="px-3">
            <button
              type="button"
              onClick={newChat}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#0B3C7A] px-3 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
            >
              <span className="text-[15px] leading-none">+</span>
              New chat
            </button>
          </div>

          <div className="mt-5 flex-1 overflow-y-auto px-3 pb-4">
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
                    onClick={() => openAgent(option.id)}
                    aria-current={active ? 'true' : undefined}
                    className={`relative flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors ${
                      active ? 'bg-slate-200/70' : 'hover:bg-slate-200/50'
                    }`}
                  >
                    {active && (
                      <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-[#0B3C7A]" />
                    )}
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-semibold tracking-wide ${
                        active
                          ? 'bg-[#0B3C7A] text-white'
                          : 'bg-white text-slate-600 ring-1 ring-slate-200'
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
                      <span className="block truncate text-[11px] text-slate-500">
                        {option.role}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="px-1 pb-1.5 pt-6 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
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
                          onClick={() => openChat(saved)}
                          className={`flex w-full flex-col gap-0.5 rounded-lg py-1.5 pl-2 pr-7 text-left leading-tight transition-colors ${
                            active ? 'bg-slate-200/70' : 'hover:bg-slate-200/50'
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
                          className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-1 text-xs text-slate-400 opacity-0 transition-opacity hover:bg-slate-300/60 hover:text-slate-700 focus:opacity-100 group-hover:opacity-100"
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
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 px-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0B3C7A] text-[11px] font-semibold tracking-wide text-white">
              {agent.initials}
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-[14px] font-semibold text-slate-900">{agent.name}</p>
              <p className="truncate text-[11px] text-slate-500">{agent.role}</p>
            </div>
          </div>

          <div ref={profileRef} className="relative ml-auto">
            <button
              type="button"
              onClick={() => setProfileOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={profileOpen}
              className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 transition-colors hover:bg-slate-100"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[11px] font-semibold text-slate-700">
                {initialsOf(USER.name)}
              </span>
              <span className="hidden min-w-0 text-left leading-tight sm:block">
                <span className="block truncate text-[13px] font-medium text-slate-800">
                  {USER.name}
                </span>
                <span className="block truncate text-[11px] text-slate-500">{USER.role}</span>
              </span>
              <svg viewBox="0 0 24 24" width="14" height="14" className="text-slate-400">
                <path fill="currentColor" d="M7 10l5 5 5-5z" />
              </svg>
            </button>

            {profileOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-40 mt-1.5 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
              >
                <div className="border-b border-slate-100 px-3.5 py-3">
                  <p className="truncate text-[13px] font-semibold text-slate-900">{USER.name}</p>
                  <p className="truncate text-[11px] text-slate-500">{USER.email}</p>
                </div>
                <div className="py-1">
                  {['Profile', 'Preferences', 'Help & support'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      role="menuitem"
                      onClick={() => setProfileOpen(false)}
                      className="block w-full px-3.5 py-2 text-left text-[13px] text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <div className="border-t border-slate-100 py-1">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => setProfileOpen(false)}
                    className="block w-full px-3.5 py-2 text-left text-[13px] text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <div ref={listRef} className="flex-1 overflow-y-auto">
          {isEmpty ? (
            <div className="mx-auto flex h-full max-w-3xl flex-col items-center justify-center px-6 py-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0B3C7A] text-[13px] font-semibold tracking-wide text-white">
                {agent.initials}
              </div>
              <h1 className="mt-4 text-[22px] font-semibold text-slate-900">{agent.name}</h1>
              <p className="mt-1 text-[14px] text-slate-500">{agent.role}</p>
              <p className="mt-4 max-w-lg text-center text-[14px] leading-relaxed text-slate-600">
                {agent.greeting}
              </p>

              <div className="mt-8 grid w-full gap-2.5 sm:grid-cols-2">
                {agent.suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => send(suggestion, { refocus: false })}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-left text-[13px] text-slate-700 transition-colors hover:border-[#0B3C7A] hover:bg-slate-50 hover:text-[#0B3C7A]"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-6 px-6 py-8">
              {chat.messages.map((message) => (
                <div key={message.id} className="flex gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-semibold tracking-wide ${
                      message.author === 'user'
                        ? 'bg-slate-200 text-slate-700'
                        : 'bg-[#0B3C7A] text-white'
                    }`}
                  >
                    {message.author === 'user' ? initialsOf(USER.name) : agent.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[13px] font-semibold text-slate-900">
                        {message.author === 'user' ? USER.name : agent.name}
                      </span>
                      <span className="text-[11px] text-slate-400">{message.time}</span>
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-[15px] leading-relaxed text-slate-700">
                      {message.text}
                    </p>
                  </div>
                </div>
              ))}

              {typing && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0B3C7A] text-[11px] font-semibold tracking-wide text-white">
                    {agent.initials}
                  </div>
                  <div className="flex items-center gap-1 pt-2.5">
                    {[0, 150, 300].map((delay) => (
                      <span
                        key={delay}
                        style={{ animationDelay: `${delay}ms` }}
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="shrink-0 px-6 pb-5">
          <div className="mx-auto max-w-3xl">
            {!isEmpty && (
              <div className="mb-2.5 flex flex-wrap gap-2">
                {agent.suggestions.slice(0, 3).map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    disabled={typing}
                    onClick={() => send(suggestion, { refocus: false })}
                    className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600 transition-colors hover:border-[#0B3C7A] hover:text-[#0B3C7A] disabled:opacity-50"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {error && <p className="mb-1.5 text-xs text-red-600">{error}</p>}

            <form
              onSubmit={(event) => {
                event.preventDefault();
                send(input);
              }}
              className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm transition-colors focus-within:border-[#0B3C7A]"
            >
              <input
                ref={inputRef}
                value={input}
                maxLength={MAX_MESSAGE_LENGTH}
                onChange={(event) => changeInput(event.target.value)}
                placeholder={`Message ${agent.name}…`}
                aria-label="Message"
                autoComplete="off"
                className="min-w-0 flex-1 bg-transparent px-3 py-2 outline-none placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={!input.trim() || typing}
                aria-label="Send message"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0B3C7A] text-white transition-opacity disabled:opacity-40"
              >
                <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M3.4 20.4l17.45-7.48a1 1 0 000-1.84L3.4 3.6a.999.999 0 00-1.4.92V9.5c0 .5.37.93.87.99L15 12 2.87 13.51c-.5.06-.87.49-.87.99v4.98a1 1 0 001.4.92z"
                  />
                </svg>
              </button>
            </form>

            <p className="mt-2 text-center text-[11px] text-slate-400">
              {agent.name} answers from {COMPANY_NAME} reference data. Verify anything you act on.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface RailProps {
  activeAgentId: AgentId;
  onExpand: () => void;
  onNewChat: () => void;
  onPickAgent: (id: AgentId) => void;
}

/**
 * The collapsed sidebar. It keeps the specialists reachable in one click
 * rather than hiding the navigation entirely, so collapsing reclaims width
 * without the app looking like it lost a panel.
 */
function Rail({ activeAgentId, onExpand, onNewChat, onPickAgent }: RailProps) {
  return (
    <div className="flex w-[60px] flex-1 flex-col items-center gap-1.5 py-3.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0B3C7A] text-[10px] font-bold text-white">
        ABC
      </div>

      <button
        type="button"
        onClick={onExpand}
        aria-label="Expand sidebar"
        title="Expand sidebar"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
      >
        <PanelIcon />
      </button>

      <span className="my-1 h-px w-7 bg-slate-200" />

      <button
        type="button"
        onClick={onNewChat}
        aria-label="New chat"
        title="New chat"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-[17px] leading-none text-slate-600 transition-colors hover:border-[#0B3C7A] hover:text-[#0B3C7A]"
      >
        +
      </button>

      <span className="my-1 h-px w-7 bg-slate-200" />

      {AGENTS.map((option) => {
        const active = option.id === activeAgentId;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onPickAgent(option.id)}
            aria-current={active ? 'true' : undefined}
            aria-label={option.name}
            title={`${option.name} — ${option.role}`}
            className={`flex h-9 w-9 items-center justify-center rounded-lg text-[11px] font-semibold tracking-wide transition-colors ${
              active
                ? 'bg-[#0B3C7A] text-white'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-[#0B3C7A]'
            }`}
          >
            {option.initials}
          </button>
        );
      })}
    </div>
  );
}

function PanelIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zM5 5h4v14H5V5zm14 14h-8V5h8v14z"
      />
    </svg>
  );
}
