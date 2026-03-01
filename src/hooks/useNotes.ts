import { useState, useEffect, useCallback } from 'react';
import {
  createNote,
  deleteNote,
  getFollowingNotes,
  getUserNote,
} from '@/services/notes.service';
import type { NoteWithUser } from '@/services/notes.service';
import type { UserNote } from '@/types';

export function useNotes(userId: string | undefined) {
  const [notes, setNotes] = useState<NoteWithUser[]>([]);
  const [myNote, setMyNote] = useState<UserNote | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchNotes = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const [followingResult, myResult] = await Promise.all([
      getFollowingNotes(userId),
      getUserNote(userId),
    ]);

    setNotes(followingResult.data);
    setMyNote(myResult.data);
    setLoading(false);
  }, [userId]);

  const shareNote = useCallback(
    async (content: string, emoji?: string) => {
      if (!userId) return null;
      const { data, error } = await createNote(userId, content, emoji);
      if (data && !error) {
        setMyNote(data);
      }
      return data;
    },
    [userId]
  );

  const removeNote = useCallback(async () => {
    if (!myNote) return;
    const { error } = await deleteNote(myNote.id);
    if (!error) {
      setMyNote(null);
    }
    return { error };
  }, [myNote]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return {
    notes,
    myNote,
    loading,
    shareNote,
    removeNote,
    refresh: fetchNotes,
  };
}
