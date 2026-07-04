import { useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { radii, spacing, typography, useTheme } from '@/theme';

interface FirstLetterInputProps {
  /** Called once per typed key (each character the user enters). */
  onKey: (key: string) => void;
  /** When true the field is inert (e.g. the verse is complete). */
  disabled?: boolean;
  /** Short hint shown above the field. */
  hint?: string;
}

/**
 * The session's input control: a text field that captures the device
 * soft-keyboard, one keystroke at a time. It keeps its own value empty —
 * every typed character is forwarded to `onKey` (which validates the first
 * letter and reveals the word) and then cleared, so the field never shows the
 * typed letters; the verse chips are the only feedback. This is how the user
 * types the verse's first letters from the keyboard.
 */
export function FirstLetterInput({
  onKey,
  disabled = false,
  hint = 'Type the first letter of each word',
}: FirstLetterInputProps) {
  const inputRef = useRef<TextInput>(null);
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const { colors } = useTheme();

  function handleChangeText(text: string) {
    // Forward every character (usually one; more if the OS batches fast typing),
    // then reset so the field stays empty and ready for the next keystroke.
    for (const char of text) {
      onKey(char);
    }
    setValue('');
  }

  return (
    <View>
      <Text
        style={{
          ...typography.caption,
          color: colors.textSecondary,
          marginBottom: spacing.sm,
          textAlign: 'center',
        }}
      >
        {hint}
      </Text>
      <Pressable
        onPress={() => inputRef.current?.focus()}
        accessibilityRole="button"
        accessibilityLabel="Focus the keyboard to type the next first letter"
      >
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={handleChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          editable={!disabled}
          autoFocus={!disabled}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          spellCheck={false}
          textContentType="none"
          importantForAutofill="no"
          contextMenuHidden
          keyboardType="ascii-capable"
          placeholder="Tap and type"
          placeholderTextColor={colors.textMuted}
          accessibilityLabel="First-letter input"
          accessibilityHint="Type the first letter of the highlighted word"
          style={{
            ...typography.heading,
            color: colors.textPrimary,
            textAlign: 'center',
            minHeight: 56,
            borderRadius: radii.full,
            borderWidth: 2,
            borderColor: focused ? colors.primary : colors.border,
            backgroundColor: disabled ? colors.surfaceMuted : colors.surface,
            paddingHorizontal: spacing.xl,
            opacity: disabled ? 0.6 : 1,
          }}
        />
      </Pressable>
    </View>
  );
}
