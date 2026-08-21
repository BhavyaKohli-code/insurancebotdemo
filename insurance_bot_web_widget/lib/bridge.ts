/**
 * Talking to whatever embeds the widget, and the small formatting helper the
 * message list needs. Browser-only: every function here touches `window`.
 */

import type { AgentId } from './agents';

interface ReactNativeWebViewBridge {
  postMessage: (message: string) => void;
}

declare global {
  interface Window {
    ReactNativeWebView?: ReactNativeWebViewBridge;
  }
}

export type HostEvent = 'ready' | 'close';

/** Bridge to the host: a React Native WebView, or a parent frame on the web. */
export function notifyHost(type: HostEvent): void {
  const message = JSON.stringify({ source: 'abc-chat-widget', type });

  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(message);
  } else if (window.parent !== window) {
    window.parent.postMessage(message, '*');
  }
}

export const clockTime = (): string =>
  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export interface ChatResponse {
  reply: string;
  agentId: AgentId;
}
