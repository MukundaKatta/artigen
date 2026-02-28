import { useState, useEffect, useCallback } from 'react';
import { COMMENTS_PAGE_SIZE } from '@/lib/constants';
import {
  getComments,
  addComment,
  deleteComment,
} from '@/services/comment.service';
import type { CommentWithUser } from '@/types';

export function useComments(postId: string) {
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    const { data } = await getComments(postId, 0);
    setComments(data);
    setPage(0);
    setHasMore(data.length >= COMMENTS_PAGE_SIZE);
    setLoading(false);
  }, [postId]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const { data } = await getComments(postId, nextPage);
    setComments((prev) => [...prev, ...data]);
    setPage(nextPage);
    setHasMore(data.length >= COMMENTS_PAGE_SIZE);
    setLoadingMore(false);
  }, [postId, page, loadingMore, hasMore]);

  const submitComment = useCallback(
    async (userId: string, content: string) => {
      setSubmitting(true);
      const { data, error } = await addComment(userId, postId, content);
      setSubmitting(false);
      if (data && !error) {
        setComments((prev) => [...prev, data]);
      }
      return { data, error };
    },
    [postId]
  );

  const removeComment = useCallback(
    async (commentId: string) => {
      const removed = comments.find((c) => c.id === commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      const { error } = await deleteComment(commentId);
      if (error && removed) {
        setComments((prev) => [...prev, removed]);
      }
      return { error };
    },
    [comments]
  );

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return {
    comments,
    loading,
    loadingMore,
    submitting,
    hasMore,
    loadMore,
    submitComment,
    removeComment,
  };
}
