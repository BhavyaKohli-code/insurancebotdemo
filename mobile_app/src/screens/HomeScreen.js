import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MENU_ITEMS } from '../menu';
import ChatbotWidget from '../components/ChatbotWidget';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.brand}>ABC Insurance Ltd.</Text>
          <Text style={styles.welcome}>What would you like to open?</Text>
        </View>

        <ScrollView contentContainerStyle={styles.grid}>
          {MENU_ITEMS.map((item) => (
            <Pressable
              key={item.key}
              style={({ pressed }) => [
                styles.tile,
                { backgroundColor: item.color },
                pressed && styles.tilePressed,
              ]}
              onPress={() => navigation.navigate(item.key)}
            >
              <Text style={styles.tileIcon}>{item.icon}</Text>
              <Text style={styles.tileTitle}>{item.title}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </SafeAreaView>

      {/* Chat UI lives in insurance_bot_web_widget, loaded in a WebView */}
      <ChatbotWidget />

    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F3F5F9' },
  safe: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16, backgroundColor: '#0B3C7A' },
  brand: { fontSize: 22, fontWeight: '700', color: '#FFFFFF' },
  welcome: { marginTop: 4, fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 110,
  },
  tile: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  tilePressed: { opacity: 0.85 },
  tileIcon: { fontSize: 34 },
  tileTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
