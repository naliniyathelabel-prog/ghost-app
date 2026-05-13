import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

// Review inbox — see every AI reply, thumbs up/down
// TODO Slice 8: fetch from Supabase message history
// TODO Slice 8: POST feedback to /api/feedback

export default function InboxScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Inbox</Text>
      <Text style={styles.subtitle}>Every reply Ghost sent, reviewed by you</Text>
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No messages yet</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D', padding: 20 },
  title: { fontSize: 28, fontWeight: '700', color: '#fff', marginTop: 60 },
  subtitle: { color: '#888', fontSize: 14, marginTop: 4, marginBottom: 32 },
  empty: { flex: 1, alignItems: 'center', paddingTop: 80 },
  emptyText: { color: '#555', fontSize: 14 },
});
