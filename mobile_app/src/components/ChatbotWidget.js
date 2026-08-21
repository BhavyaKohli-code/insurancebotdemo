import { useEffect, useState } from 'react';
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
 * Floating bubble that opens the chat widget hosted by
 * ../../insurance_bot_web_widget.
 * Every word the user reads lives in the web widget, so this file carries no
 * copy: the only native UI is a spinner while the frame loads and a retry
 * glyph if it never arrives.
 */
export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('loading'); // loading | ready | failed

  // The widget posts { source: 'abc-chat-widget', type } once it mounts and
  // again when its header X is tapped. Anything else is not ours.
  const onMessage = (data) => {
    try {
      const payload = typeof data === 'string' ? JSON.parse(data) : data;
      if (payload?.source !== 'abc-chat-widget') return;
      if (payload.type === 'ready') setStatus('ready');
      if (payload.type === 'close') setOpen(false);
    } catch {
      /* not our message */
    }
  };

  // Never leave the user on a spinner forever.
  useEffect(() => {
    if (!open || status !== 'loading') return undefined;
    const timer = setTimeout(() => setStatus('failed'), LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [open, status]);

  const show = () => {
    setStatus('loading');
    setOpen(true);
  };

  return (
    <>
      <Pressable
        style={({ pressed }) => [styles.bubble, pressed && { opacity: 0.85 }]}
        onPress={show}
        accessibilityLabel="Open chatbot"
      >
        <Text style={styles.icon}>💬</Text>
      </Pressable>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />

        {/* Shrinks the sheet instead of letting the keyboard cover the composer. */}
        <KeyboardAvoidingView
          style={styles.wrapper}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          pointerEvents="box-none"
        >
          <View style={styles.sheet}>
            <WebFrame uri={WIDGET_URL} style={styles.frame} onMessage={onMessage} />

            {status !== 'ready' && (
              <View style={styles.overlay}>
                {status === 'loading' ? (
                  <ActivityIndicator size="large" color="#0B3C7A" />
                ) : (
                  <Pressable onPress={show} accessibilityLabel="Retry">
                    <Text style={styles.retry}>↻</Text>
                  </Pressable>
                )}
              </View>
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
    elevation: 8,
  },
  icon: { fontSize: 26 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(8,18,35,0.45)' },
  wrapper: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', padding: 10 },
  sheet: {
    width: '100%',
    maxWidth: 440,
    height: '86%',
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
  },
  frame: { flex: 1, backgroundColor: '#F8FAFC' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  retry: { fontSize: 40, color: '#0B3C7A' },
});
