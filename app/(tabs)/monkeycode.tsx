import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';
import type { WebViewMessageEvent } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../../src/settings/SettingsContext';
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

export default function MonkeyCodeScreen() {
  const { settings } = useSettings();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const monkeyCodeUrl = settings.monkeyCodeUrl || '';

  const onMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('MonkeyCode postMessage:', data);
    } catch {
      console.log('MonkeyCode raw message:', event.nativeEvent.data);
    }
  };

  if (!monkeyCodeUrl) {
    return (
      <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
        <StatusBar style="light" />
        <View style={s.offline}>
          <Ionicons name="cloud-offline-outline" size={48} color={C.faint} />
          <Text style={s.offlineTitle}>MonkeyCode</Text>
          <Text style={s.offlineMsg}>Indisponível — configure a URL nas Configurações.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />
      {loading && (
        <View style={s.loader}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={s.loaderText}>Carregando MonkeyCode...</Text>
        </View>
      )}
      {error && (
        <View style={s.offline}>
          <Ionicons name="cloud-offline-outline" size={48} color={C.faint} />
          <Text style={s.offlineTitle}>Erro de conexão</Text>
          <Text style={s.offlineMsg}>Não foi possível carregar {monkeyCodeUrl}</Text>
        </View>
      )}
      <WebView
        source={{ uri: monkeyCodeUrl }}
        style={s.webview}
        onLoad={() => setLoading(false)}
        onError={() => { setLoading(false); setError(true); }}
        onMessage={onMessage}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState={false}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  webview: { flex: 1 },
  loader: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg, zIndex: 10, gap: 12 },
  loaderText: { color: C.muted, fontSize: 14 },
  offline: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, gap: 12 },
  offlineTitle: { color: C.text, fontSize: 22, fontWeight: '700' },
  offlineMsg: { color: C.muted, fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
