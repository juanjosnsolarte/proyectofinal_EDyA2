import { createSelector } from '@reduxjs/toolkit'

export const selectCommentsByPost = (postId) =>
  createSelector(
    [(state) => state.comments.commentsByPost],
    (commentsByPost) => commentsByPost[postId] || []
  )
