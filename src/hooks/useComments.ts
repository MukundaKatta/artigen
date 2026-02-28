import { useState, useEffect, useCallback } from 'react';
import { COMMENTS_PAGE_SIZE } from '@/lib/constants';
import {
  getComments,
  addComment,
  deleteComment,
  getReplies,
  getReplyCount,
} from '@/services/comment.service';
import {
  likeComment,
  unlikeComment,
  checkLikedComments,
} from '@/services/comment-like.service';
import type { CommentWithUser } from '@/types';

export function useComments(postId: string) {
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [repliesMap, setRepliesMap] = useState<Record<string, CommentWithUser[]>>({});
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const enrichComments = useCallback(async (rawComments: CommentWithUser[], userId?: string | null) => {
    if (rawComments.length === 0) return rawComments;

    const commentIds = rawComments.map((c) => c.id);

    // Batch fetch reply counts and liked status in parallel
    const [replyCountMap, likedSet] = await Promise.all([
      getReplyCount(commentIds),
      userId ? checkLikedComments(userId, commentIds) : Promise.resolve(new Set<string>()),
    ]);

    return rawComments.map((c) => ({
      ...c,
      replies_count: replyCountMap.get(c.id) || 0,
      isLiked: likedSet.has(c.id),
    }));
  }, []);

  const fetchComments = useCallback(async (userId?: string | null) => {
    setLoading(true);
    const { data } = await getComments(postId, 0);
    const enriched = await enrichComments(data, userId);
    setComments(enriched);
    setPage(0);
    setHasMore(data.length >= COMMENTS_PAGE_SIZE);
    setLoading(false);
  }, [postId, enrichComments]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const { data } = await getComments(postId, nextPage);
    const enriched = await enrichComments(data, currentUserId);
    setComments((prev) => [...prev, ...enriched]);
    setPage(nextPage);
    setHasMore(data.length >= COMMENTS_PAGE_SIZE);
    setLoadingMore(false);
  }, [postId, page, loadingMore, hasMore, enrichComments, currentUserId]);

  const submitComment = useCallback(
    async (userId: string, content: string) => {
      setCurrentUserId(userId);
      setSubmitting(true);
      const { data, error } = await addComment(userId, postId, content);
      setSubmitting(false);
      if (data && !error) {
        setComments((prev) => [...prev, { ...data, likes_count: 0, isLiked: false, replies_count: 0 }]);
      }
      return { data, error };
    },
    [postId]
  );

  const submitReply = useCallback(
    async (userId: string, content: string, parentCommentId: string) => {
      setSubmitting(true);
      const { data, error } = await addComment(userId, postId, content, parentCommentId);
      setSubmitting(false);
      if (data && !error) {
        const enrichedReply = { ...data, likes_count: 0, isLiked: false, replies_count: 0 };
        setRepliesMap((prev) => ({
          ...prev,
          [parentCommentId]: [...(prev[parentCommentId] || []), enrichedReply],
        }));
        // Increment parent's reply count
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentCommentId
              ? { ...c, replies_count: (c.replies_count || 0) + 1 }
              : c
          )
        );
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

  const toggleCommentLike = useCallback(
    async (userId: string, commentId: string) => {
      setCurrentUserId(userId);

      // Check if it's in repliesMap or comments
      const updateLike = (list: CommentWithUser[]) =>
        list.map((c) =>
          c.id === commentId
            ? {
                ...c,
                isLiked: !c.isLiked,
                likes_count: c.isLiked
                  ? Math.max(0, (c.likes_count || 0) - 1)
                  : (c.likes_count || 0) + 1,
              }
            : c
        );

      // Optimistic update in comments
      const target = comments.find((c) => c.id === commentId);
      if (target) {
        const wasLiked = target.isLiked;
        setComments(updateLike);
        const { error } = wasLiked
          ? await unlikeComment(userId, commentId)
          : await likeComment(userId, commentId);
        if (error) setComments(updateLike); // revert
      } else {
        // Check in replies
        for (const parentId of Object.keys(repliesMap)) {
          const reply = repliesMap[parentId]?.find((r) => r.id === commentId);
          if (reply) {
            const wasLiked = reply.isLiked;
            setRepliesMap((prev) => ({
              ...prev,
              [parentId]: updateLike(prev[parentId] || []),
            }));
            const { error } = wasLiked
              ? await unlikeComment(userId, commentId)
              : await likeComment(userId, commentId);
            if (error) {
              setRepliesMap((prev) => ({
                ...prev,
                [parentId]: updateLike(prev[parentId] || []),
              }));
            }
            break;
          }
        }
      }
    },
    [comments, repliesMap]
  );

  const loadReplies = useCallback(
    async (commentId: string) => {
      const { data } = await getReplies(commentId);
      if (data.length > 0 && currentUserId) {
        const ids = data.map((r) => r.id);
        const likedSet = await checkLikedComments(currentUserId, ids);
        const enriched = data.map((r) => ({
          ...r,
          isLiked: likedSet.has(r.id),
          replies_count: 0,
        }));
        setRepliesMap((prev) => ({ ...prev, [commentId]: enriched }));
      } else {
        setRepliesMap((prev) => ({ ...prev, [commentId]: data }));
      }
    },
    [currentUserId]
  );

  const initWithUserId = useCallback((userId: string) => {
    setCurrentUserId(userId);
    fetchComments(userId);
  }, [fetchComments]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return {
    comments,
    repliesMap,
    loading,
    loadingMore,
    submitting,
    hasMore,
    loadMore,
    submitComment,
    submitReply,
    removeComment,
    toggleCommentLike,
    loadReplies,
    initWithUserId,
  };
}
