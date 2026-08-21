import { Platform } from 'react-native';

// Next.js dev/start default. The widget is served from
// ../insurance_bot_web_widget.
const DEFAULT_PORT = 3000;

// Android emulators cannot reach the host machine over "localhost".
function normalise(url) {
  if (Platform.OS === 'android') {
    return url.replace('localhost', '10.0.2.2').replace('127.0.0.1', '10.0.2.2');
  }
  return url;
}

export const WIDGET_URL = normalise(
  process.env.EXPO_PUBLIC_WIDGET_URL || `http://localhost:${DEFAULT_PORT}`
);
