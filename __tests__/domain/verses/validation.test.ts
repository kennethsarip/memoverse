import { validateCustomVerseInput } from '@/domain/verses';

describe('validateCustomVerseInput', () => {
  it('accepts a reference and non-empty text', () => {
    const result = validateCustomVerseInput({
      reference: 'John 3:16',
      text: 'For God...',
    });
    expect(result).toEqual({ valid: true, errors: {} });
  });

  it('rejects a missing reference', () => {
    const result = validateCustomVerseInput({ reference: '  ', text: 'For God...' });
    expect(result.valid).toBe(false);
    expect(result.errors.reference).toBeDefined();
  });

  it('rejects missing or whitespace-only text', () => {
    const result = validateCustomVerseInput({ reference: 'John 3:16', text: '   ' });
    expect(result.valid).toBe(false);
    expect(result.errors.text).toBeDefined();
  });

  it('rejects an over-long reference or text', () => {
    const result = validateCustomVerseInput({
      reference: 'x'.repeat(81),
      text: 'y'.repeat(2001),
    });
    expect(result.valid).toBe(false);
    expect(result.errors.reference).toBeDefined();
    expect(result.errors.text).toBeDefined();
  });
});
