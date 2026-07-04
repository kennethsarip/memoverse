import { fireEvent, render } from '@testing-library/react-native';
import { useState } from 'react';
import { Text } from 'react-native';

import { FirstLetterInput } from '@/components/FirstLetterInput';
import { VerseCard } from '@/components/VerseCard';
import { applyKey, startVerseAttempt } from '@/features/memorization';

/**
 * A minimal harness wiring the real components to the real runner, so typing on
 * the keyboard field drives the same reveal/complete flow the session screen
 * uses (without pulling in expo-router navigation).
 */
function SessionHarness() {
  const [attempt, setAttempt] = useState(() =>
    startVerseAttempt('For God', 'John 3:16', 3),
  );

  return (
    <>
      <VerseCard attempt={attempt} shakeSignal={0} reducedMotion />
      <FirstLetterInput
        onKey={(key) => {
          const outcome = applyKey(attempt, key);
          if (outcome.result !== 'ignored') setAttempt(outcome.attempt);
        }}
      />
      <Text testID="status">{attempt.status}</Text>
    </>
  );
}

describe('session flow (tier 3, all hidden)', () => {
  it('reveals each word as its first letter is typed and completes the verse', async () => {
    const { getByPlaceholderText, getByText, getByTestId, queryByText } = await render(
      <SessionHarness />,
    );
    const input = getByPlaceholderText('Tap and type');

    // Nothing is shown yet at tier 3.
    expect(queryByText('For')).toBeNull();
    expect(getByTestId('status').props.children).toBe('active');

    // Type the first letters: For(f) God(g) John(j) 3(3) 16(1).
    for (const key of ['f', 'g', 'j', '3', '1']) {
      await fireEvent.changeText(input, key);
    }

    expect(getByText('For')).toBeTruthy();
    expect(getByText('God')).toBeTruthy();
    expect(getByText('John')).toBeTruthy();
    expect(getByTestId('status').props.children).toBe('complete');
  });

  it('does not advance on a wrong key', async () => {
    const { getByPlaceholderText, queryByText, getByTestId } = await render(
      <SessionHarness />,
    );
    const input = getByPlaceholderText('Tap and type');

    await fireEvent.changeText(input, 'x'); // wrong first letter for 'For'
    expect(queryByText('For')).toBeNull();
    expect(getByTestId('status').props.children).toBe('active');
  });
});
