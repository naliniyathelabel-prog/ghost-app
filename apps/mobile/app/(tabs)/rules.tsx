import { View, Text, StyleSheet, ScrollView } from 'react-native';

// Contact rules — per-contact allow / block / ask-me-first
// TODO Slice 9: fetch contacts + rules from Supabase
// TODO Slice 9: PUT /api/rules/{contact_id}

export default function RulesScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Rules</Text>
      <Text style={styles.subtitle}>Control who Ghost replies to</Text>
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No contacts yet — Ghost will auto-add them as messages arrive</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D', padding: 20 },
  title: { fontSize: 28, fontWeight: '700', color: '#fff', marginTop: 60 },
  subtitle: { color: '#888', fontSize: 14, marginTop: 4, marginBottom: 32 },
  empty: { flex: 1, alignItems: 'center', paddingTop: 80, paddingHorizontal: 24 },
  emptyText: { color: '#555', fontSize: 14, textAlign: 'center', lineHeight: 22 },
});
