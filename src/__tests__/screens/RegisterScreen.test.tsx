import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { RegisterScreen } from '@/screens/RegisterScreen';
import { showAlert } from '@/utils/alert';

const signUp = jest.fn().mockResolvedValue({ error: null });

jest.mock('@/providers/AuthProvider', () => ({
  useAuth: () => ({
    signUp,
    signIn: jest.fn(),
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
    tree = TestRenderer.create(<RegisterScreen />);
  });
  return tree;
}

describe('<RegisterScreen>', () => {
  it('renders 4 form inputs and a Sign Up button', () => {
    const tree = render();
    const inputs = tree.root.findAllByType('TextInput');
    expect(inputs.length).toBe(4); // email, username, fullName, password

    const buttons = tree.root
      .findAllByProps({ accessibilityRole: 'button' })
      .map((b) => b.props.accessibilityLabel);
    expect(buttons).toEqual(expect.arrayContaining(['Sign Up', 'Log In']));
  });

  it('does not call signUp on empty submit (zod validation)', async () => {
    const tree = render();
    const signUpBtn = tree.root
      .findAllByProps({ accessibilityRole: 'button' })
      .find((b) => b.props.accessibilityLabel === 'Sign Up');

    await act(async () => {
      await signUpBtn!.props.onPress();
    });

    expect(signUp).not.toHaveBeenCalled();
  });

  it('surfaces a sign-up error via showAlert', async () => {
    signUp.mockResolvedValueOnce({ error: { message: 'Email already taken' } });

    const tree = render();
    const inputs = tree.root.findAllByType('TextInput');
    // Form field order on screen: email, fullName, username, password
    act(() => {
      inputs[0].props.onChangeText('alice@example.com');
      inputs[1].props.onChangeText('Alice Liddell');
      inputs[2].props.onChangeText('alice');
      inputs[3].props.onChangeText('Hunter22!');
    });

    const signUpBtn = tree.root
      .findAllByProps({ accessibilityRole: 'button' })
      .find((b) => b.props.accessibilityLabel === 'Sign Up');

    await act(async () => {
      await signUpBtn!.props.onPress();
    });

    expect(signUp).toHaveBeenCalledWith('alice@example.com', 'Hunter22!', 'alice', 'Alice Liddell');
    expect(showAlert).toHaveBeenCalledWith('Sign Up Failed', 'Email already taken');
  });
});
