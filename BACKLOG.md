# drukstech App — Backlog Reorganizado

## FASE 1: Repositório e Identidade
- [x] 1.1 Criar repo SandroRM/drukstech-app
- [x] 1.2 Commit inicial: base copy from verticeApp
- [ ] 1.3 Renomear identidade visual para "drukstech" (package.json, app.json, títulos)

## FASE 2: Navegação e Estrutura Base
- [ ] 2.1 BottomTabNavigator com 5 abas: Início, Módulos, MonkeyCode, Preview, Configurações
- [ ] 2.2 Aba Início: tela de geração de módulos (já existe → refatorar)
- [ ] 2.3 Aba Módulos: lista de módulos salvos (já existe → refatorar)

## FASE 3: MonkeyCode via WebView (NOVO)
- [ ] 3.1 Aba MonkeyCode: WebView carregando URL configurável
- [ ] 3.2 Comunicação postMessage entre app e WebView
- [ ] 3.3 Aba Preview: WebView unificado (módulos locais + MonkeyCode)
- [ ] 3.4 Estado offline: "MonkeyCode indisponível — configure a URL"

## FASE 4: Configurações Centralizadas
- [ ] 4.1 Tela de Configurações completa:
  - Conexões: URL MonkeyCode, URL API Licença, URL API Validação
  - Modelo IA: lista de modelos + download/uso
  - IA Providers: Ollama, OpenAI, Claude (manter existente)
  - RAG: botão Gerenciar RAG
- [ ] 4.2 Todos os serviços leem configs do SQLite/AsyncStorage

## FASE 5: IA Local (Gemma via LiteRT)
- [ ] 5.1 Instalar react-native-litert-lm
- [ ] 5.2 Criar onDeviceAI.ts (generate + embed)
- [ ] 5.3 Modelo carregado dinamicamente conforme seleção
- [ ] 5.4 Download de modelos com progresso

## FASE 6: RAG Local
- [ ] 6.1 docs/components/ com .md: webGame, camera, button, input, list, image
- [ ] 6.2 rag/retriever.ts com embeddings locais
- [ ] 6.3 aiClient.ts com prompt dinâmico do RAG
- [ ] 6.4 RagManagerScreen (listar, adicionar, editar, excluir, reindexar)

## FASE 7: Licença por Domínio
- [ ] 7.1 expo-secure-store para JWT
- [ ] 7.2 Serviço de validação usando URL configurável
- [ ] 7.3 JWT em todas as requisições

## FASE 8: Banco de Dados Local
- [ ] 8.1 expo-sqlite + dbService.ts
- [ ] 8.2 Tabelas: modules, rag_docs, settings

## FASE 9: Empacotamento
- [ ] 9.1 Capacitor + Android APK
- [ ] 9.2 PWA (service worker, manifest)
- [ ] 9.3 Build web: npx expo export --platform web
- [ ] 9.4 APK na pasta releases/

## FASE 10: Finalização
- [ ] 10.1 README atualizado
- [ ] 10.2 Commit final e push
- [ ] 10.3 Link repo + APK + instruções
