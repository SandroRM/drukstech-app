import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSettings } from '../../src/settings/SettingsContext';
import { useI18n } from '../../src/i18n/useI18n';
import { LANGUAGES, type Language } from '../../src/i18n/translations';

const C = {
  bg: '#0b1120',
  surface: '#1a2236',
  border: '#2d3f5c',
  primary: '#6366f1',
  text: '#e8edf5',
  muted: '#7a92b3',
  faint: '#3d5070',
  success: '#34d399',
  overlay: 'rgba(0,0,0,0.7)',
};

const AVAILABLE_MODELS = ['Gemma 2B', 'Gemma 4B'];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={ss.section}>
      <Text style={ss.sectionTitle}>{title.toUpperCase()}</Text>
      <View style={ss.sectionBox}>{children}</View>
    </View>
  );
}

function NavRow({
  label,
  hint,
  active,
  last,
  onPress,
}: {
  label: string;
  hint?: string;
  active?: boolean;
  last?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[ss.row, !last && ss.rowDivider]} onPress={onPress}>
      <View style={ss.rowLabels}>
        <Text style={ss.rowLabel}>{label}</Text>
        {hint ? <Text style={ss.rowHint}>{hint}</Text> : null}
      </View>
      <View style={ss.rowRight}>
        {active ? (
          <View style={ss.activeDot} />
        ) : null}
        <Ionicons name="chevron-forward" size={16} color={C.muted} />
      </View>
    </Pressable>
  );
}

function EditableRowModal({
  visible,
  title,
  value,
  placeholder,
  label,
  onSave,
  onClose,
}: {
  visible: boolean;
  title: string;
  value: string;
  placeholder: string;
  label: string;
  onSave: (val: string) => void;
  onClose: () => void;
}) {
  const [text, setText] = useState(value);
  React.useEffect(() => { setText(value); }, [value, visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={ss.modalOverlay} onPress={onClose}>
        <Pressable style={ss.modalSheet} onPress={(e) => e.stopPropagation()}>
          <Text style={ss.modalTitle}>{title}</Text>
          <Text style={ss.inputLabel}>{label}</Text>
          <TextInput
            style={ss.urlInput}
            value={text}
            onChangeText={setText}
            placeholder={placeholder}
            placeholderTextColor={C.faint}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={() => { onSave(text.trim()); onClose(); }}
          />
          <Pressable
            style={ss.saveBtn}
            onPress={() => { onSave(text.trim()); onClose(); }}
          >
            <Text style={ss.saveBtnText}>Salvar</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function SettingsScreen() {
  const { settings, updateSettings } = useSettings();
  const { t } = useI18n();
  const router = useRouter();
  const [langModal, setLangModal] = useState(false);
  const [editModal, setEditModal] = useState<{ key: string; title: string; label: string; placeholder: string } | null>(null);

  const currentLang = settings.language || '';
  const currentLangObj = LANGUAGES.find((l) => l.code === currentLang);
  const langLabel = currentLangObj
    ? `${currentLangObj.flag}  ${currentLangObj.label}`
    : '🌐  Auto';

  const providerHint = (p: 'ollama' | 'openai' | 'claude') => {
    if (p === 'ollama') return settings.ollamaUrl || 'Non configurato';
    if (p === 'openai') return settings.openaiUrl || 'Non configurato';
    return settings.claudeModel || 'Non configurato';
  };

  const openUrlEdit = (key: string, title: string, label: string, placeholder: string) => {
    setEditModal({ key, title, label, placeholder });
  };

  const saveEditable = (val: string) => {
    if (!editModal) return;
    updateSettings({ [editModal.key]: val } as any);
  };

  const getValue = (key: string) => {
    return (settings as any)[key] || '';
  };

  return (
    <SafeAreaView style={ss.safe} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      <View style={ss.header}>
        <Ionicons name="settings" size={20} color={C.primary} />
        <Text style={ss.h1}>{t.settingsTitle}</Text>
      </View>

      <ScrollView
        contentContainerStyle={[ss.scroll]}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Connections ── */}
        <Section title="Conexões">
          <Pressable
            style={[ss.row, ss.rowDivider]}
            onPress={() => openUrlEdit('monkeyCodeUrl', 'URL do MonkeyCode', 'URL', 'https://monkeycode.example.com')}
          >
            <View style={ss.rowLabels}>
              <Text style={ss.rowLabel}>URL do MonkeyCode</Text>
              <Text style={ss.rowHint}>{settings.monkeyCodeUrl || 'Não configurado'}</Text>
            </View>
            <Ionicons name="pencil-outline" size={16} color={C.muted} />
          </Pressable>
          <Pressable
            style={[ss.row, ss.rowDivider]}
            onPress={() => openUrlEdit('licenseApiUrl', 'URL da API de Licença', 'URL', 'https://license.example.com')}
          >
            <View style={ss.rowLabels}>
              <Text style={ss.rowLabel}>URL da API de Licença</Text>
              <Text style={ss.rowHint}>{settings.licenseApiUrl || 'Não configurado'}</Text>
            </View>
            <Ionicons name="pencil-outline" size={16} color={C.muted} />
          </Pressable>
          <Pressable
            style={ss.row}
            onPress={() => openUrlEdit('validationApiUrl', 'URL da API de Validação', 'URL', 'https://validate.example.com')}
          >
            <View style={ss.rowLabels}>
              <Text style={ss.rowLabel}>URL da API de Validação</Text>
              <Text style={ss.rowHint}>{settings.validationApiUrl || 'Não configurado'}</Text>
            </View>
            <Ionicons name="pencil-outline" size={16} color={C.muted} />
          </Pressable>
        </Section>

        {/* ── Language ── */}
        <Section title={t.sectionLanguage}>
          <Pressable style={ss.row} onPress={() => setLangModal(true)}>
            <Text style={ss.rowLabel}>{langLabel}</Text>
            <Ionicons name="chevron-forward" size={16} color={C.muted} />
          </Pressable>
        </Section>

        {/* ── Provider ── */}
        <Section title={t.sectionProvider}>
          <NavRow
            label="Ollama"
            hint={providerHint('ollama')}
            active={settings.provider === 'ollama'}
            onPress={() => router.push('/settings/ollama')}
          />
          <NavRow
            label="OpenAI / Compatible"
            hint={providerHint('openai')}
            active={settings.provider === 'openai'}
            onPress={() => router.push('/settings/openai')}
          />
          <NavRow
            label="Claude"
            hint={providerHint('claude')}
            active={settings.provider === 'claude'}
            last
            onPress={() => router.push('/settings/claude')}
          />
        </Section>

        {/* ── AI Model ── */}
        <Section title="Modelo de IA Local">
          {AVAILABLE_MODELS.map((model, idx) => (
            <View key={model} style={[ss.row, idx < AVAILABLE_MODELS.length - 1 && ss.rowDivider]}>
              <View style={ss.rowLabels}>
                <Text style={ss.rowLabel}>{model}</Text>
                <Text style={ss.rowHint}>
                  {settings.activeLocalModel === model ? 'Ativo' : 'Não baixado'}
                </Text>
              </View>
              <Pressable
                style={[ss.modelBtn, settings.activeLocalModel === model && ss.modelBtnActive]}
                onPress={() => updateSettings({ activeLocalModel: model })}
              >
                <Text style={[ss.modelBtnText, settings.activeLocalModel === model && ss.modelBtnTextActive]}>
                  {settings.activeLocalModel === model ? 'Usando' : 'Usar'}
                </Text>
              </Pressable>
            </View>
          ))}
        </Section>

        {/* ── RAG ── */}
        <Section title="RAG">
          <NavRow
            label="Gerenciar RAG"
            hint="Componentes, embeddings, reindexar"
            onPress={() => router.push('/rag-manager')}
          />
        </Section>

        {/* ── Info ── */}
        <Section title={t.sectionInfo}>
          <View style={ss.row}>
            <Text style={ss.rowLabel}>{t.appVersionLabel}</Text>
            <Text style={ss.valueText}>1.0.0</Text>
          </View>
        </Section>

        <View style={ss.notice}>
          <Ionicons name="shield-checkmark-outline" size={16} color={C.faint} />
          <Text style={ss.noticeText}>{t.securityNotice}</Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* ── Language picker modal ── */}
      <Modal
        visible={langModal}
        transparent
        animationType="fade"
        onRequestClose={() => setLangModal(false)}
      >
        <Pressable style={ss.modalOverlay} onPress={() => setLangModal(false)}>
          <Pressable style={ss.modalSheet} onPress={(e) => e.stopPropagation()}>
            <Text style={ss.modalTitle}>{t.sectionLanguage}</Text>
            <Pressable
              style={[ss.langRow, currentLang === '' && ss.langRowActive]}
              onPress={() => { updateSettings({ language: '' }); setLangModal(false); }}
            >
              <Text style={ss.langRowText}>🌐  Auto</Text>
              {currentLang === '' && <Ionicons name="checkmark" size={18} color={C.primary} />}
            </Pressable>
            {LANGUAGES.map((lang) => (
              <Pressable
                key={lang.code}
                style={[ss.langRow, currentLang === lang.code && ss.langRowActive]}
                onPress={() => { updateSettings({ language: lang.code as Language }); setLangModal(false); }}
              >
                <Text style={ss.langRowText}>{lang.flag}  {lang.label}</Text>
                {currentLang === lang.code && <Ionicons name="checkmark" size={18} color={C.primary} />}
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── URL edit modal ── */}
      {editModal && (
        <EditableRowModal
          visible
          title={editModal.title}
          label={editModal.label}
          value={getValue(editModal.key)}
          placeholder={editModal.placeholder}
          onSave={saveEditable}
          onClose={() => setEditModal(null)}
        />
      )}
    </SafeAreaView>
  );
}

const ss = StyleSheet.create({
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

  scroll: { padding: 16, gap: 20, paddingBottom: 32, maxWidth: 560, width: '100%', alignSelf: 'center' },

  section: { gap: 7 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: C.faint,
    letterSpacing: 1.2,
    paddingHorizontal: 4,
  },
  sectionBox: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.border,
  },
  rowLabels: { flex: 1, gap: 2 },
  rowLabel: { color: C.text, fontSize: 15, fontWeight: '500' },
  rowHint: { color: C.muted, fontSize: 12, lineHeight: 17 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.success,
  },
  valueText: { color: C.muted, fontSize: 14 },

  modelBtn: {
    backgroundColor: C.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  modelBtnActive: { backgroundColor: C.primary },
  modelBtnText: { color: C.muted, fontSize: 13, fontWeight: '600' },
  modelBtnTextActive: { color: '#fff' },

  notice: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'flex-start',
  },
  noticeText: { flex: 1, color: C.faint, fontSize: 12, lineHeight: 18 },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: C.overlay,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
    borderWidth: 1,
    borderColor: C.border,
    gap: 4,
  },
  modalTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: C.faint,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  inputLabel: { color: C.muted, fontSize: 12, marginBottom: 6 },
  urlInput: {
    backgroundColor: C.bg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: C.text,
    fontSize: 15,
    marginBottom: 12,
  },
  saveBtn: {
    backgroundColor: C.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderRadius: 10,
  },
  langRowActive: { backgroundColor: C.primary + '18' },
  langRowText: { fontSize: 16, color: C.text },
});
