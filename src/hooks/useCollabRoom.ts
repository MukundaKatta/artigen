import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import {
  type CollabRoom,
  fetchRoom,
  fetchActiveRooms,
  joinCollabRoom,
  leaveCollabRoom,
  setReady,
  subscribeToRoom,
  createCollabRoom,
} from '@/services/collab-room.service';

export function useCollabRooms() {
  const [rooms, setRooms] = useState<CollabRoom[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRooms = useCallback(async () => {
    setLoading(true);
    const data = await fetchActiveRooms();
    setRooms(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  return { rooms, loading, refresh: loadRooms };
}

export function useCollabRoom(roomId: string) {
  const { user } = useAuth();
  const [room, setRoom] = useState<CollabRoom | null>(null);
  const [loading, setLoading] = useState(true);

  const loadRoom = useCallback(async () => {
    const data = await fetchRoom(roomId);
    setRoom(data);
    setLoading(false);
  }, [roomId]);

  useEffect(() => {
    loadRoom();

    // Subscribe to real-time updates
    const channel = subscribeToRoom(roomId, () => {
      loadRoom();
    });

    return () => {
      channel.unsubscribe();
    };
  }, [roomId, loadRoom]);

  const join = useCallback(async () => {
    if (!user?.id) return false;
    return joinCollabRoom(roomId, user.id);
  }, [roomId, user?.id]);

  const leave = useCallback(async () => {
    if (!user?.id) return;
    await leaveCollabRoom(roomId, user.id);
  }, [roomId, user?.id]);

  const toggleReady = useCallback(async () => {
    if (!user?.id || !room) return;
    const participant = room.participants.find((p) => p.user_id === user.id);
    if (participant) {
      await setReady(roomId, user.id, !participant.is_ready);
    }
  }, [roomId, user?.id, room]);

  const create = useCallback(
    async (name: string, prompt: string, maxParticipants?: number) => {
      if (!user?.id) return null;
      return createCollabRoom(user.id, name, prompt, maxParticipants);
    },
    [user?.id],
  );

  const isParticipant = room?.participants.some((p) => p.user_id === user?.id) || false;
  const isHost = room?.host_id === user?.id;

  return {
    room,
    loading,
    join,
    leave,
    toggleReady,
    create,
    isParticipant,
    isHost,
    refresh: loadRoom,
  };
}
