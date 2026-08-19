import { useEffect, useRef, useState } from 'react';
import { getReply, SUGGESTIONS } from './bot';
import { notifyHost } from './host';

const BOT_NAME = import.meta.env.VITE_BOT_NAME || 'ABC Assist';
const COMPANY_NAME = import.meta.env.VITE_COMPANY_NAME || 'ABC Insurance Ltd.';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

let nextId = 1;
const clockTime = () =>
  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const makeMessage = (author, text) => ({ id: nextId++, author, text, time: clockTime() });

/** Uses the backend when one is configured, otherwise the canned engine. */
async function askBot(text) {
  if (!API_BASE_URL) return getReply(text);

  try {
    const response = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }),
    });
    if (!response.ok) throw new Error(`Bad status ${response.status}`);
    const data = await response.json();
    return data.reply || getReply(text);
  } catch (error) {
    console.warn('[widget] backend unreachable, falling back to canned reply', error);
    return getReply(text);
  }
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true">
      <path
        d="M3.4 20.4l17.45-7.48a1 1 0 000-1.84L3.4 3.6a.999.999 0 00-1.4.92V9.5c0 .5.37.93.87.99L15 12 2.87 13.51c-.5.06-.87.49-.87.99v4.98a1 1 0 001.4.92z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function ChatWidget() {
  const [messages, setMessages] = useState([
    makeMessage(
      'bot',
      `Hi! I'm ${BOT_NAME}, your ${COMPANY_NAME} assistant. Ask me anything, or tap a suggestion below.`
    ),
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    notifyHost('ready');
  }, []);

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  // `refocus` is false for suggestion chips: tapping a chip must never pull the
  // on-screen keyboard up. Typing already has focus, so it keeps it.
  async function send(text, { refocus = true } = {}) {
    const trimmed = text.trim();
    if (!trimmed || typing) return;

    setMessages((current) => [...current, makeMessage('user', trimmed)]);
    setInput('');
    setTyping(true);

    const reply = await askBot(trimmed);
    // Small pause so the typing indicator is actually visible.
    await new Promise((resolve) => setTimeout(resolve, 500));

    setTyping(false);
    setMessages((current) => [...current, makeMessage('bot', reply)]);
    if (refocus) inputRef.current?.focus();
  }

  return (
    <div className="widget">
      <header className="header">
        <div className="avatar" aria-hidden="true">
          <span>AI</span>
        </div>

        <div className="headerText">
          <span className="headerTitle">{BOT_NAME}</span>
          <span className="headerSubtitle">
            <i className="statusDot" />
            Online · {COMPANY_NAME}
          </span>
        </div>

        <button className="closeButton" onClick={() => notifyHost('close')} aria-label="Close chat">
          <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </header>

      <div className="messages" ref={listRef}>
        {messages.map((message) => (
          <div key={message.id} className={`row ${message.author}`}>
            <div className="bubble">{message.text}</div>
            <span className="time">{message.time}</span>
          </div>
        ))}

        {typing && (
          <div className="row bot">
            <div className="bubble typing" aria-label={`${BOT_NAME} is typing`}>
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
      </div>

      <div className="chipsWrap">
        <div className="chips">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              className="chip"
              type="button"
              // Stops the tap from moving focus into (or out of) the composer.
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => send(suggestion, { refocus: false })}
              disabled={typing}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      <form
        className="composer"
        onSubmit={(event) => {
          event.preventDefault();
          send(input);
        }}
      >
        <input
          ref={inputRef}
          className="input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Type your message…"
          aria-label="Message"
          autoComplete="off"
        />
        <button
          className="sendButton"
          type="submit"
          // Keeps focus in the input so the keyboard does not flicker shut.
          onMouseDown={(event) => event.preventDefault()}
          disabled={!input.trim() || typing}
          aria-label="Send message"
        >
          <SendIcon />
        </button>
      </form>
    </div>
  );
}
