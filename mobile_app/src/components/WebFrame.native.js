import { WebView } from 'react-native-webview';

// ngrok's free tier shows a click-through interstitial for anything that looks
// like a browser. The header skips it, and the non-browser UA covers the
// sub-resource requests that cannot carry custom headers.
const SKIP_TUNNEL_WARNING = { 'ngrok-skip-browser-warning': 'true' };
const USER_AGENT = 'ABCInsuranceApp/1.0 (ReactNativeWebView)';

/**
 * Native embed for the chat widget. The `.web.js` sibling renders an iframe
 * instead, because react-native-webview has no web implementation.
 */
export default function WebFrame({ uri, style, onLoadEnd, onError, onMessage }) {
  return (
    <WebView
      source={{ uri, headers: SKIP_TUNNEL_WARNING }}
      style={style}
      userAgent={USER_AGENT}
      onLoadEnd={onLoadEnd}
      onError={(event) => {
        console.warn('[widget] load error:', event.nativeEvent.description);
        onError?.(event.nativeEvent.description);
      }}
      onHttpError={(event) => {
        const { statusCode, url } = event.nativeEvent;
        console.warn(`[widget] HTTP ${statusCode} from ${url}`);
        onError?.(`HTTP ${statusCode}`);
      }}
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
