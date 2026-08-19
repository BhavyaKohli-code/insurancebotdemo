import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import WebFrame from './WebFrame';
import { WIDGET_URL } from '../config';

const LOAD_TIMEOUT_MS = 8000;

/**
 * Floating bubble that opens the chat widget hosted by ../../web_widget.
 * All chat UI and behaviour lives in the web app — this file only frames it,
 * so widget changes never require a mobile release.
 */
export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [reason, setReason] = useState('');

  const openChat = useCallback(() => {
    console.log('Chatbot clicked — loading widget from', WIDGET_URL);
    setLoading(true);
    setFailed(false);
    setReason('');
    setOpen(true);
  }, []);

  // Never leave the user staring at a spinner: give up after a few seconds.
  useEffect(() => {
    if (!open || !loading) return undefined;

    const timer = setTimeout(() => {
      setLoading(false);
      setFailed(true);
      setReason('Timed out waiting for the widget to respond.');
    }, LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [open, loading]);

  // Messages posted by the widget (ReactNativeWebView.postMessage on native,
  // window.parent.postMessage in the web iframe).
  const onMessage = useCallback((data) => {
    let payload;
    try {
      payload = typeof data === 'string' ? JSON.parse(data) : data;
    } catch {
      return;
    }
    if (!payload || payload.source !== 'abc-chat-widget') return;

    if (payload.type === 'ready') {
      setLoading(false);
      setFailed(false);
    }
    if (payload.type === 'close') setOpen(false);
  }, []);

  const onLoadEnd = useCallback(() => setLoading(false), []);
  const onError = useCallback((description) => {
    setLoading(false);
    setFailed(true);
    if (description) setReason(String(description));
  }, []);

  return (
    <>
      <Pressable
        style={({ pressed }) => [styles.bubble, pressed && styles.pressed]}
        onPress={openChat}
        accessibilityLabel="Open chatbot"
      >
        <Text style={styles.bubbleIcon}>💬</Text>
      </Pressable>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />

        <KeyboardAvoidingView
          style={styles.sheetWrapper}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          pointerEvents="box-none"
        >
          <View style={styles.sheet}>
            {failed ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorTitle}>Chat unavailable</Text>
                <Text style={styles.errorText}>
                  Could not load the widget from {WIDGET_URL}. Start it with `npm run dev` inside
                  web_widget, then check EXPO_PUBLIC_WIDGET_URL in mobile_app/.env.
                </Text>
                {reason ? <Text style={styles.errorReason}>{reason}</Text> : null}
                <Pressable style={styles.retryButton} onPress={openChat}>
                  <Text style={styles.retryText}>Retry</Text>
                </Pressable>
              </View>
            ) : (
              <>
                <WebFrame
                  uri={WIDGET_URL}
                  style={styles.frame}
                  onLoadEnd={onLoadEnd}
                  onError={onError}
                  onMessage={onMessage}
                />
                {loading && (
                  <View style={styles.loader} pointerEvents="none">
                    <ActivityIndicator size="large" color="#0B3C7A" />
                    <Text style={styles.loaderText}>Connecting to ABC Assist…</Text>
                  </View>
                )}
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bubble: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#0B3C7A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#0B1B33',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  pressed: { opacity: 0.9, transform: [{ scale: 0.96 }] },
  bubbleIcon: { fontSize: 26 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(8,18,35,0.45)' },
  // Padding on the wrapper (not margins on the sheet) keeps the card centred:
  // width '100%' then resolves against the already-padded content box.
  sheetWrapper: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', padding: 10 },
  sheet: {
    width: '100%',
    maxWidth: 440,
    height: '86%',
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#0B1B33',
    shadowOpacity: 0.32,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 14 },
    elevation: 16,
  },
  frame: { flex: 1, backgroundColor: '#F6F8FC' },
  loader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F6F8FC',
  },
  loaderText: { marginTop: 10, color: '#6B7280', fontSize: 13 },
  errorBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 26 },
  errorTitle: { fontSize: 17, fontWeight: '700', color: '#1F2937' },
  errorText: { marginTop: 8, fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
  errorReason: { marginTop: 10, fontSize: 12, color: '#B91C1C', textAlign: 'center' },
  retryButton: {
    marginTop: 18,
    backgroundColor: '#0B3C7A',
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 10,
  },
  retryText: { color: '#FFFFFF', fontWeight: '700' },
});
