import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { checkLicenseValid, validateLicense } from './licenseService';

const C = {
  bg: '#0b1120',
  surface: '#1a2236',
  border: '#2d3f5c',
  primary: '#6366f1',
  text: '#e8edf5',
  muted: '#7a92b3',
  error: '#f87171',
};

interface Props {
  onLicensed: () => void;
}

export function LicenseGate({ onLicensed }: Props) {
  const [checking, setChecking] = useState(true);
  const [key, setKey] = useState('');
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const valid = await checkLicenseValid();
      setChecking(false);
      if (valid) onLicensed();
    })();
  }, [onLicensed]);

  const handleActivate = async () => {
    const trimmed = key.trim();
    if (!trimmed) return;
    setActivating(true);
    setError(null);
    try {
      const result = await validateLicense(trimmed);
      if (result.ok) {
        onLicensed();
      } else {
        setError(result.error);
      }
    } finally {
      setActivating(false);
    }
  };

  if (checking) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  return (
    <Modal visible animationType="fade" statusBarTranslucent>
      <SafeAreaView style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name="lock-closed" size={40} color={C.primary} />
          </View>
          <Text style={styles.title}>Ativar Licença</Text>
          <Text style={styles.subtitle}>
            Insira sua chave de licença para ativar o drukstech.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Chave de licença"
            placeholderTextColor={C.muted}
            value={key}
            onChangeText={setKey}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={C.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Pressable
            style={[styles.btn, (!key.trim() || activating) && styles.btnDisabled]}
            onPress={handleActivate}
            disabled={!key.trim() || activating}
          >
            {activating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.btnText}>Ativar</Text>
            )}
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center' },
  overlay: { flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: {
    backgroundColor: C.surface,
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    width: '100%',
    maxWidth: 380,
    gap: 14,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1e1b4b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#312e81',
  },
  title: { color: C.text, fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { color: C.muted, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  input: {
    backgroundColor: '#0b1120',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: C.text,
    fontSize: 15,
    width: '100%',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#180808',
    borderWidth: 1,
    borderColor: '#6b1a1a',
    borderRadius: 8,
    padding: 10,
    width: '100%',
  },
  errorText: { color: C.error, fontSize: 13, flex: 1, lineHeight: 18 },
  btn: {
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    width: '100%',
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
