import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { EditProfileScreen } from '@/screens/EditProfileScreen';
import { updateProfile } from '@/services/profile.service';
import { showAlert } from '@/utils/alert';

const refreshProfile = jest.fn();
const useAuthMock = jest.fn();

jest.mock('@/providers/AuthProvider', () => ({
  useAuth: () => useAuthMock(),
}));

jest.mock('@/services/profile.service', () => ({
  updateProfile: jest.fn().mockResolvedValue({ error: null }),
}));

jest.mock('@/services/upload.service', () => ({
  uploadFile: jest.fn().mockResolvedValue({ url: 'https://cdn/new-avatar.jpg', error: null }),
}));

jest.mock('@/hooks/useImagePicker', () => ({
  useImagePicker: () => ({
    pickFromGallery: jest.fn().mockResolvedValue({ asset: { uri: 'file:///avatar.jpg' }, error: null }),
  }),
}));

jest.mock('@/utils/alert', () => ({
  showAlert: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  useAuthMock.mockReturnValue({
    user: { id: 'u-1' },
    profile: {
      id: 'u-1',
      username: 'alice',
      full_name: 'Alice Liddell',
      bio: 'art lover',
      website: 'https://alice.dev',
      avatar_url: 'https://cdn/old.jpg',
    },
    refreshProfile,
    session: null,
    loading: false,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
  });
});

function render() {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(<EditProfileScreen />);
  });
  return tree;
}

describe('<EditProfileScreen>', () => {
  it('seeds the form from the current profile', () => {
    const tree = render();
    const inputs = tree.root.findAllByType('TextInput');
    // 4 fields: username, fullName, bio, website (Input order matches the schema)
    expect(inputs.length).toBeGreaterThanOrEqual(4);
    const values = inputs.map((i) => i.props.value);
    expect(values).toEqual(
      expect.arrayContaining(['alice', 'Alice Liddell', 'art lover', 'https://alice.dev']),
    );
  });

  it('renders a Save button', () => {
    const tree = render();
    const labels = tree.root
      .findAllByProps({ accessibilityRole: 'button' })
      .map((b) => b.props.accessibilityLabel);
    expect(labels).toContain('Save');
  });

  it('calls updateProfile with the form data on save', async () => {
    const tree = render();
    const save = tree.root
      .findAllByProps({ accessibilityRole: 'button' })
      .find((b) => b.props.accessibilityLabel === 'Save');

    await act(async () => {
      await save!.props.onPress();
    });

    expect(updateProfile).toHaveBeenCalledWith(
      'u-1',
      expect.objectContaining({
        username: 'alice',
        full_name: 'Alice Liddell',
      }),
    );
  });

  it('surfaces updateProfile errors via showAlert', async () => {
    (updateProfile as jest.Mock).mockResolvedValueOnce({ error: { message: 'username taken' } });

    const tree = render();
    const save = tree.root
      .findAllByProps({ accessibilityRole: 'button' })
      .find((b) => b.props.accessibilityLabel === 'Save');

    await act(async () => {
      await save!.props.onPress();
    });

    expect(showAlert).toHaveBeenCalledWith('Error', 'username taken');
    expect(refreshProfile).not.toHaveBeenCalled();
  });
});
