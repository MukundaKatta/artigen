import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { ForgotPasswordScreen } from '@/screens/ForgotPasswordScreen';
import { resetPassword } from '@/services/auth.service';
import { showAlert } from '@/utils/alert';

jest.mock('@/services/auth.service', () => ({
  resetPassword: jest.fn().mockResolvedValue({ error: null }),
}));

jest.mock('@/utils/alert', () => ({
  showAlert: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

function render() {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(<ForgotPasswordScreen />);
  });
  return tree;
}

describe('<ForgotPasswordScreen>', () => {
  it('renders the title, description, email input, and submit/back buttons', () => {
    const tree = render();
    const inputs = tree.root.findAllByType('TextInput');
    expect(inputs.length).toBe(1);

    const buttons = tree.root
      .findAllByProps({ accessibilityRole: 'button' })
      .map((b) => b.props.accessibilityLabel);
    expect(buttons).toEqual(expect.arrayContaining(['Send Reset Link', 'Back to Login']));
  });

  it('alerts when submitting with an empty email (no service call)', async () => {
    const tree = render();
    const submit = tree.root
      .findAllByProps({ accessibilityRole: 'button' })
      .find((b) => b.props.accessibilityLabel === 'Send Reset Link');

    await act(async () => {
      await submit!.props.onPress();
    });

    expect(showAlert).toHaveBeenCalledWith('Error', 'Please enter your email address');
    expect(resetPassword).not.toHaveBeenCalled();
  });

  it('calls resetPassword(email) when an email is entered', async () => {
    const tree = render();
    const input = tree.root.findByType('TextInput');
    act(() => {
      input.props.onChangeText('alice@example.com');
    });

    const submit = tree.root
      .findAllByProps({ accessibilityRole: 'button' })
      .find((b) => b.props.accessibilityLabel === 'Send Reset Link');

    await act(async () => {
      await submit!.props.onPress();
    });

    expect(resetPassword).toHaveBeenCalledWith('alice@example.com');
    expect(showAlert).toHaveBeenCalledWith(
      'Email Sent',
      expect.stringContaining('Check your email'),
      expect.any(Function),
    );
  });

  it('surfaces service errors via showAlert', async () => {
    (resetPassword as jest.Mock).mockResolvedValueOnce({ error: { message: 'rate limited' } });
    const tree = render();
    act(() => {
      tree.root.findByType('TextInput').props.onChangeText('a@b.com');
    });

    const submit = tree.root
      .findAllByProps({ accessibilityRole: 'button' })
      .find((b) => b.props.accessibilityLabel === 'Send Reset Link');
    await act(async () => {
      await submit!.props.onPress();
    });

    expect(showAlert).toHaveBeenCalledWith('Error', 'rate limited');
  });
});
