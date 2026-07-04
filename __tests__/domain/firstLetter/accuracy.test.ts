import { computeAccuracy, isCorrectFirstLetter, tokenize } from '@/domain/firstLetter';

const [wordToken, , , lovedToken] = tokenize('For God so loved', 'John 3:16');
const refTokens = tokenize('', 'John 3:16');
const chapterToken = refTokens[1]; // '3'
const verseToken = refTokens[2]; // '16'

describe('isCorrectFirstLetter', () => {
  it('matches the correct first letter case-insensitively', () => {
    expect(isCorrectFirstLetter('l', lovedToken)).toBe(true);
    expect(isCorrectFirstLetter('L', lovedToken)).toBe(true);
  });

  it('rejects the wrong letter', () => {
    expect(isCorrectFirstLetter('x', lovedToken)).toBe(false);
    expect(isCorrectFirstLetter('f', lovedToken)).toBe(false);
  });

  it('matches reference digits literally', () => {
    expect(isCorrectFirstLetter('3', chapterToken)).toBe(true);
    expect(isCorrectFirstLetter('1', verseToken)).toBe(true); // first digit of "16"
    expect(isCorrectFirstLetter('6', verseToken)).toBe(false);
  });

  it('ignores leading punctuation in the typed input', () => {
    expect(isCorrectFirstLetter('"F', wordToken)).toBe(true); // wordToken is "For"
  });

  it('rejects empty or whitespace input', () => {
    expect(isCorrectFirstLetter('', lovedToken)).toBe(false);
    expect(isCorrectFirstLetter('   ', lovedToken)).toBe(false);
  });
});

describe('computeAccuracy', () => {
  it('is 1 when every token was correct on the first try', () => {
    expect(computeAccuracy(29, 29)).toBe(1);
  });

  it('is a fraction for a partial attempt', () => {
    expect(computeAccuracy(10, 5)).toBe(0.5);
  });

  it('is 0 when nothing was correct', () => {
    expect(computeAccuracy(29, 0)).toBe(0);
  });

  it('guards against division by zero', () => {
    expect(computeAccuracy(0, 0)).toBe(0);
  });

  it('clamps out-of-range correct counts into [0, 1]', () => {
    expect(computeAccuracy(10, 20)).toBe(1);
    expect(computeAccuracy(10, -5)).toBe(0);
  });
});
