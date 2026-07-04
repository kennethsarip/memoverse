import { darkColors, lightColors, palette, spacing, themes } from '@/theme/tokens';

describe('theme tokens', () => {
  it('maps the light primary color to the brand palette', () => {
    expect(lightColors.primary).toBe(palette.brand['500']);
  });

  it('provides distinct light and dark backgrounds', () => {
    expect(lightColors.background).not.toBe(darkColors.background);
  });

  it('exposes both color schemes', () => {
    expect(Object.keys(themes)).toEqual(['light', 'dark']);
  });

  it('uses a 4pt spacing grid', () => {
    expect(spacing.md).toBe(12);
  });
});
