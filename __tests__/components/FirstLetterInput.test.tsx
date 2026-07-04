import { fireEvent, render } from '@testing-library/react-native';

import { FirstLetterInput } from '@/components/FirstLetterInput';

describe('FirstLetterInput', () => {
  it('forwards a typed character to onKey', async () => {
    const onKey = jest.fn();
    const { getByPlaceholderText } = await render(<FirstLetterInput onKey={onKey} />);
    await fireEvent.changeText(getByPlaceholderText('Tap and type'), 'f');
    expect(onKey).toHaveBeenCalledWith('f');
  });

  it('forwards batched characters in order (fast typing / paste)', async () => {
    const onKey = jest.fn();
    const { getByPlaceholderText } = await render(<FirstLetterInput onKey={onKey} />);
    await fireEvent.changeText(getByPlaceholderText('Tap and type'), 'ab');
    expect(onKey.mock.calls.map((call) => call[0])).toEqual(['a', 'b']);
  });

  it('is not editable when disabled', async () => {
    const { getByPlaceholderText } = await render(
      <FirstLetterInput onKey={jest.fn()} disabled />,
    );
    expect(getByPlaceholderText('Tap and type').props.editable).toBe(false);
  });
});
