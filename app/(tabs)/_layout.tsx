import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import {
  BibleIcon,
  HomeIcon,
  ProfileIcon,
  VersesIcon,
} from '@/components/icons/TabIcons';
import { radii, spacing, typography, useTheme } from '@/theme';
import { hexToRgba } from '@/utils/color';

/**
 * Floating frosted tab bar (CLAUDE.md 1.5), matching the locked prototype:
 * a blurred, tinted pill floating above the content rather than a docked bar.
 */
export default function TabsLayout() {
  const { colors, scheme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: typography.tabLabel,
        tabBarItemStyle: { paddingVertical: spacing.xs },
        tabBarStyle: {
          position: 'absolute',
          left: spacing.md,
          right: spacing.md,
          bottom: spacing.md,
          height: 64,
          borderRadius: radii.bar,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: 'transparent',
          shadowColor: '#125078',
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.4,
          shadowRadius: 18,
          elevation: 8,
        },
        tabBarBackground: () => (
          <View style={{ flex: 1, borderRadius: radii.bar, overflow: 'hidden' }}>
            <BlurView tint={scheme} intensity={70} style={StyleSheet.absoluteFill} />
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: hexToRgba(colors.surface, 0.62) },
              ]}
            />
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarIcon: ({ color }) => <HomeIcon color={color} /> }}
      />
      <Tabs.Screen
        name="verses"
        options={{
          title: 'Verses',
          tabBarIcon: ({ color }) => <VersesIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="bible"
        options={{
          title: 'Bible',
          tabBarIcon: ({ color }) => <BibleIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <ProfileIcon color={color} />,
        }}
      />
    </Tabs>
  );
}
