import { WebView } from 'react-native-webview';

// ngrok's free tier shows a click-through interstitial for anything that looks
// like a browser. The header skips it, and the non-browser UA covers the
// sub-resource requests that cannot carry custom headers.
const HEADERS = { 'ngrok-skip-browser-warning': 'true' };
const USER_AGENT = 'MobileAppWebView/1.0';

/**
 * Native embed for the chat widget. The `.web.js` sibling renders an iframe
 * instead, because react-native-webview has no web implementation.
 */
export default function WebFrame({ uri, style, onMessage }) {
  return (
    <WebView
      source={{ uri, headers: HEADERS }}
      style={style}
      userAgent={USER_AGENT}
      onMessage={(event) => onMessage?.(event.nativeEvent.data)}
      originWhitelist={['*']}
      javaScriptEnabled
      domStorageEnabled
      keyboardDisplayRequiresUserAction={false}
      // Cleartext http://<lan-ip> is fine for local development.
      mixedContentMode="always"
    />
  );
}
