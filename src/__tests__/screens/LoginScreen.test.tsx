import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { LoginScreen } from '@/screens/LoginScreen';
import { showAlert } from '@/utils/alert';

const signIn = jest.fn().mockResolvedValue({ error: null });

jest.mock('@/providers/AuthProvider', () => ({
  useAuth: () => ({
    signIn,
    signUp: jest.fn(),
    signOut: jest.fn(),
    refreshProfile: jest.fn(),
    session: null,
    user: null,
    profile: null,
    loading: false,
  }),
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
    tree = TestRenderer.create(<LoginScreen />);
  });
  return tree;
}

describe('<LoginScreen>', () => {
  it('renders email + password inputs and a Log In button', () => {
    const tree = render();
    const inputs = tree.root.findAllByType('TextInput');
    expect(inputs.length).toBeGreaterThanOrEqual(2);

    const buttons = tree.root.findAllByProps({ accessibilityRole: 'button' });
    const labels = buttons.map((b) => b.props.accessibilityLabel);
    expect(labels).toEqual(
      expect.arrayContaining(['Log In', 'Forgot password?', 'Sign Up']),
    );
  });

  it('does not call signIn when fields are empty (zod validation)', async () => {
    const tree = render();
    const loginBtn = tree.root
      .findAllByProps({ accessibilityRole: 'button' })
      .find((n) => n.props.accessibilityLabel === 'Log In');

    await act(async () => {
      loginBtn!.props.onPress();
    });

    expect(signIn).not.toHaveBeenCalled();
  });

  it('calls signIn with email + password on valid submit', async () => {
    const tree = render();
    const inputs = tree.root.findAllByType('TextInput');
    // first input is email, second is password
    act(() => {
      inputs[0].props.onChangeText('a@b.com');
      inputs[1].props.onChangeText('hunter2');
    });

    const loginBtn = tree.root
      .findAllByProps({ accessibilityRole: 'button' })
      .find((n) => n.props.accessibilityLabel === 'Log In');

    await act(async () => {
      await loginBtn!.props.onPress();
    });

    expect(signIn).toHaveBeenCalledWith('a@b.com', 'hunter2');
  });

  it('surfaces signIn error via showAlert', async () => {
    signIn.mockResolvedValueOnce({ error: { message: 'Invalid credentials' } });

    const tree = render();
    const inputs = tree.root.findAllByType('TextInput');
    act(() => {
      inputs[0].props.onChangeText('a@b.com');
      inputs[1].props.onChangeText('hunter2');
    });
    const loginBtn = tree.root
      .findAllByProps({ accessibilityRole: 'button' })
      .find((n) => n.props.accessibilityLabel === 'Log In');

    await act(async () => {
      await loginBtn!.props.onPress();
    });

    expect(showAlert).toHaveBeenCalledWith('Login Failed', 'Invalid credentials');
  });
});
