'use client';

import dynamic from 'next/dynamic';

/**
 * The widget is seeded from `localStorage` and the clock, so prerendering it
 * would only produce markup hydration has to throw away. `ssr: false` is only
 * honoured inside a Client Component, which is all this wrapper exists for.
 */
const ChatWidget = dynamic(() => import('./ChatWidget'), { ssr: false });

export default function ChatWidgetClient() {
  return <ChatWidget />;
}
