import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '../../src/i18n/useI18n';

const C = {
  bg: '#0b1120',
  surface: '#1a2236',
  border: '#2d3f5c',
  primary: '#6366f1',
  text: '#e8edf5',
  muted: '#7a92b3',
  faint: '#3d5070',
};

export default function PreviewScreen() {
  const { t } = useI18n();

  return (
    <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />
      <View style={s.header}>
        <Ionicons name="eye-outline" size={20} color={C.primary} />
        <Text style={s.h1}>Preview</Text>
      </View>
      <View style={s.placeholder}>
        <Ionicons name="layers-outline" size={48} color={C.faint} />
        <Text style={s.placeholderTitle}>Pré-visualização unificada</Text>
        <Text style={s.placeholderText}>
          Abra um módulo salvo na aba Módulos ou receba um do MonkeyCode para ver a pré-visualização aqui.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  h1: { fontSize: 26, fontWeight: '800', color: C.text, letterSpacing: -0.5 },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, gap: 12 },
  placeholderTitle: { color: C.text, fontSize: 20, fontWeight: '700' },
  placeholderText: { color: C.muted, fontSize: 14, textAlign: 'center', lineHeight: 20, maxWidth: 300 },
});
