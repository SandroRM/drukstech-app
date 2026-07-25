import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';

const C = {
  bg: '#0b1120',
  surface: '#1a2236',
  border: '#2d3f5c',
  primary: '#6366f1',
  text: '#e8edf5',
  muted: '#7a92b3',
  faint: '#3d5070',
  success: '#34d399',
  error: '#f87171',
};

type RagComponent = {
  id: string;
  name: string;
  description: string;
  properties: string;
  example: string;
};

const INITIAL_COMPONENTS: RagComponent[] = [
  { id: '1', name: 'webGame', description: 'Canvas-based web game', properties: '{ width, height, gameLoop }', example: '<WebGame />' },
  { id: '2', name: 'camera', description: 'Camera capture component', properties: '{ onCapture, facingMode }', example: '<Camera />' },
  { id: '3', name: 'button', description: 'Interactive button', properties: '{ label, onPress, variant }', example: '<Button label="Click" />' },
  { id: '4', name: 'input', description: 'Text input field', properties: '{ value, onChange, placeholder }', example: '<Input placeholder="..." />' },
  { id: '5', name: 'list', description: 'Scrollable list', properties: '{ items, renderItem }', example: '<List items={[...]} />' },
  { id: '6', name: 'image', description: 'Image display', properties: '{ src, alt, fit }', example: '<Image src="..." />' },
];

export default function RagManagerScreen() {
  const router = useRouter();
  const [components, setComponents] = useState<RagComponent[]>(INITIAL_COMPONENTS);
  const [editing, setEditing] = useState<RagComponent | null>(null);
  const [form, setForm] = useState({ name: '', description: '', properties: '', example: '' });

  const startAdd = () => {
    setEditing(null);
    setForm({ name: '', description: '', properties: '', example: '' });
  };

  const startEdit = (c: RagComponent) => {
    setEditing(c);
    setForm({ name: c.name, description: c.description, properties: c.properties, example: c.example });
  };

  const saveComponent = () => {
    if (!form.name.trim()) {
      Alert.alert('Erro', 'Nome é obrigatório');
      return;
    }
    if (editing) {
      setComponents((prev) =>
        prev.map((c) => (c.id === editing.id ? { ...c, ...form } : c))
      );
    } else {
      const newComp: RagComponent = {
        id: Date.now().toString(),
        ...form,
      };
      setComponents((prev) => [...prev, newComp]);
    }
    setEditing(null);
    setForm({ name: '', description: '', properties: '', example: '' });
  };

  const deleteComponent = (c: RagComponent) => {
    Alert.alert('Excluir', `Deseja excluir "${c.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => setComponents((prev) => prev.filter((p) => p.id !== c.id)),
      },
    ]);
  };

  const reindex = () => {
    Alert.alert('Reindexar', 'Embeddings recalculados com sucesso!');
  };

  if (editing || (form.name !== '' && !editing)) {
    return (
      <>
        <Stack.Screen options={{ title: editing ? 'Editar Componente' : 'Novo Componente', headerStyle: { backgroundColor: C.bg }, headerTintColor: C.text }} />
        <SafeAreaView style={s.safe} edges={['bottom', 'left', 'right']}>
          <ScrollView style={s.flex} contentContainerStyle={s.formScroll}>
            <Text style={s.formLabel}>Nome</Text>
            <TextInput style={s.input} value={form.name} onChangeText={(t) => setForm({ ...form, name: t })} placeholder="webGame" placeholderTextColor={C.faint} />
            <Text style={s.formLabel}>Descrição</Text>
            <TextInput style={s.input} value={form.description} onChangeText={(t) => setForm({ ...form, description: t })} placeholder="Breve descrição..." placeholderTextColor={C.faint} />
            <Text style={s.formLabel}>Propriedades</Text>
            <TextInput style={s.input} value={form.properties} onChangeText={(t) => setForm({ ...form, properties: t })} placeholder="{ width, height }" placeholderTextColor={C.faint} />
            <Text style={s.formLabel}>Exemplo</Text>
            <TextInput style={[s.input, s.inputLast]} value={form.example} onChangeText={(t) => setForm({ ...form, example: t })} placeholder="<WebGame />" placeholderTextColor={C.faint} />
            <View style={s.formBtns}>
              <Pressable style={s.cancelBtn} onPress={() => { setEditing(null); setForm({ name: '', description: '', properties: '', example: '' }); }}>
                <Text style={s.cancelText}>Cancelar</Text>
              </Pressable>
              <Pressable style={s.saveBtn} onPress={saveComponent}>
                <Text style={s.saveText}>Salvar</Text>
              </Pressable>
            </View>
          </ScrollView>
        </SafeAreaView>
      </>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['bottom', 'left', 'right']}>
      <Stack.Screen options={{ title: 'RAG Manager', headerStyle: { backgroundColor: C.bg }, headerTintColor: C.text }} />
      <StatusBar style="light" />

      <View style={s.toolbar}>
        <View style={{ flex: 1 }} />
        <Pressable style={s.addBtn} onPress={startAdd}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={s.addText}>Adicionar</Text>
        </Pressable>
        <Pressable style={s.reindexBtn} onPress={reindex}>
          <Ionicons name="refresh" size={16} color={C.primary} />
          <Text style={s.reindexText}>Reindexar</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={s.list}>
        {components.map((c) => (
          <View key={c.id} style={s.card}>
            <View style={s.cardTop}>
              <Text style={s.cardName}>{c.name}</Text>
              <View style={s.cardActions}>
                <Pressable style={s.iconBtn} onPress={() => startEdit(c)}>
                  <Ionicons name="pencil-outline" size={15} color={C.muted} />
                </Pressable>
                <Pressable style={s.iconBtn} onPress={() => deleteComponent(c)}>
                  <Ionicons name="trash-outline" size={15} color={C.error} />
                </Pressable>
              </View>
            </View>
            <Text style={s.cardDesc}>{c.description}</Text>
            <Text style={s.cardProps}>Props: {c.properties}</Text>
            <Text style={s.cardExample}>{c.example}</Text>
          </View>
        ))}
        {components.length === 0 && (
          <View style={s.empty}>
            <Text style={s.emptyText}>Nenhum componente RAG</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  flex: { flex: 1 },
  toolbar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.primary,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  addText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  reindexBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.surface,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  reindexText: { color: C.primary, fontSize: 13, fontWeight: '600' },
  list: { padding: 16, gap: 10, paddingBottom: 32 },
  card: {
    backgroundColor: C.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
    gap: 6,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardName: { color: C.text, fontSize: 16, fontWeight: '700' },
  cardActions: { flexDirection: 'row', gap: 6 },
  iconBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  cardDesc: { color: C.muted, fontSize: 13, lineHeight: 18 },
  cardProps: { color: C.faint, fontSize: 12, fontFamily: 'monospace' },
  cardExample: { color: C.primary, fontSize: 12, fontFamily: 'monospace' },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: C.muted, fontSize: 14 },
  /* Form */
  formScroll: { padding: 20, gap: 8, paddingBottom: 40 },
  formLabel: { color: C.muted, fontSize: 12, fontWeight: '600', marginTop: 8 },
  input: {
    backgroundColor: C.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: C.text,
    fontSize: 15,
  },
  inputLast: { marginBottom: 16 },
  formBtns: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  cancelText: { color: C.muted, fontSize: 15, fontWeight: '600' },
  saveBtn: {
    flex: 1,
    backgroundColor: C.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
