import React from 'react';
import { Button } from '@/components/ui/Button';

type Props = {
  isFollowing: boolean;
  loading: boolean;
  onPress: () => void;
};

export function FollowButton({ isFollowing, loading, onPress }: Props) {
  return (
    <Button
      title={isFollowing ? 'Following' : 'Follow'}
      variant={isFollowing ? 'outline' : 'primary'}
      size="sm"
      loading={loading}
      onPress={onPress}
    />
  );
}
