import { useEffect, useRef, useState } from 'react';
import {
  askBot,
  BOT_NAME,
  clockTime,
  COMPANY_NAME,
  MAX_MESSAGE_LENGTH,
  notifyHost,
  SUGGESTIONS,
  validateMessage,
} from './chatWidget';

let nextId = 1;
const makeMessage = (author, text) => ({ id: nextId++, author, text, time: clockTime() });

export default function ChatWidget() {
  const [messages, setMessages] = useState([
    makeMessage('bot', `Hi! I'm ${BOT_NAME}. Ask me anything, or tap a suggestion below.`),
  ]);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [typing, setTyping] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => notifyHost('ready'), []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  // `refocus` is false for suggestion chips so tapping one never pulls the
  // on-screen keyboard up. Typing already has focus, so it keeps it.
  async function send(raw, { refocus = true } = {}) {
    if (typing) return;

    const { text, error: invalid } = validateMessage(raw);
    if (invalid) {
      setError(invalid);
      return;
    }

    setError('');
    setInput('');
    setMessages((current) => [...current, makeMessage('user', text)]);
    setTyping(true);

    const reply = await askBot(text);
    // Small pause so the typing indicator is actually visible.
    await new Promise((resolve) => setTimeout(resolve, 500));

    setTyping(false);
    setMessages((current) => [...current, makeMessage('bot', reply)]);
    if (refocus) inputRef.current?.focus();
  }

  return (
    <div className="flex h-full flex-col bg-slate-50 font-sans text-[15px] text-slate-800">
      <header className="flex items-center gap-3 bg-[#0B3C7A] px-4 py-3 text-white">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
          AI
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-semibold">{BOT_NAME}</span>
          <span className="flex items-center gap-1.5 text-xs text-white/75">
            <i className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Online · {COMPANY_NAME}
          </span>
        </div>
        <button
          type="button"
          onClick={() => notifyHost('close')}
          aria-label="Close chat"
          className="ml-auto rounded-full px-2 py-1 text-lg leading-none text-white/80 hover:bg-white/15 hover:text-white"
        >
          ✕
        </button>
      </header>

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex flex-col ${message.author === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-sm ${
                message.author === 'user'
                  ? 'rounded-br-sm bg-[#0B3C7A] text-white'
                  : 'rounded-bl-sm bg-white text-slate-800'
              }`}
            >
              {message.text}
            </div>
            <span className="mt-1 text-[11px] text-slate-400">{message.time}</span>
          </div>
        ))}

        {typing && (
          <div className="flex gap-1 rounded-2xl rounded-bl-sm bg-white px-3.5 py-3 shadow-sm w-fit">
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

      <div className="flex gap-2 overflow-x-auto px-4 pb-2">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            disabled={typing}
            // Stops the tap from moving focus into (or out of) the composer.
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => send(suggestion, { refocus: false })}
            className="shrink-0 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-600 hover:border-[#0B3C7A] hover:text-[#0B3C7A] disabled:opacity-50"
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
          onChange={(event) => {
            setInput(event.target.value);
            if (error) setError('');
          }}
          placeholder="Type your message…"
          aria-label="Message"
          autoComplete="off"
          className="flex-1 rounded-full bg-slate-100 px-4 py-2.5 outline-none placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#0B3C7A]/30"
        />
        <button
          type="submit"
          disabled={!input.trim() || typing}
          aria-label="Send message"
          // Keeps focus in the input so the keyboard does not flicker shut.
          onMouseDown={(event) => event.preventDefault()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0B3C7A] text-white disabled:opacity-40"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path
              fill="currentColor"
              d="M3.4 20.4l17.45-7.48a1 1 0 000-1.84L3.4 3.6a.999.999 0 00-1.4.92V9.5c0 .5.37.93.87.99L15 12 2.87 13.51c-.5.06-.87.49-.87.99v4.98a1 1 0 001.4.92z"
            />
          </svg>
        </button>
      </form>
    </div>
  );
}
