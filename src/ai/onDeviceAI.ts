import type { LiteRTLMInstance } from 'react-native-litert-lm/src/modelFactory';
import { loadSettings } from '../settings/settingsStore';

let llm: LiteRTLMInstance | null = null;
let currentModel = '';

function dbg(msg: string) {
  console.log('[onDeviceAI]', msg);
}

async function getLLM(): Promise<LiteRTLMInstance | null> {
  if (!llm) {
    const { createLLM } = require('react-native-litert-lm');
    llm = createLLM();
  }
  return llm;
}

async function ensureModelLoaded(): Promise<void> {
  const settings = await loadSettings();
  const modelName = settings.activeLocalModel || '';
  if (!modelName) {
    throw new Error('Nenhum modelo local selecionado. Configure em Configurações.');
  }
  if (currentModel !== modelName || !llm) {
    const instance = await getLLM();
    if (!instance) throw new Error('Falha ao criar engine LiteRT-LM.');
    let url: string;
    if (settings.localModelUrl) {
      url = settings.localModelUrl;
    } else if (modelName.includes('4B')) {
      url = 'https://huggingface.co/litert-community/gemma-4-E4B-it-litert-lm/resolve/main/gemma-4-E4B-it.litertlm';
    } else {
      url = 'https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm/resolve/main/gemma-4-E2B-it.litertlm';
    }
    dbg(`Loading model: ${modelName} from ${url}`);
    await instance.loadModel(url, { backend: 'cpu', maxOutputTokens: 512 });
    currentModel = modelName;
  }
}

export async function generate(prompt: string): Promise<string> {
  await ensureModelLoaded();
  const instance = await getLLM();
  if (!instance) throw new Error('Engine não inicializado.');
  const response = await instance.execute([{ type: 'text' as const, text: prompt }]);
  return response;
}

export function generateStream(
  prompt: string,
  onToken: (token: string, done: boolean) => void
): Promise<void> {
  return ensureModelLoaded().then(async () => {
    const instance = await getLLM();
    if (!instance) throw new Error('Engine não inicializado.');
    await instance.execute(
      [{ type: 'text' as const, text: prompt }],
      (token: string, done: boolean) => onToken(token, done)
    );
  });
}

export async function embed(text: string): Promise<number[]> {
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
  const vector = new Array(384).fill(0);
  for (const word of words) {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = ((hash << 5) - hash + word.charCodeAt(i)) | 0;
    }
    const idx = Math.abs(hash) % 384;
    vector[idx] += 1;
  }
  const norm = Math.sqrt(vector.reduce((s, v) => s + v * v, 0));
  if (norm > 0) {
    for (let i = 0; i < vector.length; i++) vector[i] /= norm;
  }
  return vector;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export async function isReady(): Promise<boolean> {
  return llm !== null && currentModel !== '';
}

export async function close(): Promise<void> {
  if (llm) {
    llm.close();
    llm = null;
    currentModel = '';
  }
}
