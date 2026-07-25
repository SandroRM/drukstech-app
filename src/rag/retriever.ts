// Retriever RAG: busca top 3 componentes usando embeddings locais

import { embed, cosineSimilarity } from '../ai/onDeviceAI';
import { loadSettings } from '../settings/settingsStore';

export interface DocComponent {
  name: string;
  description: string;
  properties: string;
  example: string;
}

const builtInDocs: DocComponent[] = [
  {
    name: 'webGame',
    description: 'Canvas-based web game component with game loop support. Render any 2D game using a canvas element.',
    properties: '{ width: number, height: number, gameLoop: string }',
    example: '<webGame width={400} height={600} gameLoop="flappy" />',
  },
  {
    name: 'camera',
    description: 'Camera capture component for taking photos and videos. Supports front and back cameras.',
    properties: '{ onCapture: (uri: string) => void, facingMode: string }',
    example: '<camera onCapture={(uri) => console.log(uri)} facingMode="back" />',
  },
  {
    name: 'button',
    description: 'Interactive button component with multiple style variants and disabled state.',
    properties: '{ label: string, onPress: () => void, variant: string, disabled?: boolean }',
    example: '<button label="Enviar" onPress={handleSubmit} variant="primary" />',
  },
  {
    name: 'input',
    description: 'Text input field component with support for multiline and secure text entry.',
    properties: '{ value: string, onChange: (text: string) => void, placeholder?: string, multiline?: boolean }',
    example: '<input value={name} onChange={setName} placeholder="Digite seu nome" />',
  },
  {
    name: 'list',
    description: 'Scrollable list component with customizable item rendering and key extraction.',
    properties: '{ items: T[], renderItem: (item: T, index: number) => ReactNode }',
    example: '<list items={todos} renderItem={(todo) => <Text>{todo.title}</Text>} />',
  },
  {
    name: 'image',
    description: 'Image display component with fit modes (cover, contain, fill) and optional dimensions.',
    properties: '{ src: string, alt?: string, fit: string, width?: number, height?: number }',
    example: '<image src="https://example.com/photo.jpg" fit="cover" width={200} height={200} />',
  },
];

let cachedEmbeddings: Map<string, number[]> = new Map();

export async function indexComponents(docs: DocComponent[]): Promise<void> {
  cachedEmbeddings.clear();
  for (const doc of docs) {
    const text = `${doc.name} ${doc.description} ${doc.properties}`;
    const vec = await embed(text);
    cachedEmbeddings.set(doc.name, vec);
  }
}

export async function retrieve(query: string, k = 3): Promise<DocComponent[]> {
  if (cachedEmbeddings.size === 0) {
    await indexComponents(builtInDocs);
  }

  const queryVec = await embed(query);
  const scored = builtInDocs.map((doc) => {
    const docVec = cachedEmbeddings.get(doc.name);
    if (!docVec) return { doc, score: 0 };
    return { doc, score: cosineSimilarity(queryVec, docVec) };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k).map((s) => s.doc);
}

export async function buildRagPrompt(userPrompt: string): Promise<string> {
  const components = await retrieve(userPrompt, 3);
  const ctxParts = components.map(
    (c) => `\n[${c.name}]\n${c.description}\nProps: ${c.properties}\nExemplo: ${c.example}`
  );
  const context = ctxParts.join('\n');

  return `Você é um assistente de geração de módulos React Native para o app drukstech.
Componentes disponíveis:
${context}

Com base nos componentes acima, gere um módulo React Native que atenda à seguinte solicitação do usuário. Use APENAS os componentes listados acima se eles se encaixarem naturalmente. Se o usuário pedir algo diferente, crie com componentes padrão do React Native (View, Text, TouchableOpacity, etc.).

Solicitação: ${userPrompt}`;
}
