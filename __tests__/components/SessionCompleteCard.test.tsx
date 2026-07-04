import { fireEvent, render } from '@testing-library/react-native';

import { SessionCompleteCard } from '@/components/SessionCompleteCard';

describe('SessionCompleteCard', () => {
  it('renders the real accuracy and placeholder stats', async () => {
    const { getByText } = await render(
      <SessionCompleteCard
        accuracy={0.5}
        xpEarned={0}
        currentStreak={0}
        verseReference="John 3:16"
        onContinue={jest.fn()}
        reducedMotion
      />,
    );
    expect(getByText('Session complete')).toBeTruthy();
    expect(getByText('50%')).toBeTruthy();
    expect(getByText('You worked through John 3:16')).toBeTruthy();
  });

  it('fires onContinue when the button is pressed', async () => {
    const onContinue = jest.fn();
    const { getByLabelText } = await render(
      <SessionCompleteCard
        accuracy={1}
        xpEarned={0}
        currentStreak={0}
        onContinue={onContinue}
        reducedMotion
      />,
    );
    await fireEvent.press(getByLabelText('Continue'));
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('shows a new badge when one is passed', async () => {
    const { getByText } = await render(
      <SessionCompleteCard
        accuracy={1}
        xpEarned={0}
        currentStreak={0}
        newBadge={{ title: 'First Verse' }}
        onContinue={jest.fn()}
        reducedMotion
      />,
    );
    expect(getByText('First Verse')).toBeTruthy();
  });
});
