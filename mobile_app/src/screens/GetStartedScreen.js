import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function GetStartedScreen({ navigation }) {
  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe}>
        <View style={styles.hero}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>ABC</Text>
          </View>
          <Text style={styles.brand}>ABC Insurance Ltd.</Text>
          <Text style={styles.tagline}>
            Everything your team needs — policies, targets and training — in one place.
          </Text>
        </View>

        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={() => navigation.replace('Home')}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </Pressable>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0B3C7A' },
  safe: { flex: 1, justifyContent: 'space-between', padding: 28 },
  hero: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logo: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { fontSize: 30, fontWeight: '800', color: '#0B3C7A', letterSpacing: 1 },
  brand: { marginTop: 22, fontSize: 26, fontWeight: '700', color: '#FFFFFF' },
  tagline: {
    marginTop: 12,
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  footer: { alignItems: 'center' },
  button: {
    backgroundColor: '#FFB300',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  buttonPressed: { opacity: 0.85 },
  buttonText: { fontSize: 17, fontWeight: '700', color: '#0B3C7A' },
  version: { marginTop: 14, fontSize: 12, color: 'rgba(255,255,255,0.6)' },
});
