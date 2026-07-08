import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import {
  addCustomVerseToLibrary,
  addPackToLibrary,
  listPacks,
  type PackSummary,
} from '@/data';
import { validateCustomVerseInput, type CustomVerseValidation } from '@/domain/verses';
import { radii, spacing, typography, useTheme } from '@/theme';
import { todayKey } from '@/utils/date';

import { Button } from './Button';
import { Chip } from './Chip';
import { ListRow } from './ListRow';

type SheetTab = 'pack' | 'custom';

interface AddVerseSheetProps {
  visible: boolean;
  onClose: () => void;
}

/** Add-verse bottom sheet (Section 7, Phase 1.6): start a curated pack, or add
 * a free-text custom verse. Both paths land the new verse(s) in the due queue. */
export function AddVerseSheet({ visible, onClose }: AddVerseSheetProps) {
  const { colors } = useTheme();
  const [tab, setTab] = useState<SheetTab>('pack');

  const [packs, setPacks] = useState<PackSummary[] | null>(null);
  const [packsError, setPacksError] = useState<string | null>(null);
  const [addingPackId, setAddingPackId] = useState<string | null>(null);

  const [reference, setReference] = useState('');
  const [text, setText] = useState('');
  const [validation, setValidation] = useState<CustomVerseValidation | null>(null);

  useEffect(() => {
    if (!visible || packs !== null || packsError) return;
    listPacks()
      .then(setPacks)
      .catch((error: Error) => setPacksError(error.message));
  }, [visible, packs, packsError]);

  function closeAndReset() {
    setTab('pack');
    setReference('');
    setText('');
    setValidation(null);
    onClose();
  }

  async function handlePackPress(pack: PackSummary) {
    setAddingPackId(pack.id);
    try {
      await addPackToLibrary(pack.id, todayKey());
      closeAndReset();
    } catch (error) {
      setPacksError(
        error instanceof Error ? error.message : "Couldn't start that pack right now.",
      );
    } finally {
      setAddingPackId(null);
    }
  }

  function handleCustomSubmit() {
    const input = { reference, text };
    const result = validateCustomVerseInput(input);
    setValidation(result);
    if (!result.valid) return;
    addCustomVerseToLibrary(input, todayKey());
    closeAndReset();
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={closeAndReset}
    >
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(0,0,0,0.4)',
        }}
      >
        <Pressable
          style={{ flex: 1 }}
          onPress={closeAndReset}
          accessibilityLabel="Close"
        />
        <View
          style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: radii.sheet,
            borderTopRightRadius: radii.sheet,
            borderWidth: 1,
            borderColor: colors.border,
            padding: spacing.xl,
            maxHeight: '80%',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text style={{ ...typography.heading, color: colors.textPrimary }}>
              Add a verse
            </Text>
            <Pressable
              onPress={closeAndReset}
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={12}
            >
              <Text style={{ ...typography.heading, color: colors.textSecondary }}>
                Close
              </Text>
            </Pressable>
          </View>

          <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg }}>
            <Chip
              label="Start a pack"
              tone="primary"
              selected={tab === 'pack'}
              onPress={() => setTab('pack')}
            />
            <Chip
              label="Custom verse"
              tone="primary"
              selected={tab === 'custom'}
              onPress={() => setTab('custom')}
            />
          </View>

          {tab === 'pack' ? (
            <View style={{ marginTop: spacing.lg }}>
              {packsError ? (
                <Text style={{ ...typography.body, color: colors.danger }}>
                  {packsError}
                </Text>
              ) : packs === null ? (
                <Text style={{ ...typography.body, color: colors.textSecondary }}>
                  Loading packs...
                </Text>
              ) : packs.length === 0 ? (
                <Text style={{ ...typography.body, color: colors.textSecondary }}>
                  No packs available yet.
                </Text>
              ) : (
                <ScrollView style={{ maxHeight: 320 }}>
                  {packs.map((pack) => (
                    <ListRow
                      key={pack.id}
                      title={pack.title}
                      subtitle={pack.description ?? undefined}
                      trailing={
                        <Text style={{ ...typography.caption, color: colors.primary }}>
                          {addingPackId === pack.id ? 'Adding...' : 'Start'}
                        </Text>
                      }
                      onPress={addingPackId ? undefined : () => handlePackPress(pack)}
                      accessibilityLabel={`Start pack: ${pack.title}`}
                    />
                  ))}
                </ScrollView>
              )}
            </View>
          ) : (
            <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
              <View>
                <TextInput
                  value={reference}
                  onChangeText={setReference}
                  placeholder='Reference, like "John 3:16"'
                  placeholderTextColor={colors.textMuted}
                  accessibilityLabel="Verse reference"
                  style={{
                    ...typography.body,
                    color: colors.textPrimary,
                    borderWidth: 1,
                    borderColor: validation?.errors.reference
                      ? colors.danger
                      : colors.border,
                    borderRadius: radii.md,
                    padding: spacing.md,
                  }}
                />
                {validation?.errors.reference ? (
                  <Text
                    style={{
                      ...typography.caption,
                      color: colors.danger,
                      marginTop: spacing.xs,
                    }}
                  >
                    {validation.errors.reference}
                  </Text>
                ) : null}
              </View>
              <View>
                <TextInput
                  value={text}
                  onChangeText={setText}
                  placeholder="Paste or type the verse text"
                  placeholderTextColor={colors.textMuted}
                  accessibilityLabel="Verse text"
                  multiline
                  textAlignVertical="top"
                  style={{
                    ...typography.body,
                    color: colors.textPrimary,
                    borderWidth: 1,
                    borderColor: validation?.errors.text ? colors.danger : colors.border,
                    borderRadius: radii.md,
                    padding: spacing.md,
                    minHeight: 100,
                  }}
                />
                {validation?.errors.text ? (
                  <Text
                    style={{
                      ...typography.caption,
                      color: colors.danger,
                      marginTop: spacing.xs,
                    }}
                  >
                    {validation.errors.text}
                  </Text>
                ) : null}
              </View>
              <Button title="Add verse" onPress={handleCustomSubmit} />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
