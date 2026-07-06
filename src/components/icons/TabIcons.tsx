import type { ColorValue } from 'react-native';
import { Circle, Path, Rect, Svg, type SvgProps } from 'react-native-svg';

interface TabIconProps {
  color: ColorValue;
  size?: number;
}

// Path data traced from the locked prototype's tab bar (CLAUDE.md 1.5) for
// pixel-accurate icons without adding an icon-library dependency.
const strokeProps: Partial<SvgProps> = {
  fill: 'none',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function HomeIcon({ color, size = 22 }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...strokeProps}>
      <Path d="M4 11.5 12 4l8 7.5" />
      <Path d="M6 10.5V20h12v-9.5" />
    </Svg>
  );
}

export function VersesIcon({ color, size = 22 }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...strokeProps}>
      <Path d="M7 4h10a1.5 1.5 0 0 1 1.5 1.5V21l-6.5-3.2L5.5 21V5.5A1.5 1.5 0 0 1 7 4z" />
    </Svg>
  );
}

export function BibleIcon({ color, size = 22 }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...strokeProps}>
      <Rect x={5} y={4} width={14} height={16} rx={2.2} fill="none" />
      <Path d="M12 8v6M9.5 11h5" />
    </Svg>
  );
}

export function ProfileIcon({ color, size = 22 }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...strokeProps}>
      <Circle cx={12} cy={8.4} r={3.3} fill="none" />
      <Path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
    </Svg>
  );
}
