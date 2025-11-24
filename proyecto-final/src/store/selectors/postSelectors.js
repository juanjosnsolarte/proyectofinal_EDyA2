import { createSelector } from '@reduxjs/toolkit'

export const selectPostsByUser = (userId) =>
  createSelector(
    [(state) => state.posts.posts],
    (posts) => posts.filter((post) => post.usuarioId === userId)
  )
