import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useState } from 'react';

// Train Your Ghost — personality setup
// TODO Slice 6: POST to /api/persona with form values
// TODO Slice 6: AI parses sample replies → extract style fingerprint

export default function TrainScreen() {
  const [samples, setSamples] = useState('');
  const [language, setLanguage] = useState<'english' | 'hinglish' | 'tamil'>('english');
  const [tone, setTone] = useState<'casual' | 'formal'>('casual');

  const langs = ['english', 'hinglish', 'tamil'] as const;
  const tones = ['casual', 'formal'] as const;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Train Your Ghost</Text>
      <Text style={styles.subtitle}>Paste 5 real replies you've sent. Ghost will match your tone exactly.</Text>

      <Text style={styles.label}>Language</Text>
      <View style={styles.pills}>
        {langs.map((l) => (
          <TouchableOpacity
            key={l} onPress={() => setLanguage(l)}
            style={[styles.pill, language === l && styles.pillActive]}
          >
            <Text style={[styles.pillText, language === l && styles.pillTextActive]}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Tone</Text>
      <View style={styles.pills}>
        {tones.map((t) => (
          <TouchableOpacity
            key={t} onPress={() => setTone(t)}
            style={[styles.pill, tone === t && styles.pillActive]}
          >
            <Text style={[styles.pillText, tone === t && styles.pillTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Paste 5 sample replies</Text>
      <TextInput
        style={styles.textArea}
        multiline
        numberOfLines={8}
        placeholder={"e.g.\nhey da, order dispatched already!\nbro relax, it'll be there by tmrw\nyeah da coming today itself"}
        placeholderTextColor="#555"
        value={samples}
        onChangeText={setSamples}
      />

      <TouchableOpacity style={styles.btn}>
        <Text style={styles.btnText}>Save Ghost Persona</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D', padding: 20 },
  title: { fontSize: 28, fontWeight: '700', color: '#fff', marginTop: 60 },
  subtitle: { color: '#888', fontSize: 14, marginTop: 4, marginBottom: 32 },
  label: { color: '#aaa', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  pills: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#333' },
  pillActive: { backgroundColor: '#A855F7', borderColor: '#A855F7' },
  pillText: { color: '#888', fontSize: 14 },
  pillTextActive: { color: '#fff' },
  textArea: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, color: '#fff', fontSize: 14, minHeight: 160, textAlignVertical: 'top', borderWidth: 1, borderColor: '#333', marginBottom: 24 },
  btn: { backgroundColor: '#A855F7', borderRadius: 14, padding: 18, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
