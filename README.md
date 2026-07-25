# drukstech

**AI-powered mobile app factory with local inference, RAG, and MonkeyCode integration.**

drukstech generates, validates, and runs native mobile apps from natural language descriptions. Supports Ollama, OpenAI, Claude, and on-device AI (LiteRT / Gemma) with local RAG retrieval.

## Setup

```bash
git clone https://github.com/SandroRM/drukstech-app
cd drukstech-app
npm install --legacy-peer-deps
```

## Run web (dev)

```bash
npx expo start --web
```

## Run mobile (Expo Go)

```bash
npx expo start
```

## Build web (PWA)

```bash
npx expo export --platform web
# output in dist/
```

## Build Android APK (Capacitor)

```bash
npm install --legacy-peer-deps
npx expo export --platform web
npx cap sync
cd android && ./gradlew assembleDebug
# APK at: android/app/build/outputs/apk/debug/app-debug.apk
```

*Requires: Android SDK, Java 17+, Gradle.*

## Configuration

All connection URLs and AI provider settings are configurable via the **Settings** tab (5th tab):

1. **Connections** — MonkeyCode URL, License API URL, Validation API URL
2. **AI Provider** — Ollama, OpenAI, Claude (select and configure each)
3. **Local AI Model** — Gemma 2B / 4B (download and activate via LiteRT)
4. **RAG** — Manage components, reindex embeddings
5. **Language** — EN, IT, ES, FR, DE

## 5 Tabs

| Tab | Function |
|-----|----------|
| Início | Generate modules from natural language prompts |
| Módulos | Browse, open, rename, delete saved modules |
| MonkeyCode | WebView loading configured MonkeyCode URL |
| Preview | Unified preview for modules and MonkeyCode output |
| Configurações | All connection URLs, AI providers, local model, RAG, language |

## Features

- AI module generation (Ollama / OpenAI / Claude)
- On-device AI inference via LiteRT-LM (Gemma 2B/4B)
- Local RAG retrieval with embeddings and dynamic prompts
- MonkeyCode WebView integration with postMessage
- License service with JWT (expo-secure-store)
- SQLite database (modules, rag_docs, settings tables)
- PWA support (service worker, manifest)
- Capacitor for native Android APK
- 5-language UI (EN, IT, ES, FR, DE)

## Tech Stack

- React Native 0.81 + Expo SDK 54
- Expo Router v6 (file-based navigation)
- TypeScript 5.9 (strict)
- Zod v4 (module validation)
- SQLite (expo-sqlite)
- Secure Storage (expo-secure-store)
- LiteRT-LM (react-native-litert-lm)
- AsyncStorage (settings persistence)
- Capacitor (Android APK packaging)

## License

Apache 2.0
