import { View, Text, Switch, StyleSheet, ScrollView } from 'react-native';
import { useState } from 'react';

// Dashboard — Ghost ON/OFF + live reply feed
// TODO Slice 5: connect to WS /ws/relay for live events
// TODO Slice 5: persist ghost_enabled to Supabase

export default function DashboardScreen() {
  const [ghostEnabled, setGhostEnabled] = useState(false);
  const [replies] = useState<{ id: string; from: string; reply: string }[]>([]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>👻 Ghost</Text>
        <Text style={styles.subtitle}>
          {ghostEnabled ? 'Replying as you' : 'Sleeping'}
        </Text>
      </View>

      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>
          {ghostEnabled ? 'Ghost is ON' : 'Ghost is OFF'}
        </Text>
        <Switch
          value={ghostEnabled}
          onValueChange={setGhostEnabled}
          trackColor={{ true: '#A855F7', false: '#333' }}
          thumbColor="#fff"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's replies</Text>
        {replies.length === 0 ? (
          <Text style={styles.empty}>No replies yet — turn Ghost on</Text>
        ) : (
          replies.map((r) => (
            <View key={r.id} style={styles.replyCard}>
              <Text style={styles.replyFrom}>{r.from}</Text>
              <Text style={styles.replyText}>{r.reply}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D', padding: 20 },
  header: { marginTop: 60, marginBottom: 32 },
  title: { fontSize: 32, fontWeight: '700', color: '#fff' },
  subtitle: { fontSize: 16, color: '#888', marginTop: 4 },
  toggleRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', backgroundColor: '#1a1a1a',
    padding: 20, borderRadius: 16, marginBottom: 32,
  },
  toggleLabel: { fontSize: 18, color: '#fff', fontWeight: '600' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, color: '#888', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  empty: { color: '#555', fontSize: 14, textAlign: 'center', paddingVertical: 24 },
  replyCard: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, marginBottom: 8 },
  replyFrom: { color: '#A855F7', fontSize: 12, marginBottom: 4 },
  replyText: { color: '#fff', fontSize: 14 },
});
