import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

/**
 * Shared layout for the six feature pages. Each page passes its own colour,
 * title and blurb so every screen looks distinct.
 */
export default function FeatureScreen({ color, icon, title, subtitle, points }) {
  return (
    <View style={[styles.root, { backgroundColor: color }]}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.icon}>{icon}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          <View style={styles.card}>
            {points.map((point) => (
              <View key={point} style={styles.pointRow}>
                <View style={[styles.bullet, { backgroundColor: color }]} />
                <Text style={styles.pointText}>{point}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.footer}>ABC Insurance Ltd.</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  content: { padding: 24, paddingBottom: 48 },
  icon: { fontSize: 48, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '700', color: '#FFFFFF' },
  subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.85)', marginTop: 6, lineHeight: 22 },
  card: {
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  pointRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  bullet: { width: 8, height: 8, borderRadius: 4, marginTop: 7, marginRight: 12 },
  pointText: { flex: 1, fontSize: 15, color: '#1F2937', lineHeight: 22 },
  footer: { marginTop: 28, textAlign: 'center', color: 'rgba(255,255,255,0.8)', fontSize: 12 },
});
