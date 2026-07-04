import { render } from '@testing-library/react-native';

import { maskWord, WordChip } from '@/components/WordChip';
import type { Token } from '@/domain/firstLetter';

const loved: Token = { raw: 'loved', firstLetter: 'l', isReference: false };

describe('maskWord', () => {
  it('hides letters and digits but keeps punctuation as a cue', () => {
    expect(maskWord('world,')).toBe('_____,');
    expect(maskWord('16')).toBe('__');
  });
});

describe('WordChip', () => {
  it('shows the full word when revealed', async () => {
    const { getByText, queryByText } = await render(
      <WordChip token={loved} revealed isCurrent={false} shakeSignal={0} reducedMotion />,
    );
    expect(getByText('loved')).toBeTruthy();
    expect(queryByText('_____')).toBeNull();
  });

  it('shows a masked placeholder while hidden', async () => {
    const { getByText, queryByText } = await render(
      <WordChip token={loved} revealed={false} isCurrent shakeSignal={0} reducedMotion />,
    );
    expect(queryByText('loved')).toBeNull();
    expect(getByText('_____')).toBeTruthy();
  });

  it('labels the current hidden word for screen readers', async () => {
    const { getByLabelText } = await render(
      <WordChip token={loved} revealed={false} isCurrent shakeSignal={0} reducedMotion />,
    );
    expect(getByLabelText('Current word, hidden. Type its first letter.')).toBeTruthy();
  });
});
