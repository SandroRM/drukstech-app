import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { listModules } from '../../src/modules/moduleStore';
import { useSettings } from '../../src/settings/SettingsContext';
import type { MotherPermission, StoredModule } from '../../src/types/generatedModule';
import { CapabilityRegistry } from '../../src/capabilities/capabilityRegistry';
import { createMotherApi } from '../../src/capabilities/motherApi';
import { isModuleNetworkFetchEnabled } from '../../src/config';
import { DynamicRenderer } from '../../src/renderer/DynamicRenderer';
import { ModulePermissionGate } from '../../src/renderer/ModulePermissionGate';
import { prefetchNativePermissions } from '../../src/security/runtimePermissions';
import { useI18n } from '../../src/i18n/useI18n';
import { generateModule } from '../../src/ai/aiClient';
import { replaceModule } from '../../src/modules/moduleStore';
import { GeneratingModal } from '../../src/components/GeneratingModal';

const C = {
  bg: '#0b1120',
  surface: '#1a2236',
  surfaceHigh: '#22304a',
  border: '#2d3f5c',
  primary: '#6366f1',
  text: '#e8edf5',
  muted: '#7a92b3',
  faint: '#3d5070',
  success: '#34d399',
  error: '#f87171',
  errorBg: '#180808',
  errorBorder: '#6b1a1a',
  overlay: 'rgba(0,0,0,0.7)',
};

export default function PreviewScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const { settings } = useSettings();
  const [modules, setModules] = useState<StoredModule[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [needsGate, setNeedsGate] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [grantedIds, setGrantedIds] = useState<MotherPermission[]>([]);
  const [gateBusy, setGateBusy] = useState(false);
  const [regenSheet, setRegenSheet] = useState(false);
  const [tweakText, setTweakText] = useState('');
  const [regenLoading, setRegenLoading] = useState(false);
  const [regenDone, setRegenDone] = useState(false);
  const [regenError, setRegenError] = useState<string | null>(null);
  const regenPromptRef = useRef('');

  const load = useCallback(async () => {
    const all = await listModules();
    setModules(all);
    if (all.length > 0 && !selectedId) {
      setSelectedId(all[all.length - 1].id);
    }
  }, [selectedId]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const selected = useMemo(() => modules.find((m) => m.id === selectedId) ?? null, [modules, selectedId]);

  useEffect(() => {
    if (selected) {
      const gate = selected.manifest.permissions.length > 0;
      setNeedsGate(gate);
      setAnswered(!gate);
      setGrantedIds([]);
    }
  }, [selected?.id]);

  const registry = useMemo(() => new CapabilityRegistry(), [selected?.id]);
  useEffect(() => { return () => { void registry.cleanupAll(); }; }, [registry]);

  const onAllow = async () => {
    if (!selected || gateBusy) return;
    setGateBusy(true);
    try {
      await prefetchNativePermissions(selected.manifest.permissions);
    } finally {
      setGateBusy(false);
    }
    setGrantedIds([...selected.manifest.permissions]);
    setAnswered(true);
  };

  const onDeny = () => {
    setGrantedIds([]);
    setAnswered(true);
  };

  const motherApi = useMemo(() => {
    if (!selected) return null;
    return createMotherApi({
      moduleId: selected.id,
      manifestPermissions: selected.manifest.permissions,
      granted: new Set(grantedIds),
      allowNetworkFetch: isModuleNetworkFetchEnabled(),
      registry,
    });
  }, [selected, grantedIds, registry]);

  const webGameAllowNetwork = useMemo(() => {
    if (!selected) return false;
    return (
      isModuleNetworkFetchEnabled() &&
      selected.manifest.permissions.includes('network') &&
      grantedIds.includes('network')
    );
  }, [selected, grantedIds]);

  const onRegenConfirm = async () => {
    if (!selected || !selectedId) return;
    const originalPrompt = selected.prompt || '';
    const combined = tweakText.trim()
      ? `${originalPrompt}\n\nModifiche richieste: ${tweakText.trim()}`
      : originalPrompt;
    if (!combined.trim()) return;

    regenPromptRef.current = combined;
    setRegenSheet(false);
    setRegenError(null);
    setRegenDone(false);
    setRegenLoading(true);

    try {
      const res = await generateModule(combined, {
        useMock: false,
        language: settings.language || undefined,
        ...(settings.provider === 'ollama'
          ? { ollamaBaseUrl: settings.ollamaUrl || undefined, ollamaModel: settings.ollamaModel || undefined }
          : settings.provider === 'claude'
          ? {
              apiProvider: 'claude',
              claudeBaseUrl: settings.claudeBaseUrl || undefined,
              claudeApiKey: settings.claudeApiKey || undefined,
              claudeModel: settings.claudeModel || 'claude-sonnet-4-20250514',
            }
          : {
              apiUrl: settings.openaiUrl || undefined,
              apiKey: settings.openaiKey || undefined,
              apiModel: settings.openaiModel || undefined,
            }),
      });

      if (!res.ok) {
        setRegenError(res.error);
        return;
      }

      const saved = await replaceModule(selectedId, res.data, originalPrompt);
      if (!saved.ok) {
        setRegenError(saved.error);
        return;
      }

      setRegenDone(true);
      await new Promise<void>((r) => setTimeout(r, 1200));
      setTweakText('');
      await load();
    } finally {
      setRegenLoading(false);
      setRegenDone(false);
    }
  };

  if (modules.length === 0) {
    return (
      <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
        <StatusBar style="light" />
        <View style={s.header}>
          <Ionicons name="eye-outline" size={20} color={C.primary} />
          <Text style={s.h1}>Preview</Text>
        </View>
        <View style={s.empty}>
          <Ionicons name="layers-outline" size={48} color={C.faint} />
          <Text style={s.emptyTitle}>Nenhum módulo salvo</Text>
          <Text style={s.emptyText}>
            Gere um módulo na aba Gerar ou receba um do MonkeyCode para visualizar aqui.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      <View style={s.header}>
        <Ionicons name="eye-outline" size={20} color={C.primary} />
        <Text style={s.h1}>Preview</Text>
        {selected ? (
          <View style={s.headerRight}>
            <Text style={s.moduleName} numberOfLines={1}>{selected.name}</Text>
            <Pressable onPress={() => setRegenSheet(true)} hitSlop={10} style={s.regenBtn}>
              <Ionicons name="refresh" size={16} color={C.primary} />
            </Pressable>
            <Pressable onPress={() => router.push(`/module/${selected.id}`)} hitSlop={10}>
              <Ionicons name="open-outline" size={18} color={C.muted} />
            </Pressable>
          </View>
        ) : null}
      </View>

      <GeneratingModal visible={regenLoading} done={regenDone} prompt={regenPromptRef.current} />

      {regenError ? (
        <View style={s.errorBanner}>
          <Ionicons name="alert-circle" size={16} color={C.error} />
          <Text style={s.errorBannerText}>{regenError}</Text>
          <Pressable onPress={() => setRegenError(null)} hitSlop={10}>
            <Ionicons name="close" size={16} color={C.error} />
          </Pressable>
        </View>
      ) : null}

      <View style={s.previewArea}>
        {needsGate && !answered ? (
          <ModulePermissionGate
            permissions={selected!.manifest.permissions}
            onAllow={() => void onAllow()}
            onDeny={onDeny}
            busy={gateBusy}
          />
        ) : motherApi && selected ? (
          <DynamicRenderer
            ui={selected.ui}
            code={selected.code}
            motherApi={motherApi}
            webGameAllowNetwork={webGameAllowNetwork}
          />
        ) : (
          <View style={s.loadingPreview}>
            <ActivityIndicator color={C.primary} size="small" />
          </View>
        )}
      </View>

      <View style={s.moduleListHeader}>
        <Text style={s.moduleListLabel}>MÓDULOS</Text>
        <Text style={s.moduleListCount}>{modules.length}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.moduleList} contentContainerStyle={s.moduleListContent}>
        {modules.map((m) => (
          <Pressable
            key={m.id}
            style={[s.moduleChip, m.id === selectedId && s.moduleChipActive]}
            onPress={() => setSelectedId(m.id)}
          >
            <Text style={[s.moduleChipText, m.id === selectedId && s.moduleChipTextActive]} numberOfLines={1}>
              {m.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <Modal
        visible={regenSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setRegenSheet(false)}
      >
        <Pressable style={s.overlay} onPress={() => setRegenSheet(false)}>
          <Pressable style={s.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={s.sheetHandle} />
            <Text style={s.sheetTitle}>Refinar módulo</Text>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {selected?.prompt ? (
                <View style={s.block}>
                  <Text style={s.blockLabel}>PROMPT ORIGINAL</Text>
                  <View style={s.originalBox}>
                    <Text style={s.originalText}>{selected.prompt}</Text>
                  </View>
                </View>
              ) : null}
              <View style={s.block}>
                <Text style={s.blockLabel}>AJUSTES</Text>
                <TextInput
                  style={s.tweakInput}
                  placeholder="Descreva as mudanças desejadas..."
                  placeholderTextColor={C.faint}
                  value={tweakText}
                  onChangeText={setTweakText}
                  multiline
                  autoCorrect={false}
                />
              </View>
              <View style={s.actions}>
                <Pressable style={s.cancelBtn} onPress={() => setRegenSheet(false)}>
                  <Text style={s.cancelBtnText}>Cancelar</Text>
                </Pressable>
                <Pressable style={s.regenConfirmBtn} onPress={() => void onRegenConfirm()}>
                  <Ionicons name="refresh" size={16} color="#fff" />
                  <Text style={s.regenConfirmBtnText}>Regenerar</Text>
                </Pressable>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
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
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  h1: { fontSize: 26, fontWeight: '800', color: C.text, letterSpacing: -0.5, flex: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8, maxWidth: '50%' },
  moduleName: { color: C.muted, fontSize: 13, fontWeight: '600', flexShrink: 1 },
  regenBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#1e1b4b', alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, gap: 12 },
  emptyTitle: { color: C.text, fontSize: 20, fontWeight: '700' },
  emptyText: { color: C.muted, fontSize: 14, textAlign: 'center', lineHeight: 20, maxWidth: 300 },

  previewArea: { flex: 1, backgroundColor: '#060913', borderBottomWidth: 1, borderBottomColor: C.border },
  loadingPreview: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  moduleListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 6,
  },
  moduleListLabel: { color: C.faint, fontSize: 11, fontWeight: '700', letterSpacing: 1.1 },
  moduleListCount: { color: C.muted, fontSize: 12, fontWeight: '700' },
  moduleList: { maxHeight: 56 },
  moduleListContent: { paddingHorizontal: 16, gap: 8, paddingBottom: 12 },
  moduleChip: {
    backgroundColor: C.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: C.border,
    maxWidth: 160,
  },
  moduleChipActive: { backgroundColor: '#1e1b4b', borderColor: C.primary },
  moduleChipText: { color: C.muted, fontSize: 13, fontWeight: '600' },
  moduleChipTextActive: { color: C.primary },

  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: C.errorBg,
    borderBottomWidth: 1,
    borderBottomColor: C.errorBorder,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  errorBannerText: { flex: 1, color: C.error, fontSize: 13, lineHeight: 18 },

  overlay: { flex: 1, backgroundColor: C.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    borderWidth: 1,
    borderColor: C.border,
    gap: 16,
    maxHeight: '85%',
  },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: C.faint, alignSelf: 'center', marginBottom: 4 },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: C.text, letterSpacing: -0.3 },
  block: { gap: 8, marginBottom: 4 },
  blockLabel: { fontSize: 11, fontWeight: '700', color: C.faint, letterSpacing: 1.1, textTransform: 'uppercase' },
  originalBox: { backgroundColor: C.bg, borderRadius: 10, borderWidth: 1, borderColor: C.border, padding: 12 },
  originalText: { color: C.muted, fontSize: 14, lineHeight: 20 },
  tweakInput: {
    backgroundColor: C.bg, borderRadius: 10, borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 14, paddingVertical: 12, color: C.text, fontSize: 14, lineHeight: 20,
    minHeight: 90, textAlignVertical: 'top',
  },
  actions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  cancelBtn: { flex: 1, borderRadius: 12, paddingVertical: 14, backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, alignItems: 'center' },
  cancelBtnText: { color: C.muted, fontSize: 15, fontWeight: '600' },
  regenConfirmBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12, paddingVertical: 14, backgroundColor: C.primary },
  regenConfirmBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
