import { useEffect } from 'react';

/**
 * Web embed for the chat widget. react-native-web renders to the DOM, so a
 * plain iframe is the right primitive here.
 */
export default function WebFrame({ uri, onMessage }) {
  useEffect(() => {
    if (!onMessage) return undefined;

    const handler = (event) => onMessage(event.data);
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onMessage]);

  return (
    <iframe
      src={uri}
      style={{ width: '100%', height: '100%', border: 'none', background: '#F8FAFC' }}
    />
  );
}
