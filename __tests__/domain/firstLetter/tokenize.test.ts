import { deriveFirstLetter, tokenize } from '@/domain/firstLetter';

// WEB (public domain) text of John 3:16 — 26 words.
const JOHN_3_16 =
  'For God so loved the world, that he gave his one and only Son, ' +
  'that whoever believes in him should not perish, but have eternal life.';

describe('deriveFirstLetter', () => {
  it('lowercases the first alphabetic character', () => {
    expect(deriveFirstLetter('Loved')).toBe('l');
    expect(deriveFirstLetter('GOD')).toBe('g');
  });

  it('ignores leading punctuation and quotes', () => {
    expect(deriveFirstLetter('"For')).toBe('f');
    expect(deriveFirstLetter('(and')).toBe('a');
    expect(deriveFirstLetter('“whoever')).toBe('w'); // smart opening quote
  });

  it('keeps a leading digit as itself', () => {
    expect(deriveFirstLetter('3')).toBe('3');
    expect(deriveFirstLetter('16')).toBe('1');
  });

  it('returns an empty string when there is no letter or digit', () => {
    expect(deriveFirstLetter('—')).toBe(''); // em dash
    expect(deriveFirstLetter('')).toBe('');
  });
});

describe('tokenize', () => {
  it('tokenizes John 3:16 into verse words followed by reference tokens', () => {
    const tokens = tokenize(JOHN_3_16, 'John 3:16');

    // 26 verse words + 3 reference tokens (John, 3, 16).
    expect(tokens).toHaveLength(29);

    expect(tokens[0]).toEqual({ raw: 'For', firstLetter: 'f', isReference: false });
    expect(tokens[3]).toEqual({ raw: 'loved', firstLetter: 'l', isReference: false });

    // The verse ends with "eternal life." then the reference.
    const last5 = tokens.slice(-5);
    expect(last5.map((t) => t.firstLetter)).toEqual(['e', 'l', 'j', '3', '1']);
    expect(last5.map((t) => t.raw)).toEqual(['eternal', 'life.', 'John', '3', '16']);
    expect(last5.map((t) => t.isReference)).toEqual([false, false, true, true, true]);
  });

  it('keeps punctuation attached to the word, not as its own token', () => {
    const tokens = tokenize('the world, that', 'John 3:16');
    expect(tokens[1]).toEqual({ raw: 'world,', firstLetter: 'w', isReference: false });
  });

  it('splits reference chapter and verse numbers into literal-digit tokens', () => {
    const refTokens = tokenize('', 'John 3:16').filter((t) => t.isReference);
    expect(refTokens).toEqual([
      { raw: 'John', firstLetter: 'j', isReference: true },
      { raw: '3', firstLetter: '3', isReference: true },
      { raw: '16', firstLetter: '1', isReference: true },
    ]);
  });

  it('handles multi-word book names and verse ranges', () => {
    const refTokens = tokenize('', '1 Corinthians 13:4-7').filter((t) => t.isReference);
    expect(refTokens.map((t) => t.raw)).toEqual(['1', 'Corinthians', '13', '4-7']);
    expect(refTokens.map((t) => t.firstLetter)).toEqual(['1', 'c', '1', '4']);
  });

  it('tokenizes a single-word verse', () => {
    const tokens = tokenize('Rejoice!', 'Philippians 4:4');
    const verseTokens = tokens.filter((t) => !t.isReference);
    expect(verseTokens).toEqual([
      { raw: 'Rejoice!', firstLetter: 'r', isReference: false },
    ]);
  });

  it('returns only reference tokens for an empty verse', () => {
    const tokens = tokenize('', 'John 3:16');
    expect(tokens.every((t) => t.isReference)).toBe(true);
    expect(tokens).toHaveLength(3);
  });

  it('returns an empty array when both verse and reference are empty', () => {
    expect(tokenize('', '')).toEqual([]);
    expect(tokenize('   ', '   ')).toEqual([]);
  });

  it('drops stray whitespace-separated punctuation instead of emitting empty tokens', () => {
    // An em dash flanked by spaces must not become its own (empty-first-letter) token.
    const tokens = tokenize('life — death', 'John 3:16');
    const verseTokens = tokens.filter((t) => !t.isReference);
    expect(verseTokens.map((t) => t.raw)).toEqual(['life', 'death']);
  });
});
