import { Stack } from 'expo-router';
import { Fragment, useState } from 'react';
import { CameraCaptureModalHost } from '../src/renderer/CameraCaptureModal';
import { QrScanModalHost } from '../src/renderer/QrScanModal';
import { TorchHost } from '../src/renderer/TorchHost';
import { SettingsProvider } from '../src/settings/SettingsContext';
import { LicenseGate } from '../src/license/LicenseGate';

export default function RootLayout() {
  const [licensed, setLicensed] = useState(false);

  if (!licensed) {
    return <LicenseGate onLicensed={() => setLicensed(true)} />;
  }

  return (
    <SettingsProvider>
      <Fragment>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="module/[id]"
            options={{
              headerStyle: { backgroundColor: '#0b1120' },
              headerTintColor: '#e8edf5',
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen
            name="settings/ollama"
            options={{
              title: 'Ollama',
              headerStyle: { backgroundColor: '#0b1120' },
              headerTintColor: '#e8edf5',
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen
            name="settings/openai"
            options={{
              title: 'OpenAI API',
              headerStyle: { backgroundColor: '#0b1120' },
              headerTintColor: '#e8edf5',
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen
            name="settings/claude"
            options={{
              title: 'Claude API',
              headerStyle: { backgroundColor: '#0b1120' },
              headerTintColor: '#e8edf5',
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen
            name="rag-manager"
            options={{
              title: 'Gerenciar RAG',
              headerStyle: { backgroundColor: '#0b1120' },
              headerTintColor: '#e8edf5',
              headerShadowVisible: false,
            }}
          />
        </Stack>
        <CameraCaptureModalHost />
        <QrScanModalHost />
        <TorchHost />
      </Fragment>
    </SettingsProvider>
  );
}
