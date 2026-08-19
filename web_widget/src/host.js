/**
 * Tiny bridge so the widget can talk to whatever embeds it — a React Native
 * WebView in the mobile app, or a plain iframe on the web.
 */
export function notifyHost(type, payload = {}) {
  const message = JSON.stringify({ source: 'abc-chat-widget', type, ...payload });

  // React Native WebView
  if (typeof window !== 'undefined' && window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(message);
    return;
  }

  // Browser iframe
  if (typeof window !== 'undefined' && window.parent !== window) {
    window.parent.postMessage(message, '*');
  }
}
