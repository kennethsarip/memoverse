import { Pressable, Text, View } from 'react-native';

import { radii, spacing, typography, useTheme } from '@/theme';

interface ChapterGridProps {
  chapterCount: number;
  onSelect: (chapter: number) => void;
}

/** Grid of chapter numbers for a selected book (Section 7, Phase 1.8's Bible
 * tab picker: book list -> chapter grid -> passage view). */
export function ChapterGrid({ chapterCount, onSelect }: ChapterGridProps) {
  const { colors } = useTheme();
  const chapters = Array.from({ length: chapterCount }, (_, i) => i + 1);

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
      {chapters.map((chapter) => (
        <Pressable
          key={chapter}
          onPress={() => onSelect(chapter)}
          accessibilityRole="button"
          accessibilityLabel={`Chapter ${chapter}`}
          style={({ pressed }) => ({
            width: 52,
            height: 52,
            borderRadius: radii.md,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: pressed ? colors.primarySoft : colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
          })}
        >
          <Text style={{ ...typography.body, color: colors.textPrimary }}>{chapter}</Text>
        </Pressable>
      ))}
    </View>
  );
}
